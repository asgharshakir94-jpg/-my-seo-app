import { createClient } from '@supabase/supabase-js'
import BackToTop from '@/components/backToTop';
import BlogSearchList, { type BlogListItem } from '@/components/BlogSearchList'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'SEO Articles for Trade Businesses | RankinSEO Blog',
    description:
        'Articles on local SEO for roofers, plumbers, HVAC, electrical and solar businesses, from the RankinSEO blog.',
    alternates: {
        canonical: 'https://rankinseo.xyz/blog/',
    },
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

function extractTitle(content: string | null, keyword: string): string {
    if (content) {
        const match = content.match(/<h[12][^>]*>(.*?)<\/h[12]>/i);
        if (match) {
            const heading = match[1].replace(/<[^>]+>/g, '').trim();
            if (heading) return heading;
        }
    }
    return keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function excerpt(content: string | null, metaDescription: string | null, length = 160) {
    if (metaDescription && metaDescription.trim()) {
        const meta = metaDescription.replace(/\s+/g, ' ').trim();
        return meta.length > length ? meta.slice(0, length).trim() + '...' : meta;
    }
    if (!content) return '';
    const text = content
        .replace(/<h[12][^>]*>[\s\S]*?<\/h[12]>/i, '')
        .replace(/<img[^>]*>/gi, '')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/<[^>]*>/g, ' ')
        .replace(/^#+\s*/gm, '')
        .replace(/\s+/g, ' ')
        .replace(/Photo by .{1,80}? on Unsplash\.?/gi, '')
        .trim();
    return text.length > length ? text.slice(0, length).trim() + '...' : text;
}

export default async function BlogIndexPage() {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('blog index: Supabase environment variables are missing');
        return (
            <main className="max-w-xl mx-auto px-6 py-12 font-sans">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Blog</h1>
                <p className="text-slate-600">The articles could not be loaded right now. Please try again in a few minutes.</p>
            </main>
        );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data: articles, error } = await supabase
        .from('campaigns')
        .select('id, slug, keyword, title, content, meta_description, created_at')
        .in('status', ['approved', 'exported'])
        .order('created_at', { ascending: false });

    // Prints the exact database error message onto the viewport
    if (error || !articles) {
        console.error('blog index query failed:', error?.message);
        return (
            <main className="max-w-xl mx-auto px-6 py-12 font-sans">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Blog</h1>
                <p className="text-slate-600">The articles could not be loaded right now. Please try again in a few minutes.</p>
            </main>
        );
    }

    const items: BlogListItem[] = articles
        .filter((art) => art.slug)
        .map((art) => ({
            id: art.id,
            slug: art.slug,
            title: art.title || extractTitle(art.content, art.keyword || 'SEO Campaign'),
            excerpt: excerpt(art.content, art.meta_description),
        }))

    return (
        <main className="max-w-4xl mx-auto px-6 py-12 font-sans">
            <h1 className="text-3xl font-bold text-slate-900 border-b pb-4 mb-2">
                RankinSEO Blog
            </h1>
            <p className="text-slate-600 mb-8">
                Articles on local SEO for trade businesses ({items.length} published):
            </p>

            <BlogSearchList items={items} />

            <BackToTop />
        </main>
    )
}