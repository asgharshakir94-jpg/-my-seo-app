"use client";

import { useState, type FormEvent } from 'react';
import Link from 'next/link';

type Sample = { domain: string; name: string | null; type: string };
type Result = { niche: string; country: string; total: number; samples: Sample[] };

const TYPE_LABELS: Record<string, string> = {
  directory: 'Directory',
  guest_post: 'Guest post',
  citation: 'Local citation',
  resource_page: 'Resource page',
};

export default function ProspectFinder() {
  const [niche, setNiche] = useState('');
  const [country, setCountry] = useState('US');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot, must stay empty
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setSent(false);
    setFormError('');

    try {
      const res = await fetch('/api/prospects/search/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, country }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Something went wrong');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!result) return;
    setSending(true);
    setFormError('');

    try {
      const res = await fetch('/api/prospects/report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: result.niche,
          country: result.country,
          businessName,
          email,
          consent,
          website,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Something went wrong');
      setSent(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row mb-6">
        <input
          type="text"
          required
          minLength={2}
          maxLength={80}
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="Your trade or niche, e.g. plumbing"
          className="flex-1 rounded-lg border border-line bg-surface p-3 text-ink placeholder-sand focus:outline-none"
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded-lg border border-line bg-surface p-3 text-ink"
        >
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="UK">United Kingdom</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-ink px-5 py-3 font-medium text-paper disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Find opportunities'}
        </button>
      </form>

      {error && (
        <div className="mb-6 rounded-lg border border-line bg-surface p-3 text-sm text-ink">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-line bg-surface p-6">
          <p className="text-4xl font-semibold text-ink">{result.total}</p>
          <p className="mb-4 text-ink/70">
            link opportunities found for &ldquo;{result.niche}&rdquo;
          </p>

          {result.samples.length > 0 && (
            <ul className="divide-y divide-line mb-6">
              {result.samples.map((s) => (
                <li key={s.domain} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-medium text-ink">{s.name || s.domain}</span>
                  <span className="text-ink/60">{TYPE_LABELS[s.type] || s.type}</span>
                </li>
              ))}
            </ul>
          )}

          {result.total > 0 && !sent && (
            <form onSubmit={handleSend} className="border-t border-line pt-5">
              <p className="mb-3 font-medium text-ink">
                Get the full list of {result.total} sites as a free PDF
              </p>

              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                maxLength={120}
                placeholder="Business name (optional)"
                className="mb-3 w-full rounded-lg border border-line bg-paper p-3 text-ink placeholder-sand focus:outline-none"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mb-3 w-full rounded-lg border border-line bg-paper p-3 text-ink placeholder-sand focus:outline-none"
              />

              {/* Honeypot: hidden from people, bots tend to fill it */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              <label className="mb-3 flex items-start gap-2 text-xs text-ink/70">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  I agree to receive this PDF and occasional emails from RankinSEO about SEO tips and
                  services. I can unsubscribe at any time. See our{' '}
                  <Link href="/privacy" className="underline">
                    privacy policy
                  </Link>
                  .
                </span>
              </label>

              {formError && <p className="mb-3 text-sm text-ink">{formError}</p>}

              <button
                type="submit"
                disabled={sending || !consent}
                className="w-full rounded-lg bg-ink px-5 py-3 font-medium text-paper disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Email me the PDF'}
              </button>
            </form>
          )}

          {sent && (
            <p className="border-t border-line pt-5 text-ink">
              Done! Check your inbox for the PDF (and your spam folder if you don&apos;t see it).
            </p>
          )}
        </div>
      )}
    </div>
  );
}