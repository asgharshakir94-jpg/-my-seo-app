'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function PlanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get('url') || '';
  const [loading, setLoading] = useState(false);

  const handleGetStarted = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // not logged in — send to signup, carry the site url along
      router.push(`/signup?redirect=/dashboard&site=${encodeURIComponent(url)}`);
      return;
    }

    // logged in — mark onboarding complete and go to dashboard
    await supabase.auth.updateUser({
      data: { quiz_completed: true, site_url: url }
    });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-accent-from to-accent-to shadow-accent" />
            <span className="font-bold tracking-tight text-lg text-ink">
              RankinSEO <span className="text-sand font-medium">Project Platform</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-ink">Your growth plan is ready</h1>
          {url && <p className="text-sm text-slate mt-1">Built for {url}</p>}
        </div>

        <div className="bg-surface border border-line rounded-lg p-6 shadow-flat">
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-xl font-bold text-ink">Business</h2>
            <span className="text-xs bg-accent-soft text-accent-text font-semibold px-2 py-1 rounded-sm">50% OFF</span>
          </div>
          <p className="text-sm text-slate mb-4">All-in-one growth package</p>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-sm text-slate line-through">$99</span>
            <span className="text-3xl font-bold text-ink">$49.5</span>
            <span className="text-sm text-slate">/month</span>
          </div>

          <button
            onClick={handleGetStarted}
            disabled={loading}
            className="w-full bg-gradient-to-r from-accent-from to-accent-to hover:opacity-90 disabled:opacity-60 text-white text-sm font-bold px-4 py-3 rounded-md transition-all duration-200 active:scale-95 shadow-accent"
          >
            {loading ? 'Setting up...' : 'Get Started'}
          </button>
          <p className="text-xs text-slate text-center mt-3">50% off your first month, then $99/month. Cancel anytime.</p>

          <ul className="mt-6 space-y-2 text-sm text-ink">
            <li className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full bg-accent-soft flex items-center justify-center text-[10px]">✓</span>
              Personalized growth plan
            </li>
            <li className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full bg-accent-soft flex items-center justify-center text-[10px]">✓</span>
              30 SEO articles per month
            </li>
            <li className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full bg-accent-soft flex items-center justify-center text-[10px]">✓</span>
              Auto-publish to your site
            </li>
            <li className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full bg-accent-soft flex items-center justify-center text-[10px]">✓</span>
              Unlimited rewrites
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={null}>
      <PlanContent />
    </Suspense>
  );
}