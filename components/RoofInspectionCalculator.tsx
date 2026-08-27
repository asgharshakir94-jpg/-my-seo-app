'use client';

import { useMemo, useState } from 'react';

export default function RoofInspectionCalculator() {
  const [inspectionsPerMonth, setInspectionsPerMonth] = useState(20);
  const [pricePerInspection, setPricePerInspection] = useState(150);
  const [hoursPerInspection, setHoursPerInspection] = useState(1.5);
  const [laborCostPerHour, setLaborCostPerHour] = useState(35);
  const [vehicleFuelPerJob, setVehicleFuelPerJob] = useState(15);
  const [monthlyOverhead, setMonthlyOverhead] = useState(800);

  const results = useMemo(() => {
    const revenue = inspectionsPerMonth * pricePerInspection;
    const laborCost = inspectionsPerMonth * hoursPerInspection * laborCostPerHour;
    const fuelCost = inspectionsPerMonth * vehicleFuelPerJob;
    const totalCost = laborCost + fuelCost + monthlyOverhead;
    const profit = revenue - totalCost;
    const marginPct = revenue > 0 ? (profit / revenue) * 100 : 0;
    const costPerInspection = inspectionsPerMonth > 0 ? totalCost / inspectionsPerMonth : 0;
    const breakEvenPrice = costPerInspection;

    return {
      revenue,
      laborCost,
      fuelCost,
      totalCost,
      profit,
      marginPct,
      costPerInspection,
      breakEvenPrice,
    };
  }, [
    inspectionsPerMonth,
    pricePerInspection,
    hoursPerInspection,
    laborCostPerHour,
    vehicleFuelPerJob,
    monthlyOverhead,
  ]);

  const marginColor =
    results.marginPct < 10
      ? 'bg-red-500'
      : results.marginPct < 25
        ? 'bg-amber-500'
        : 'bg-emerald-500';

  const marginLabel =
    results.marginPct < 10
      ? 'Thin margin — review your pricing'
      : results.marginPct < 25
        ? 'Workable, but room to grow'
        : 'Healthy margin';

  const clampedMargin = Math.max(0, Math.min(100, results.marginPct));

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div className="w-full max-w-3xl mx-auto bg-surface border border-line rounded-2xl p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-ink/70 mb-1">
              Inspections per month
            </label>
            <input
              type="number"
              min={0}
              value={inspectionsPerMonth}
              onChange={(e) => setInspectionsPerMonth(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from"
            />
          </div>

          <div>
            <label className="block text-sm text-ink/70 mb-1">
              Price per inspection ($)
            </label>
            <input
              type="number"
              min={0}
              value={pricePerInspection}
              onChange={(e) => setPricePerInspection(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from"
            />
          </div>

          <div>
            <label className="block text-sm text-ink/70 mb-1">
              Hours per inspection
            </label>
            <input
              type="number"
              min={0}
              step={0.25}
              value={hoursPerInspection}
              onChange={(e) => setHoursPerInspection(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from"
            />
          </div>

          <div>
            <label className="block text-sm text-ink/70 mb-1">
              Labor cost per hour ($)
            </label>
            <input
              type="number"
              min={0}
              value={laborCostPerHour}
              onChange={(e) => setLaborCostPerHour(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from"
            />
          </div>

          <div>
            <label className="block text-sm text-ink/70 mb-1">
              Vehicle / fuel cost per job ($)
            </label>
            <input
              type="number"
              min={0}
              value={vehicleFuelPerJob}
              onChange={(e) => setVehicleFuelPerJob(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from"
            />
          </div>

          <div>
            <label className="block text-sm text-ink/70 mb-1">
              Monthly overhead ($) — insurance, equipment, software
            </label>
            <input
              type="number"
              min={0}
              value={monthlyOverhead}
              onChange={(e) => setMonthlyOverhead(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-ink/70">
              <span>Monthly revenue</span>
              <span className="text-ink font-medium">{fmt(results.revenue)}</span>
            </div>
            <div className="flex justify-between text-sm text-ink/70">
              <span>Labor cost</span>
              <span className="text-ink font-medium">{fmt(results.laborCost)}</span>
            </div>
            <div className="flex justify-between text-sm text-ink/70">
              <span>Fuel / vehicle cost</span>
              <span className="text-ink font-medium">{fmt(results.fuelCost)}</span>
            </div>
            <div className="flex justify-between text-sm text-ink/70">
              <span>Overhead</span>
              <span className="text-ink font-medium">{fmt(monthlyOverhead)}</span>
            </div>
            <div className="border-t border-line pt-3 flex justify-between text-sm">
              <span className="text-ink/70">Total cost</span>
              <span className="text-ink font-medium">{fmt(results.totalCost)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-ink font-medium">Monthly profit</span>
              <span className={`font-semibold ${results.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {fmt(results.profit)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-ink/70">Profit margin</span>
              <span className="text-sm font-medium text-ink">
                {results.marginPct.toFixed(1)}%
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-line overflow-hidden">
              <div
                className={`h-full ${marginColor} transition-all duration-300`}
                style={{ width: `${clampedMargin}%` }}
              />
            </div>
            <p className="text-xs text-ink/60 mt-1.5">{marginLabel}</p>
          </div>

          <div className="mt-6 rounded-xl bg-paper border border-line p-4">
            <p className="text-sm text-ink/70">
              Break-even price per inspection
            </p>
            <p className="text-xl font-semibold text-ink mt-0.5">
              {fmt(results.breakEvenPrice)}
            </p>
            <p className="text-xs text-ink/60 mt-1">
              Charging below this loses you money once labor, fuel, and overhead are covered.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-ink/70">
          Want more roofing customers finding pages like this one?
        </p>
        <a
          href="/audit"
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-accent-from to-accent-from px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Run a free SEO audit
        </a>
      </div>
    </div>
  );
}
