import Link from "next/link";

export function FeaturesSection() {
  return (
    <section id="features" className="bg-paper px-6 py-24">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-sm font-medium tracking-widest text-accent uppercase">
          What&apos;s inside
        </p>
        <h2 className="mt-4 text-4xl md:text-5xl font-bold text-ink">
          Everything you need to write local SEO articles
        </h2>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-ink/70">
          RankinSEO researches your keyword and writes a search-optimized
          article for your trade business. You review it and publish it on
          your own website.
        </p>
      </div>

      {/* Top feature row */}
      <div className="mx-auto max-w-6xl mt-16 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl p-8 border border-line">
          <div className="text-2xl">✨</div>
          <h3 className="mt-4 text-xl font-semibold text-ink">
            From one keyword to a finished article
          </h3>
          <p className="mt-2 text-ink/70">
            Type a keyword your customers search for, such as &quot;roof repair
            Tulsa&quot;. RankinSEO builds a research brief first, then writes the
            full article from it, so the draft covers what readers actually
            look for.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-ink/70">
            <li>✓ Research brief with subtopics and common questions</li>
            <li>✓ Optional city and industry for local wording</li>
            <li>✓ Clean HTML you can copy into your website</li>
          </ul>
        </div>

        <div className="bg-ink text-paper rounded-2xl p-8 flex flex-col justify-between">
          <div>
            <p className="text-4xl font-bold">10</p>
            <p className="mt-2 text-paper/80 text-sm">
              articles a month on the Starter plan, each written from a
              keyword you choose.
            </p>
          </div>
        </div>
      </div>

      {/* Second row */}
      <div className="mx-auto max-w-6xl mt-6 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-8 border border-line">
          <h3 className="text-xl font-semibold text-ink">Risk check before you publish</h3>
          <p className="mt-2 text-ink/70">
            Every article is scanned for things that need a human look:
            prices, statistics, dates that will go stale, business claims,
            and rules or regulations. Flagged articles wait for your review
            instead of going out unchecked.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-8 border border-line">
          <h3 className="text-xl font-semibold text-ink">Free tools for trade businesses</h3>
          <p className="mt-2 text-ink/70">
            Try our free backlink opportunity finder and cost and profit
            margin calculators for trades. No account needed.
          </p>
          <Link href="/tools" className="mt-4 inline-block text-sm font-medium text-accent">
            See the free tools →
          </Link>
        </div>
      </div>

      {/* What is in every article */}
      <div className="mx-auto max-w-6xl mt-24 text-center">
        <h3 className="text-3xl font-bold text-ink">What&apos;s in every article</h3>
        <p className="mt-2 text-ink/70">
          What RankinSEO does each time you click Launch Pipeline.
        </p>
      </div>

      <div className="mx-auto max-w-6xl mt-10 grid md:grid-cols-3 gap-6">
        {[
          { title: "Research brief", desc: "Subtopics to cover, local details to include, and questions readers ask, before any writing starts." },
          { title: "SEO score", desc: "Each article gets a score out of 100, with word count, keyword density, headings, links and images shown." },
          { title: "Risk check", desc: "Flags prices, statistics, dates and regulations so you know what to double-check before publishing." },
          { title: "Photo included", desc: "A relevant Unsplash photo is added with credit, and you can swap it from your dashboard." },
          { title: "Local wording", desc: "Add a city and an industry and the article is written for local homeowners instead of generic readers." },
          { title: "You approve it", desc: "You read every article and approve it before it is marked ready to publish." },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-2xl p-8 border border-line">
            <h4 className="font-semibold text-ink">{item.title}</h4>
            <p className="mt-2 text-sm text-ink/70">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA band */}
      <div className="mx-auto max-w-6xl mt-20 bg-ink rounded-2xl p-12 text-center">
        <h3 className="text-3xl font-bold text-paper">
          Ready to see what a RankinSEO article looks like?
        </h3>
        <div className="mt-6 flex gap-4 justify-center">
          <Link href="/audit" className="bg-white text-ink px-6 py-3 rounded-lg font-medium">
            Start Your Free Audit
          </Link>
          <Link href="/contact" className="border border-paper/40 text-paper px-6 py-3 rounded-lg font-medium">
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}