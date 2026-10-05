import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Set to true once you have filled in verified_at for the sites you trust.
const REQUIRE_VERIFIED = true;

const HOME_TRADE_WORDS = [
  'plumb', 'roof', 'hvac', 'solar', 'electric', 'carpent', 'landscap',
  'paint', 'construct', 'build', 'contractor', 'handyman', 'clean',
  'pest', 'garage', 'floor', 'remodel', 'gutter', 'window', 'home',
];
const COUNTRIES = ['US', 'CA', 'UK'];

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const niche = String(body.niche || '').trim().toLowerCase().slice(0, 80);
    const countryRaw = String(body.country || 'US').trim().toUpperCase();
    const country = COUNTRIES.includes(countryRaw) ? countryRaw : 'US';

    if (niche.length < 2) {
      return NextResponse.json({ message: 'Please enter your niche or trade' }, { status: 400 });
    }

    const isHomeTrade = HOME_TRADE_WORDS.some((w) => niche.includes(w));
    const words = niche.split(/[^a-z]+/).filter(Boolean);
    const hasWord = (list) => list.some((w) => words.includes(w));
    const niches = ['general', niche];
    if (isHomeTrade) niches.push('home services');
    if (hasWord(['saas', 'software', 'startup', 'tech', 'app', 'apps', 'ai'])) niches.push('software');
    if (hasWord(['agency', 'marketing', 'seo', 'advertising', 'design'])) niches.push('marketing agency');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    let query = supabase
      .from('link_prospects')
      .select('domain, site_name, type, authority_score', { count: 'exact' })
      .eq('country', country)
      .in('niche', niches)
      .eq('is_free', true)
      .order('authority_score', { ascending: false, nullsFirst: false })
      .limit(3);

    if (REQUIRE_VERIFIED) query = query.not('verified_at', 'is', null);

    const { data, count, error } = await query;
    if (error) {
      return NextResponse.json({ message: 'Search failed, please try again' }, { status: 500 });
    }

    return NextResponse.json({
      niche,
      country,
      total: count ?? 0,
      samples: (data ?? []).map((r) => ({
        domain: r.domain,
        name: r.site_name,
        type: r.type,
      })),
    });
  } catch {
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}