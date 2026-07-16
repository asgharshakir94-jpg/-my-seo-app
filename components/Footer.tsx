import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-paper mt-8">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-accent-from to-accent-to" />
          <span className="text-sm text-slate">
            © {new Date().getFullYear()} RankinSEO. All rights reserved.
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-slate">
          <Link href="/privacy" className="hover:text-ink transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-ink transition-colors">
            Terms of Service
          </Link>
          <Link href="/contact" className="hover:text-ink transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}