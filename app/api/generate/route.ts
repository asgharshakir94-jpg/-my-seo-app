export const dynamic = 'force-dynamic';
export const maxDuration = 60; 

import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase';

const BRIEF_SYSTEM_PROMPT = `You are an SEO content strategist. You generate content briefs for local service businesses in ANY industry and ANY region worldwide. Do not assume a specific industry, country, or measurement system — infer everything from the inputs given.

Given a topic, business type, and location, generate a content brief as a single JSON object — no markdown, no preamble, just raw JSON.

Schema:
{
  "topic": string,
  "location": string,
  "industry": string,
  "search_intent": "informational" | "commercial" | "transactional",
  "title": string (under 60 characters, include the year if relevant),
  "must_cover_subtopics": string[] (4-6 items),
  "local_details": string[] (3-5 items — must reflect genuine local factors, would be WRONG if applied elsewhere),
  "faqs": string[] (3-5 real questions people in this location search),
  "unverified_claims": string[] (any specific numbers, prices, percentages, or timeframes that should be fact-checked before publishing)
}

Rules:
- Never default to US-centric assumptions unless the location is in the US
- Use metric/local regulatory bodies where appropriate
- Any specific numeric claim must also appear in unverified_claims
- Do not include any text outside the JSON object
- Keep the brief lean — this brief controls final article length, so favor fewer, higher-value items over exhaustive coverage`;

async function generateBrief(openai: OpenAI, keyword: string, city?: string, industry?: string) {
  const location = city || 'unspecified — infer general best-practice guidance';
  const businessType = industry || 'unspecified — infer likely industry from the keyword itself';

  const briefResponse = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    messages: [
      { role: 'system', content: BRIEF_SYSTEM_PROMPT },
      { role: 'user', content: `Topic: ${keyword}\nBusiness type / industry: ${businessType}\nLocation: ${location}` }
    ],
    response_format: { type: 'json_object' }
    });

  const brief = JSON.parse(briefResponse.choices[0].message.content || '{}');

  // quality gate — bail out to plain generation if the brief is too thin
  if (!brief.must_cover_subtopics || brief.must_cover_subtopics.length < 4) {
    return null;
  }

  return brief;
}

export async function POST(req: Request) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const { keyword, city, industry } = await req.json();

    if (!keyword) {
      return new Response(JSON.stringify({ error: 'Keyword is required' }), { status: 400 });
    }

    // STEP 1: Generate the brief (cheap, non-streamed call)
    const brief = await generateBrief(openai, keyword, city, industry);

    // STEP 2: Build the article prompt — brief-driven if available, fallback to plain
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
          content: `You are RankYou's elite Autonomous SEO Campaign Pipeline. 
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
            await supabaseAdmin
              .from('campaigns')
              .update({
                content: completeArticle,
                brief: brief || null,
                unverified_claims: brief?.unverified_claims || null,
                })
              .eq('keyword', keyword);
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