# RankinSEO — Architecture & Decisions Log

Internal reference for the RankinSEO platform (Ironclad Automations). 
Last updated: July 2026.

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
| AI | OpenAI `gpt-5-mini` | Article generation + risk scoring |
| Payments | Paddle (Merchant of Record) | Stripe unavailable in Pakistan; Paddle handles global tax/VAT |
| Blog CMS | Native (`/blog` route, Supabase-backed) | Originally Webflow via MCP export — abandoned (see §7) |

**Repo**: `asgharshakir94-jpg/-my-seo-app`, local path `C:\Users\Home\my-seo-app`.
**Deploy**: push to `main` → Vercel auto-builds → live on `rankinseo.xyz`.

---

## 3. Data model (Supabase, `public` schema)

### `campaigns`
Core table — one row per article/keyword campaign.
- `status`: `generating` → `pending_review` / `approved` → `exported`
- `risk_score` (int), `risk_flags` (jsonb) — from AI risk-scoring pass
- `slug` (unique), `meta_description` — added for native blog
- RLS: user can only see their own campaigns

### `subscriptions`
Paddle subscription state, one row per Paddle subscription.
- `user_id` → `auth.users(id)`
- `paddle_subscription_id` (unique), `paddle_customer_id`
- `status`, `plan`, `price_id`, `current_period_end`
- RLS enabled — user can `select` only their own row
- Written exclusively by the webhook (service role key — bypasses RLS)

### `contact_submissions`, `keyword_suggestions`, `subscribers`
Supporting tables for the `/contact` form, keyword tool, and newsletter 
signups respectively.

---

## 4. Content generation pipeline

Two-step architecture, both calls to `gpt-5-mini`:

1. **Brief generator** — cheap, non-streamed pre-call. Produces structured 
   JSON: `must_cover_subtopics`, `local_details`, `faqs`, `unverified_claims` 
   (flags potentially stale numeric claims for human review).
2. **Article generation** — main call using the brief as input. System 
   prompt: "RankinSEO's elite Autonomous SEO Campaign Pipeline."
3. **Risk scoring** — secondary LLM call, returns structured risk score + 
   flags. Articles scoring below 30 auto-approve; others land in 
   `pending_review`.

**Known gotcha**: `gpt-5-mini` burns significant tokens on internal 
reasoning before producing output. `max_completion_tokens` must be set 
generously (currently 6000 for article gen, 4000 for risk scoring) or 
you get empty responses that silently fail JSON parsing.

**Content-save decoupled from risk-scoring** using Next.js `after()` — 
this avoids Vercel serverless timeouts cutting off the Supabase status 
update mid-generation (this was a critical bug, fixed mid-July).

---

## 5. Auth & routing

- Supabase auth via `@supabase/ssr`. Two clients:
  - `lib/supabase/client.ts` — browser client (`createBrowserClient`)
  - `lib/supabase/server.ts` — server client (`createClient()`, async, 
    awaited `cookies()` — Next.js 15+ pattern)
- `proxy.ts` middleware gates `/dashboard` and API routes
- Public landing page (`/`) is a **Server Component** (exports `metadata`); 
  interactive bits live in `components/HomePageClient.tsx` (Client Component)
- Funnel: `/quiz` → `/plan` → login/signup → `/dashboard`

**Known gotcha**: any page using `useSearchParams()` (e.g. `/auth/confirm`, 
`/plan`) needs a `<Suspense>` boundary around it for Next.js static 
prerendering, or the build fails. Pattern: split into inner `XContent` 
component + outer `XPage` export wrapping it in `<Suspense fallback={...}>`.

---

## 6. Payments (Paddle)

### Environments — this bit us once, document carefully
Paddle has **two completely separate environments** with separate 
dashboards, separate data, and separate webhook signing secrets:
- **Sandbox**: `sandbox-vendors.paddle.com` — test mode, fake cards work
- **Production**: `vendors.paddle.com` — real money

Which one your app talks to is controlled by `NEXT_PUBLIC_PADDLE_ENV` 
(`sandbox` or `production`), read in `PricingSection.tsx`'s 
`Paddle.Environment.set()` call. **Currently set to `sandbox`.**

Each environment needs its **own webhook destination** registered 
separately (Developer Tools → Notifications → New destination) with 
its **own secret** — they are not interchangeable.

