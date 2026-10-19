import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import ShareButtons from '@/components/ShareButtons';

const SITE = 'https://rankinseo.xyz'

const STOP_WORDS = new Set([
  'what', 'is', 'are', 'the', 'for', 'and', 'how', 'to', 'of', 'in', 'a', 'an',
  'your', 'you', 'vs', 'my', 'do', 'does', 'with', 'on', 'it', 'can', 'best',
])

function keywordWords(keyword: string): string[] {
  return keyword
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
}

function toTitle(keyword: string) {
  return keyword
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function extractTitle(content: string | null, keyword: string) {
  if (content) {
    const match = content.match(/<h[12][^>]*>(.*?)<\/h[12]>/i)
    if (match) return match[1].replace(/<[^>]+>/g, '').trim()
  }
  return toTitle(keyword)
}

function stripFirstHeading(content: string | null) {
  if (!content) return ''
  return content.replace(/<h[12][^>]*>.*?<\/h[12]>/i, '')
}

async function getArticle(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('campaigns')
    .select('keyword, slug, title, content, meta_description, created_at, status')
    .eq('slug', slug)
    .in('status', ['approved', 'exported'])
    .single()

  return data
}

type RelatedRow = {
  slug: string
  title: string | null
  keyword: string | null
  created_at: string
}

async function getRelated(slug: string, keyword: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('campaigns')
    .select('slug, title, keyword, created_at')
    .in('status', ['approved', 'exported'])
    .neq('slug', slug)
    .not('slug', 'is', null)
    .order('created_at', { ascending: false })
    .limit(200)

  const rows = (data || []) as RelatedRow[]
  if (rows.length === 0) return []

  const words = keywordWords(keyword)
  const scored = rows.map((row) => ({
    ...row,
    score: keywordWords(row.keyword || '').filter((w) => words.includes(w)).length,
  }))

  // Sort is stable, so equal scores stay newest-first
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 5)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) return { title: 'Article not found | RankinSEO' }

  const pageTitle = article.title || extractTitle(article.content, article.keyword)
  const title = `${pageTitle} | RankinSEO Blog`
  const description = article.meta_description || undefined

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE}/blog/${article.slug}/`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE}/blog/${article.slug}/`,
      siteName: 'RankinSEO',
      images: [
        {
          url: 'https://rankinseo.xyz/og-default.jpg',
          width: 1200,
          height: 630,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://rankinseo.xyz/og-default.jpg'],
    },
  }
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) notFound()

  const pageTitle = article.title || extractTitle(article.content, article.keyword)
  const articleUrl = `${SITE}/blog/${article.slug}/`
  const related = await getRelated(article.slug, article.keyword || '')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: pageTitle.slice(0, 110),
    ...(article.meta_description ? { description: article.meta_description } : {}),
    image: ['https://rankinseo.xyz/og-default.jpg'],
    datePublished: new Date(article.created_at).toISOString(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
    author: { '@type': 'Organization', name: 'RankinSEO', url: SITE },
    publisher: { '@type': 'Organization', name: 'RankinSEO', url: SITE },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <article className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight mb-4">
          {pageTitle}
        </h1>
        <p className="text-sm text-ink/50 mb-10">
          {new Date(article.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <div className="blog-content prose prose-lg max-w-none prose-headings:text-ink prose-p:text-ink/80 prose-strong:text-ink prose-a:text-ink">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {stripFirstHeading(article.content)}
          </ReactMarkdown>
        </div>
        <ShareButtons title={pageTitle} url={articleUrl} />

        {related.length > 0 && (
          <nav aria-label="Related articles" className="mt-12 border-t border-line pt-8">
            <h2 className="text-xl font-semibold mb-4">Related articles</h2>
            <ul className="space-y-2 list-none p-0">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/blog/${r.slug}/`} className="underline hover:no-underline">
                    {r.title || toTitle(r.keyword || r.slug)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </article>
    </>
  )
}