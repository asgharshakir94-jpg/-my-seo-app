// check-duplicates.mjs
// Verifies whether any of the 3 crawl-links in roof-damage-restoration-cost-2026
// were accidentally duplicated by the re-run.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data: row, error } = await supabase
    .from('campaigns')
    .select('id, content')
    .eq('slug', 'roof-damage-restoration-cost-2026')
    .single();

  if (error || !row) {
    console.error('Error fetching row:', error);
    process.exit(1);
  }

  const targets = [
    '/blog/roof-storm-damage-guide-orlando',
    '/blog/hail-damaged-roof-materials-calgary',
    '/blog/winter-roof-protection-omaha',
  ];

  console.log(`Content length: ${row.content.length} characters\n`);

  targets.forEach(href => {
    const count = row.content.split(href).length - 1;
    console.log(`"${href}" appears ${count} time(s)`);
  });
}

main();
