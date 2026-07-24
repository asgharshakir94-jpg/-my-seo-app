import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export const metadata = {
  title: 'Blog | RankinSEO',
  description: 'Roofing, solar, and trades industry guides and insights.',
}

function extractTitle(content: string | null, keyword: string) {
  if (content) {
    const match = content.match(/<h[12][^>]*>(.*?)<\/h[12]>/i)
    if (match) return match[1].replace(/<[^>]+>/g, '').trim()
  }
  return keyword.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function stripFirstHeading(content: string | null) {
  if (!content) return ''
  return content.replace(/<h[12][^>]*>.*?<\/h[12]>/i, '')
}

function excerpt(content: string | null, length = 160) {
  const stripped = stripFirstHeading(content)
  const text = stripped.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return text.length > length ? text.slice(0, length).trim() + '…' : text
}

export default async function BlogIndexPage() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('campaigns')
    .select('id, keyword, slug, meta_description, content, created_at')
    .in('status', ['approved', 'exported'])
    .not('slug', 'is', null)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Blog</h1>
      <p className="text-ink/60 mb-12">
        Guides and insights for roofing, solar, and trades businesses.
      </p>

      {(!articles || articles.length === 0) && (
        <p className="text-ink/60">No articles published yet — check back soon.</p>
      )}

      <div className="grid gap-8 sm:grid-cols-2">
        {articles?.map((article) => (
          <Link
            key={article.id}
            href={`/blog/${article.slug}`}
            className="block rounded-lg border border-line bg-surface p-6 hover:border-ink/30 transition-colors"
          >
            <h2 className="text-lg font-semibold mb-2">
              {extractTitle(article.content, article.keyword)}
            </h2>
            <p className="text-sm text-ink/60 line-clamp-3">
              {article.meta_description || excerpt(article.content)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}