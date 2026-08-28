import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TRADE_CALCULATORS } from '@/lib/tradeCalculators';
import TradeCalculator from '@/components/TradeCalculator';

export async function generateStaticParams() {
  return Object.keys(TRADE_CALCULATORS).map((trade) => ({ trade }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trade: string }>;
}): Promise<Metadata> {
  const { trade } = await params;
  const config = TRADE_CALCULATORS[trade];
  if (!config) return {};
  return { title: config.pageTitle, description: config.pageDescription };
}

export default async function TradeCalculatorPage({
  params,
}: {
  params: Promise<{ trade: string }>;
}) {
  const { trade } = await params;
  const config = TRADE_CALCULATORS[trade];
  if (!config) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-2">
        {config.tradeName} cost & profit margin calculator
      </h1>
      <p className="text-ink/70 mb-8">
        Work out what to charge per {config.jobUnitLabel} and see your real profit margin after labor, fuel, and overhead.
      </p>
      <TradeCalculator config={config} />
    </main>
  );
}