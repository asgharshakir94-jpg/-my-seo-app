import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENPAGERANK_API_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENPAGERANK_API_KEY) {
  console.error('Missing env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENPAGERANK_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const { data: rows, error } = await supabase.from('link_prospects').select('id, domain');
if (error) {
  console.error('Supabase read failed:', error.message);
  process.exit(1);
}
console.log(`Scoring ${rows.length} domains...`);

let updated = 0;
for (let i = 0; i < rows.length; i += 100) {
  const batch = rows.slice(i, i + 100);

  const res = await fetch('https://openpagerank.keywordseverywhere.com/v1/domains/bulk', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENPAGERANK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ domains: batch.map((r) => r.domain), include_history: false }),
  });
  if (!res.ok) {
    console.error(`Open PageRank error: HTTP ${res.status}`);
    process.exit(1);
  }

  const json = await res.json();
  const list =
    json.results ??
    json.domains ??
    json.data ??
    Object.values(json).find((v) => Array.isArray(v) && v.length && v[0]?.domain) ??
    [];

  for (const item of list) {
    const row = batch.find((r) => r.domain === item.domain);
    if (!row) continue;
    if (!item.found || item.open_page_rank == null) {
      console.log(`  no score: ${item.domain}`);
      continue;
    }
    const { error: upErr } = await supabase
      .from('link_prospects')
      .update({ authority_score: item.open_page_rank })
      .eq('id', row.id);
    if (upErr) {
      console.error(`  update failed for ${item.domain}: ${upErr.message}`);
    } else {
      console.log(`  ${item.domain}: ${item.open_page_rank}`);
      updated++;
    }
  }
}
console.log(`Done. Updated ${updated} of ${rows.length}.`);