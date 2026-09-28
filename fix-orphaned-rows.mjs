// fix-orphaned-rows.mjs
// Adds slug + title to the 5 rows that were missing them, and fixes
// the "Orlendo" -> "Orlando" typo in row 23.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const FIXES = [
  {
    id: 23,
    slug: 'roof-storm-damage-guide-orlando',
    title: 'After the Storm: A Practical Roof Damage Guide for Orlando Homeowners',
    fixTypo: { from: /Orlendo/g, to: 'Orlando' },
  },
  {
    id: 24,
    slug: 'emergency-roof-leak-repair-austin',
    title: 'Emergency Roof Leak in Austin: What to Do Right Now and How to Get it Fixed Fast',
  },
  {
    id: 25,
    slug: 'hail-damaged-roof-materials-calgary',
    title: "Hail-Damaged Roofs in Calgary: A Homeowner's Action Plan",
  },
  {
    id: 26,
    slug: 'winter-roof-protection-omaha',
    title: 'Winterize Your Omaha Roof: Practical Steps to Stop Ice Dams and Leaks',
  },
  {
    id: 27,
    slug: 'how-to-find-the-most-experienced-roofer-austin',
    title: 'How to Find and Hire the Most Experienced Roofer in Austin',
  },
];

async function main() {
  // Safety check: make sure none of these slugs already exist on other rows
  const slugs = FIXES.map(f => f.slug);
  const { data: existing, error: checkErr } = await supabase
    .from('campaigns')
    .select('id, slug')
    .in('slug', slugs);

  if (checkErr) {
    console.error('Error checking for slug collisions:', checkErr);
    process.exit(1);
  }

  if (existing && existing.length > 0) {
    console.error('Slug collision(s) found, aborting:', existing);
    process.exit(1);
  }

  for (const fix of FIXES) {
    const { data: row, error: fetchErr } = await supabase
      .from('campaigns')
      .select('id, content')
      .eq('id', fix.id)
      .single();

    if (fetchErr || !row) {
      console.error(`Error fetching row ${fix.id}:`, fetchErr);
      continue;
    }

    let content = row.content;
    if (fix.fixTypo) {
      content = content.replace(fix.fixTypo.from, fix.fixTypo.to);
    }

    const { error: updateErr } = await supabase
      .from('campaigns')
      .update({ slug: fix.slug, title: fix.title, content })
      .eq('id', fix.id);

    if (updateErr) {
      console.error(`Error updating row ${fix.id}:`, updateErr);
      continue;
    }

    console.log(`✅ id=${fix.id} -> slug="${fix.slug}", title="${fix.title}"`);
  }
}

main();
