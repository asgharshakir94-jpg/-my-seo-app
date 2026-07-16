import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | RankinSEO',
  description: 'Terms and conditions for using the RankinSEO platform.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans antialiased">
      <nav className="border-b border-line bg-paper/90 backdrop-blur-md sticky top-0 z-50 px-4 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-accent-from to-accent-to shadow-accent" />
            <span className="font-bold tracking-tight text-lg text-ink">
              RankinSEO <span className="text-sand font-medium">Project Platform</span>
            </span>
          </Link>
          <Link href="/" className="text-sm font-medium text-ink/70 hover:text-ink transition-colors">
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto p-6 md:p-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Terms of Service</h1>
          <p className="text-sm text-slate mt-2">Last updated: July 16, 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">1. Agreement to Terms</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            By accessing or using RankinSEO, operated by Ironclad Automations, you agree to be
            bound by these Terms of Service. If you do not agree, please do not use our services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">2. Description of Service</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            RankinSEO is an AI-powered platform that generates SEO-optimized articles for trades
            businesses and publishes or exports them to a client's content management system,
            including but not limited to Webflow.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">3. AI-Generated Content Disclaimer</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            Content produced by RankinSEO is generated using artificial intelligence and may contain
            inaccuracies, outdated information, or errors, including but not limited to pricing,
            statistics, regulations, or local claims. All content is subject to human review before
            publication. You are solely responsible for reviewing and approving content before it is
            published or exported, and for verifying the accuracy of any factual claims, especially
            those flagged for review by our risk-assessment system.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">4. User Responsibilities</h2>
          <ul className="list-disc pl-5 text-sm text-ink/80 space-y-2">
            <li>You must provide accurate information when using our contact form or creating an account.</li>
            <li>You are responsible for reviewing and approving all AI-generated content before publication.</li>
            <li>You may not use RankinSEO to generate content that is unlawful, defamatory, or infringes on third-party rights.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">5. Payment and Billing</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            Certain features of RankinSEO may require payment on a subscription or per-use basis.
            Pricing details are provided at the point of sale or on our{' '}
            <Link href="/#pricing" className="text-accent-text underline underline-offset-2">
              pricing page
            </Link>. Fees are non-refundable except as required by law or as otherwise stated at
            the time of purchase.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">6. Intellectual Property</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            Upon payment and export, you own the rights to the specific content generated for your
            account. RankinSEO retains all rights to its underlying platform, software, prompts,
            and technology.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">7. Limitation of Liability</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            RankinSEO and Ironclad Automations are not liable for any indirect, incidental, or
            consequential damages arising from your use of AI-generated content, including but not
            limited to claims arising from inaccurate, outdated, or misleading published content.
            Our total liability for any claim shall not exceed the amount you paid us in the three
            months preceding the claim.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">8. Third-Party Services</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            Our platform relies on third-party services including OpenAI, Supabase, Vercel, and
            Webflow. We are not responsible for outages, errors, or data handling practices of
            these third parties beyond our reasonable control.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">9. Termination</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            We reserve the right to suspend or terminate your access to RankinSEO at our discretion,
            including for violation of these Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">10. Changes to These Terms</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            We may update these Terms from time to time. Continued use of RankinSEO after changes
            are posted constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">11. Contact Us</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            Questions about these Terms? Reach out via our{' '}
            <Link href="/contact" className="text-accent-text underline underline-offset-2">
              contact page
            </Link>.
          </p>
        </section>
      </main>
    </div>
  );
}