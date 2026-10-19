'use client'

import { useState } from 'react'
import Link from 'next/link'

export type BlogListItem = {
  id: number | string
  slug: string
  title: string
  excerpt: string
}

export default function BlogSearchList({ items }: { items: BlogListItem[] }) {
  const [query, setQuery] = useState('')

  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const filtered =
    terms.length === 0
      ? items
      : items.filter((item) => {
          const haystack = `${item.title} ${item.excerpt}`.toLowerCase()
          return terms.every((term) => haystack.includes(term))
        })

  return (
    <div>
      <label htmlFor="blog-search" className="sr-only">
        Search articles
      </label>
      <input
        id="blog-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search articles..."
        autoComplete="off"
        className="w-full mb-3 px-4 py-2 border border-slate-300 rounded-md bg-white/60 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
      />

      {terms.length > 0 && (
        <p className="text-sm text-slate-500 mb-4" role="status">
          {filtered.length} of {items.length} articles
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="text-slate-600 py-6">No articles match your search.</p>
      ) : (
        <ul className="space-y-4 list-none p-0">
          {filtered.map((item) => (
            <li key={item.id} className="border-b border-slate-100 pb-3">
              <Link
                href={`/blog/${item.slug}/`}
                className="text-blue-600 hover:underline font-semibold text-lg block"
              >
                {item.title}
              </Link>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.excerpt}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}