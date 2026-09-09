'use client';

import { useState } from 'react';
import { Copy, Check, Zap, MapPin, Phone, Building2, Globe } from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────────── */
type ServiceCategory = 'Plumber' | 'Roofer' | 'HVACBusiness' | 'Electrician' | 'SolarEnergySystem';

interface FormData {
  companyName: string;
  phone: string;
  category: ServiceCategory;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  websiteUrl: string;
  targetedCities: string;
  openingHours: string;
}

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  Plumber: 'Plumbing',
  Roofer: 'Roofing',
  HVACBusiness: 'HVAC Contractor',
  Electrician: 'Electrical',
  SolarEnergySystem: 'Solar Installer',
};

const CATEGORY_DESCRIPTIONS: Record<ServiceCategory, string> = {
  Plumber: 'Professional plumbing services for residential and commercial clients.',
  Roofer: 'Expert roofing installation, repair, and replacement services.',
  HVACBusiness: 'Heating, ventilation, and air conditioning services for homes and businesses.',
  Electrician: 'Licensed electrical installation, repair, and safety inspection services.',
  SolarEnergySystem: 'Solar panel installation and renewable energy system services.',
};

/* ─── Schema Builder ─────────────────────────────────────────────────────── */
function buildSchema(form: FormData): string {
  const cities = form.targetedCities
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);

  const areaServed = cities.length
    ? cities.map((c) => ({ '@type': 'City', name: c }))
    : undefined;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': form.category,
    name: form.companyName || 'Your Company Name',
    telephone: form.phone || '+1-000-000-0000',
    description: CATEGORY_DESCRIPTIONS[form.category],
    url: form.websiteUrl || 'https://example.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: form.streetAddress || '123 Main Street',
      addressLocality: form.city || 'Your City',
      addressRegion: form.state || 'ST',
      postalCode: form.zip || '00000',
      addressCountry: 'US',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: form.openingHours.split('-')[0]?.trim() || '08:00',
        closes: form.openingHours.split('-')[1]?.trim() || '17:00',
      },
    ],
  };

  if (areaServed) {
    schema.areaServed = areaServed;
  }

  return JSON.stringify(schema, null, 2);
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export function LocalSchemaGenerator() {
  const [form, setForm] = useState<FormData>({
    companyName: '',
    phone: '',
    category: 'Plumber',
    streetAddress: '',
    city: '',
    state: '',
    zip: '',
    websiteUrl: '',
    targetedCities: '',
    openingHours: '08:00 - 17:00',
  });

  const [schema, setSchema] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = () => {
    setSchema(buildSchema(form));
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!schema) return;
    await navigator.clipboard.writeText(schema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  /* ── Shared input class ── */
  const inputClass =
    'w-full px-3 py-2.5 rounded-lg border border-line bg-paper text-ink text-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow';

  return (
    <section
      id="local-schema-generator"
      className="max-w-7xl mx-auto px-4 py-12"
      aria-labelledby="schema-gen-heading"
    >
      {/* ── Header ── */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft/40 border border-line text-xs font-semibold uppercase tracking-wider text-ink/70 mb-4">
          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-accent-from to-accent-to" />
          Free Tool — No Sign-Up Required
        </div>
        <h1
          id="schema-gen-heading"
          className="text-3xl md:text-4xl font-bold tracking-tight text-ink mb-3"
        >
          Local Business Schema Generator
        </h1>
        <p className="text-base md:text-lg text-ink/70 max-w-2xl mx-auto">
          Generate a perfectly structured{' '}
          <strong>LocalBusiness JSON-LD schema</strong> in seconds. Paste it into
          your website&apos;s{' '}
          <code className="text-xs bg-paper border border-line rounded px-1.5 py-0.5">
            {'<head>'}
          </code>{' '}
          to help Google and AI engines understand your business.
        </p>
      </div>

      {/* ── Main Card ── */}
      <div className="bg-surface border border-line rounded-2xl p-6 md:p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── Left: Form ── */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
              <Building2 className="h-5 w-5 text-accent" />
              Business Details
            </h2>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                placeholder="e.g., Smith Plumbing LLC"
                value={form.companyName}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Service Category */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Service Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputClass}
              >
                {(Object.keys(CATEGORY_LABELS) as ServiceCategory[]).map((key) => (
                  <option key={key} value={key}>
                    {CATEGORY_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Phone Number
                </span>
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="+1-555-867-5309"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> Website URL
                </span>
              </label>
              <input
                type="url"
                name="websiteUrl"
                placeholder="https://smithplumbing.com"
                value={form.websiteUrl}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <hr className="border-line" />

            <h2 className="text-lg font-semibold text-ink flex items-center gap-2 !mt-5">
              <MapPin className="h-5 w-5 text-accent" />
              Location & Coverage
            </h2>

            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Street Address
              </label>
              <input
                type="text"
                name="streetAddress"
                placeholder="123 Main Street"
                value={form.streetAddress}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* City / State / Zip — 3 columns */}
            <div className="grid grid-cols-6 gap-3">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-ink mb-1.5">City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Dallas"
                  value={form.city}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-ink mb-1.5">State</label>
                <input
                  type="text"
                  name="state"
                  placeholder="TX"
                  maxLength={2}
                  value={form.state}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-ink mb-1.5">ZIP</label>
                <input
                  type="text"
                  name="zip"
                  placeholder="75201"
                  maxLength={10}
                  value={form.zip}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Targeted Service Cities */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Targeted Service Cities{' '}
                <span className="text-ink/50 font-normal">(comma-separated)</span>
              </label>
              <textarea
                name="targetedCities"
                rows={3}
                placeholder="Dallas, Plano, Frisco, McKinney, Allen"
                value={form.targetedCities}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Opening Hours */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Opening Hours{' '}
                <span className="text-ink/50 font-normal">(Mon–Fri, 24-hr format)</span>
              </label>
              <input
                type="text"
                name="openingHours"
                placeholder="08:00 - 17:00"
                value={form.openingHours}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-accent-from to-accent-to hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
            >
              <Zap className="h-4 w-4" />
              Generate Schema
            </button>
          </div>

          {/* ── Right: Output ── */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-ink">Generated JSON-LD</h2>
              {schema && (
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-line bg-paper text-sm font-medium text-ink hover:bg-surface transition-colors"
                  aria-label="Copy schema to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Code
                    </>
                  )}
                </button>
              )}
            </div>

            {schema ? (
              <pre className="flex-1 bg-paper border border-line rounded-xl p-4 overflow-x-auto text-sm font-mono text-ink/80 leading-relaxed whitespace-pre">
                {`<script type="application/ld+json">\n${schema}\n</script>`}
              </pre>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-paper border border-line rounded-xl p-8 text-center min-h-[320px]">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-accent-from/20 to-accent-to/20 border border-line flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <p className="text-sm font-medium text-ink mb-1">
                  Your schema will appear here
                </p>
                <p className="text-xs text-ink/50">
                  Fill in the form and click &quot;Generate Schema&quot; to get started
                </p>
              </div>
            )}

            {schema && (
              <div className="mt-4 p-4 rounded-xl bg-paper/60 border border-line">
                <p className="text-xs text-ink/60 leading-relaxed">
                  <strong className="text-ink/80">How to use:</strong> Copy the code above
                  and paste it just before the closing{' '}
                  <code className="bg-surface border border-line rounded px-1 py-0.5">
                    {'</head>'}
                  </code>{' '}
                  tag on your webpage. Validate it at{' '}
                  <a
                    href="https://search.google.com/test/rich-results"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-accent hover:opacity-80"
                  >
                    Google Rich Results Test
                  </a>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="mt-8 p-6 bg-surface border border-line rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-ink text-sm mb-0.5">
            Want your schema automatically added to every page?
          </p>
          <p className="text-xs text-ink/60">
            RankinSEO injects entity-optimized schema on every article we publish — hands-free.
          </p>
        </div>
        <a
          href="/audit"
          className="shrink-0 px-6 py-2.5 rounded-md bg-black text-white text-sm font-medium hover:bg-ink/90 transition-colors"
        >
          Get Your Free Audit →
        </a>
      </div>
    </section>
  );
}
