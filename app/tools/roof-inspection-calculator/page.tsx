import type { Metadata } from 'next';
import RoofInspectionCalculator from '@/components/RoofInspectionCalculator';

export const metadata: Metadata = {
  title: 'Roof Inspection Cost & Profit Margin Calculator | RankinSEO',
  description:
    'Free calculator for roofing contractors to price inspections and check profit margins based on labor, fuel, and overhead costs.',
};

export default function RoofInspectionCalculatorPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-2">
        Roof inspection cost & profit margin calculator
      </h1>
      <p className="text-ink/70 mb-8">
        Work out what to charge per inspection and see your real profit margin after labor, fuel, and overhead.
      </p>
      <RoofInspectionCalculator />
    </main>
  );
}