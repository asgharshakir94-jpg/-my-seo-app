export const dynamic = 'force-dynamic';
export const maxDuration = 120;

import OpenAI from 'openai';
import { after } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { randomUUID } from 'crypto';
import { computeArticleScore } from '@/lib/seoScore';
import { matchTrade } from '@/lib/tradeCalculators';
import { notifyGoogleIndexing } from '@/lib/googleIndexing';
import { checkArticleAllowance } from '@/lib/planLimits';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // strip punctuation
    .replace(/\s+/g, '-')       // spaces to hyphens
    .replace(/-+/g, '-')        // collapse repeats
    .slice(0, 80);              // keep URLs reasonable
}

const TITLE_CASE_ACRONYMS = new Set([
  'SEO', 'HVAC', 'AI', 'GBP', 'PDF', 'FAQ', 'USA', 'UK', 'PK',
  'NIC', 'SWIFT', 'IBAN', 'URL', 'API', 'SaaS', 'ROI', 'PPC',
]);

const TITLE_CASE_LOWERCASE = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'for', 'nor', 'in', 'on',
  'at', 'to', 'of', 'vs',
]);

function buildSeoTitle(keyword: string): string {
  const words = keyword.trim().split(/\s+/);

  const titled = words.map((word, i) => {
    const upper = word.toUpperCase();
    if (TITLE_CASE_ACRONYMS.has(upper)) return upper;

    const lower = word.toLowerCase();
    if (i !== 0 && i !== words.length - 1 && TITLE_CASE_LOWERCASE.has(lower)) {
      return lower;
    }

    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  const base = titled.join(' ');
  return base.length > 60 ? base.slice(0, 57) + '...' : base;
}
function buildMetaDescription(keyword: string): string {
  return `${keyword.trim()} — practical, actionable guidance to help you get results. Learn what works and how to get started today.`.slice(0, 155);
}
function descriptionFromArticle(html: string, fallback: string): string {
  const text = html
    .replace(/<h[12][^>]*>[\s\S]*?<\/h[12]>/i, '')
    .replace(/<figure[\s\S]*?<\/figure>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/^#+\s*/gm, '')
    .replace(/\s+/g, ' ')
    .replace(/Photo by .{1,80}? on Unsplash\.?/gi, '')
    .trim();
  if (text.length < 60) return fallback;
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  let out = '';
  for (const s of sentences) {
    const next = (out + ' ' + s.trim()).trim();
    if (next.length > 155) break;
    out = next;
  }
  if (out.length >= 60) return out;
  return text.slice(0, 152).trim() + '...';
}


const IMAGE_STOP_WORDS = new Set([
  'what', 'is', 'are', 'how', 'to', 'do', 'does', 'the', 'a', 'an', 'for', 'of', 'in', 'on', 'near', 'me',
  'my', 'your', 'you', 'can', 'should', 'vs', 'and', 'or', 'best', 'top', 'guide', 'tips', 'cost', 'much',
]);

// Builds a short list of searches to try, from most specific to most general.
function imageSearchQueries(keyword: string): string[] {
  const clean = keyword.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = clean.split(' ').filter((w) => w && !IMAGE_STOP_WORDS.has(w));

  const queries: string[] = [keyword.trim(), words.slice(0, 3).join(' '), words.slice(0, 2).join(' ')];

  if (/roof|shingle|gutter/.test(clean)) queries.push('roofing contractor');
  else if (/plumb|drain|pipe|water heater/.test(clean)) queries.push('plumber');
  else if (/hvac|air conditioning|furnace|heat pump/.test(clean)) queries.push('hvac technician');
  else if (/electric/.test(clean)) queries.push('electrician');
  else if (/solar/.test(clean)) queries.push('solar panels');
  else queries.push('small business owner laptop');

  return queries.filter((q, i) => q.length > 0 && queries.indexOf(q) === i);
}

// Fetches one relevant Unsplash photo for the article header.
// Tries the full keyword first, then simpler searches, so most articles get a fitting photo.
// Fails gracefully: if the API is down, rate-limited, or nothing is found,
// the article still generates and saves normally, just without an image.
async function fetchArticleImage(keyword: string, requestId: string): Promise<{ url: string; alt: string; credit: string; creditUrl: string } | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    logger.error({ event: 'unsplash_key_missing', requestId });
    return null;
  }

  for (const query of imageSearchQueries(keyword)) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${accessKey}` } }
      );

      if (!res.ok) {
        logger.error({ event: 'unsplash_fetch_failed', requestId, status: res.status, query });
        if (res.status === 403 || res.status === 429) return null; // rate limited: stop trying
        continue;
      }

      const data = await res.json();
      const photo = data.results?.[0];
      if (!photo) {
        logger.info({ event: 'unsplash_no_results', requestId, query });
        continue;
      }

      return {
        url: photo.urls.regular,
        alt: photo.alt_description || keyword,
        credit: photo.user.name,
        creditUrl: photo.user.links.html,
      };
    } catch (err) {
      logger.error({ event: 'unsplash_fetch_error', requestId, query, error: err instanceof Error ? err.message : String(err) });
      return null;
    }
  }

  return null;
}
const BRIEF_SYSTEM_PROMPT = `You are an SEO research assistant. Given a target keyword (and optional city/industry context), produce a structured content brief as raw JSON only — no markdown, no backticks, no commentary.

The JSON must have this exact shape:
{
  "must_cover_subtopics": string[],   // 4-7 key subtopics the article must address
  "local_details": string[],          // specific local facts/details to weave in, empty array if no city given
  "faqs": string[],                   // 3-5 real questions readers would ask about this topic
  "unverified_claims": string[]       // any statistic or claim that would need a citation/fact-check, empty array if none
}

Return ONLY the JSON object, nothing else.`;

const RISK_SYSTEM_PROMPT = `You are a fact-risk auditor for SEO articles. Given the article HTML below, return ONLY raw JSON, no markdown, no backticks, no commentary.

The JSON must have this exact shape:
{
  "risk_score": number,        // 0-100, how risky this content is to publish unreviewed
  "flags": string[],           // any of: "stale_date_reference", "pricing_claim", "local_business_claim", "statistic_claim", "regulatory_claim" — empty array if none
  "flagged_snippets": string[] // the exact sentences that triggered flags, empty array if none
}

Flag content as risky if it:
- References specific years, "current," "latest," or "as of" in a way that will go stale
- States prices, costs, or cost ranges as fact
- Claims specific business credentials (years in business, awards, ratings, "#1")
- Cites statistics or percentages without attribution
- References laws, codes, or regulations that could change

Return ONLY the JSON object.`;

async function scoreArticleRisk(openai: OpenAI, articleHtml: string, requestId: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: RISK_SYSTEM_PROMPT },
        { role: 'user', content: articleHtml },
      ],
      max_completion_tokens: 4000,
    });

    const raw = response.choices?.[0]?.message?.content || '';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    if (!cleaned) {
      logger.error({ event: 'risk_scoring_empty_response', requestId, finishReason: response.choices?.[0]?.finish_reason });
      return { risk_score: 100, flags: ['risk_scoring_failed'], flagged_snippets: [] };
    }
    return JSON.parse(cleaned);
  } catch (err) {
    logger.error({ event: 'risk_scoring_failed', requestId, error: err instanceof Error ? err.message : String(err) }); 
    // Fail safe: if scoring breaks, force human review rather than silently auto-approving
    return { risk_score: 100, flags: ['risk_scoring_failed'], flagged_snippets: [] };
  }
}
async function generateBrief(
  openai: OpenAI,
  keyword: string,
  requestId: string,
  city?: string,
  industry?: string
) {
  try {
    const userPrompt = `Keyword: "${keyword}"${city ? `\nCity: ${city}` : ''}${industry ? `\nIndustry: ${industry}` : ''}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-5.6-terra',  
      messages: [
        { role: 'system', content: BRIEF_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_completion_tokens: 2000,
    });

    const raw = response.choices?.[0]?.message?.content || '';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    logger.error({ event: 'brief_generation_failed', requestId, keyword, error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

// Runs AFTER the response has been sent to the client, via Next.js's after().
// This is intentionally decoupled from the stream lifecycle so a slow/failing
// risk-scoring call can never block or kill the article save.
async function runRiskScoringInBackground(openai: OpenAI, campaignId: number, completeArticle: string, requestId: string, slug: string) {
  try {
    const RISK_THRESHOLD = 30; // tune after reviewing real score distribution
    const riskResult = await scoreArticleRisk(openai, completeArticle, requestId);
    const finalStatus =
      riskResult.risk_score < RISK_THRESHOLD ? 'approved' : 'pending_review';

      const { error: riskUpdateErr, data: riskUpdateData } = await supabaseAdmin
      .from('campaigns')
      .update({
        status: finalStatus,
        risk_score: riskResult.risk_score,
        risk_flags: riskResult.flags,
      })
      .eq('id', campaignId)
      .eq('status', 'pending_review')  // only touch it if still pending — don't clobber a manual approve
      .select('id');
    
    if (riskUpdateData && riskUpdateData.length === 0) {
      logger.info({ event: 'risk_score_skipped_already_actioned', requestId, campaignId });
    }

      if (riskUpdateErr) {
        logger.error({ event: 'risk_score_save_failed', requestId, campaignId, error: riskUpdateErr.message });
      } else {
        logger.info({ event: 'risk_scoring_completed', requestId, campaignId, status: finalStatus, riskScore: riskResult.risk_score });

      
        if (finalStatus === 'approved' && riskUpdateData && riskUpdateData.length > 0) {
          await notifyGoogleIndexing(`https://rankinseo.xyz/blog/${slug}/`);
        }
       }  
      } catch (err) {
      logger.error({ event: 'risk_scoring_background_failed', requestId, campaignId, error: err instanceof Error ? err.message : String(err) }); 
    // No-op: row is already saved as pending_review from Step A, safe to leave as-is.
  }
}

export async function POST(req: Request) {
  const requestId = randomUUID();
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const supabaseSession = await createClient();
  const { data: { user } } = await supabaseSession.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  try {
    const { keyword, city, industry } = await req.json();

    if (!keyword) {
      return new Response(JSON.stringify({ error: 'Keyword is required' }), { status: 400 });
    }

    // Plan check: only trial/paid customers can generate, up to their monthly article limit.
    const allowance = await checkArticleAllowance(user.id, user.email);
    if (!allowance.allowed) {
      logger.info({ event: 'generation_blocked', requestId, userId: user.id, reason: allowance.reason, plan: allowance.plan, used: allowance.used, limit: allowance.limit });
      const message =
        allowance.reason === 'limit_reached'
          ? `You've used ${allowance.used} of ${allowance.limit} articles on your ${allowance.plan} plan this month. Upgrade your plan to write more.`
          : allowance.reason === 'no_subscription'
          ? 'Start your free 14-day trial to generate articles.'
          : 'We could not check your plan right now. Please try again in a minute.';
      return new Response(
        JSON.stringify({ error: message, code: allowance.reason }),
        { status: allowance.reason === 'check_failed' ? 500 : 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const slug = slugify(keyword);
    const seoTitle = buildSeoTitle(keyword);
    const metaDescription = buildMetaDescription(keyword);
    const matchedTrade = matchTrade(keyword, industry);

    logger.info({ event: 'generation_started', requestId, keyword, city, industry, userId: user.id });

    // Fetch brief and article image in parallel — independent calls, no reason to wait on one before the other
    const [brief, articleImage] = await Promise.all([
      generateBrief(openai, keyword, requestId, city, industry),
      fetchArticleImage(keyword, requestId),
    ]);

    // STEP 1.5: Create (or reuse) the campaign row up front.
    // A keyword is unique per customer (ignoring upper/lower case). Slugs are unique site-wide,
    // so if another customer already uses this slug we retry with a short suffix.
    let campaignRow;
    let slugToTry = slug;
    const keywordPattern = keyword.replace(/[\\%_]/g, '\\$&');
    for (let attempt = 0; attempt < 4 && !campaignRow; attempt++) {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('campaigns')
        .insert({
          keyword,
          slug: slugToTry,
          title: seoTitle,
          meta_description: metaDescription,
          status: 'generating',
          brief: brief || null,
          unverified_claims: brief?.unverified_claims || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (!insertError) {
        campaignRow = inserted;
        break;
      }

      if (insertError.code !== '23505') {
        logger.error({ event: 'campaign_insert_failed', requestId, error: insertError.message });
        return new Response(JSON.stringify({ error: 'Could not start the article. Please try again.' }), { status: 500 });
      }

      // Unique violation. Case 1: this customer already has this keyword, so reuse that row.
      const { data: existing } = await supabaseAdmin
        .from('campaigns')
        .select()
        .eq('user_id', user.id)
        .ilike('keyword', keywordPattern)
        .maybeSingle();

      if (existing) {
        campaignRow = existing;
        break;
      }

      // Case 2: another customer already uses this slug, so retry with a short suffix.
      slugToTry = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    if (!campaignRow) {
      return new Response(JSON.stringify({ error: 'Could not create the article. Please try again or use a slightly different keyword.' }), { status: 409 });
    }

    // Mark the matching keyword_suggestions row as used (best-effort — never blocks generation)
    try {
      await supabaseAdmin
        .from('keyword_suggestions')
        .update({ status: 'used' })
        .ilike('keyword', keyword);
    } catch (err) {
      logger.error({ event: 'keyword_mark_used_failed', requestId, keyword, error: err instanceof Error ? err.message : String(err) });
    }

    const articleUserPrompt = brief
      ? `Write the article using this content brief. Follow it exactly — cover every subtopic, weave in every local detail naturally, and answer every FAQ within the body or a dedicated FAQ section.

Brief:
${JSON.stringify(brief, null, 2)}`
      : `Execute an end-to-end autonomous content optimization sprint for the keyword: "${keyword}".`;

    const response = await openai.chat.completions.create({
      model: 'gpt-5.6-terra',
      messages: [
        {
          role: 'system',
          content: `You are RankinSEO's elite Autonomous SEO Campaign Pipeline.
          Your mission is to write a highly authoritative, publication-ready, deeply optimized article targeting the user's primary keyword.

          CRITICAL WRITING RULES:
          1. Format everything in semantic, elegant HTML structures (use <h2>, <h3>, <p>, <strong>, <em>, <ul>, and <li>).
          2. NEVER wrap your code output in markdown backticks (e.g., do not use \`\`\`html ... \`\`\`). Output pure text strings containing the HTML tags directly.
          3. Weave highly relevant latent semantic indexing (LSI) terms naturally throughout the narrative.
          4. Ensure an immediate, engaging hook in the introduction followed by highly actionable, clear structural subsections.
          5. Target 900-1200 words total. Do not exceed 1400 words under any circumstances. Prioritize clarity and actionable value over exhaustive coverage — cut anything that doesn't directly help the reader.
          6. Do NOT include an <h1> tag in your output — the page title is handled separately. Start directly with your intro paragraph, then use <h2> for section headers.
          7. Do not add a call-to-action, link to an audit, or other promotional paragraph at the end of the article, other than the calculator link described below if one is provided.
          ${matchedTrade ? `
          7b. Since this article is about ${matchedTrade.tradeName.toLowerCase()}, as the final paragraph of the article, insert this CTA promoting the calculator, using this exact HTML: <p><strong>Curious if your pricing actually pencils out?</strong> Try our free <a href="/tools/${matchedTrade.slug}-calculator">${matchedTrade.tradeName} Cost & Profit Margin Calculator</a> to see your real margin after labor, fuel, and overhead.</p>` : ''}
          8. Do not reference or assume a specific city, county, or location unless one is explicitly provided as input. Never insert placeholder text like "[City, County, State]", "[Your City]", or similar. If the topic is location-independent or no location was given, write generically using phrases like "your area," "your region," or "local homeowners" instead.`       
          },
        { role: 'user', content: articleUserPrompt }
      ],
      stream: true,
      max_completion_tokens: 6000,
    });

    const encoder = new TextEncoder();
    let completeArticle = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.choices?.[0]?.delta?.content || '';
            if (text) {
              completeArticle += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          if (completeArticle) {
            const imageHtml = articleImage
              ? `<img src="${articleImage.url}" alt="${articleImage.alt.replace(/"/g, '&quot;')}" style="width:100%;border-radius:8px;margin-bottom:0.5rem;" />\n<p style="font-size:0.8rem;color:#888;margin-bottom:1.5rem;">Photo by <a href="${articleImage.creditUrl}?utm_source=rankinseo&utm_medium=referral" target="_blank" rel="noopener">${articleImage.credit}</a> on <a href="https://unsplash.com?utm_source=rankinseo&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a></p>\n`
              : '';
            const finalArticle = `<h1>${seoTitle}</h1>\n${imageHtml}${completeArticle}`;
            const { total: seoScore, breakdown: seoScoreBreakdown } = computeArticleScore(finalArticle, keyword);
          
            const { error: saveErr } = await supabaseAdmin
              .from('campaigns')
              .update({
                content: finalArticle,
                meta_description: descriptionFromArticle(finalArticle, metaDescription),
                status: 'pending_review',
                seo_score: seoScore,
                seo_score_breakdown: seoScoreBreakdown,
              })
              .eq('id', campaignRow.id);
              
              if (saveErr) {
                logger.error({ event: 'article_save_failed', requestId, campaignId: campaignRow.id, error: saveErr.message });
              } else {
                logger.info({ event: 'article_generated', requestId, campaignId: campaignRow.id, keyword, userId: user.id, wordCount: completeArticle.split(/\s+/).length, seoScore, hasImage: !!articleImage });  
              // Schedule risk scoring to run AFTER this response is fully sent.
              // Using after() means it can't block or get killed alongside the
              // client-facing stream — it runs as its own background task.
              after(() => runRiskScoringInBackground(openai, campaignRow.id, finalArticle, requestId, campaignRow.slug));
            }
          }

        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (error: any) {
    logger.error({ event: 'generate_route_failed', requestId, userId: user.id, error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}