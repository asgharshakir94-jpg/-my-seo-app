export const dynamic = 'force-dynamic';
export const maxDuration = 60; 

import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase'; // Connects to your database

export async function POST(req: Request) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const { keyword } = await req.json();

    if (!keyword) {
      return new Response(JSON.stringify({ error: 'Keyword is required' }), { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: `You are RankYou's elite Autonomous SEO Campaign Pipeline. 
          Your mission is to write a highly authoritative, publication-ready, deeply optimized article targeting the user's primary keyword.
          
          CRITICAL WRITING RULES:
          1. Format everything in semantic, elegant HTML structures (use <h2>, <h3>, <p>, <strong>, <em>, <ul>, and <li>).
          2. NEVER wrap your code output in markdown backticks (e.g., do not use \`\`\`html ... \`\`\`). Output pure text strings containing the HTML tags directly.
          3. Weave highly relevant latent semantic indexing (LSI) terms naturally throughout the narrative.
          4. Ensure an immediate, engaging hook in the introduction followed by highly actionable, clear structural subsections.` 
        },
        { 
          role: 'user', 
          content: `Execute an end-to-end autonomous content optimization sprint for the keyword: "${keyword}".` 
        }
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    let completeArticle = ''; // Collects the text to save in your database later

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.choices?.[0]?.delta?.content || '';
            if (text) {
              completeArticle += text; // Saves the text piece by piece
              controller.enqueue(encoder.encode(text));
            }
          }
          
          // Article finished streaming! Save it into Supabase now:
          if (completeArticle) {
            await supabaseAdmin.from('campaigns').insert({
              keyword: keyword,
              content: completeArticle
            });
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
