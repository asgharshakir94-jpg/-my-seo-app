export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { randomUUID } from 'crypto';
import { Resend } from 'resend';

const ARTICLES_PER_RUN = 1;
const RISK_THRESHOLD = 30;

const TITLE_CASE_ACRONYMS = new Set([
  'SEO', 'HVAC', 'AI', 'GBP', 'PDF', 'FAQ', 'USA', 'UK', 'PK',
  'NIC', 'SWIFT', 'IBAN', 'URL', 'API', 'SaaS', 'ROI', 'PPC',
]);
const TITLE_CASE_LOWERCASE = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'for', 'nor', 'in', 'on',
  'at', 'to', 'of', 'vs',
]);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

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
  "must_cover_subtopics": string[],
  "local_details": string[],
  "faqs": string[],
  "unverified_claims": string[]
}

Return ONLY the JSON object, nothing else.`;

const RISK_SYSTEM_PROMPT = `You are a fact-risk auditor for SEO articles. Given the article HTML below, return ONLY raw JSON, no markdown, no backticks, no commentary.

The JSON must have this exact shape:
{
  "risk_score": number,
  "flags": string[],
  "flagged_snippets": string[]
}

Flag content as risky if it:
- References specific years, "current," "latest," or "as of" in a way that will go stale
- States prices, costs, or cost ranges as fact
- Claims specific business credentials (years in business, awards, ratings, "#1")
- Cites statistics or percentages without attribution
- References laws, codes, or regulations that could change

Return ONLY the JSON object.`;

const ARTICLE_SYSTEM_PROMPT = `You are RankinSEO's elite Autonomous SEO Campaign Pipeline.
Your mission is to write a highly authoritative, publication-ready, deeply optimized article targeting the user's primary keyword.

CRITICAL WRITING RULES:
1. Format everything in semantic, elegant HTML structures (use <h2>, <h3>, <p>, <strong>, <em>, <ul>, and <li>).
2. NEVER wrap your code output in markdown backticks (e.g., do not use \`\`\`html ... \`\`\`). Output pure text strings containing the HTML tags directly.
3. Weave highly relevant latent semantic indexing (LSI) terms naturally throughout the narrative.
4. Ensure an immediate, engaging hook in the introduction followed by highly actionable, clear structural subsections.
5. Target 900-1200 words total. Do not exceed 1400 words under any circumstances. Prioritize clarity and actionable value over exhaustive coverage — cut anything that doesn't directly help the reader.
6. Do NOT include an <h1> tag in your output — the page title is handled separately. Start directly with your intro paragraph, then use <h2> for section headers.
7. Always end the article with a clear call-to-action encouraging the reader to run a free SEO audit. Use this exact link and phrasing style: <p><strong>Ready to see how your site stacks up?</strong> <a href="/audit">Run a free SEO audit</a> and get a clear picture of what's holding your rankings back.</p>`;

// Location-signal words used to prefer local-intent keywords, mirroring the
// manual selection approach used when picking keywords by hand.
const LOCAL_SIGNAL_WORDS = [
  'near me', 'in ', 'city', 'county', 'local', 'area',
];

function scoreLocalIntent(keyword: string): number {
  const lower = keyword.toLowerCase();
  return LOCAL_SIGNAL_WORDS.some((signal) => lower.includes(signal)) ? 1 : 0;
}

async function pickKeywords(limit: number) {
  const { data, error } = await supabaseAdmin
    .from('keyword_suggestions')
    .select('id, keyword, rationale, intent, status')
    .eq('status', 'new')
    .order('id', { ascending: true })
    .limit(50);

  if (error || !data || data.length === 0) {
    return [];
  }

  const sorted = [...data].sort((a, b) => scoreLocalIntent(b.keyword) - scoreLocalIntent(a.keyword));
  return sorted.slice(0, limit);
}

async function generateBrief(openai: OpenAI, keyword: string, requestId: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5.6-terra',
      messages: [
        { role: 'system', content: BRIEF_SYSTEM_PROMPT },
        { role: 'user', content: `Keyword: "${keyword}"` },
      ],
      max_completion_tokens: 2000,
    });
    const raw = response.choices?.[0]?.message?.content || '';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    logger.error({ event: 'cron_brief_generation_failed', requestId, keyword, error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

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
      return { risk_score: 100, flags: ['risk_scoring_failed'], flagged_snippets: [] };
    }
    return JSON.parse(cleaned);
  } catch (err) {
    logger.error({ event: 'cron_risk_scoring_failed', requestId, error: err instanceof Error ? err.message : String(err) });
    return { risk_score: 100, flags: ['risk_scoring_failed'], flagged_snippets: [] };
  }
}

