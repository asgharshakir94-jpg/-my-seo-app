import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BackToTop from '@/components/backToTop';

export const dynamic = 'force-dynamic'
export const revalidate = 3600

function extractTitle(content: string | null, keyword: string): string {
    if (content) {
        const match = content.match(/<(h[12])[^>]*>(.*?)<\/\h[12]>/);
        if (match) {
            const heading = match[2].replace(/<[^>]*>/g, "").trim();
            if (/^\d+[\.\-\)]\s/.test(heading)) {
                return heading;
            }
        }
    }
    return keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function stripFirstHeading(content: string | null) {
    if (!content) return '';
    return content.replace(/<(h[12])[^>]*>.*?<\/\h[12]>/, '');
}

function excerpt(content: string | null, length = 160) {
    const stripped = stripFirstHeading(content);
    const text = stripped.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return text.length > length ? text.slice(0, length).trim() + '...' : text;
}

export default async function BlogIndexPage() {
    const supabase = await createClient()

    // 1. Fetch all published rows from your campaign table
    const { data: articles, error } = await supabase
        .from('campaign')
        .select('id, slug, keyword, content, created_at')
        .order('created_at', { ascending: false });

    if (error || !articles) {
        console.error("Supabase error fetching directory articles:", error);
        return <div className="p-8">Error loading directory content.</div>;
    }

    return (
        <main className="max-w-4xl mx-auto px-6 py-12 font-sans">
            <h1 className="text-3xl font-bold text-slate-900 border-b pb-4 mb-2">
                RankinSEO Site Directory
            </h1>
            <p className="text-slate-600 mb-8">
                Browse our complete, automated local optimization index ({articles.length} campaigns active):
            </p>

            {/* 2. Render all 145 items as static HTML links for Google Bots */}
            <ul className="space-y-4 list-none p-0">
                {articles.map((art) => {
                    // Extract the clean human title using your existing pipeline logic
                    const displayTitle = extractTitle(art.content, art.keyword || 'SEO Campaign');
                    
                    return (
                        <li key={art.id} className="border-b border-slate-100 pb-3">
                            <Link 
                                href={`/blog/${art.slug}`}
                                className="text-blue-600 hover:underline font-semibold text-lg block"
                            >
                                {displayTitle}
                            </Link>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                {excerpt(art.content)}
                            </p>
                        </li>
                    );
                })}
            </ul>

            <BackToTop />
        </main>
    )
}
