export function FeaturesSection() {
    return (
        <section id="features" className="bg-paper px-6 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm font-medium tracking-widest text-accent uppercase">
            Engineered for Authority
          </p>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-ink">
            Sophisticated Intelligence for Modern SEO
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-ink/70">
            Move beyond basic metrics. RankinSEO leverages autonomous neural
            networks to predict ranking shifts before they happen.
          </p>
        </div>
  
        {/* Top feature row */}
        <div className="mx-auto max-w-6xl mt-16 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl p-8 border border-line">
            <div className="text-2xl">✨</div>
            <h3 className="mt-4 text-xl font-semibold text-ink">
              Autonomous SEO Engine
            </h3>
            <p className="mt-2 text-ink/70">
              Our proprietary engine continuously crawls your niche, identifying
              structural weaknesses and high-intent opportunities without
              manual intervention.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-ink/70">
              <li>✓ Self-correcting technical audits</li>
              <li>✓ Automated internal linking maps</li>
              <li>✓ Dynamic content gap detection</li>
            </ul>
          </div>
  
          <div className="bg-ink text-paper rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <p className="text-4xl font-bold">94%</p>
              <p className="mt-2 text-paper/80 text-sm">
                Reduction in manual keyword research time for enterprise teams
                using our intelligence suites.
              </p>
            </div>
          </div>
        </div>
  
        {/* Second row: Keyword Intelligence + Backlink Vault */}
        <div className="mx-auto max-w-6xl mt-6 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-8 border border-line">
            <h3 className="text-xl font-semibold text-ink">AI Keyword Intelligence</h3>
            <p className="mt-2 text-ink/70">
              Go beyond volume and difficulty. Discover the semantic DNA of
              high-performing keywords and predict intent shifts before they
              impact your traffic.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-line">
            <h3 className="text-xl font-semibold text-ink">Precision Backlink Vault</h3>
            <p className="mt-2 text-ink/70">
              A curated, hyper-vetted ecosystem of high-authority publishers.
              We focus on qualitative architectural integrity over quantitative
              noise.
            </p>
            <a href="#" className="mt-4 inline-block text-sm font-medium text-accent">
              Explore the Vault →
            </a>
          </div>
        </div>
  
        {/* Precision Components grid */}
        <div className="mx-auto max-w-6xl mt-24 text-center">
          <h3 className="text-3xl font-bold text-ink">Precision Components</h3>
          <p className="mt-2 text-ink/70">
            The fine-tuned instruments driving your organic growth.
          </p>
        </div>
  
        <div className="mx-auto max-w-6xl mt-10 grid md:grid-cols-3 gap-6">
          {[
            { title: "Real-time Attribution", desc: "Track the exact ROI of every keyword and link placement in real-time dashboards." },
            { title: "Content Harmony", desc: "Align your content strategy with search demand patterns using predictive AI modeling." },
            { title: "Algorithm Shield", desc: "Get notified of potential algorithm updates before they roll out globally." },
            { title: "SERP Archiving", desc: "Visual snapshots of every search result page to analyze competitor positioning over time." },
            { title: "Global Authority", desc: "Manage multi-regional SEO campaigns from a single, unified architectural interface." },
            { title: "Enterprise API", desc: "Seamlessly integrate our intelligence into your existing proprietary data stack." },
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
            Ready to Command the Search Landscape?
          </h3>
          <div className="mt-6 flex gap-4 justify-center">
            <button className="bg-white text-ink px-6 py-3 rounded-lg font-medium">
              Start Your Free Audit
            </button>
            <button className="border border-paper/40 text-paper px-6 py-3 rounded-lg font-medium">
              Talk to an Expert
            </button>
          </div>
        </div>
      </section>
    );
  }