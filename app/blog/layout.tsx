import Link from 'next/link'

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <header className="border-b border-line">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg tracking-tight">
            RankinSEO
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/blog" className="hover:opacity-70 transition-opacity">
              Blog
            </Link>
            <Link href="/#pricing" className="hover:opacity-70 transition-opacity">
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md bg-ink text-paper px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-ink/60">
          <span>© {new Date().getFullYear()} RankinSEO</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:opacity-70">Privacy</Link>
            <Link href="/contact" className="hover:opacity-70">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}