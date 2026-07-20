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
        <div className="flex items-center gap-4">
          
            href="https://www.facebook.com/profile.php?id=61556442362464"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-slate hover:text-ink transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 12a10 10 0 1 0-11.5 9.87v-6.98H7.9V12h2.6V9.8c0-2.57 1.53-4 3.87-4 1.12 0 2.3.2 2.3.2v2.53h-1.3c-1.28 0-1.68.8-1.68 1.62V12h2.85l-.46 2.89h-2.4v6.98A10 10 0 0 0 22 12z"/>
            </svg>
          </a>
          
            href="https://www.instagram.com/asghar.ironclad"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-slate hover:text-ink transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.8.31-1.48.72-2.15 1.4-.68.67-1.09 1.35-1.4 2.15-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.8.72 1.48 1.4 2.15.67.68 1.35 1.09 2.15 1.4.76.3 1.64.5 2.91.56 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.8-.31 1.48-.72 2.15-1.4.68-.67 1.09-1.35 1.4-2.15.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.88 5.88 0 0 0-1.4-2.15A5.88 5.88 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0z"/>
              <path d="M12 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.41-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44z"/>
            </svg>
          </a>
          
            href="https://www.linkedin.com/in/muhammad-asghar-s-47b7902b5/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-slate hover:text-ink transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}