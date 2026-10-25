import { supabaseAdmin } from '@/lib/supabase';

// Articles each plan can generate per calendar month (UTC).
// Change these numbers to change the limits everywhere.
export const PLAN_LIMITS: Record<string, number> = {
  Starter: 10,
  Growth: 30,
};

// Comma-separated login emails that are never limited (set ADMIN_EMAILS in .env.local and Vercel).
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export type ArticleAllowance =
  | { allowed: true; plan: string; used: number; limit: number | null }
  | {
      allowed: false;
      reason: 'no_subscription' | 'limit_reached' | 'check_failed';
      plan: string | null;
      used: number;
      limit: number | null;
    };

export async function checkArticleAllowance(
  userId: string,
  email?: string | null
): Promise<ArticleAllowance> {
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
    return { allowed: true, plan: 'Admin', used: 0, limit: null };
  }

  const { data: subs, error: subsErr } = await supabaseAdmin
    .from('subscriptions')
    .select('plan, status, current_period_end')
    .eq('user_id', userId);

  if (subsErr) {
    return { allowed: false, reason: 'check_failed', plan: null, used: 0, limit: null };
  }

  const now = new Date();
  // Trial and active subscriptions count. A cancelled one still counts until its paid period ends.
  const valid = (subs || []).filter(
    (s) =>
      s.plan &&
      PLAN_LIMITS[s.plan] !== undefined &&
      (s.status === 'on_trial' ||
        s.status === 'active' ||
        (s.status === 'cancelled' &&
          s.current_period_end &&
          new Date(s.current_period_end) > now))
  );

  if (valid.length === 0) {
    return { allowed: false, reason: 'no_subscription', plan: null, used: 0, limit: null };
  }

  // If somehow more than one is valid, use the best (highest limit).
  const best = valid.sort((a, b) => PLAN_LIMITS[b.plan!] - PLAN_LIMITS[a.plan!])[0];
  const plan = best.plan as string;
  const limit = PLAN_LIMITS[plan];

  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  ).toISOString();

  const { count, error: countErr } = await supabaseAdmin
    .from('campaigns')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', monthStart);

  if (countErr) {
    return { allowed: false, reason: 'check_failed', plan, used: 0, limit };
  }

  const used = count ?? 0;
  if (used >= limit) {
    return { allowed: false, reason: 'limit_reached', plan, used, limit };
  }
  return { allowed: true, plan, used, limit };
}
