import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About RankinSEO | SEO Content for Trade Businesses",
  description:
    "RankinSEO creates AI-powered SEO articles for roofers, HVAC, solar, plumbing and electrical businesses in the US and Canada. Meet the founder, Muhammad Asghar Shakir.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">
        SEO built for roofers, HVAC, solar, plumbing and electrical businesses
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        You run a trade business. You don&apos;t have time to learn SEO. RankinSEO
        helps you find the keywords your customers search for and turns them into search-optimized articles, so your website
        keeps bringing in local customers.
      </p>

      {/* Founder */}
      <section className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-start">
        <img
          src="/Founder.jpg"
          alt="Muhammad Asghar Shakir, founder of RankinSEO"
          width={160}
          height={160}
          className="h-40 w-40 rounded-xl object-cover"
        />
        <div>
          <h2 className="text-2xl font-semibold">
            Hi, I&apos;m Muhammad Asghar Shakir
          </h2>
          <p className="mt-3 text-gray-700">
            I was born in Pakistan and lived in Chicago from 1987 to 1993, so I
            know American business culture first-hand. Before RankinSEO, I
            worked in sales and marketing, then moved into restaurant
            management. Running a restaurant taught me what it&apos;s like to
            run a local business: long days, thin margins, and no spare time
            for marketing, even when you know you need it.
          </p>
          <p className="mt-3 text-gray-700">
            I started RankinSEO because trade businesses face the same problem.
            A roofer, plumber or HVAC owner is busy on job sites, and the
            website content that brings in local customers never gets written.
            I built RankinSEO to take that work off your plate.
          </p>
          <p className="mt-3 text-gray-700">
            My promise: clear work every week, honest reporting, and replies to
            your emails within 24 hours.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mt-14">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-6 text-gray-700">
          <li>
            <strong>We scan your site</strong> and find the keywords your
            customers actually search for.
          </li>
          <li>
            <strong>You choose a keyword</strong> that fits your trade and
            the areas you serve.
          </li>
          <li>
            <strong>We generate your article</strong>, written to rank, ready to publish on
            your website.
          </li>
        </ol>
      </section>

      {/* Location */}
      <section className="mt-14">
        <h2 className="text-2xl font-semibold">Where we&apos;re based</h2>
        <p className="mt-3 text-gray-700">
          I&apos;m based in Pakistan and work with trade businesses across the
          US and Canada. My working hours are 9 AM to 7 PM Pakistan time
          (PKT), which is roughly midnight to 10 AM Eastern, or 9 PM to 7 AM
          Pacific. Email me any time and I reply within 24 hours. Calls are
          available by appointment.
        </p>
      </section>

      {/* Proof: add only real results */}
      {/*
      <section className="mt-14">
        <h2 className="text-2xl font-semibold">Results</h2>
        <p className="mt-3 text-gray-700">[REAL case study or testimonial here]</p>
      </section>
      */}

      {/* Contact + CTA */}
      <section className="mt-14 rounded-xl bg-gray-50 p-6">
        <h2 className="text-2xl font-semibold">Talk to me directly</h2>
        <p className="mt-2 text-gray-700">
          Questions before you start? Email me at{" "}
          <a className="underline" href="mailto:support@rankinseo.xyz">
            support@rankinseo.xyz
          </a>
          .
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/quiz"
            className="rounded-lg bg-black px-5 py-2.5 text-white"
          >
            Get your free site scan
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border border-gray-300 px-5 py-2.5"
          >
            Contact
          </Link>
        </div>
      </section>
    </main>
  );
}
