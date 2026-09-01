'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-4 border-t border-line mt-8">
      <span className="text-sm text-ink/60 mr-1">Share this article:</span>
      <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-md border border-line bg-surface text-sm text-ink hover:bg-paper transition">
        X / Twitter
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-md border border-line bg-surface text-sm text-ink hover:bg-paper transition">
        LinkedIn
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-md border border-line bg-surface text-sm text-ink hover:bg-paper transition">
        Facebook
      </a>
      <button onClick={handleCopy} className="px-3 py-1.5 rounded-md border border-line bg-surface text-sm text-ink hover:bg-paper transition">
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
}