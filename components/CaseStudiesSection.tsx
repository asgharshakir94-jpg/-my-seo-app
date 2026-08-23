export default function CaseStudiesSection() {
  return (
    <section id="case-studies" className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-12">
        <span className="text-sm font-semibold tracking-wide text-ink/60 mb-3 block">
          PROVEN PERFORMANCE
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">
          Quantifiable SEO dominance for high-growth enterprises.
        </h2>
        <p className="text-ink/70 max-w-2xl">
          Explore how ambitious brands leverage rankinseo.xyz to transform
          search visibility into a predictable revenue engine.
        </p>
      </div>

      {/* CTA band */}
      <div className="rounded-2xl bg-ink text-paper p-10 md:p-12">
        <h3 className="text-2xl md:text-3xl font-bold mb-3">
          Ready to see similar results for your brand?
        </h3>
        <p className="text-paper/70 mb-6 max-w-xl">
          Get a custom SEO audit and growth projection based on your
          industry&apos;s current data velocity.
        </p>
        <div className="flex gap-4">
          <a href="/audit"
          className="bg-paper text-ink px-6 py-2 rounded-md font-medium hover:opacity-90"
          >
          Request a Strategy Audit
          </a>
          <a href="#pricing"
          className="border border-paper/40 text-paper px-6 py-2 rounded-md font-medium hover:bg-paper/10"
          >
          View Pricing Plans
          </a>
        </div>
      </div>
    </section>
  );
}