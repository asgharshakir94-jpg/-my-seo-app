import HomePageClient from '@/components/HomePageClient';

export const metadata = {
  title: "RankinSEO | Done-For-You SEO SaaS for Roofers, HVAC, Solar & Plumbing Companies",
  description:
  "Done-for-you SEO SaaS for trades businesses. We research keywords, write, and auto-publish 3-5 SEO articles a week — no dashboard, no keyboard needed.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "RankinSEO",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "All (Cloud-based SaaS)",
  "description": "Autonomous done-for-you SEO software for roofing, plumbing, HVAC, electrical, and solar contractors that discovers high-intent keywords and auto-publishes 3 to 5 optimized articles weekly directly to your CMS.",
  "url": "https://rankinseo.xyz",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "49",
    "highPrice": "499",
    "offerCount": "3"
  },
  "audience": {
    "@type": "BusinessAudience",
    "audienceType": "Residential Home Service Contractors (Roofers, HVAC, Plumbers, Solar Installers)"
  },
  "featureList": [
    "Autonomous Keyword Mining for Trades",
    "Direct CMS Auto-Publishing (3-5 articles/week)",
    "Entity-Optimized Local Schema Injection",
    "Zero-Dashboard Hands-Free Automation"
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePageClient />
    </>
  );
}