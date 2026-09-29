import Link from "next/link";

const tools = [
  {
    title: "Roofing Calculator",
    desc: "Price your roof inspections and check your profit margin.",
    href: "/tools/roofing-calculator",
  },
  {
    title: "Solar Calculator",
    desc: "Price your solar installations and check your profit margin.",
    href: "/tools/solar-calculator",
  },
  {
    title: "HVAC Calculator",
    desc: "Price your HVAC service calls and check your profit margin.",
    href: "/tools/hvac-calculator",
  },
  {
    title: "Plumbing Calculator",
    desc: "Price your plumbing service calls and check your profit margin.",
    href: "/tools/plumbing-calculator",
  },
  {
    title: "Electrical Calculator",
    desc: "Price your electrical service calls and check your profit margin.",
    href: "/tools/electrical-calculator",
  },
  {
    title: "Free SEO Audit",
    desc: "Scan your site for common SEO issues in seconds.",
    href: "/audit",
  },
  {
    title: "Free Backlink Seeker",
    desc: "Crawl and analyze any domain to instantly discover active backlink connection metadata.",
    href: "/tools/backlink-seeker",
  },
];

export function CoreToolsSection() {
  return (
    <section id="core-features" className="bg-paper px-6 py-16">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-sm font-medium tracking-widest text-accent uppercase">
          Free to Use
        </p>
        <h2 className="mt-4 text-3xl md:text-4xl font-bold text-ink">
          Our Core Features
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-ink/70">
          Price jobs accurately, check optimization data, and find your real metrics — no sign-up required.
        </p>
      </div>

      <div className="mx-auto max-w-6xl mt-10 grid md:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="block bg-white rounded-2xl p-6 border border-line hover:border-accent transition-colors shadow-sm hover:shadow-md"
          >
            <h3 className="font-semibold text-ink flex items-center gap-2">
              {tool.title} {tool.title === "Free Backlink Seeker" && <span className="text-xs bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">New</span>}
            </h3>
            <p className="mt-2 text-sm text-ink/70">{tool.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
