'use client';

import Lottie from 'lottie-react';
import { useEffect, useRef, useState } from 'react';
import robotAnimation from '@/public/animations/robot.json';

type FAQItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How does RankinSEO work?',
    answer:
      'RankinSEO researches keywords for your business, writes optimized articles, and publishes them straight to your site — no manual work needed.',
  },
  {
    question: 'Do I need a credit card to start?',
    answer:
      'No. Your 14-day trial starts without any card required, so you can try it risk-free.',
  },
  {
    question: 'What platforms do you publish to?',
    answer:
      'RankinSEO publishes natively to your site, and can also integrate with platforms like WordPress and Webflow.',
  },
  {
    question: 'Is the content actually good for SEO?',
    answer:
      'Every article goes through a two-step process — a research brief, then a full draft — with built-in risk-scoring to flag anything that needs a human review before it goes live.',
  },
];

export default function FloatingRobotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQItem | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const widgetRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!widgetRef.current) return;

      const rect = widgetRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY) || 1;
      const maxOffset = 45;
      const maxDistance = 400;
      const strength = Math.min(distance / maxDistance, 1);
      const proximity = 1 - strength;

      const offsetX = (deltaX / distance) * maxOffset * strength;
      const offsetY = (deltaY / distance) * maxOffset * strength;

      setOffset({ x: offsetX, y: offsetY });
      setScale(1 + proximity * 0.15);
    }

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  function handleToggle() {
    setIsOpen((prev) => !prev);
    setSelectedFAQ(null);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-72 rounded-2xl border border-line bg-surface p-4 shadow-lg">
          {!selectedFAQ ? (
            <>
              <p className="font-semibold text-ink mb-1">SEO Expert</p>
              <p className="text-sm text-ink/90 mb-3">
                Ask me something, or pick a question below.
              </p>
              <div className="flex flex-col gap-2">
                {FAQ_ITEMS.map((item) => (
                  <button
                    key={item.question}
                    onClick={() => setSelectedFAQ(item)}
                    className="text-left text-sm px-3 py-2 rounded-lg border border-line hover:bg-paper transition-colors text-ink"
                  >
                    {item.question}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setSelectedFAQ(null)}
               className="text-xs font-medium text-ink/80 hover:text-ink mb-2"
              >
                ← Back to questions
              </button>
              <p className="text-sm text-ink/90 leading-relaxed">{selectedFAQ.answer}</p>
              
            </>
          )}
        </div>
      )}

      <button
        ref={widgetRef}
        onClick={handleToggle}
        className="h-36 w-36 rounded-full bg-surface border border-line shadow-lg overflow-hidden flex items-center justify-center"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transition: 'transform 100ms ease-out',
        }}
        aria-label="Open SEO assistant info"
      >
        <Lottie animationData={robotAnimation} loop autoplay className="h-32 w-32" />
      </button>
    </div>
  );
}