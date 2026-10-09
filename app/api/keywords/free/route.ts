// app/api/keywords/free/route.ts
// Free keyword ideas for everyone: Google autocomplete + related searches +
// "People also ask" via Serper. Cached 7 days, rate limited per visitor, with a
// global daily cap on fresh lookups so costs stay bounded.
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

export const runtime = 'nodejs';

const COUNTRIES: Record<string, string> = { us: 'us', ca: 'ca', uk: 'gb', gb: 'gb', au: 'au' };
const CACHE_DAYS = 7;
const PER_IP_DAILY = 10; // requests per visitor per 24h (cached ones count too)
const GLOBAL_DAILY_FRESH = 150; // fresh Serper lookups per 24h across everyone

type Results = { suggestions: string[]; related: string[]; questions: string[] };

// Place names to hide, so every visitor gets ideas that fit their own area.
const STATES = [
  'alabama','alaska','arizona','arkansas','california','colorado','connecticut','delaware','florida','georgia',
  'hawaii','idaho','illinois','indiana','iowa','kansas','kentucky','louisiana','maine','maryland','massachusetts',
  'michigan','minnesota','mississippi','missouri','montana','nebraska','nevada','new hampshire','new jersey',
  'new mexico','new york','north carolina','north dakota','ohio','oklahoma','oregon','pennsylvania','rhode island',
  'south carolina','south dakota','tennessee','texas','utah','vermont','virginia','washington','west virginia',
  'wisconsin','wyoming',
];
const CITIES = [
  'dc','nyc','brooklyn','queens','staten island','bronx','manhattan','los angeles','chicago','houston','phoenix',
  'philadelphia','san antonio','san diego','dallas','austin','san jose','jacksonville','fort worth','columbus',
  'charlotte','san francisco','indianapolis','seattle','denver','boston','el paso','nashville','detroit',
  'portland','las vegas','memphis','louisville','baltimore','milwaukee','albuquerque','tucson','fresno',
  'sacramento','atlanta','miami','orlando','tampa','birmingham','hoover','bessemer','toronto','vancouver',
  'calgary','london','manchester','sydney','melbourne',
  'frisco','tyler','boise','matthews','palm bay','plano','irving','garland','mckinney','arlington','lubbock',
  'laredo','corpus christi','honolulu','anchorage','omaha','tulsa','wichita','raleigh','durham','greensboro',
  'richmond','norfolk','virginia beach','pittsburgh','cincinnati','cleveland','kansas city','st louis',
  'minneapolis','new orleans','oklahoma city','salt lake city','oakland','long beach','bakersfield','riverside',
  'anaheim','santa ana','stockton','henderson','reno','spokane','tacoma','mesa','scottsdale','chandler',
  'gilbert','tempe','glendale','aurora','colorado springs','fort lauderdale','hialeah','st petersburg',
  'clearwater','lakeland','naples','sarasota','savannah','augusta','charleston','knoxville','chattanooga',
  'lexington','buffalo','rochester','albany','syracuse','newark','jersey city','hartford','providence',
  'ottawa','edmonton','montreal','winnipeg','mississauga','brampton','leeds','glasgow','liverpool','bristol',
  'brisbane','perth','adelaide','canberra',
];
// Two-letter state codes that are not also common words (so "me", "in", "or",
// "hi", "ok", "la" are NOT included and "near me" is never treated as a place).
const STATE_CODES = [
  'tx','ca','fl','ny','nj','nc','sc','va','wa','ga','il','mi','mn','tn','az','nv','nm','ut','ks','ky','ia',
  'nd','sd','wv','wi','wy','mt','nh','vt','ri','ct','md','ak',
];
const PLACE_RE = new RegExp(`\\b(${[...STATES, ...CITIES].join('|')})\\b`, 'i');
const CODE_RE = new RegExp(`\\b(${STATE_CODES.join('|')})\\b`, 'i');
const hasPlace = (text: string) =>
  PLACE_RE.test(text) || CODE_RE.test(text) || /,\s*[a-z]{2}\b/i.test(text) || /\b\d{5}\b/.test(text);

// Keep related searches and questions only if they still contain every main
// word of the visitor's search. This drops other companies' names and
// off-topic results.
const STOP = new Set([
  'near','me','in','for','the','and','of','to','my','best','how','what','is','does','do',
]);
const seedStems = (kw: string) =>
  kw.split(' ').filter((w) => w.length > 2 && !STOP.has(w)).map((w) => w.slice(0, 4));
const onTopic = (text: string, stems: string[], all = true) => {
  const t = text.toLowerCase();
  return stems.length === 0 || (all ? stems.every((s) => t.includes(s)) : stems.some((s) => t.includes(s)));
};

async function serper(path: 'search' | 'autocomplete', q: string, gl: string, num?: number) {
  const res = await fetch(`https://google.serper.dev/${path}`, {
    method: 'POST',
    headers: { 'X-API-KEY': process.env.SERPER_API_KEY as string, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q, gl, hl: 'en', ...(num ? { num } : {}) }),
  });
  if (!res.ok) throw new Error(`Serper ${path} ${res.status}`);
  return res.json();
}

