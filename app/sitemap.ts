import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

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
    const supabaseUrl = "https://vquzrlcnlvxgskxvtphf.supabase.co";
    // 🌟 Place your actual long anon string key inside these double quotes:
    const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxdXpybGNubHZ4Z3NreHZ0cGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNTgyMTIsImV4cCI6MjA5ODYzNDIxMn0.1H_UB7tS4tJDU9WciPfnM33MlHZeV3r3doXx4qcS4a0";

    // Simplified connection layout - no double checks to cause underlines
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data: articles, error } = await supabase
        .from('campaigns')
        .select('slug, created_at')
        .not('slug', 'is', null);

      if (!error && articles) {
        blogRoutes = articles.map((article: any) => ({
          url: `https://rankinseo.xyz/${article.slug}`, 
          lastModified: new Date(article.created_at || new Date()),
          changeFrequency: 'monthly',
          priority: 0.6,
        }));
      }
    }
  } catch (error) {
    console.error("Sitemap system exception error:", error);
  }

  return [...staticRoutes, ...blogRoutes];
}
