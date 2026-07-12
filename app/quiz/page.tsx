'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SCAN_STEPS = [
  'Crawling site structure',
  'Extracting target keywords',
  'Mapping competitor content',
  'Drafting content plan',
];

export default function QuizPage() {
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    if (visibleSteps >= SCAN_STEPS.length) return;
    const timer = setTimeout(() => setVisibleSteps((n) => n + 1), 500);
    return () => clearTimeout(timer);
  }, [visibleSteps]);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // wait for the scan animation to finish before moving on
    setTimeout(() => {
      router.push(`/plan?url=${encodeURIComponent(url)}`);
    }, SCAN_STEPS.length * 500 + 300);
  };
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-16">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">

        {/* Left: form */}
        <div>
          {/* Trust row: works with */}
          <div className="flex items-center gap-3 mb-6 text-slate">
            <span className="text-xs uppercase tracking-wide">Optimized for</span>
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-full bg-surface border border-line flex items-center justify-center text-xs font-semibold text-ink">G</span>
              <span className="h-7 w-7 rounded-full bg-surface border border-line flex items-center justify-center text-xs font-semibold text-ink">AI</span>
              <span className="h-7 w-7 rounded-full bg-surface border border-line flex items-center justify-center text-xs font-semibold text-ink">B</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink leading-tight mb-3">
            Where should we point the pipeline?
          </h1>
          <p className="text-lg text-slate max-w-md mb-8">
            Drop in your site. We'll scan it, find the keywords worth chasing, and hand you a content plan built to rank.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="url"
              required
              placeholder="https://your-website.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 border border-line rounded-md text-ink bg-surface placeholder-slate/60 focus:outline-none focus:ring-2 focus:ring-accent-from/40"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-black text-white rounded-md font-medium hover:bg-ink/90 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Starting scan…' : 'Scan my site'}
            </button>
          </form>

          <p className="text-xs text-slate mt-3">No signup required to see your plan.</p>
        </div>

        {/* Right: live scan preview */}
        <div className="bg-surface border border-line rounded-lg p-6 shadow-flat">
          <div className="text-xs font-mono text-slate mb-4 uppercase tracking-wide">
            Live pipeline preview
          </div>
          <ul className="space-y-4">
            {SCAN_STEPS.map((step, i) => {
              const active = i < visibleSteps;
              return (
                <li
                  key={step}
                  className={`flex items-center gap-3 transition-opacity duration-500 ${
                    active ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white transition-colors duration-500 ${
                      active ? 'bg-gradient-to-r from-accent-from to-accent-to' : 'bg-line'
                    }`}
                  >
                    {active ? '✓' : ''}
                  </span>
                  <span className={`text-sm ${active ? 'text-ink' : 'text-slate'}`}>{step}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 pt-4 border-t border-line text-xs text-slate font-mono">
            engine: gpt-5-mini · status: {visibleSteps >= SCAN_STEPS.length ? 'ready' : 'running'}
          </div>
        </div>

      </div>
    </div>
  );
}