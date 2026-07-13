"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time from your account settings. Pro-rated charges will apply immediately for upgrades.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "Yes, the Starter plan includes a 14-day free trial with no credit card required to get started.",
  },
  {
    question: "What data sources do you use?",
    answer:
      "We pull from a combination of proprietary crawlers and licensed third-party SEO data providers to keep rankings and keyword data accurate.",
  },
];

export default function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="max-w-3xl mx-auto p-4 md:p-8">
      <h2 className="text-3xl font-bold text-ink text-center mb-10">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={faq.question} className="border border-line rounded-lg bg-surface">
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex justify-between items-center px-6 py-4 text-left"
            >
              <span className="font-medium text-ink">{faq.question}</span>
              <svg
                className={`w-5 h-5 text-ink/60 transition-transform ${
                  openFaq === i ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openFaq === i && (
              <p className="px-6 pb-4 text-sm text-ink/70">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}