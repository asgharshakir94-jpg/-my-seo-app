/**
 * backfill-ctas.mjs
 *
 * One-time script to find older `campaigns` rows whose `content` is missing
 * the CTA blocks (added to the generation pipeline after ~July 16-20) and
 * append the correct trade-specific CTAs to them.
 *
 * HOW TO RUN
 * ----------
 * 1. Make sure these packages are installed (they likely already are):
 *      npm install @supabase/supabase-js
 * 2. Set two environment variables before running (PowerShell example):
 *      $env:SUPABASE_URL="https://vquzrlcnlvxgskxvtphf.supabase.co"
 *      $env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-from-supabase-dashboard"
 *    (Use the SERVICE ROLE key, not the anon key, since RLS would block a
 *    bulk update otherwise. Find it in Supabase Dashboard -> Project
 *    Settings -> API -> service_role secret.)
 * 3. First do a DRY RUN to see what it *would* change, without writing:
 *      node backfill-ctas.mjs --dry-run
 * 4. Review the console output. If it looks right, run for real:
 *      node backfill-ctas.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.\n' +
    'Set them first, e.g.:\n' +
    '  $env:SUPABASE_URL="https://your-project.supabase.co"\n' +
    '  $env:SUPABASE_SERVICE_ROLE_KEY="ey..."\n'
  );
  process.exit(1);
}

const DRY_RUN = process.argv.includes('--dry-run');

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const TRADE_KEYWORDS = {
    hvac: ['hvac', 'furnace', 'air condition', 'heat pump'],
    roofing: ['roof', 'shingle', 'gutter', 'storm damage'],
    solar: ['solar', 'panel', 'inverter'],
    plumbing: ['plumb', 'pipe', 'drain', 'water heater'],
    electrical: ['electric', 'wiring', 'panel upgrade', 'circuit'],
  };

const TRADE_CALCULATOR = {
  roofing: { slug: 'roofing-calculator', label: 'Roofing Business Profit Margins' },
  solar: { slug: 'solar-calculator', label: 'Solar Installer Profit Margins' },
  hvac: { slug: 'hvac-calculator', label: 'HVAC Business Profit Margins' },
  plumbing: { slug: 'plumbing-calculator', label: 'Plumbing Business Profit Margins' },
  electrical: { slug: 'electrical-calculator', label: 'Electrical Business Profit Margins' },
};

function detectTrade(keyword) {
  const k = (keyword || '').toLowerCase();
  for (const [trade, terms] of Object.entries(TRADE_KEYWORDS)) {
    if (terms.some((t) => k.includes(t))) return trade;
  }
  return null;
}

function buildCtaBlock(trade) {
  const calc = TRADE_CALCULATOR[trade];

  const auditBlock = `
<div class="cta-box">
  <h3>Want to know how your site stacks up?</h3>
  <p>Get a free instant SEO audit...</p>
  <a href="https://rankinseo.xyz/audit">Get Your Free Audit &rarr;</a>
</div>`;

  if (!calc) {
    return auditBlock;
  }

  const calcBlock = `
<div class="cta-box">
  <h3>Calculate Your ${calc.label}</h3>
  <p>Use our free ${trade} calculator...</p>
  <a href="https://rankinseo.xyz/tools/${calc.slug}">Try the Calculator &rarr;</a>
</div>`;

  return `${auditBlock}\n${calcBlock}`;
}

async function main() {
  console.log(DRY_RUN ? '--- DRY RUN (no writes will be made) ---' : '--- LIVE RUN ---');

  const { data: rows, error } = await supabase
    .from('campaigns')
    .select('id, keyword, content')
    .not('content', 'is', null);

  if (error) {
    console.error('Failed to fetch campaigns:', error.message);
    process.exit(1);
  }

  const missingCta = rows.filter((r) => !r.content.includes('cta-box'));

  console.log(`Total rows: ${rows.length}`);
  console.log(`Rows missing CTA: ${missingCta.length}\n`);

  const noTradeDetected = [];
  let updatedCount = 0;

  for (const row of missingCta) {
    const trade = detectTrade(row.keyword);

    if (!trade) {
      noTradeDetected.push(row);
    }

    const ctaBlock = buildCtaBlock(trade);
    const newContent = `${row.content.trimEnd()}\n${ctaBlock}\n`;

    console.log(
      `Row ${row.id} — "${row.keyword}" — trade: ${trade ?? 'NONE (audit CTA only)'}`
    );

    if (!DRY_RUN) {
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({ content: newContent })
        .eq('id', row.id);

      if (updateError) {
        console.error(`  Failed to update row ${row.id}:`, updateError.message);
      } else {
        updatedCount++;
      }
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Rows that would be / were updated: ${missingCta.length}`);
  if (!DRY_RUN) console.log(`Successfully updated: ${updatedCount}`);
  if (noTradeDetected.length) {
    console.log(
      `\nRows with NO trade match (only audit CTA appended, may want to review manually):`
    );
    noTradeDetected.forEach((r) => console.log(`  - id ${r.id}: "${r.keyword}"`));
  }

  if (DRY_RUN) {
    console.log('\nThis was a dry run — no data was changed. Re-run without --dry-run to apply.');
  }
}

main();