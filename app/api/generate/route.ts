export const dynamic = 'force-dynamic';
export const maxDuration = 120;

import OpenAI from 'openai';
import { after } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { randomUUID } from 'crypto';

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
async function runRiskScoringInBackground(openai: OpenAI, campaignId: number, completeArticle: string, requestId: string) {
  try {
    const RISK_THRESHOLD = 30; // tune after reviewing real score distribution
    const riskResult = await scoreArticleRisk(openai, completeArticle, requestId);
    const finalStatus =
      riskResult.risk_score < RISK_THRESHOLD ? 'approved' : 'pending_review';

    const { error: riskUpdateErr } = await supabaseAdmin
      .from('campaigns')
      .update({
        status: finalStatus,
        risk_score: riskResult.risk_score,
        risk_flags: riskResult.flags,
      })
      .eq('id', campaignId);

      if (riskUpdateErr) {
        logger.error({ event: 'risk_score_save_failed', requestId, campaignId, error: riskUpdateErr.message });
      } else {
        logger.info({ event: 'risk_scoring_completed', requestId, campaignId, status: finalStatus, riskScore: riskResult.risk_score });
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
    const slug = slugify(keyword);
    const seoTitle = buildSeoTitle(keyword);
    const metaDescription = buildMetaDescription(keyword);

    logger.info({ event: 'generation_started', requestId, keyword, city, industry, userId: user.id });

    const brief = await generateBrief(openai, keyword, requestId, city, industry);

    // STEP 1.5: Create (or reuse) the campaign row up front
    let campaignRow;
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('campaigns')
      .insert({
        keyword,
        slug,
        title: seoTitle,
        meta_description: metaDescription,  
        status: 'generating',
        brief: brief || null,
        unverified_claims: brief?.unverified_claims || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (insertError) {
      // If it failed because the keyword already exists, reuse that row instead
      if (insertError.code === '23505') {
        const { data: existing, error: fetchError } = await supabaseAdmin
          .from('campaigns')
          .select()
          .eq('keyword', keyword)
          .single();

        if (fetchError || !existing) {
          return new Response(JSON.stringify({ error: 'Keyword exists but could not be loaded' }), { status: 500 });
        }
        campaignRow = existing;
      } else {
        return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
      }
    } else {
      campaignRow = inserted;
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
          7. Always end the article with a clear call-to-action encouraging the reader to run a free SEO audit. Use this exact link and phrasing style: <p><strong>Ready to see how your site stacks up?</strong> <a href="/audit">Run a free SEO audit</a> and get a clear picture of what's holding your rankings back.</p>`        
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
            const finalArticle = `<h1>${seoTitle}</h1>\n${completeArticle}`;
          
            const { error: saveErr } = await supabaseAdmin
              .from('campaigns')
              .update({
                content: finalArticle,
                status: 'pending_review',
              })
              .eq('id', campaignRow.id);
              
              if (saveErr) {
                logger.error({ event: 'article_save_failed', requestId, campaignId: campaignRow.id, error: saveErr.message });
              } else {
                logger.info({ event: 'article_generated', requestId, campaignId: campaignRow.id, keyword, userId: user.id, wordCount: completeArticle.split(/\s+/).length });  
              // Schedule risk scoring to run AFTER this response is fully sent.
              // Using after() means it can't block or get killed alongside the
              // client-facing stream — it runs as its own background task.
              after(() => runRiskScoringInBackground(openai, campaignRow.id, finalArticle, requestId));
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