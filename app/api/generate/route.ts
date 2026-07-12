export const dynamic = 'force-dynamic';
export const maxDuration = 60; 

import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/server';

// ... BRIEF_SYSTEM_PROMPT and generateBrief() stay exactly the same ...

export async function POST(req: Request) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Check for a logged-in user
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
            await supabaseAdmin
              .from('campaigns')
              .update({
                content: completeArticle,
                brief: brief || null,
                unverified_claims: brief?.unverified_claims || null,
                })
              .eq('keyword', keyword)
              .eq('user_id', user.id);
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