# RankinSEO — Incident Runbook

What to check, in order, when something breaks.

---

## 1. Confirm it's actually broken

- Check UptimeRobot dashboard — is `rankinseo.xyz` / `/login` currently down, 
  or was it a blip that already recovered?
- Try the site yourself in an incognito/private window (rules out a caching 
  or session issue on your end)

---

## 2. Check Vercel first (hosting dashboard)

vercel.com → my-seo-app → **Deployments**

- Is the latest deployment "Ready" or does it show an error/build failure?
- Click into the latest deployment → **Runtime Logs** — look for 5xx errors 
  or repeated crashes around the time the issue started
- Check **Observability** tab if enabled, for error rate spikes

**If the latest deploy is broken**: this is almost always caused by a recent 
push. Go to Deployments, find the last known-good deployment (the one before 
things broke), click "..." → **Promote to Production** (instant rollback, 
no rebuild needed).

---

## 3. Check Supabase (database)

supabase.com dashboard → your project

- **Database → Health**: is Supabase itself reporting an outage? (rare, but 
  check status.supabase.com too)
- **Logs → Postgres Logs**: any repeated errors, connection limit warnings
- **Table Editor**: can you manually query your tables? If Supabase is fine 
  but your app can't reach it, suspect env vars (see §5) or RLS policy changes

---

## 4. Check deploy logs for the specific error

Vercel → Deployments → click the failing/latest deployment → **Logs** tab 
(or **Runtime Logs** for post-deploy errors)

- Build-time errors show in Build Logs
- Runtime errors (500s from API routes) show in Runtime Logs — search for 
  your structured log `event` names (e.g. `generate_route_failed`, 
  `paddle_webhook_processing_failed`) to jump straight to the relevant failure

---

## 5. Check environment variables

Vercel → Settings → Environment Variables

- Did a secret get rotated (OpenAI, Supabase service role, Paddle) without 
  updating Vercel?
- Did `NEXT_PUBLIC_PADDLE_ENV` get flipped accidentally?
- Remember: editing an env var does NOT auto-redeploy — you must manually 
  redeploy for the new value to take effect

---

## 6. Rollback (if a recent deploy caused it)

Vercel → Deployments → find last known-good deployment → "..." menu → 
**Promote to Production**

This is instant (no rebuild) and reverts the live site immediately while 
you debug the broken code separately in a new branch/commit.

---

## 7. Paddle-specific issues

If checkout or subscriptions stop working specifically:
- Check Paddle status: status.paddle.com
- Check webhook delivery: vendors.paddle.com (or sandbox-vendors.paddle.com) 
  → Developer Tools → Notifications → your destination → notification log — 
  are deliveries failing? What HTTP status is Paddle getting back?
- Confirm `NEXT_PUBLIC_PADDLE_ENV` and `PADDLE_WEBHOOK_SECRET` still match 
  (sandbox vs production secrets are NOT interchangeable — see 
  ARCHITECTURE.md §6)

---

## 8. Backups

- **Supabase**: free tier does NOT include automatic backups. Point-in-time 
  recovery requires a paid plan. **Action item**: consider manually exporting 
  critical tables (`campaigns`, `subscriptions`) periodically until on a 
  paid plan, or upgrade if data loss risk becomes unacceptable.
- **Code**: fully backed up via GitHub (`asgharshakir94-jpg/-my-seo-app`) — 
  every deploy is a git commit, so code itself is never at risk

---

## 9. Uptime monitoring

UptimeRobot (free tier), 5-minute check interval, monitoring:
- `rankinseo.xyz`
- `/login`

Alerts via email only. **Consider adding**: a check on `/api/webhooks/paddle` 
or another API route, since UptimeRobot currently only confirms the frontend 
loads — not that API routes/webhooks are functioning.

---

## 10. After the incident

- Note what broke and why in this file's "Known bugs" section in 
  `ARCHITECTURE.md`
- If it was a deploy that broke things, check `npm run build` locally next 
  time BEFORE pushing (should already be habit, but worth the reminder)