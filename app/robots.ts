import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/api/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        userAgent: 'Perplexity-User',
        allow: '/',
      },
    ],
    sitemap: 'https://rankinseo.xyz/sitemap.xml/',
  }
}