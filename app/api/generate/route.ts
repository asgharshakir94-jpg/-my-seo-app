export const dynamic = 'force-dynamic';
export const maxDuration = 120;

import OpenAI from 'openai';
import { after } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/server';

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

async function scoreArticleRisk(openai: OpenAI, articleHtml: string) {
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
      console.error('scoreArticleRisk: empty content, likely reasoning tokens exhausted budget. finish_reason:', response.choices?.[0]?.finish_reason);
      return { risk_score: 100, flags: ['risk_scoring_failed'], flagged_snippets: [] };
    }
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('scoreArticleRisk failed, defaulting to manual review:', err);
    // Fail safe: if scoring breaks, force human review rather than silently auto-approving
    return { risk_score: 100, flags: ['risk_scoring_failed'], flagged_snippets: [] };
  }
}

async function generateBrief(
  openai: OpenAI,
  keyword: string,
  city?: string,
  industry?: string
) {
  try {
    const userPrompt = `Keyword: "${keyword}"${city ? `\nCity: ${city}` : ''}${industry ? `\nIndustry: ${industry}` : ''}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
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
    console.error('generateBrief failed, falling back to no-brief mode:', err);
    return null;
  }
}

// Runs AFTER the response has been sent to the client, via Next.js's after().
// This is intentionally decoupled from the stream lifecycle so a slow/failing
// risk-scoring call can never block or kill the article save.
async function runRiskScoringInBackground(openai: OpenAI, campaignId: number, completeArticle: string) {
  try {
    const RISK_THRESHOLD = 30; // tune after reviewing real score distribution
    const riskResult = await scoreArticleRisk(openai, completeArticle);
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
      console.error('Failed to save risk scoring result for campaign', campaignId, riskUpdateErr);
    }
  } catch (err) {
    console.error('Background risk scoring failed for campaign', campaignId, err);
    // No-op: row is already saved as pending_review from Step A, safe to leave as-is.
  }
}

export async function POST(req: Request) {
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

    const brief = await generateBrief(openai, keyword, city, industry);

    // STEP 1.5: Create (or reuse) the campaign row up front
    let campaignRow;
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('campaigns')
      .insert({
        keyword,
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
      model: 'gpt-5-mini',
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
          5. Target 900-1200 words total. Do not exceed 1400 words under any circumstances. Prioritize clarity and actionable value over exhaustive coverage — cut anything that doesn't directly help the reader.`
        },
        { role: 'user', content: articleUserPrompt }
      ],
      stream: true,
      max_completion_tokens: 2000,
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
            // Save the article and flip status to pending_review immediately.
            // This is the ONLY write that happens before the stream closes,
            // so the client is never left waiting on risk scoring.
            const { error: saveErr } = await supabaseAdmin
              .from('campaigns')
              .update({
                content: completeArticle,
                status: 'pending_review',
              })
              .eq('id', campaignRow.id);

            if (saveErr) {
              console.error('Failed to save article for campaign', campaignRow.id, saveErr);
            } else {
              // Schedule risk scoring to run AFTER this response is fully sent.
              // Using after() means it can't block or get killed alongside the
              // client-facing stream — it runs as its own background task.
              after(() => runRiskScoringInBackground(openai, campaignRow.id, completeArticle));
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}