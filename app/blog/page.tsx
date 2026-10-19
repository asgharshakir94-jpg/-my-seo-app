import { createClient } from '@supabase/supabase-js'
import BackToTop from '@/components/backToTop';
import BlogSearchList, { type BlogListItem } from '@/components/BlogSearchList'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
        return (
            <div className="p-8 max-w-xl mx-auto my-12 border border-red-200 bg-red-50 rounded-lg text-red-800 font-sans">
                <h2 className="font-bold text-lg mb-2">Supabase Credentials Missing</h2>
                <p className="text-sm text-slate-700">URL Length: {supabaseUrl.length} | Key Length: {supabaseAnonKey.length}</p>
                <p className="text-xs text-slate-500 mt-2">Make sure your variables are saved inside Vercel Dashboard Settings.</p>
            </div>
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
        return (
            <div className="p-8 max-w-2xl mx-auto my-12 border border-orange-200 bg-orange-50 rounded-lg text-orange-900 font-sans">
                <h2 className="font-bold text-lg mb-2">Database Connection Diagnostic</h2>
                <p className="text-sm font-semibold text-red-700">Message: {error?.message || "No data returned from query."}</p>
                <p className="text-xs text-slate-600 mt-2">Details: {error?.details || "None"}</p>
                <p className="text-xs text-slate-600">Code: {error?.code || "N/A"}</p>
            </div>
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
                RankinSEO Site Directory
            </h1>
            <p className="text-slate-600 mb-8">
                Browse our complete, automated local optimization index ({items.length} campaigns active):
            </p>

            <BlogSearchList items={items} />

            <BackToTop />
        </main>
    )
}