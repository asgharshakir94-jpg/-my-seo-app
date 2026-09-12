// add-internal-link.mjs
// One-off script: adds a sentence linking roof-inspection-cost -> gutter-cleaning-cost
//
// Run from your project root (same folder as backfill-ctas.mjs), with the
// same SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars you used there.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  // 1. Find the two gutter-cleaning-cost candidates and let the script decide
  //    which is the generic/national one (no city mention in content).
  const { data: gutterRows, error: gutterErr } = await supabase
    .from('campaigns')
    .select('id, slug, keyword, content')
    .ilike('slug', '%gutter-cleaning-cost%');

  if (gutterErr) {
    console.error('Error fetching gutter-cleaning-cost rows:', gutterErr);
    process.exit(1);
  }

  if (!gutterRows || gutterRows.length === 0) {
    console.error('No gutter-cleaning-cost rows found. Check the slug pattern.');
    process.exit(1);
  }

  console.log(`Found ${gutterRows.length} gutter-cleaning-cost row(s):`);
  gutterRows.forEach(r => {
    const isLocalized = /austin|central texas/i.test(r.content || '');
    console.log(`  - id=${r.id} slug=${r.slug} localized=${isLocalized}`);
  });

  // Prefer the Austin-localized version (roof-inspection-cost is Austin-specific)
  const target = gutterRows.find(r => /austin|central texas/i.test(r.content || ''))
    || gutterRows[0]; // fallback if only one exists

  console.log(`\nLinking to: /blog/${target.slug} (id=${target.id})\n`);

  // 2. Fetch roof-inspection-cost
  const { data: roofRow, error: roofErr } = await supabase
    .from('campaigns')
    .select('id, slug, content')
    .eq('slug', 'roof-inspection-cost')
    .single();

  if (roofErr || !roofRow) {
    console.error('Error fetching roof-inspection-cost row:', roofErr);
    process.exit(1);
  }

  const newHref = `/blog/${target.slug}`;
  let updatedContent;

  // Check if a gutter-cleaning-cost link already exists (possibly pointing to a different slug)
  const existingLinkRegex = /\(\/blog\/gutter-cleaning-cost(-2026)?\)/;
  const match = roofRow.content.match(existingLinkRegex);

  if (match) {
    const existingHref = match[0].slice(1, -1); // strip parens
    if (existingHref === newHref) {
      console.log('Correct link already present in roof-inspection-cost content. No changes made.');
      return;
    }
    console.log(`Found existing link to ${existingHref}, updating it to ${newHref}...`);
    updatedContent = roofRow.content.replace(existingLinkRegex, `(${newHref})`);
  } else {
    const linkSentence = `\n\nWhile checking your roof, it is also wise to consider the [gutter cleaning cost](${newHref}) to prevent water damage.\n`;
    updatedContent = roofRow.content + linkSentence;
  }

  const { error: updateErr } = await supabase
    .from('campaigns')
    .update({ content: updatedContent })
    .eq('id', roofRow.id);

  if (updateErr) {
    console.error('Error updating roof-inspection-cost content:', updateErr);
    process.exit(1);
  }

  console.log('✅ Link sentence added to roof-inspection-cost content.');
}

main();