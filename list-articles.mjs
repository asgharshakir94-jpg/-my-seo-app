// list-articles.mjs
// Dumps all campaigns (id, slug, title, keyword) sorted by keyword,
// so we can spot-check for internal linking opportunities together.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TRADE_KEYWORDS = {
  hvac: ['hvac', 'furnace', 'air condition', 'heat pump'],
  roofing: ['roof', 'shingle', 'gutter', 'storm damage'],
  solar: ['solar', 'panel', 'inverter'],
  plumbing: ['plumb', 'pipe', 'drain', 'water heater'],
  electrical: ['electric', 'wiring', 'panel upgrade', 'circuit'],
};

function detectTrade(keyword, title) {
  const k = `${keyword || ''} ${title || ''}`.toLowerCase();
  for (const [trade, words] of Object.entries(TRADE_KEYWORDS)) {
    if (words.some(w => k.includes(w))) return trade;
  }
  return 'general/seo';
}

async function main() {
  const { data: rows, error } = await supabase
    .from('campaigns')
    .select('id, slug, keyword, title, content');

  if (error) {
    console.error('Error fetching campaigns:', error);
    process.exit(1);
  }

  const grouped = {};
  rows.forEach(r => {
    const trade = detectTrade(r.keyword, r.title);
    if (!grouped[trade]) grouped[trade] = [];
    grouped[trade].push(r);
  });

  for (const [trade, items] of Object.entries(grouped)) {
    console.log(`\n=== ${trade.toUpperCase()} (${items.length}) ===`);
    items
      .sort((a, b) => (a.keyword || '').localeCompare(b.keyword || ''))
      .forEach(r => {
        console.log(`  id=${r.id}  slug=${r.slug}  title="${r.title}"`);
      });
  }

  console.log(`\nTotal: ${rows.length} rows`);
}

main();