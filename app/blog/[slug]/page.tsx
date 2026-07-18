import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

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

async function getArticle(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('campaigns')
    .select('keyword, slug, content, meta_description, created_at, status')
    .eq('slug', slug)
    .in('status', ['approved', 'exported'])
    .single()

  return data
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) return { title: 'Article not found | RankinSEO' }

  return {
    title: `${extractTitle(article.content, article.keyword)} | RankinSEO Blog`,
    description: article.meta_description || undefined,
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

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight mb-4">
        {extractTitle(article.content, article.keyword)}
      </h1>
      <p className="text-sm text-ink/50 mb-10">
        {new Date(article.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: stripFirstHeading(article.content) }}
      />
    </article>
  )
}