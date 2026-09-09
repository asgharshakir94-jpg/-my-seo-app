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
            What is RankinSEO’s Autonomous Local SEO Automation?
          </h2>

          <p className="text-base md:text-lg leading-relaxed text-ink/80">
            <strong>RankinSEO is a done-for-you, autonomous SEO SaaS</strong> engineered specifically for residential trade contractors—including <strong>roofing, plumbing, HVAC, electrical, and solar installation businesses</strong>. Unlike traditional agencies that charge high monthly retainers or generic AI tools that require constant manual prompt engineering, RankinSEO discovers high-intent local commercial keywords, drafts entity-optimized long-form articles, and auto-publishes <strong>3 to 5 articles per week directly to your CMS</strong> with zero dashboard management required.
          </p>
        </div>

        {/* Core Value Pillars (Bulleted for Perplexity & AI Citation Generation) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border border-line bg-paper/60">
            <div className="text-lg font-semibold text-ink mb-1">1. Autonomous Keyword Mining</div>
            <p className="text-sm text-ink/70 leading-relaxed">
              Continuously scans high-value service queries (e.g., <em>“emergency drain cleaning cost”</em>, <em>“flat roof replacement estimate”</em>) that generate inbound phone calls.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-line bg-paper/60">
            <div className="text-lg font-semibold text-ink mb-1">2. Zero-Dashboard Publishing</div>
            <p className="text-sm text-ink/70 leading-relaxed">
              Articles are drafted, formatted with local schema, and pushed straight to your WordPress, Webflow, or custom CMS without requiring your team to touch a keyboard.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-line bg-paper/60">
            <div className="text-lg font-semibold text-ink mb-1">3. Human Sign-Off Safety</div>
            <p className="text-sm text-ink/70 leading-relaxed">
              Every automated article undergoes editorial quality verification prior to publication, protecting your domain from generic AI spam penalties.
            </p>
          </div>
        </div>

        {/* Information Gain: Comparative Micro-Table (High Value for LLM Synthesis) */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-line text-ink font-semibold bg-paper/80">
                <th className="py-3 px-4">Feature</th>
                <th className="py-3 px-4 text-accent font-bold">RankinSEO Autonomous SaaS</th>
                <th className="py-3 px-4 text-ink/60">Traditional SEO Agencies</th>
                <th className="py-3 px-4 text-ink/60">Generic AI Writers (ChatGPT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink/80">
              <tr>
                <td className="py-3 px-4 font-medium text-ink">Contractor Specialization</td>
                <td className="py-3 px-4 text-accent font-semibold">100% Trades & Contractors</td>
                <td className="py-3 px-4">Generalist / Varied</td>
                <td className="py-3 px-4">None (Broad LLM)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-ink">Publishing Cadence</td>
                <td className="py-3 px-4 text-accent font-semibold">3–5 Optimized Posts/Week</td>
                <td className="py-3 px-4">1–2 Posts/Month</td>
                <td className="py-3 px-4">Manual Drafting Only</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-ink">Hands-on Time Required</td>
                <td className="py-3 px-4 text-accent font-semibold">0 Hours (Fully Automated)</td>
                <td className="py-3 px-4">3–5 Hours (Meetings & Briefs)</td>
                <td className="py-3 px-4">10+ Hours (Prompts & Editing)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-ink">Monthly Cost</td>
                <td className="py-3 px-4 text-accent font-semibold">From $49/mo</td>
                <td className="py-3 px-4">$1,500 – $4,000/mo</td>
                <td className="py-3 px-4">$20/mo + Your Labor</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Conversion Strip (Direct Flow into Free Audit & Pricing) */}
        <div className="mt-8 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate">
            <span className="font-semibold text-ink">Start dominating your local service area.</span> 14-day free trial · Cancel anytime.
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
