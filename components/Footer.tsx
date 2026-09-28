import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-paper mt-8">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Copyright Text */}
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-accent-from to-accent-to" />
          <span className="text-sm text-slate">
            © {new Date().getFullYear()} RankinSEO. All rights reserved.
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6 text-sm text-slate">
          <Link href="/blog" className="hover:text-ink transition-colors font-medium">
            Blog Directory
          </Link>
          <Link href="/privacy" className="hover:text-ink transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-ink transition-colors">
            Terms of Service
          </Link>
          <Link href="/refund" className="hover:text-ink transition-colors">
            Refund Policy
          </Link>
          <Link href="/contact" className="hover:text-ink transition-colors">
            Contact
          </Link>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-4">
          <a 
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-slate hover:text-ink transition-colors"
          >
            <svg xmlns="http://w3.org" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
            </svg>
          </a>
        </div>

      </div>
    </footer>
  );
}