### Checkout flow
`components/PricingSection.tsx`:
1. Loads `paddle.js` dynamically, initializes with `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
2. `handleCheckout(priceId)` fetches the logged-in Supabase user
3. Redirects to `/login` if not authenticated
4. Opens `Paddle.Checkout.open()` with `customData: { user_id: user.id }` 
   — **this is the only link between a Paddle subscription and a Supabase 
   user**. Without it, the webhook can't attribute a subscription to anyone.

### Webhook
`app/api/webhooks/paddle/route.ts`:
- Verifies `Paddle-Signature` header (`ts=...;h1=...`) via HMAC-SHA256 
  over `{ts}:{rawBody}`, 5-minute replay tolerance
- Handles: `subscription.created/updated/activated` → upsert into 
  `subscriptions`; `subscription.canceled/paused` → status update
- Plan name resolved via a hardcoded `price_id → plan name` map 
  (`getPlanName()`) rather than trusting Paddle's payload shape, since 
  Paddle doesn't reliably include a plan `name` field on subscription events
- Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS (webhook has no user session)

### Price IDs (sandbox)
- Starter ($49/mo): `pri_01ky4d97vn69zedfatxtbcznre`
- Growth ($129/mo): `pri_01ky4d4fvtbzf10jzybs62t0rb`

### Payouts
Evaluated Payoneer, SadaBiz (SadaPay), and Elevate Pay for getting funds 
out of Paddle to Pakistan. Elevate Pay chosen — Y Combinator-backed, 
FDIC-insured via US banking partners, ~$1.50 flat transfer fee, and 
handles PRC (Proceeds Realization Certificate) documentation relevant 
to Pakistani IT-export tax status.

### Still outstanding
- No in-app logic yet reacts to `subscriptions.status` (no feature-gating, 
  no trial-expiry handling, no UI showing current plan)
- Production Paddle webhook destination not yet created (only sandbox exists)

---

## 7. Blog (native, not Webflow)

Originally exported articles to Webflow CMS via MCP. Abandoned because:
- Custom domains (needed to connect a Webflow blog under `rankinseo.xyz`) 
  are paid-tier only (~$14-18/mo) — ruled out
- Exported articles were stuck as unpublished drafts (export route never 
  called Webflow's publish step)
- Webflow's CMS template had no header/footer around content

Replaced with a native `/blog` route reading straight from the `campaigns` 
table — zero extra cost, reuses the existing design system. 
`app/api/mcp/route.ts` (old Webflow export endpoint) left in place unused.

`CMS_API_TOKEN` env var is a leftover from this, safe to ignore/remove.

---

## 8. Design system

Custom Tailwind tokens, not raw Tailwind colors: `bg-paper`, `text-ink`, 
`bg-surface`, `border-line`, `placeholder-sand`, `accent-from`.

---

## 9. Environment variables reference

| Variable | Public? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | Yes | Supabase client init |
| `SUPABASE_SERVICE_ROLE_KEY` | **No** | Server-side, bypasses RLS — used by webhook |
| `OPENAI_API_KEY` | **No** | Article generation, risk scoring |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Yes | Paddle.js checkout init |
| `NEXT_PUBLIC_PADDLE_ENV` | Yes | `sandbox` or `production` — controls which Paddle account is used |
| `NEXT_PUBLIC_PADDLE_PRICE_STARTER` / `_GROWTH` | Yes | Price IDs shown in checkout |
| `PADDLE_API_KEY` | **No** | Server-side Paddle API calls |
| `PADDLE_WEBHOOK_SECRET` | **No** | Verifies incoming webhook signatures — **different per environment** |
| `CMS_API_TOKEN` | **No** | Unused leftover, safe to ignore |

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

---

## 11. Monitoring

UptimeRobot (free tier), 5-minute intervals, monitoring `rankinseo.xyz` 
and `/login`. Email alerts only.
## 12. Logging

Structured logging via `lib/logger.ts` — never raw `console.log`/`console.error` 
in API routes. Every log call takes an object with an `event` key plus relevant 
fields (ids, error messages, counts), output as one-line JSON so Vercel's log 
search can filter/query by field instead of grepping text.

```typescript
import { logger } from '@/lib/logger';

logger.info({ event: 'something_happened', userId, campaignId });
logger.error({ event: 'something_failed', campaignId, error: err.message });
```

Currently wired into:
- `app/api/webhooks/paddle/route.ts` — `paddle_webhook_received`, 
  `paddle_webhook_missing_user_id`, `paddle_webhook_processing_failed`, 
  `paddle_webhook_processed`
- `app/api/generate/route.ts` — `generation_started`, `brief_generation_failed`, 
  `risk_scoring_empty_response`, `risk_scoring_failed`, `risk_score_save_failed`, 
  `risk_scoring_completed`, `risk_scoring_background_failed`, 
  `article_save_failed`, `article_generated`, `generate_route_failed`

Apply the same pattern to any new API route going forward.