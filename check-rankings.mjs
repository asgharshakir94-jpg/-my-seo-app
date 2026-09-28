// check-rankings.mjs
// Checks Google ranking position of rankinseo.xyz for a batch of
// your article keywords, using the Serper API.
//
// Usage: node check-rankings.mjs
// Requires SERPER_API_KEY and SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const serperApiKey = process.env.SERPER_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}
if (!serperApiKey) {
  console.error('Missing SERPER_API_KEY env var.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TEST_BATCH_SIZE = 10; // change or remove this limit once confirmed working

async function checkRanking(keyword) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': serperApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: keyword, gl: 'us', hl: 'en' }),
  });

  if (!res.ok) {
    throw new Error(`Serper API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const organic = data.organic || [];

  const position = organic.findIndex(r => r.link && r.link.includes('rankinseo.xyz'));
  return position === -1 ? null : position + 1; // 1-indexed rank, or null if not in top results
}

async function main() {
  const { data: rows, error } = await supabase
    .from('campaigns')
    .select('id, slug, keyword')
    .not('keyword', 'is', null)
    .limit(TEST_BATCH_SIZE);

  if (error) {
    console.error('Error fetching campaigns:', error);
    process.exit(1);
  }

  console.log(`Checking rankings for ${rows.length} keyword(s)...\n`);

  for (const row of rows) {
    try {
      const rank = await checkRanking(row.keyword);
      const rankLabel = rank ? `#${rank}` : 'not in top results';
      console.log(`"${row.keyword}" (${row.slug}) -> ${rankLabel}`);
    } catch (err) {
      console.error(`"${row.keyword}" -> Error: ${err.message}`);
    }
    // small delay to avoid hammering the API
    await new Promise(r => setTimeout(r, 300));
  }
}

main();
