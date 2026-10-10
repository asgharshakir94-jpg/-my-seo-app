import type { Metadata } from 'next';
import Link from 'next/link';
import { TRADE_CALCULATORS } from '@/lib/tradeCalculators';

export const metadata: Metadata = {
  title: 'Free Trade Calculators & SEO Tools | RankinSEO',
  description:
    'Free cost and profit margin calculators for trades businesses, plus free SEO tools: keyword finder, backlink opportunity finder, schema generator and more.',
};

export default function ToolsIndexPage() {
  const trades = Object.values(TRADE_CALCULATORS);

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 md:py-16">
      {/* SECTION 1: Trade Calculators */}
      <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-2">
        Free trade calculators
      </h1>
      <p className="text-ink/70 mb-8">
        Work out what to charge and see your real profit margin after labor, fuel, and overhead.
      </p>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-16">
        {trades.map((config) => (
          <Link
            key={config.slug}
            href={`/tools/${config.slug}-calculator`}
            className="block rounded-lg border border-line bg-surface p-5 hover:border-accent-from transition-colors"
          >
            <h2 className="text-lg font-medium text-ink mb-1">
              {config.tradeName} calculator
            </h2>
            <p className="text-sm text-ink/70">
              Price your {config.jobUnitLabel} and check your profit margin.
            </p>
          </Link>
        ))}
      </div>

      {/* SECTION 2: SEO & Marketing Tools */}
      <div className="border-t border-line pt-12">
        <h2 className="text-xl font-semibold text-ink mb-2">Free SEO tools for trades businesses</h2>
        <p className="text-ink/70 mb-8">
          Find keywords customers search for, discover sites that can link to you, and get your business found on Google. Free, no sign-up.
        </p>
        
        <div className="grid gap-4 sm:grid-cols-2">

          {/* Card 1: Free Keyword Finder */}
          <Link
            href="/tools/keyword-finder"
            className="group block rounded-lg border border-line bg-surface p-5 hover:border-accent-from transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🔎</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800">New</span>
              </div>
              <h3 className="text-lg font-medium text-ink mb-1">
                Free Keyword Finder
              </h3>
              <p className="text-sm text-ink/70 mb-4 leading-relaxed">
                Get real Google keyword ideas and the questions customers ask for your trade. Free, no sign-up.
              </p>
            </div>
            <span className="text-sm font-medium text-ink/90 group-hover:underline mt-auto">Open Free Tool →</span>
          </Link>

          {/* Card 2: Free Backlink Opportunity Finder */}
          <Link
            href="/tools/backlink-opportunity-finder"
            className="group block rounded-lg border border-line bg-surface p-5 hover:border-accent-from transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🤝</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800">New</span>
              </div>
              <h3 className="text-lg font-medium text-ink mb-1">
                Free Backlink Opportunity Finder
              </h3>
              <p className="text-sm text-ink/70 mb-4 leading-relaxed">
                Find directories, guest post sites and listings that can link to your trade business.
              </p>
            </div>
            <span className="text-sm font-medium text-ink/90 group-hover:underline mt-auto">Open Free Tool →</span>
          </Link>

          {/* Card 3: Local Business Schema Generator */}
          <Link
            href="/tools/schema-generator"
            className="group block rounded-lg border border-line bg-surface p-5 hover:border-accent-from transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🏢</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Popular</span>
              </div>
              <h3 className="text-lg font-medium text-ink mb-1">
                Local Business Schema Generator
              </h3>
              <p className="text-sm text-ink/70 mb-4 leading-relaxed">
                Generate a LocalBusiness JSON-LD schema in seconds — free, no sign-up required.
              </p>
            </div>
            <span className="text-sm font-medium text-ink/90 group-hover:underline mt-auto">Open Free Tool →</span>
          </Link>

          {/* Card 4: Free Outbound Link Checker */}
          <Link
            href="/tools/backlink-seeker"
            className="group block rounded-lg border border-line bg-surface p-5 hover:border-accent-from transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-lg font-medium text-ink mb-1">
                Free Outbound Link Checker
              </h3>
              <p className="text-sm text-ink/70 mb-4 leading-relaxed">
                Check which other sites a page links out to, such as social profiles and partner sites.
              </p>
            </div>
            <span className="text-sm font-medium text-ink/90 group-hover:underline mt-auto">Open Free Tool →</span>
          </Link>

        </div>
      </div>
    </main>
  );
}