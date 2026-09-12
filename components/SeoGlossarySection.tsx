"use client";

import { useState } from "react";
import Link from "next/link";

const questions = [
  {
    question: "What is a backlink?",
    answer: "Learn how backlinks work and why they matter for your SEO.",
    href: "/blog/what-is-a-backlink",
  },
  {
    question: "What is a canonical tag?",
    answer: "Understand canonical tags and how they affect your rankings.",
    href: "/blog/what-is-a-canonical-tag",
  },
  {
    question: "What is duplicate content?",
    answer: "See why duplicate content hurts SEO and how to avoid it.",
    href: "/blog/what-is-duplicate-content",
  },
  {
    question: "What is internal linking?",
    answer: "Discover how internal links help pages get discovered and ranked.",
    href: "/blog/what-is-internal-linking",
  },
  {
    question: "What is a URL slug?",
    answer: "Learn what makes a good URL slug for SEO.",
    href: "/blog/what-is-a-url-slug",
  },
  {
    question: "What is schema markup?",
    answer: "Find out how structured data helps search engines understand your site.",
    href: "/blog/what-is-schema-markup-structured-data",
  },
  {
    question: "What is RankinSEO's automated technical audit feature?",
    answer:
      "RankinSEO's automated technical audit scans your website for SEO errors — broken links, missing tags, slow-loading scripts, and more — and shows you exactly what's holding your rankings back, free. Upgrading unlocks the fix: RankinSEO resolves the issues it finds, so you don't have to hand it off to a developer.",
    href: "/audit",
    cta: "Try the free audit →",
  },
  {
    question: "Can RankinSEO fix Core Web Vitals issues automatically?",
    answer:
      "No, RankinSEO does not automatically modify your website's code to fix Core Web Vitals. Instead, it accurately audits your site to pinpoint the exact scripts and images causing slowdowns, and unlocks the precise optimization steps through its premium subscription plans.",
    href: "/audit",
    cta: "Try the free audit →",
  },
];

export function SeoGlossarySection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="seo-glossary" className="max-w-3xl mx-auto p-4 md:p-8">
      <h2 className="text-3xl font-bold text-ink text-center mb-2">
        SEO Questions, Answered
      </h2>
      <p className="text-center text-ink/70 mb-10">
        Quick answers to common SEO terms — click through for the full guide.
      </p>
      <div className="space-y-4">
        {questions.map((item, i) => (
          <div key={item.href} className="border border-line rounded-lg bg-surface">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex justify-between items-center px-6 py-4 text-left"
            >
              <span className="font-medium text-ink">{item.question}</span>
              <svg
                className={`w-5 h-5 text-ink/60 transition-transform ${
                  open === i ? "rotate-180" : ""
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
            {open === i && (
              <div className="px-6 pb-4">
                <p className="text-sm text-ink/70 mb-2">{item.answer}</p>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  {item.cta || "Read the full guide →"}
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
