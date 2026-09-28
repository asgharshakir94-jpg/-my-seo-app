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
    const SUPABASE_REST_URL = "https://supabase.co";
    
    // 🌟 Hardcode your long-string Supabase Anon Key here to bypass environment mapping failures
    const PUBLIC_ANON_KEY = "PASTE_YOUR_ACTUAL_LONG_SUPABASE_ANON_KEY_HERE";

    if (PUBLIC_ANON_KEY && PUBLIC_ANON_KEY !== "PASTE_YOUR_ACTUAL_LONG_SUPABASE_ANON_KEY_HERE") {
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
