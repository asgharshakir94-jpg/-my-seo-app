import { NextResponse } from 'next/server';
import googleTrends from 'google-trends-api';
import { supabaseAdmin } from '@/lib/supabase';

const SEED_TERMS = [
  'roofing',
  'solar panels',
  'HVAC',
  'plumbing',
  'electrician',
  'carpentry',
  'local SEO for contractors',
];

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { data: existing } = await supabaseAdmin
    .from('keyword_suggestions')
    .select('keyword');
  const existingSet = new Set((existing ?? []).map(r => r.keyword.toLowerCase()));

  const allNew: { keyword: string }[] = [];

  for (const seed of SEED_TERMS) {
    try {
      const raw = await googleTrends.relatedQueries({ keyword: seed });
      const parsed = JSON.parse(raw);
      const rising = parsed?.default?.rankedList?.[1]?.rankedKeyword ?? [];

      const EXCLUDE_PATTERNS = [
        'meaning', 'pdf', 'salary', 'jobs', 'apprentice', 'wikipedia',
        'tesla', 'lg ', 'panasonic', 'harbor freight', 'renogy', 'jinko',
      ];
      
      for (const item of rising) {
        const kw = item.query?.trim();
        if (!kw) continue;
        const kwLower = kw.toLowerCase();
        if (existingSet.has(kwLower)) continue;
        if (EXCLUDE_PATTERNS.some(pattern => kwLower.includes(pattern))) continue;
      
        allNew.push({ keyword: kw });
        existingSet.add(kwLower);
      }

      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(`Trends fetch failed for seed "${seed}":`, err);
    }
  }

  const uniqueNew = allNew;

  if (uniqueNew.length > 0) {
    const { error } = await supabaseAdmin
      .from('keyword_suggestions')
      .insert(uniqueNew.map((k) => ({
        keyword: k.keyword,
        rationale: 'Rising Google Trends query',
        intent: 'informational',
        status: 'new',
      })));

    if (error) {
      console.error({ event: 'trend_keywords_save_failed', error: error.message });
      return NextResponse.json({ error: 'save_failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ inserted: uniqueNew.length });
}