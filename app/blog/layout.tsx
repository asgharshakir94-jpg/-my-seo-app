import Link from 'next/link'
import Footer from '@/components/Footer'

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <nav className="border-b border-line bg-paper/90 backdrop-blur-md sticky top-0 z-50 px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-accent-from to-accent-to shadow-accent" />
            <Link href="/" className="font-bold tracking-tight text-lg text-ink">
              RankinSEO <span className="text-sand font-medium">Project Platform</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-ink/80">
            <Link href="/#features" className="hover:text-ink transition-colors">What's Inside</Link>
            <Link href="/#case-studies" className="hover:text-ink transition-colors">Case Studies</Link>
            <Link href="/#pricing" className="hover:text-ink transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-ink transition-colors">Blog</Link>
            <Link href="/#security" className="hover:text-ink transition-colors">Security</Link>
            <Link href="/#faq" className="hover:text-ink transition-colors">FAQ</Link>
            <Link href="/contact" className="hover:text-ink transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-ink/80 hover:text-ink transition-colors">
              Log In
            </Link>
            <Link href="/dashboard">
              <button className="text-xs font-bold bg-ink text-paper px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
                Open Dashboard
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  )
}