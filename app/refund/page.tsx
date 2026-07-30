import Link from 'next/link';

export const metadata = {
  title: 'Refund Policy | RankinSEO',
  description: 'Refund and cancellation policy for the RankinSEO platform.',
};

export default function RefundPolicyPage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-ink">Refund Policy</h1>
          <p className="text-sm text-slate mt-2">Last updated: July 30, 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">1. Free Trial</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            RankinSEO offers a 14-day free trial on all paid plans. You will not be charged until
            the trial period ends. You may cancel at any time during the trial at no cost.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">2. Subscription Cancellations</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            You may cancel your subscription at any time from your account dashboard. Cancellation
            takes effect at the end of your current billing period, and you will retain access to
            paid features until that date. We do not provide partial refunds for unused time within
            a billing period.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">3. Refund Eligibility</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            If you believe you were charged in error, or experienced a technical issue that
            prevented you from using RankinSEO during your billing period, contact us within 7 days
            of the charge. We review refund requests on a case-by-case basis and will respond
            within 5 business days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">4. How to Request a Refund</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            Reach out via our{' '}
            <Link href="/contact" className="text-accent-text underline underline-offset-2">
              contact page
            </Link>{' '}
            with your account email and the reason for your request. Approved refunds are processed
            to the original payment method within 5–10 business days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">5. Exceptions</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            Refunds are not provided for accounts terminated for violation of our{' '}
            <Link href="/terms" className="text-accent-text underline underline-offset-2">
              Terms of Service
            </Link>.
          </p>
        </section>
      </main>
    </div>
  );
}