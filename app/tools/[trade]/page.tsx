import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TRADE_CALCULATORS } from '@/lib/tradeCalculators';
import TradeCalculator from '@/components/TradeCalculator';
import LeadMagnet from '@/components/LeadMagnet';

function resolveTrade(slug: string) {
  const key = slug.replace(/-calculator$/, '');
  return TRADE_CALCULATORS[key] ? key : null;
}

export async function generateStaticParams() {
  return Object.keys(TRADE_CALCULATORS).map((trade) => ({
    trade: `${trade}-calculator`,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trade: string }>;
}): Promise<Metadata> {
  const { trade: slug } = await params;
  const key = resolveTrade(slug);
  if (!key) return {};
  const config = TRADE_CALCULATORS[key];
  return { title: config.pageTitle, description: config.pageDescription };
}

export default async function TradeCalculatorPage({
  params,
}: {
  params: Promise<{ trade: string }>;
}) {
  const { trade: slug } = await params;
  const key = resolveTrade(slug);
  if (!key) notFound();
  const config = TRADE_CALCULATORS[key];

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-2">
        {config.tradeName} cost & profit margin calculator
      </h1>
      <p className="text-ink/70 mb-8">
        Work out what to charge per {config.jobUnitLabel} and see your real profit margin after labor, fuel, and overhead.
      </p>
      <TradeCalculator config={config} />
      {key === 'roofing' && (
        <LeadMagnet fileUrl="/downloads/roof-inspection-checklist.pdf" title="Roof Inspection Checklist" />
      )}
    </main>
  );
}