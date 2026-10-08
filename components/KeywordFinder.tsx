"use client";

import { useState, type FormEvent } from 'react';
import Link from 'next/link';

type Result = {
  keyword: string;
  suggestions: string[];
  related: string[];
  questions: string[];
};

const GROUPS: { key: 'suggestions' | 'related' | 'questions'; title: string; hint: string }[] = [
  { key: 'suggestions', title: 'Keyword ideas', hint: 'What people type into Google as they start searching' },
  { key: 'related', title: 'Related searches', hint: 'Other searches people make around the same topic' },
  { key: 'questions', title: 'Questions people ask', hint: 'Good topics for blog posts and FAQ sections' },
];

export default function KeywordFinder() {
  const [keyword, setKeyword] = useState('');
  const [country, setCountry] = useState('us');
  const [website, setWebsite] = useState(''); // honeypot, must stay empty
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState('');

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setCopied('');

    try {
      const res = await fetch('/api/keywords/free/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, country, website }),
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

  const copyGroup = async (key: string, items: string[]) => {
    try {
      await navigator.clipboard.writeText(items.join('\n'));
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      setCopied('');
    }
  };

  const total = result ? result.suggestions.length + result.related.length + result.questions.length : 0;

  return (
    <div>
      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row mb-4">
        <input
          type="text"
          required
          minLength={2}
          maxLength={80}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Your service or topic, e.g. emergency plumber"
          className="flex-1 rounded-lg border border-line bg-surface p-3 text-ink placeholder-sand focus:outline-none"
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded-lg border border-line bg-surface p-3 text-ink"
        >
          <option value="us">United States</option>
          <option value="ca">Canada</option>
          <option value="uk">United Kingdom</option>
          <option value="au">Australia</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-ink px-5 py-3 font-medium text-paper disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Find keywords'}
        </button>

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
      </form>

      <p className="mb-6 text-xs text-ink/60">
        Free for everyone, no signup. Ideas come from real Google suggestions. Monthly search
        volume is not included.
      </p>

      {error && (
        <div className="mb-6 rounded-lg border border-line bg-surface p-3 text-sm text-ink">
          {error}
        </div>
      )}

      {result && total === 0 && (
        <div className="rounded-lg border border-line bg-surface p-4 text-sm text-ink">
          No general ideas found for &ldquo;{result.keyword}&rdquo;. Try a broader term, such as the
          service on its own.
        </div>
      )}

      {result && total > 0 && (
        <div className="rounded-lg border border-line bg-surface p-6">
          <p className="mb-5 text-ink/70">
            <span className="mr-1 text-3xl font-semibold text-ink">{total}</span> ideas for &ldquo;
            {result.keyword}&rdquo;
          </p>

          {GROUPS.map((g) => {
            const items = result[g.key];
            if (!items || items.length === 0) return null;
            return (
              <div key={g.key} className="mb-6 last:mb-0">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-medium text-ink">{g.title}</h3>
                  <button
                    type="button"
                    onClick={() => copyGroup(g.key, items)}
                    className="text-xs text-ink/70 underline"
                  >
                    {copied === g.key ? 'Copied' : 'Copy all'}
                  </button>
                </div>
                <p className="mb-2 text-xs text-ink/60">{g.hint}</p>
                <ul className="divide-y divide-line text-sm text-ink">
                  {items.map((k) => (
                    <li key={k} className="py-2">
                      {k}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          <p className="mt-6 border-t border-line pt-4 text-xs text-ink/70">
            Next step: find where to get links to your site with our{' '}
            <Link href="/tools/backlink-opportunity-finder/" className="underline">
              free backlink opportunity finder
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}