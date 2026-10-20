# RankinSEO - Architecture & Decisions Log

Internal reference for the RankinSEO platform (Ironclad Automations).
Last updated: October 2026.

---

## 1. What this is

AI-powered SEO article generation and publishing platform for trades
businesses (roofers, solar installers, plumbers, builders). Users get
a 14-day free trial (no card required), generate SEO articles via an
AI pipeline, and publish to a native blog.

---

## 2. Stack

| Layer | Tech | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | Full-stack in one repo, Vercel-native |
| Hosting | Vercel | Auto-deploy from GitHub `main` |
| Database/Auth | Supabase (Postgres + `@supabase/ssr`) | Auth, RLS, generous free tier |
| AI | OpenAI `gpt-5.6-terra` (brief + article generation), `gpt-5-mini` (risk scoring) | Quality for writing, cheap for scoring |
| Payments | Lemon Squeezy (Merchant of Record) | Works for a Pakistan-based seller; handles global tax/VAT |
| Email | Resend (domain `rankinseo.xyz` verified) | Finder report emails, Write for Us alerts |
| Blog CMS | Native (`/blog` route, Supabase-backed) | Originally Webflow via MCP export - abandoned (see section 7) |

**Repo**: `asgharshakir94-jpg/-my-seo-app`, local path `C:\Users\Home\my-seo-app`.
**Deploy**: push to `main` -> Vercel auto-builds -> live on `rankinseo.xyz`.

---

## 3. Data model (Supabase, `public` schema)

### `campaigns`
Core table - one row per article/keyword campaign.
- `status`: `generating` -> `pending_review` / `approved` -> `exported`; `archived` hides an article from the blog and sitemap
- `risk_score` (int), `risk_flags` (jsonb) - from AI risk-scoring pass
- `slug` (unique), `meta_description` - used by the native blog
- RLS: anon can read only `approved` / `exported` rows; users can insert and update their own rows

### `subscriptions`
Lemon Squeezy subscription state, one row per subscription.
- `user_id` -> `auth.users(id)`, `lemonsqueezy_subscription_id` (the upsert conflict key), `lemonsqueezy_customer_id`
- Other columns (status, plan, period end) are set in the same upsert; check the exact names in the Supabase Table Editor
- RLS enabled - user can `select` only their own row
- Written exclusively by the webhook (service role key - bypasses RLS)

### Supporting tables
`contact_submissions`, `keyword_suggestions`, `subscribers` (contact form,
keyword tool, newsletter), `keyword_cache` and `keyword_requests` (free
Keyword Finder), `link_prospects` and `prospect_leads` (Backlink
Opportunity Finder), `guest_submissions` (Write for Us form, insert-only
anon policy). RLS is on for all of them.

---

## 4. Content generation pipeline

Manual generation from the dashboard ("Launch Pipeline",
`app/api/generate/route.ts`) is the primary method.

1. **Brief generator** - cheap, non-streamed pre-call. Produces structured
   JSON: `must_cover_subtopics`, `local_details`, `faqs`, `unverified_claims`
   (flags potentially stale numeric claims for human review).
2. **Article generation** - main call using the brief as input. The server
   generates slug, title and meta description, injects a single `<h1>`, and
   adds a calculator CTA for matching trade keywords (`matchTrade()` in
   `lib/tradeCalculators.ts`).
3. **Risk scoring** - secondary LLM call (`gpt-5-mini`), returns structured
   risk score + flags. Articles scoring below 30 auto-approve; others land
   in `pending_review`.

The auto-generate cron (`/api/cron/auto-generate`) is built but disabled:
cron articles skip risk scoring because of the Hobby plan's 60s timeout.
`/api/cron/fetch-trends` feeds `keyword_suggestions` from Google Trends.

**Known gotcha**: reasoning models burn significant tokens on internal
reasoning before producing output. `max_completion_tokens` must be set
generously (see the values in `app/api/generate/route.ts`) or you get
empty responses that silently fail JSON parsing.

**Content-save decoupled from risk-scoring** using Next.js `after()` -
this avoids Vercel serverless timeouts cutting off the Supabase status
update mid-generation (this was a critical bug, fixed mid-July).

---

## 5. Auth & routing

