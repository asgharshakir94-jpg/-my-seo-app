import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { TRADE_CALCULATORS } from '@/lib/tradeCalculators';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://rankinseo.xyz';
  const page = (
    path: string,
    changeFrequency: 'daily' | 'weekly' | 'monthly',
    priority: number
  ): MetadataRoute.Sitemap[number] => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  });

  const calculatorRoutes: MetadataRoute.Sitemap = Object.values(TRADE_CALCULATORS).map(
    (config) => page(`/tools/${config.slug}-calculator/`, 'monthly', 0.7)
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    page('/tools/', 'monthly', 0.8),
    page('/tools/keyword-finder/', 'monthly', 0.8),
    page('/tools/backlink-opportunity-finder/', 'monthly', 0.8),
    page('/tools/schema-generator/', 'monthly', 0.6),
    page('/tools/backlink-seeker/', 'monthly', 0.4),
    ...calculatorRoutes,
    page('/audit/', 'monthly', 0.7),
    page('/blog/', 'daily', 0.7),
    page('/contact/', 'monthly', 0.5),
  ];

  let blogRoutes: MetadataRoute.Sitemap = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data: articles, error } = await supabase
        .from('campaigns')
        .select('slug, created_at')
        .not('slug', 'is', null);

      if (!error && articles) {
        blogRoutes = articles.map((article: any) => ({
          url: `${base}/${article.slug}`,
          lastModified: new Date(article.created_at || new Date()),
          changeFrequency: 'monthly',
          priority: 0.6,
        }));
      } else if (error) {
        console.error('Sitemap query error:', error.message);
      }
    } else {
      console.error('Sitemap: missing Supabase env vars');
    }
  } catch (error) {
    console.error('Sitemap system exception error:', error);
  }

  return [...staticRoutes, ...blogRoutes];
}