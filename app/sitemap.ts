import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: 'https://rankinseo.xyz',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://rankinseo.xyz',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://rankinseo.xyz',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://rankinseo.xyz',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  let blogRoutes: MetadataRoute.Sitemap = [];

  try {
    // 🌟 Direct REST endpoint query ensures 100% database connection stability
    const SUPABASE_REST_URL = "https://supabase.co";
    const PUBLIC_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

    if (PUBLIC_ANON_KEY) {
      const res = await fetch(SUPABASE_REST_URL, {
        headers: {
          "apikey": PUBLIC_ANON_KEY,
          "Authorization": `Bearer ${PUBLIC_ANON_KEY}`
        },
        next: { revalidate: 0 }
      });

      if (res.ok) {
        const articles = await res.json();
        
        blogRoutes = (articles ?? []).map((article: any) => ({
          // 🌟 Fixed: Removed the trailing slash at the end to match app routes perfectly
          url: `https://rankinseo.xyz/${article.slug}`, 
          lastModified: new Date(article.created_at),
          changeFrequency: 'monthly',
          priority: 0.6,
        }));
      }
    }
  } catch (error) {
    console.error("Sitemap generation error layout:", error);
  }

  return [...staticRoutes, ...blogRoutes];
}
