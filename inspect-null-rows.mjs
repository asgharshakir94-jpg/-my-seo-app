// inspect-null-rows.mjs
// Prints full details of rows with null slug/title so we can decide
// whether to fix or delete them.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data: rows, error } = await supabase
    .from('campaigns')
    .select('*')
    .in('id', [23, 24, 25, 26, 27]);

  if (error) {
    console.error('Error fetching rows:', error);
    process.exit(1);
  }

  rows.forEach(r => {
    console.log(`\n=== id=${r.id} ===`);
    console.log('slug:', r.slug);
    console.log('title:', r.title);
    console.log('keyword:', r.keyword);
    console.log('created_at:', r.created_at);
    console.log('content (first 300 chars):', (r.content || '(empty)').slice(0, 300));
    console.log('content length:', (r.content || '').length);
  });
}

main();