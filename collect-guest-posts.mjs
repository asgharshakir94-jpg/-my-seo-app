// collect-guest-posts.mjs  (v2, stricter filters)
// Finds "write for us" / guest-post submission pages with Serper and inserts
// them into link_prospects as UNVERIFIED rows (verified_at null, is_free false).
// Usage:
//   node --env-file=.env.local .\collect-guest-posts.mjs --dry-run
//   node --env-file=.env.local .\collect-guest-posts.mjs

import { createClient } from "@supabase/supabase-js";

const DRY = process.argv.includes("--dry-run");
const SERPER_KEY = process.env.SERPER_API_KEY;
const SB_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!SERPER_KEY) {
  console.error("Missing SERPER_API_KEY. Run with --env-file=.env.local");
  process.exit(1);
}
if (!SB_URL || !SB_KEY) {
  console.error(
    "Missing Supabase URL or secret key. Looked for SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY."
  );
  process.exit(1);
}

const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });

const JOBS = [
  { niche: "plumbing", queries: ['plumbing "write for us"', 'plumber blog "guest post" submit'] },
  { niche: "roofing", queries: ['roofing "write for us"', 'roofing blog "guest post" submit'] },
  { niche: "hvac", queries: ['hvac "write for us"', 'heating cooling blog "guest post"'] },
  { niche: "electrical", queries: ['electrician "write for us"', 'electrical contractor blog "guest post"'] },
  { niche: "solar", queries: ['solar energy "write for us"', 'solar blog "guest post" submit'] },
  { niche: "home services", queries: ['home improvement "write for us"', 'home services blog "guest post"', 'contractor "become a contributor" home'] },
  { niche: "software", queries: ['saas "write for us"', 'software blog "guest post" submit'] },
  { niche: "marketing agency", queries: ['digital marketing "write for us"', 'seo blog "guest post" submit'] },
];

// Big platforms, marketplaces and sites that SELL guest posts
const BLOCK_HOSTS = new Set([
  "facebook.com", "youtube.com", "reddit.com", "linkedin.com", "pinterest.com",
  "wikipedia.org", "medium.com", "quora.com", "amazon.com", "twitter.com",
  "x.com", "instagram.com", "tiktok.com", "forbes.com", "entrepreneur.com",
  "yelp.com", "github.com", "substack.com", "wordpress.com",
  "fiverr.com", "legiit.com", "seoclerk.com", "upwork.com", "slideserve.com",
  "vefogix.com", "writersweekly.com", "collaborator.pro", "linkpublishers.com",
  "adsy.com", "qualityguestpost.com", "guestpostlinks.net", "prposting.com",
  "serpzilla.com", "web20ranker.com", "mentionagent.ai", "seojet.net",
  "seopressor.com", "aamax.co", "meteoraweb.com",
]);
const BLOCK_SUFFIX = [".gov", ".edu", ".blogspot.com", ".wordpress.com", ".wixsite.com", ".medium.com", ".home.blog"];

// Non-US country domains (the finder is US-only)
const NON_US_TLD =
  /\.(com?\.)?(uk|in|pk|au|nz|za|ng|ke|ph|bd|lk|my|sg|ae|sa|pl|de|fr|es|it|nl|br|mx|ru|tr|id|cn|jp|kr|eg|gh|ie|ca)$/;

// The URL PATH must look like a submission page
const GUEST_PATH_RE =
  /(write[-_]?(for|to)[-_]?us|guest[-_]?(post|blog|author|article|contribut|submission)|submit[-_]?(a[-_]?)?(guest|article|post|story)|become[-_]?a[-_]?contributor|contribute|contributor)/;
// ...and must not look like an article, list, service page or dated post
const BAD_PATH_RE =
  /(sites|list|services?|how-to|best|top-|guide\b|tips|ideas|strategies|statistics|what-|buy|cheap|pricing|\/threads?\/|\/tag\/|\/author\/|\/\d{4}\/\d{2}\/)/;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parse(link) {
  try {
    const u = new URL(link);
    return {
      host: u.hostname.toLowerCase().replace(/^www\./, ""),
      path: decodeURIComponent(u.pathname).toLowerCase(),
    };
  } catch {
    return null;
  }
}

function isBlocked(host) {
  if (BLOCK_HOSTS.has(host)) return true;
  if (NON_US_TLD.test(host)) return true;
  return BLOCK_SUFFIX.some((s) => host.endsWith(s));
}

function cleanName(title) {
  if (!title) return null;
  const parts = title.split(/\s+[|–—-]\s+/);
  const name = (parts.length > 1 ? parts[parts.length - 1] : parts[0]).trim();
  return name.slice(0, 60) || null;
}

async function serper(q) {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ q, gl: "us", hl: "en", num: 10 }),
  });
  if (!res.ok) throw new Error(`Serper ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.organic || [];
}

async function main() {
  const { data: existing, error: exErr } = await sb
    .from("link_prospects")
    .select("domain");
  if (exErr) {
    console.error("Could not read link_prospects:", exErr.message);
    process.exit(1);
  }
  const seen = new Set(existing.map((r) => r.domain.toLowerCase().replace(/^www\./, "")));
  console.log(`Existing domains in table: ${seen.size}`);

  const rows = [];
  let credits = 0;

  for (const job of JOBS) {
    for (const q of job.queries) {
      let results = [];
      try {
        results = await serper(q);
        credits++;
      } catch (e) {
        console.error(`  query failed (${q}): ${e.message}`);
        continue;
      }
      let added = 0;
      for (const r of results) {
        const p = parse(r.link);
        if (!p || isBlocked(p.host) || seen.has(p.host)) continue;
        if (p.path.endsWith(".pdf")) continue;
        if (!GUEST_PATH_RE.test(p.path)) continue;
        if (BAD_PATH_RE.test(p.path)) continue;
        seen.add(p.host);
        added++;
        rows.push({
          domain: p.host,
          site_name: cleanName(r.title),
          type: "guest_post",
          country: "US",
          niche: job.niche,
          submit_url: r.link.split("?")[0], // drop tracking params
          is_free: false, // flip to true only after you confirm it accepts free guest posts
          notes: `Auto-found via Serper: ${q}`,
        });
      }
      console.log(`[${job.niche}] ${q} -> ${added} new`);
      await sleep(400);
    }
  }

  console.log(`\nSerper credits used: ${credits}`);
  console.log(`New candidate rows: ${rows.length}`);
  for (const r of rows) console.log(` - ${r.domain} (${r.niche}) ${r.submit_url}`);

  if (DRY) {
    console.log("\nDry run: nothing inserted.");
    return;
  }
  if (rows.length === 0) {
    console.log("Nothing to insert.");
    return;
  }
  const { error } = await sb.from("link_prospects").insert(rows);
  if (error) {
    console.error("Insert failed:", error.message);
    process.exit(1);
  }
  console.log(`\nInserted ${rows.length} unverified rows.`);
}

main();