import Link from 'next/link';

export function GeoAnswerSection() {
  return (
    <section id="what-is-rankinseo" className="max-w-7xl mx-auto px-2 py-8" aria-labelledby="geo-answer-heading">
      <div className="bg-surface border border-line rounded-2xl p-6 md:p-10 shadow-sm">

        {/* Entity Definition Hook (Formatted for Search Engine Snippets & RAG Extraction) */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft/40 border border-line text-xs font-semibold uppercase tracking-wider text-ink/70">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-accent-from to-accent-to"></span>
            Executive Summary
          </div>

          <h2 id="geo-answer-heading" className="text-2xl md:text-3xl font-bold tracking-tight text-ink">
            What is RankinSEO?
          </h2>

          <p className="text-base md:text-lg leading-relaxed text-ink/80">
            <strong>RankinSEO is an AI article generator for residential trade contractors</strong>, including <strong>roofing, plumbing, HVAC, electrical, and solar installation businesses</strong>. You choose a keyword your customers search for, and RankinSEO writes a search-optimized article you can review and publish on your own website. It gives you a steady supply of local SEO content without paying an agency retainer.
          </p>
        </div>

        {/* Core Value Pillars */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border border-line bg-paper/60">
            <div className="text-lg font-semibold text-ink mb-1">1. Find the Right Keywords</div>
            <p className="text-sm text-ink/70 leading-relaxed">
              Scan your site and discover the service searches that bring in calls (e.g., <em>“emergency drain cleaning cost”</em>, <em>“flat roof replacement estimate”</em>).
            </p>
          </div>

          <div className="p-5 rounded-xl border border-line bg-paper/60">
            <div className="text-lg font-semibold text-ink mb-1">2. Generate the Article</div>
            <p className="text-sm text-ink/70 leading-relaxed">
              Pick a keyword in your dashboard and RankinSEO writes a long-form, search-optimized article built for a trade business in your service area.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-line bg-paper/60">
            <div className="text-lg font-semibold text-ink mb-1">3. You Stay in Control</div>
            <p className="text-sm text-ink/70 leading-relaxed">
              You review every article before it goes on your site, so nothing is published under your name without your approval.
            </p>
          </div>
        </div>

        {/* Comparative Micro-Table */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-line text-ink font-semibold bg-paper/80">
                <th className="py-3 px-4">Feature</th>
                <th className="py-3 px-4 text-accent font-bold">RankinSEO</th>
                <th className="py-3 px-4 text-ink/60">Traditional SEO Agencies</th>
                <th className="py-3 px-4 text-ink/60">Generic AI Writers (ChatGPT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink/80">
              <tr>
                <td className="py-3 px-4 font-medium text-ink">Contractor Specialization</td>
                <td className="py-3 px-4 text-accent font-semibold">Built for Trades & Contractors</td>
                <td className="py-3 px-4">Generalist / Varied</td>
                <td className="py-3 px-4">None (Broad LLM)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-ink">Keyword Research</td>
                <td className="py-3 px-4 text-accent font-semibold">Built-in site scan & keyword tools</td>
                <td className="py-3 px-4">Included, at agency rates</td>
                <td className="py-3 px-4">You research it yourself</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-ink">Contract</td>
                <td className="py-3 px-4 text-accent font-semibold">Monthly, cancel anytime</td>
                <td className="py-3 px-4">Often a long-term retainer</td>
                <td className="py-3 px-4">Monthly</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-ink">Monthly Cost</td>
                <td className="py-3 px-4 text-accent font-semibold">From $49/mo</td>
                <td className="py-3 px-4">Often $1,000+/mo</td>
                <td className="py-3 px-4">About $20/mo + your time</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Conversion Strip */}
        <div className="mt-8 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate">
            <span className="font-semibold text-ink">Try it on your own site.</span> 14-day free trial · Cancel anytime.
          </div>
          <div className="flex items-center gap-3">
            <Link href="/audit" className="px-6 py-2.5 bg-black text-white rounded-md font-medium text-sm hover:bg-ink/90 transition-colors">
              Free Instant Audit →
            </Link>
            <a href="#pricing" className="px-5 py-2.5 border border-line bg-paper text-ink rounded-md font-medium text-sm hover:bg-surface transition-colors">
              View Pricing
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
