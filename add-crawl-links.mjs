// add-crawl-links.mjs
// Adds internal links from indexed, trusted pages into the 5 newly-fixed
// (currently unindexed) orphaned articles, to help Google discover/crawl them.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Each entry: which indexed article gets one or more new sentences appended,
// each linking to one of the newly-fixed unindexed articles.
const LINKS = [
  {
    sourceSlug: 'roof-damage-restoration-cost-2026',
    additions: [
      {
        targetSlug: 'roof-storm-damage-guide-orlando',
        sentence: "If you're in Orlando and recently weathered a storm, see our guide on [assessing roof storm damage](/blog/roof-storm-damage-guide-orlando).",
      },
      {
        targetSlug: 'hail-damaged-roof-materials-calgary',
        sentence: "Calgary homeowners dealing with hail damage can find material-specific guidance in our [hail-damaged roof materials guide](/blog/hail-damaged-roof-materials-calgary).",
      },
      {
        targetSlug: 'winter-roof-protection-omaha',
        sentence: "Omaha homeowners preparing for winter should also check out our guide to [protecting your roof from ice dams](/blog/winter-roof-protection-omaha).",
      },
    ],
  },
  {
    sourceSlug: 'roofing-contractor-near-me',
    additions: [
      {
        targetSlug: 'emergency-roof-leak-repair-austin',
        sentence: "If you're dealing with an active leak in Austin right now, see our [emergency roof leak guide](/blog/emergency-roof-leak-repair-austin) for immediate steps.",
      },
    ],
  },
  {
    sourceSlug: 'how-to-write-a-roofing-estimate-fast',
    additions: [
      {
        targetSlug: 'how-to-find-the-most-experienced-roofer-austin',
        sentence: "Homeowners in Austin comparing estimates should also read our guide on [finding the most experienced roofer in town](/blog/how-to-find-the-most-experienced-roofer-austin).",
      },
    ],
  },
];

async function main() {
  for (const { sourceSlug, additions } of LINKS) {
    const { data: row, error: fetchErr } = await supabase
      .from('campaigns')
      .select('id, content')
      .eq('slug', sourceSlug)
      .single();

    if (fetchErr || !row) {
      console.error(`Could not fetch source "${sourceSlug}":`, fetchErr);
      continue;
    }

    let content = row.content;
    let changed = false;

    for (const { targetSlug, sentence } of additions) {
      const href = `/blog/${targetSlug}`;
      if (content.includes(href)) {
        console.log(`  - ${sourceSlug} already links to ${targetSlug}, skipping.`);
        continue;
      }
      content += `\n\n${sentence}\n`;
      changed = true;
      console.log(`  + Adding link ${sourceSlug} -> ${targetSlug}`);
    }

    if (!changed) {
      console.log(`No changes needed for ${sourceSlug}.\n`);
      continue;
    }

    const { error: updateErr } = await supabase
      .from('campaigns')
      .update({ content })
      .eq('id', row.id);

    if (updateErr) {
      console.error(`Error updating ${sourceSlug}:`, updateErr);
      continue;
    }

    console.log(`✅ Updated ${sourceSlug}\n`);
  }
}

main();