- Supabase auth via `@supabase/ssr`. Two clients:
  - `lib/supabase/client.ts` - browser client (`createBrowserClient`)
  - `lib/supabase/server.ts` - server client (`createClient()`, async,
    awaited `cookies()` - Next.js 15+ pattern)
- `proxy.ts` middleware gates `/dashboard` and API routes
- Public landing page (`/`) is a **Server Component** (exports `metadata`);
  interactive bits live in `components/HomePageClient.tsx` (Client Component)
- Funnel: `/quiz` -> `/plan` -> login/signup -> `/dashboard`

**Known gotcha**: any page using `useSearchParams()` (e.g. `/auth/confirm`,
`/plan`) needs a `<Suspense>` boundary around it for Next.js static
prerendering, or the build fails. Pattern: split into inner `XContent`
component + outer `XPage` export wrapping it in `<Suspense fallback={...}>`.

---

## 6. Payments (Lemon Squeezy)

Lemon Squeezy is the only payment processor. Paddle was fully removed from
code and env on Aug 13, 2026 (a UK-GDPR data removal request to Paddle is
still being processed on their side).

### Store and plans
Store: `rankinseo.lemonsqueezy.com`, currency USD. Two variants:
- Starter: $49/mo
- Growth: $129/mo

### Checkout flow
`components/PricingSection.tsx`:
1. Loads `lemon.js` and opens the Lemon Squeezy checkout overlay using the
   hardcoded checkout (UUID) links for each plan
2. Prefills email and `user_id` from the Supabase session
3. The `user_id` passed with checkout is the link between a Lemon Squeezy
   subscription and a Supabase user. Without it, the webhook cannot
   attribute a subscription to anyone.

### Webhook
`app/api/webhooks/lemonsqueezy/route.ts`:
- Verifies the `x-signature` header with HMAC-SHA256 over the raw body,
  using `LEMONSQUEEZY_WEBHOOK_SECRET`
- Handles the subscription lifecycle events and writes them into the
  `subscriptions` table
- Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS (the webhook has no user session)

### Payouts
Lemon Squeezy pays out to an MCB bank account in Pakistan via SWIFT
(about $15 per transfer). W-8BEN tax certificate completed; identity
verification (NIC + selfie via Stripe) cleared.

### Still outstanding
- Test-mode vs live-mode checkout behaviour was inconsistent as of Aug 15;
  re-test an end-to-end purchase and confirm the `subscriptions` row
- Verify whether any in-app logic reacts to `subscriptions.status`
  (feature-gating, trial expiry, current-plan UI)

---

## 7. Blog (native, not Webflow)

Originally exported articles to Webflow CMS via MCP. Abandoned because:
- Custom domains (needed to connect a Webflow blog under `rankinseo.xyz`)
  are paid-tier only (~$14-18/mo) - ruled out
