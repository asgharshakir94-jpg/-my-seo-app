import HomePageClient from '@/components/HomePageClient';

export const metadata = {
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "RankinSEO",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "All (Cloud-based SaaS)",
  "description": "AI article generator and SEO tools for roofing, plumbing, HVAC, electrical, and solar contractors. Find keywords, run site audits, and generate search-optimized articles.",
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
    "Keyword research for trade businesses",
    "Domain audits",
    "AI-generated, search-optimized articles",
    "Keyword tracking"
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