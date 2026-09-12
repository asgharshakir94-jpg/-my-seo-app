// add-crawl-links-batch2.mjs
// Second batch: adds internal links from indexed, trusted pages into
// 5 more unindexed articles, to help Google discover/crawl them.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const LINKS = [
  {
    sourceSlug: 'gutter-cleaning-cost',
    additions: [
      {
        targetSlug: 'roof-maintenance-tips',
        sentence: "While you're at it, our [roof maintenance tips](/blog/roof-maintenance-tips) cover other upkeep tasks that go hand-in-hand with clean gutters.",
      },
    ],
  },
  {
    sourceSlug: 'hvac-supply-near-me',
    additions: [
      {
        targetSlug: 'hvac-near-me',
        sentence: "Looking to hire a contractor instead of buying parts yourself? See our guide to [finding HVAC services near you](/blog/hvac-near-me).",
      },
    ],
  },
  {
    sourceSlug: 'seo-checklist-for-denver-residential-roofers',
    additions: [
      {
        targetSlug: 'how-to-rank-a-roofing-company-on-google-maps',
        sentence: "For more on local visibility, see our guide on [how to rank a roofing company on Google Maps](/blog/how-to-rank-a-roofing-company-on-google-maps).",
      },
    ],
  },
  {
    sourceSlug: 'average-overhead-costs-for-running-a-trade-business-in-alberta',
    additions: [
      {
        targetSlug: 'best-crm-software-for-roofers-in-calgary',
        sentence: "If you're managing overhead in Alberta, our roundup of [the best CRM software for roofers in Calgary](/blog/best-crm-software-for-roofers-in-calgary) can help streamline operations.",
      },
    ],
  },
  {
    sourceSlug: 'acculynx-vs-jobnimbus-vs-roofer-for-austin-trade-businesses',
    additions: [
      {
        targetSlug: 'best-estimating-apps-for-solar-installers-in-austin',
        sentence: "Running a different trade in Austin? Check out our picks for [the best estimating apps for solar installers](/blog/best-estimating-apps-for-solar-installers-in-austin).",
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
