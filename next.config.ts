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
    ];
  },
};

export default nextConfig;
