import Image from "next/image";

const stories = [
  {
    tag: "FinTech",
    title: "NovaBank: Global Authority Play",
    metric1: { label: "Keywords in Top 3", value: "+140" },
    metric2: { label: "Market Share Gain", value: "12%" },
    image: "/images/case-study-fintech.jpg",
  },
  {
    tag: "E-Commerce",
    title: "Aura Home: Core Web Vital Audit",
    metric1: { label: "Conversion Lift", value: "+28%" },
    metric2: { label: "Site Speed", value: "0.8s" },
    image: "/images/case-study-ecommerce.jpg",
  },
  {
    tag: "SaaS",
    title: "CloudScale: Competitive Moat",
    metric1: { label: "LTV Increase", value: "+15%" },
    metric2: { label: "CPA Reduction", value: "-42%" },
    image: "/images/case-study-saas.jpg",
  },
];

const stats = [
  { value: "500+", label: "ENTERPRISE CLIENTS" },
  { value: "4.8B", label: "KEYWORDS TRACKED" },
  { value: "99.9%", label: "DATA ACCURACY" },
  { value: "$2B+", label: "CLIENT REVENUE INFLUENCED" },
];

const trafficBars = [30, 42, 38, 58, 70, 62, 85];

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
          Explore how the world&apos;s most ambitious brands leverage
          rankinseo.xyz to transform search visibility into a predictable
          revenue engine.
        </p>
      </div>

      {/* Spotlight + stat card */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 relative rounded-xl overflow-hidden h-80">
          <Image
            src="/images/case-study-spotlight.jpg"
            alt="Linear Health office"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-medium mb-3">
              Enterprise Spotlight
            </span>
            <h3 className="text-2xl font-bold">
              Linear Health: Scaling Organic Patient Acquisition
            </h3>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-xl p-6 flex flex-col">
          <svg
            className="w-6 h-6 text-accent-from mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
          <span className="text-sm font-semibold text-ink/60 mb-auto">
            TRAFFIC INCREASE
          </span>
          <div>
            <p className="text-4xl font-bold text-ink">+214%</p>
            <p className="text-sm text-ink/60">Organic traffic growth YoY</p>
          </div>
        </div>
      </div>

      {/* Traffic velocity + testimonial */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        <div className="bg-surface border border-line rounded-xl p-6">
          <span className="text-sm font-semibold text-ink/60 block mb-6">
            TRAFFIC VELOCITY
          </span>
          <div className="flex items-end gap-2 h-32 mb-3">
            {trafficBars.map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-ink/80 rounded-t"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-ink/50">
            <span>Month 1</span>
            <span>Month 7</span>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-xl p-6">
          <span className="text-3xl text-accent-from font-serif leading-none">
            &ldquo;
          </span>
          <p className="text-ink/80 mb-6">
            rankinseo.xyz didn&apos;t just give us data; they gave us a
            roadmap. Within two quarters, organic search became our primary
            lead generation channel, surpassing our paid spend performance.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-300 to-rose-500" />
            <div>
              <p className="font-semibold text-ink text-sm">Sarah Chen</p>
              <p className="text-ink/60 text-xs">VP of Marketing, Linear Health</p>
            </div>
          </div>
        </div>
      </div>

      {/* Client success stories grid */}
      <div className="mb-16">
        <h3 className="text-xl font-bold text-ink mb-6">Client Success Stories</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div
              key={story.title}
              className="bg-surface border border-line rounded-xl overflow-hidden"
            >
              <div className="relative h-40">
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-3 left-3 bg-white/90 text-ink text-xs font-medium px-2 py-1 rounded">
                  {story.tag}
                </span>
              </div>
              <div className="p-6">
                <h4 className="font-semibold text-ink mb-4">{story.title}</h4>
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-ink/60">{story.metric1.label}</span>
                  <span className="font-semibold text-ink">{story.metric1.value}</span>
                </div>
                <div className="flex justify-between items-center mb-4 text-sm">
                  <span className="text-ink/60">{story.metric2.label}</span>
                  <span className="font-semibold text-ink">{story.metric2.value}</span>
                </div>
                <a href="#" className="text-sm font-medium text-accent-from inline-flex items-center gap-1">
                  Read Case Study
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats band */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-line mb-16 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-3xl font-bold text-ink mb-1">{s.value}</p>
            <p className="text-xs font-semibold text-ink/60 tracking-wide">{s.label}</p>
          </div>
        ))}
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