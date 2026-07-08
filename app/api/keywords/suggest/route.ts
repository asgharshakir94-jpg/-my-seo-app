// app/api/keywords/suggest/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { trade, city, competitorNotes } = await req.json();

  if (!trade || !city) {
    return NextResponse.json({ error: 'trade and city are required' }, { status: 400 });
  }

  const prompt = `
You are an SEO strategist for local trades businesses.
Business type: ${trade}
Service area: ${city}
${competitorNotes ? `Competitor notes: ${competitorNotes}` : ''}

Suggest 8 SEO keywords this business should target. For each one, give:
- keyword
- intent (local / informational / commercial)
- a one-sentence rationale a non-marketer would understand

Return ONLY valid JSON, an array of objects with keys: keyword, intent, rationale. No preamble, no markdown.
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = completion.choices[0].message.content ?? '[]';
  const clean = raw.replace(/```json|```/g, '').trim();

  let suggestions;
  try {
    suggestions = JSON.parse(clean);
  } catch {
    return NextResponse.json({ error: 'Failed to parse suggestions', raw }, { status: 500 });
  }

  return NextResponse.json({ suggestions });
}