async function generateOneArticle(openai: OpenAI, keywordRow: { id: number; keyword: string }, requestId: string) {
  const keyword = keywordRow.keyword;
  const slug = slugify(keyword);
  const seoTitle = buildSeoTitle(keyword);
  const metaDescription = buildMetaDescription(keyword);

  const brief = await generateBrief(openai, keyword, requestId);

  const { data: campaignRow, error: insertError } = await supabaseAdmin
    .from('campaigns')
    .insert({
      keyword,
      slug,
      title: seoTitle,
      meta_description: metaDescription,
      status: 'generating',
      brief: brief || null,
      unverified_claims: brief?.unverified_claims || null,
      user_id: '2ad0b4b3-762f-4087-89f3-c8ad23e490ed',
    })
    .select()
    .single();

  if (insertError || !campaignRow) {
    logger.error({ event: 'cron_campaign_insert_failed', requestId, keyword, error: insertError?.message });
    return { keyword, success: false, status: 'insert_failed' as const };
  }

  const articleUserPrompt = brief
    ? `Write the article using this content brief. Follow it exactly — cover every subtopic, weave in every local detail naturally, and answer every FAQ within the body or a dedicated FAQ section.

Brief:
${JSON.stringify(brief, null, 2)}`
    : `Execute an end-to-end autonomous content optimization sprint for the keyword: "${keyword}".`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5.6-terra',
      messages: [
        { role: 'system', content: ARTICLE_SYSTEM_PROMPT },
        { role: 'user', content: articleUserPrompt },
      ],
      max_completion_tokens: 6000,
    });

    const articleBody = response.choices?.[0]?.message?.content || '';
    if (!articleBody) {
      await supabaseAdmin.from('campaigns').update({ status: 'pending_review' }).eq('id', campaignRow.id);
      return { keyword, success: false, status: 'empty_article' as const };
    }

    const finalArticle = `<h1>${seoTitle}</h1>\n${articleBody}`;

    const { error: saveErr } = await supabaseAdmin
      .from('campaigns')
      .update({ content: finalArticle, status: 'pending_review' })
      .eq('id', campaignRow.id);

    if (saveErr) {
      logger.error({ event: 'cron_article_save_failed', requestId, campaignId: campaignRow.id, error: saveErr.message });
      return { keyword, success: false, status: 'save_failed' as const };
    }

    await supabaseAdmin.from('keyword_suggestions').update({ status: 'used' }).eq('id', keywordRow.id);

    // Risk-scoring skipped in cron path to stay under Hobby-plan 60s limit —
    // article stays pending_review, same as manual review flow.
    return {
      keyword,
      success: true,
      status: 'pending_review' as const,
      slug,
    };
  } catch (err) {
    logger.error({ event: 'cron_article_generation_failed', requestId, keyword, error: err instanceof Error ? err.message : String(err) });
    await supabaseAdmin.from('campaigns').update({ status: 'pending_review' }).eq('id', campaignRow.id);
    return { keyword, success: false, status: 'generation_failed' as const };
  }
}

type RunResult = Awaited<ReturnType<typeof generateOneArticle>>;

async function sendSummaryEmail(results: RunResult[], requestId: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CRON_NOTIFY_EMAIL || 'asgharshakir94@gmail.com';

  if (!apiKey) {
    logger.error({ event: 'cron_email_skipped_no_key', requestId });
    return;
  }

  const resend = new Resend(apiKey);

  const approved = results.filter((r) => r.success && r.status === ('approved' as string));
  const pending = results.filter((r) => r.success && r.status === 'pending_review');
  const failed = results.filter((r) => !r.success);

  const rows = results
  .map((r) => {
    const label =
      r.status === 'pending_review'
        ? '⚠️ Needs your review'
        : `❌ Failed (${r.status})`;
    return `<li><strong>${r.keyword}</strong> — ${label}</li>`;
  })
  .join('');

  const html = `
  <div style="font-family: sans-serif; max-width: 600px;">
    <h2>RankinSEO — Daily Auto-Generation Summary</h2>
    <p>${results.length} article(s) attempted · ${pending.length} pending review · ${failed.length} failed.</p>
    <ul>${rows}</ul>
    <p><a href="https://rankinseo.xyz/dashboard">Open Dashboard</a></p>
  </div>
`;

try {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: toEmail,
    subject: `RankinSEO: ${pending.length} article(s) need review`,
    html,
  });
} catch (err) {
  logger.error({ event: 'cron_email_send_failed', requestId, error: err instanceof Error ? err.message : String(err) });
}
} 

async function handleAutoGenerate(req: Request) {
  const requestId = randomUUID();

  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  logger.info({ event: 'cron_auto_generate_started', requestId });

  const keywordRows = await pickKeywords(ARTICLES_PER_RUN);

  if (keywordRows.length === 0) {
    logger.info({ event: 'cron_auto_generate_no_keywords', requestId });
    return new Response(JSON.stringify({ message: 'No unused keywords available', generated: 0 }), { status: 200 });
  }

  const results: RunResult[] = [];
  for (const row of keywordRows) {
    const result = await generateOneArticle(openai, row, requestId);
    results.push(result);
  }

  await sendSummaryEmail(results, requestId);

  logger.info({ event: 'cron_auto_generate_completed', requestId, results });

  return new Response(JSON.stringify({ requestId, results }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(req: Request) {
  return handleAutoGenerate(req);
}

export async function POST(req: Request) {
  return handleAutoGenerate(req);
}