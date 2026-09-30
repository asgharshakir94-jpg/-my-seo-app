import type { Metadata } from 'next';
import Link from 'next/link';
import { TRADE_CALCULATORS } from '@/lib/tradeCalculators';

export const metadata: Metadata = {
  title: 'Free Trade Calculators & SEO Tools | RankinSEO',
  description:
    'Free cost and profit margin calculators alongside modern marketing utilities like schema generators and backlink checkers.',
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

      {/* SECTION 2: SEO & Marketing Utilities */}
      <div className="border-t border-line pt-12">
        <h2 className="text-xl font-semibold text-ink mb-2">More free production tools</h2>
        <p className="text-ink/70 mb-8">
          Explore our collection of free marketing utilities designed to streamline your development and content pipeline.
        </p>
        
        <div className="grid gap-4 sm:grid-cols-2">
          
          {/* Card 1: Local Business Schema Generator */}
          <Link
            href="/tools/schema-generator"
            className="block rounded-lg border border-line bg-surface p-5 hover:border-accent-from transition-colors flex flex-col justify-between"
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

          {/* Card 2: Free Backlink Seeker & Checker */}
          <Link
            href="/tools/backlink-seeker"
            className="block rounded-lg border border-line bg-surface p-5 hover:border-accent-from transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🚀</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800">New</span>
              </div>
              <h3 className="text-lg font-medium text-ink mb-1">
                Free Backlink Seeker & Checker
              </h3>
              <p className="text-sm text-ink/70 mb-4 leading-relaxed">
                Analyze any live domain or URL to instantly discover, crawl, and track active incoming link connections.
              </p>
            </div>
            <span className="text-sm font-medium text-ink/90 group-hover:underline mt-auto">Open Free Tool →</span>
          </Link>

        </div>
      </div>
    </main>
  );
}
