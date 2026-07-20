'use client';

import { useState } from 'react';

interface Check {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

interface AuditResult {
  url: string;
  score: number;
  checks: Check[];
}

export default function AuditPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AuditResult | null>(null);

  const runAudit = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Could not reach the audit service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Free SEO audit</h1>
        <p className="text-slate mb-8">
          Enter your website URL and we&apos;ll scan it for common SEO issues in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runAudit()}
            placeholder="yourbusiness.com"
            className="flex-1 border border-line rounded-md px-4 py-3 bg-surface placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from"
          />
          <button
            onClick={runAudit}
            disabled={loading}
            className="bg-gradient-to-r from-accent-from to-accent-to text-white font-medium px-6 py-3 rounded-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Scanning...' : 'Run audit'}
          </button>
        </div>

        {error && (
          <div className="border border-red-200 bg-red-50 text-red-600 rounded-md px-4 py-3 mb-8">
            {error}
          </div>
        )}

        {result && (
          <div>
            <div className={`flex items-center gap-4 border rounded-lg px-5 py-4 mb-6 ${scoreColor(result.score)}`}>
              <div className="text-3xl font-bold">{result.score}%</div>
              <div>
                <p className="font-medium">SEO health score for {result.url}</p>
                <p className="text-sm opacity-80">
                  {result.checks.filter((c) => c.passed).length} of {result.checks.length} checks passed
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {result.checks.map((check) => (
                <div
                  key={check.id}
                  className="flex items-start justify-between gap-4 border border-line rounded-md px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{check.label}</p>
                    <p className="text-sm text-slate">{check.detail}</p>
                  </div>
                  <span className={check.passed ? 'text-green-600' : 'text-red-600'}>
                    {check.passed ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}