"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Is there a free trial available?",
    answer:
      "Yes. The Starter plan includes a 14-day free trial. Checkout asks for a card, and you are charged $49 a month after the 14 days unless you cancel first. You can cancel anytime. Payments are handled securely by Lemon Squeezy.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Yes. To upgrade or downgrade, email support@rankinseo.xyz and we will change your plan.",
  },
  {
    question: "Do you publish the articles to my website?",
    answer:
      "No. RankinSEO writes the article and you review it, then publish it on your own website, for example on WordPress, Wix or Squarespace. You stay in control of what goes live.",
  },
  {
    question: "How are the articles written?",
    answer:
      "You enter a keyword, and optionally a city and industry. RankinSEO uses AI language models from OpenAI to build a research brief and then write the article from it. A second AI check flags prices, statistics, dates and regulations for you to verify before publishing. Photos come from Unsplash.",
  },
  {
    question: "Will the articles rank on Google?",
    answer:
      "We can't promise rankings, and nobody honestly can. Articles are written to follow SEO best practice, but results depend on many things, including your website's age and authority and how much competition there is for the keyword.",
  },
];

export default function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="faq" className="max-w-3xl mx-auto p-4 md:p-8">
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