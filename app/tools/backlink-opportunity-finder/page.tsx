import type { Metadata } from 'next';
import ProspectFinder from '@/components/ProspectFinder';

export const metadata: Metadata = {
  title: 'Free Backlink Opportunity Finder | RankinSEO',
  description:
    'Find directories and sites where your trade business can get a backlink. Free, no sign-up to search.',
  openGraph: {
    title: 'Free Backlink Opportunity Finder | RankinSEO',
    description:
      'Find directories and sites where your trade business can get backlinks. Get the list as a free PDF.',
    url: '/tools/backlink-opportunity-finder/',
    type: 'website',
  },
};

export default function BacklinkOpportunityFinderPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-6 md:py-10">
      <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-1">
        Free Backlink Opportunity Finder
      </h1>
      <p className="text-ink/70 mb-5">
        Enter your trade and country to see directories and sites where you can get a backlink to your website.
      </p>

      <ProspectFinder />

      <p className="mt-8 text-xs text-ink/60">
        Results are for informational purposes only. We do not guarantee placement or responses, and not every site gives a followed link.
      </p>
    </main>
  );
}