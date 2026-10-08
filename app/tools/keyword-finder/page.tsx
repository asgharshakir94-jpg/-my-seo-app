import type { Metadata } from 'next';
import KeywordFinder from '@/components/KeywordFinder';

export const metadata: Metadata = {
  title: 'Free Keyword Finder for Trades Businesses | RankinSEO',
  description:
    'Get real Google keyword ideas and the questions customers ask for your trade. Free, no sign-up.',
  openGraph: {
    title: 'Free Keyword Finder for Trades Businesses | RankinSEO',
    description:
      'Get real Google keyword ideas and customer questions for your trade. Free, no sign-up.',
    url: '/tools/keyword-finder/',
    type: 'website',
  },
};

export default function KeywordFinderPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-6 md:py-10">
      <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-1">
        Free Keyword Finder
      </h1>
      <p className="text-ink/70 mb-5">
        Enter a service or topic to see what people actually search for on Google, plus the questions
        they ask. Use the ideas for your website pages, blog posts and FAQs.
      </p>

      <KeywordFinder />

      <p className="mt-8 text-xs text-ink/60">
        Ideas come from Google&apos;s public suggestions and are for guidance only. Monthly search
        volume and difficulty are not shown, and results can change from day to day.
      </p>
    </main>
  );
}