import type { Metadata } from 'next';
import Link from 'next/link';
import { TRADE_CALCULATORS } from '@/lib/tradeCalculators';

export const metadata: Metadata = {
  title: 'Free Trade Calculators | RankinSEO',
  description:
    'Free cost and profit margin calculators for roofing, solar, HVAC, plumbing, and electrical contractors.',
};

export default function ToolsIndexPage() {
  const trades = Object.values(TRADE_CALCULATORS);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-2">
        Free trade calculators
      </h1>
      <p className="text-ink/70 mb-8">
        Work out what to charge and see your real profit margin after labor, fuel, and overhead.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
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
    </main>
  );
}