const uniq = (arr: unknown[], seed: string): string[] => {
  const out: string[] = [];
  const seen = new Set<string>([seed]);
  for (const v of arr) {
    const s = String(v ?? '').trim();
    const k = s.toLowerCase();
    if (!s || seen.has(k)) continue;
    seen.add(k);
    out.push(s);
  }
  return out;
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Honeypot: real people never fill this hidden field.
    if (body.website) return NextResponse.json({ suggestions: [], related: [], questions: [] });

    const keyword = String(body.keyword || '')
      .toLowerCase()
      .replace(/[^a-z0-9 '&-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 80);
    if (keyword.length < 2) {
      return NextResponse.json({ message: 'Please enter a keyword or topic first' }, { status: 400 });
    }
    const gl = COUNTRIES[String(body.country || 'us').toLowerCase()] || 'us';

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!process.env.SERPER_API_KEY || !url || !serviceKey) {
      console.error('keywords/free: missing env vars');
      return NextResponse.json({ message: 'This tool is not set up yet, please try later' }, { status: 500 });
    }
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

    // If the visitor typed a place themselves, keep place-specific ideas.
    const keepPlaces = hasPlace(keyword);
    const stems = seedStems(keyword);
    const placeOk = (x: string) => keepPlaces || !hasPlace(x);
    const clean = (r: Results): Results => ({
      suggestions: r.suggestions.filter(placeOk),
      related: r.related.filter((x) => placeOk(x) && onTopic(x, stems)),
      questions: r.questions.filter((x) => placeOk(x) && onTopic(x, stems, false)),
    });

    // Per-visitor limit (IP is hashed, never stored raw).
    const fwd = req.headers.get('x-forwarded-for');
    const ip = (fwd ? fwd.split(',')[0].trim() : req.headers.get('x-real-ip')) || 'unknown';
    const ipHash = createHmac('sha256', serviceKey).update(ip).digest('hex').slice(0, 32);
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

    const { count: mine, error: limitErr } = await supabase
      .from('keyword_requests')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', since);
    if (limitErr) {
      console.error('keywords/free: keyword_requests unavailable');
      return NextResponse.json({ message: 'This tool is not set up yet, please try later' }, { status: 500 });
    }
    if ((mine ?? 0) >= PER_IP_DAILY) {
      return NextResponse.json(
        { message: 'You have used your free searches for today. Please come back tomorrow.' },
        { status: 429 }
      );
    }
    await supabase.from('keyword_requests').insert({ ip_hash: ipHash });

    // Cache first: repeat searches cost nothing.
    const cutoff = new Date(Date.now() - CACHE_DAYS * 24 * 3600 * 1000).toISOString();
    const { data: cached, error: cacheErr } = await supabase
      .from('keyword_cache')
      .select('results')
      .eq('keyword', keyword)
      .eq('country', gl)
      .gte('created_at', cutoff)
      .maybeSingle();
    if (cacheErr) {
      console.error('keywords/free: keyword_cache unavailable');
      return NextResponse.json({ message: 'This tool is not set up yet, please try later' }, { status: 500 });
    }
    if (cached?.results) {
      return NextResponse.json({ keyword, ...clean(cached.results as Results), cached: true });
    }

    // Global cap on fresh lookups.
    const { count: fresh } = await supabase
      .from('keyword_cache')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since);
    if ((fresh ?? 0) >= GLOBAL_DAILY_FRESH) {
      return NextResponse.json(
        { message: "We've reached today's limit of new keyword lookups. Please try again tomorrow." },
        { status: 429 }
      );
    }

    const [auto, search] = await Promise.allSettled([
      serper('autocomplete', keyword, gl),
      serper('search', keyword, gl, 10),
    ]);
    if (auto.status === 'rejected' && search.status === 'rejected') {
      console.error('keywords/free: Serper failed');
      return NextResponse.json({ message: 'Could not fetch keywords right now. Please try again.' }, { status: 502 });
    }

    const a = auto.status === 'fulfilled' ? auto.value : {};
    const s = search.status === 'fulfilled' ? search.value : {};

    const results: Results = {
      suggestions: uniq((a.suggestions || []).map((x: { value?: string }) => x.value), keyword),
      related: uniq((s.relatedSearches || []).map((x: { query?: string }) => x.query), keyword),
      questions: uniq((s.peopleAlsoAsk || []).map((x: { question?: string }) => x.question), keyword),
    };

    // Cache the unfiltered results; the filters run on every response.
    if (results.suggestions.length + results.related.length + results.questions.length > 0) {
      await supabase
        .from('keyword_cache')
        .upsert(
          { keyword, country: gl, results, created_at: new Date().toISOString() },
          { onConflict: 'keyword,country' }
        );
    }

    return NextResponse.json({ keyword, ...clean(results), cached: false });
  } catch (err) {
    console.error('keywords/free error:', err instanceof Error ? err.message : 'unknown');
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}