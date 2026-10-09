// app/api/keywords/suggest/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

export const runtime = 'nodejs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PER_IP_DAILY = 20; // OpenAI suggestions per visitor per 24h

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const trade = String(body.trade || '').trim().slice(0, 80);
  const city = String(body.city || '').trim().slice(0, 80);
  const competitorNotes = String(body.competitorNotes || '').trim().slice(0, 500);

  if (!trade || !city) {
    return NextResponse.json({ error: 'trade and city are required' }, { status: 400 });
  }

  // Per-visitor limit (IP is hashed, never stored raw). Uses a separate hash
  // from the free keyword finder, so the two tools do not share a counter.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('keywords/suggest: missing env vars');
    return NextResponse.json({ error: 'Service unavailable' }, { status: 500 });
  }
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const fwd = req.headers.get('x-forwarded-for');
  const ip = (fwd ? fwd.split(',')[0].trim() : req.headers.get('x-real-ip')) || 'unknown';
  const ipHash = createHmac('sha256', serviceKey).update(`suggest:${ip}`).digest('hex').slice(0, 32);
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

  const { count: mine, error: limitErr } = await supabase
    .from('keyword_requests')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since);
  if (limitErr) {
    console.error('keywords/suggest: keyword_requests unavailable');
    return NextResponse.json({ error: 'Service unavailable' }, { status: 500 });
  }
  if ((mine ?? 0) >= PER_IP_DAILY) {
    return NextResponse.json(
      { error: 'Daily limit reached. Please try again tomorrow.' },
      { status: 429 }
    );
  }
  await supabase.from('keyword_requests').insert({ ip_hash: ipHash });

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

  let raw = '[]';
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5.6-terra',
      messages: [{ role: 'user', content: prompt }],
    });
    raw = completion.choices[0].message.content ?? '[]';
  } catch (err) {
    console.error('keywords/suggest: OpenAI failed', err instanceof Error ? err.message : 'unknown');
    return NextResponse.json({ error: 'Could not generate suggestions right now' }, { status: 502 });
  }

  const clean = raw.replace(/```json|```/g, '').trim();

  let suggestions;
  try {
    suggestions = JSON.parse(clean);
  } catch {
    return NextResponse.json({ error: 'Failed to parse suggestions', raw }, { status: 500 });
  }

  return NextResponse.json({ suggestions });
}