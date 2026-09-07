import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ✅ Force trailing slashes sitewide
  trailingSlash: true,

  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },

  async redirects() {
    return [
      {
        source: '/tools/roof-inspection-calculator',
        destination: '/tools/roofing-calculator',
        permanent: true,
      },
      {
        source: '/blog/how-to-spot-roofstorm-damage',
        destination: '/blog/how-to-spot-roof-storm-damage',
        permanent: true,
      }, 
      {
        source: '/blog/roof-maintenance-checklist-for-homeowners',
        destination: '/blog/roof-maintenance-check-list-for-homeowners',
        permanent: true,
      }, 
      {
        source: '/blog/roofing-inspection-cost',
        destination: '/blog/roof-inspection-cost',
        permanent: true,
      },
      {
        source: '/blog/roofing-company-near-me',
        destination: '/blog/roofing-contractor-near-me',
        permanent: true,
      },
      {
        source: '/blog//roofing-near-me',
        destination: '/blog/roofing-contractor-near-me',
        permanent: true,
      },
      {
        source:  '/blog/roofing-contractors-near-me',
        destination: '/blog/roofing-contractor-near-me',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
