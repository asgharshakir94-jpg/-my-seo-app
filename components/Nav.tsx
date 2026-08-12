import Link from "next/link";


export default function Nav() {
  return (
    <nav className="border-b border-line bg-paper/90 backdrop-blur-md sticky top-0 z-50 px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
         <Link href="/" className="flex items-center space-x-2">
         <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-accent-from to-accent-to shadow-accent" />
         <span className="font-bold tracking-tight text-lg text-ink">
         RankinSEO <span className="text-sand font-medium">Project Platform</span>
         </span>
         </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-ink/80">
          <a href="#features" className="hover:text-ink transition-colors">What's Inside</a>
          <a href="#case-studies" className="hover:text-ink transition-colors">Case Studies</a>
          <a href="#pricing" className="hover:text-ink transition-colors">Pricing</a>
          <Link href="/blog" className="hover:text-ink transition-colors">Blog</Link>
          <a href="#security" className="hover:text-ink transition-colors">Security</a>
          <a href="#faq" className="hover:text-ink transition-colors">FAQ</a>
          <Link href="/contact" className="hover:text-ink transition-colors">Contact</Link>
          </nav> 
          <Link href="/login" className="text-sm font-medium text-ink/80 hover:text-ink transition-colors">
          Log In
          </Link>
          <Link href="/dashboard">
          <button className="text-xs font-bold text-white bg-black px-4 py-2 rounded-md">
          Open Dashboard
          </button>
          </Link>
        </div>
      </nav>
      );
    }