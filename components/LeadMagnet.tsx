'use client';

import { useState } from 'react';

export default function LeadMagnet({
  fileUrl,
  title,
}: {
  fileUrl: string;
  title: string;
}) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="mt-8 rounded-xl border border-line bg-paper p-6 text-center">
        <p className="text-ink font-medium mb-3">You're in! Grab your checklist below.</p>
        
        <a href={fileUrl}
          download
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-accent-from to-accent-from px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Download {title}
        </a>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-xl border border-line bg-paper p-6">
      <p className="text-ink font-medium mb-1">Get the free {title}</p>
      <p className="text-sm text-ink/70 mb-4">
        Enter your email and download it instantly — no spam, unsubscribe anytime.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-ink placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-accent-from to-accent-from px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {status === 'loading' ? 'Sending...' : 'Get the checklist'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-sm text-red-600 mt-2">Something went wrong — try again.</p>
      )}
    </div>
  );
}