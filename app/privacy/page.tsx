import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | RankinSEO',
  description: 'How RankinSEO collects, uses, and protects your data.',
};

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-ink">Privacy Policy</h1>
          <p className="text-sm text-slate mt-2">Last updated: July 16, 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">1. Who We Are</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            RankinSEO ("we," "us," or "our") is a product operated by Ironclad Automations. This
            Privacy Policy explains how we collect, use, and protect information when you visit
            our website, use our contact form, or use our SEO content generation platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">2. Information We Collect</h2>
          <p className="text-sm text-ink/80 leading-relaxed">We collect the following types of information:</p>
          <ul className="list-disc pl-5 text-sm text-ink/80 space-y-2">
            <li><strong>Contact form submissions:</strong> name, email address, business name or website URL, and any message content you provide.</li>
            <li><strong>Account information:</strong> if you sign up for our platform, we collect your email address and authentication details via our authentication provider (Supabase).</li>
            <li><strong>Usage data:</strong> keywords, campaign data, and content you generate or approve through the platform.</li>
            <li><strong>Technical data:</strong> IP address, browser type, and general analytics collected automatically when you visit our site.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 text-sm text-ink/80 space-y-2">
            <li>To respond to inquiries submitted through our contact form.</li>
            <li>To provide, maintain, and improve the RankinSEO platform.</li>
            <li>To generate SEO content on your behalf using third-party AI services.</li>
            <li>To communicate with you about your account or services.</li>
            <li>To comply with legal obligations.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">4. Third-Party Services</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            We rely on trusted third-party providers to operate RankinSEO, including:
          </p>
          <ul className="list-disc pl-5 text-sm text-ink/80 space-y-2">
            <li><strong>Supabase</strong> — database hosting and authentication.</li>
            <li><strong>OpenAI</strong> — AI content generation. Keyword and content data may be processed by OpenAI's API to generate articles.</li>
            <li><strong>Vercel</strong> — application hosting and infrastructure.</li>
            <li><strong>Webflow</strong> — content export and publishing, where applicable to your account.</li>
          </ul>
          <p className="text-sm text-ink/80 leading-relaxed">
            Each of these providers has its own privacy practices governing how they handle data
            processed on our behalf.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">5. Data Retention</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            We retain your information for as long as necessary to provide our services or as
            required by law. You may request deletion of your data at any time by contacting us.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">6. Your Rights</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            Depending on your location (including under GDPR for users in the EU/UK), you may have
            the right to access, correct, delete, or export your personal data, and to object to
            or restrict certain processing. To exercise these rights, contact us using the details below.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">7. Data Security</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            We use industry-standard measures, including encrypted connections and access controls,
            to protect your data. However, no method of transmission or storage is 100% secure, and
            we cannot guarantee absolute security.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">8. Children's Privacy</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            RankinSEO is not directed at individuals under the age of 18, and we do not knowingly
            collect data from children.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">9. Changes to This Policy</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            We may update this Privacy Policy from time to time. Changes will be posted on this page
            with an updated "Last updated" date.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">10. Contact Us</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            If you have questions about this Privacy Policy or wish to exercise your data rights,
            contact us via our{' '}
            <Link href="/contact" className="text-accent-text underline underline-offset-2">
              contact page
            </Link>.
          </p>
        </section>
      </main>
    </div>
  );
}