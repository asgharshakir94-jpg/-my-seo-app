import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: 'https://rankinseo.xyz',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://rankinseo.xyz/quiz',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://rankinseo.xyz/plan',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://rankinseo.xyz/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  const supabase = await createClient();
  const { data: articles } = await supabase
    .from('campaigns')
    .select('slug, created_at')
    .in('status', ['approved', 'exported'])
    .not('slug', 'is', null);

  const blogRoutes: MetadataRoute.Sitemap = (articles ?? []).map((article) => ({
    url: `https://rankinseo.xyz/blog/${article.slug}`,
    lastModified: new Date(article.created_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}