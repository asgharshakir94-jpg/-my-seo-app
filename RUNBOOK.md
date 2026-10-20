# RankinSEO - Incident Runbook

What to check, in order, when something breaks.

---

## 1. Confirm it's actually broken

- Check UptimeRobot dashboard - is `rankinseo.xyz` / `/login` currently down,
  or was it a blip that already recovered?
- Try the site yourself in an incognito/private window (rules out a caching
  or session issue on your end)

---

## 2. Check Vercel first (hosting dashboard)

vercel.com -> my-seo-app -> **Deployments**

- Is the latest deployment "Ready" or does it show an error/build failure?
- Click into the latest deployment -> **Runtime Logs** - look for 5xx errors
  or repeated crashes around the time the issue started
- Check **Observability** tab if enabled, for error rate spikes

**If the latest deploy is broken**: this is almost always caused by a recent
push. Go to Deployments, find the last known-good deployment (the one before
things broke), click "..." -> **Promote to Production** (instant rollback,
no rebuild needed).

---

## 3. Check Supabase (database)

supabase.com dashboard -> your project

- **Database -> Health**: is Supabase itself reporting an outage? (rare, but
  check status.supabase.com too)
- **Logs -> Postgres Logs**: any repeated errors, connection limit warnings
- **Table Editor**: can you manually query your tables? If Supabase is fine
  but your app can't reach it, suspect env vars (see section 5) or RLS policy changes

---

## 4. Check deploy logs for the specific error

Vercel -> Deployments -> click the failing/latest deployment -> **Logs** tab
(or **Runtime Logs** for post-deploy errors)

- Build-time errors show in Build Logs
- Runtime errors (500s from API routes) show in Runtime Logs - search for
  your structured log `event` names (e.g. `generate_route_failed` or
  `lemonsqueezy_webhook_processing_failed`) to jump straight to the
  relevant failure

---

## 5. Check environment variables

Vercel -> Settings -> Environment Variables

- Did a secret get rotated (OpenAI, Supabase service role / secret key,
  Lemon Squeezy webhook secret, Serper, Resend) without updating Vercel?
- Is `LEMONSQUEEZY_WEBHOOK_SECRET` still the signing secret of the webhook
  you are actually using? (test mode and live mode webhooks are separate)
- Remember: editing an env var does NOT auto-redeploy - you must manually
  redeploy for the new value to take effect

---

## 6. Rollback (if a recent deploy caused it)

Vercel -> Deployments -> find last known-good deployment -> "..." menu ->
**Promote to Production**

This is instant (no rebuild) and reverts the live site immediately while
you debug the broken code separately in a new branch/commit.

---

## 7. Lemon Squeezy issues (checkout or subscriptions)

If checkout or subscriptions stop working specifically:
- Check Lemon Squeezy's status page (linked from their website)
- Check webhook delivery: app.lemonsqueezy.com -> Settings -> Webhooks ->
  your webhook -> recent deliveries. Are deliveries failing? What HTTP
  status is Lemon Squeezy getting back from
  `https://rankinseo.xyz/api/webhooks/lemonsqueezy`?
- Confirm the webhook's signing secret still matches
  `LEMONSQUEEZY_WEBHOOK_SECRET` in Vercel (a mismatch makes every
  delivery fail the `x-signature` check)
- Test mode and live mode are separate in Lemon Squeezy: each has its own
  webhook, so check you are looking at the mode that matches the purchase
- If a payment succeeded but the user has no subscription, find the row in
  the `subscriptions` table (Supabase Table Editor). If it is missing, the
  checkout probably lacked `user_id`, or the webhook failed - redeliver
  it from the Lemon Squeezy webhook log once the cause is fixed
- Checkout links are hardcoded in `components/PricingSection.tsx`; if a plan
  or variant is changed in Lemon Squeezy, update the links there

---

## 8. Backups

- **Supabase**: free tier does NOT include automatic backups. Point-in-time
  recovery requires a paid plan. **Manual backup script exists**: run
  `node scripts/backup.js` to export `campaigns`, `subscriptions`,
  `contact_submissions`, `keyword_suggestions`, and `subscribers` to
  timestamped JSON files in `backups/` (git-ignored - contains real user
  data). After running, upload the timestamped folder to Google Drive ->
  **RankinSEO Backups** (15 GB free tier, plenty of headroom - current
  backups are a few MB). No automated schedule yet; run manually before
  risky changes or periodically (e.g. monthly).
- **Before bulk edits in the SQL Editor**: copy the table first, for example
  `create table campaigns_backup6 as select * from campaigns;`
- **Code**: fully backed up via GitHub (`asgharshakir94-jpg/-my-seo-app`) -
  every deploy is a git commit, so code itself is never at risk

---

## 9. Uptime monitoring

UptimeRobot (free tier), 5-minute check interval, monitoring:
- `rankinseo.xyz`
- `/login`

Alerts via email only. **Consider adding**: a check on `/blog/` or another
data-backed page, since UptimeRobot currently only confirms the frontend
loads, not that Supabase-backed pages work. Do not point it at
`/api/webhooks/lemonsqueezy`: that route only accepts signed POST requests,
so a plain check would report an error.

---

## 10. After the incident

- Note what broke and why in the "Known bugs" section of `ARCHITECTURE.md`
- If it was a deploy that broke things, check `npm run build` locally next
  time BEFORE pushing (should already be habit, but worth the reminder)