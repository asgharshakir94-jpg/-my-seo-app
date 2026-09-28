import Link from 'next/link'
import { createClient } from '@supabase/supabase-js' 
import BackToTop from '@/components/backToTop';

export const dynamic = 'force-dynamic'
export const revalidate = 0 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

function extractTitle(content: string | null, keyword: string): string {
    if (content) {
        const match = content.match(/<(h)[^>]*>(.*?)<\/\h>/);
        if (match && match[0]) {
            const heading = match[0].replace(/<[^>]*>/g, "").trim();
            if (/^\d+[\.\-\)]\s/.test(heading)) {
                return heading;
            }
            if (heading) return heading; 
        }
    }
    return keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function stripFirstHeading(content: string | null) {
    if (!content) return '';
    return content.replace(/<(h)[^>]*>.*?<\/\h>/, '');
}

function excerpt(content: string | null, length = 160) {
    const stripped = stripFirstHeading(content);
    const text = stripped.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
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
        .select('id, slug, keyword, content, created_at')
        .order('created_at', { ascending: false });

    // 🌟 Modified: Prints the exact database error message onto the viewport
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

    return (
        <main className="max-w-4xl mx-auto px-6 py-12 font-sans">
            <h1 className="text-3xl font-bold text-slate-900 border-b pb-4 mb-2">
                RankinSEO Site Directory
            </h1>
            <p className="text-slate-600 mb-8">
                Browse our complete, automated local optimization index ({articles.length} campaigns active):
            </p>

            <ul className="space-y-4 list-none p-0">
                {articles.map((art) => {
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