- Exported articles were stuck as unpublished drafts (export route never
  called Webflow's publish step)
- Webflow's CMS template had no header/footer around content

Replaced with a native `/blog` route reading straight from the `campaigns`
table - zero extra cost, reuses the existing design system.
`app/api/mcp/route.ts` (old Webflow export endpoint) left in place unused.

`CMS_API_TOKEN` env var is a leftover from this, safe to ignore/remove.

Current behaviour:
- `trailingSlash: true` - articles live at `/blog/<slug>/`
- `/blog` directory has a search box (`components/BlogSearchList.tsx`) and
  only lists approved articles
- Each article page has BlogPosting schema, a canonical URL and a
  5-link Related articles block

---

## 7b. Sitemap & indexing

- `app/sitemap.ts` reads `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` from env. Archived rows are hidden by RLS.
- To keep a live page out of the sitemap, add its slug to `EXCLUDED_SLUGS`
  at the top of `app/sitemap.ts`.
- Submitted in Search Console as `/sitemap.xml/` (with trailing slash).
- Publishing an article calls the Google Indexing API through
  `notifyGoogleIndexing` (service account), sending `/blog/<slug>/`
  with the trailing slash.
- Removed or merged articles get a 301 in `next.config.ts`.

---

## 8. Design system

Custom Tailwind tokens, not raw Tailwind colors: `bg-paper`, `text-ink`,
`bg-surface`, `border-line`, `placeholder-sand`, `accent-from`.
Tailwind v4: config lives in `app/globals.css`, there is no `tailwind.config.*`.

---

## 9. Environment variables reference

| Variable | Public? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | Yes | Supabase client init, sitemap |
| `SUPABASE_SERVICE_ROLE_KEY` | **No** | Server-side, bypasses RLS - used by the webhook and scripts |
| `OPENAI_API_KEY` | **No** | Article generation, risk scoring |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | **No** | Verifies incoming Lemon Squeezy webhook signatures |
| `CRON_SECRET` | **No** | Auth for `/api/cron/*` routes |
| `SERPER_API_KEY` | **No** | Keyword Finder, guest-post collector |
| `RESEND_API_KEY` / `FINDER_FROM_EMAIL` | **No** | Outgoing email (finder reports, Write for Us alerts) |
| `GOOGLE_INDEXING_CLIENT_EMAIL` / `GOOGLE_INDEXING_PRIVATE_KEY` | **No** | Google Indexing API service account |
| `CMS_API_TOKEN` | **No** | Unused leftover, safe to ignore |

Lemon Squeezy checkout links are hardcoded in `components/PricingSection.tsx`,
so there are no public Lemon Squeezy env vars.

Sensitive values live in `.env.local` (git-ignored) and Vercel's
Environment Variables (encrypted). Never commit, never screenshot
uncropped.

---

## 10. Known bugs fixed (for pattern-recognition later)

- **Slug bug** (twice): both the MCP export route and the approve route
  independently forgot to write `slug` back to `campaigns`, making
  articles invisible on `/blog` (which filters out null slugs). Fix
  pattern: compute slug once, include in every `.update()` that changes
  article status.
- **Insert vs update**: early pipeline bug where new keyword campaigns
  needed an `.insert()` step, not just `.update()` on non-existent rows.
- **Vercel timeout truncation**: long-running risk-scoring calls got cut
  off mid-request by serverless function timeouts. Fixed by decoupling
  with `after()`.
- **Calculator 404s**: a folder named `app/tools/[trade]-calculator` is not
  valid in the App Router (a dynamic segment must be the whole folder
  name). Fixed by using `app/tools/[trade]` and carrying the
  `-calculator` suffix in the param value.
- **Sitemap URLs**: the sitemap listed `/<slug>` while articles live at
  `/blog/<slug>/`. Fixed in commit 264275d.

---

## 11. Monitoring

UptimeRobot (free tier), 5-minute intervals, monitoring `rankinseo.xyz`
and `/login`. Email alerts only. Search Console emails indexing and
redirect-validation results.

---

## 12. Logging

Structured logging via `lib/logger.ts` - never raw `console.log`/`console.error`
in API routes. Every log call takes an object with an `event` key plus relevant
fields (ids, error messages, counts), output as one-line JSON so Vercel's log
search can filter/query by field instead of grepping text.

```typescript
import { logger } from '@/lib/logger';

logger.info({ event: 'something_happened', userId, campaignId });
logger.error({ event: 'something_failed', campaignId, error: err.message });
```

Currently wired into:
- `app/api/webhooks/lemonsqueezy/route.ts` - `lemonsqueezy_webhook_received`,
  `lemonsqueezy_webhook_missing_user_id`, `lemonsqueezy_webhook_processing_failed`,
  `lemonsqueezy_webhook_processed`
- `app/api/generate/route.ts` - `generation_started`, `brief_generation_failed`,
  `risk_scoring_empty_response`, `risk_scoring_failed`, `risk_score_save_failed`,
  `risk_scoring_completed`, `risk_scoring_background_failed`,
  `article_save_failed`, `article_generated`, `generate_route_failed`

Apply the same pattern to any new API route going forward.
`app/api/generate/route.ts` also generates a `requestId` (via `crypto.randomUUID()`)
at the start of each request and threads it through every log line for that
request - including inside helper functions like `generateBrief` and
`runRiskScoringInBackground` - so the full lifecycle of one generation request
can be traced in Vercel's log search even under concurrent traffic. The
Lemon Squeezy webhook doesn't need a separate `requestId` since the
subscription id already serves as its natural correlation key.

Apply the same pattern (a `requestId` correlation field) to any new route that
spans multiple async steps or helper functions going forward.