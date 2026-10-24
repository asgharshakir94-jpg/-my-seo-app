"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Nav() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close the phone menu whenever the page changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const closeMenu = () => setMenuOpen(false);

  const mobileLink = "block py-3 text-base font-medium text-ink/80 hover:text-ink border-b border-line";

  return (
    <header className="border-b border-line bg-paper/90 backdrop-blur-md sticky top-0 z-50 px-4 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-accent-from to-accent-to shadow-accent" />
          <span className="font-bold tracking-tight text-lg text-ink">
            RankinSEO <span className="hidden sm:inline text-sand font-medium">Project Platform</span>
          </span>
        </Link>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-ink/80">
          <a href="/#features" className="hover:text-ink transition-colors">What's Inside</a>
          <a href="/#pricing" className="hover:text-ink transition-colors">Pricing</a>
          <Link
            href="/blog"
            className={`transition-colors ${
              pathname?.startsWith("/blog") ? "text-accent-text font-semibold" : "hover:text-ink"
            }`}
          >
            Blog
          </Link>
          <Link
            href="/tools"
            className={`transition-colors ${
              pathname?.startsWith("/tools") ? "text-accent-text font-semibold" : "hover:text-ink"
            }`}
          >
            Tools
          </Link>
          <a href="/#security" className="hover:text-ink transition-colors">Security</a>
          <a href="/#faq" className="hover:text-ink transition-colors">FAQ</a>
          <Link
            href="/about"
            className={`transition-colors ${
              pathname?.startsWith("/about") ? "text-accent-text font-semibold" : "hover:text-ink"
            }`}
          >
            About
          </Link>
          <Link
            href="/contact"
            className={`transition-colors ${
              pathname?.startsWith("/contact") ? "text-accent-text font-semibold" : "hover:text-ink"
            }`}
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* Desktop buttons */}
          {!isDashboard && (
            <Link
              href="/tools/backlink-opportunity-finder"
              className="hidden lg:inline-block text-xs font-bold text-black bg-green-500 hover:bg-green-400 px-3 py-2 rounded-md"
            >
              Free Tool
            </Link>
          )}
          {!isDashboard && isLoggedIn === true && (
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-ink/80 hover:text-ink transition-colors"
              >
                Log out
              </button>
              <Link href="/dashboard">
                <button className="text-xs font-bold text-white bg-black px-4 py-2 rounded-md">
                  Open Dashboard
                </button>
              </Link>
            </div>
          )}
          {!isDashboard && isLoggedIn === false && (
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-ink/80 hover:text-ink transition-colors">
                Log In
              </Link>
              <Link href="/dashboard">
                <button className="text-xs font-bold text-white bg-black px-4 py-2 rounded-md">
                  Open Dashboard
                </button>
              </Link>
            </div>
          )}

          {/* Phone menu button (hamburger) */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md border border-line text-ink"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Phone menu panel */}
      {menuOpen && (
        <div className="md:hidden max-w-7xl mx-auto mt-3 border-t border-line">
          <a href="/#features" onClick={closeMenu} className={mobileLink}>What's Inside</a>
          <a href="/#pricing" onClick={closeMenu} className={mobileLink}>Pricing</a>
          <Link href="/blog" onClick={closeMenu} className={mobileLink}>Blog</Link>
          <Link href="/tools" onClick={closeMenu} className={mobileLink}>Tools</Link>
          <a href="/#security" onClick={closeMenu} className={mobileLink}>Security</a>
          <a href="/#faq" onClick={closeMenu} className={mobileLink}>FAQ</a>
          <Link href="/about" onClick={closeMenu} className={mobileLink}>About</Link>
          <Link href="/contact" onClick={closeMenu} className={mobileLink}>Contact</Link>

          {!isDashboard && (
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Link
                href="/tools/backlink-opportunity-finder"
                onClick={closeMenu}
                className="text-xs font-bold text-black bg-green-500 hover:bg-green-400 px-3 py-2 rounded-md"
              >
                Free Tool
              </Link>
              {isLoggedIn === true && (
                <>
                  <Link href="/dashboard" onClick={closeMenu}>
                    <button className="text-xs font-bold text-white bg-black px-4 py-2 rounded-md">
                      Open Dashboard
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-ink/80 hover:text-ink transition-colors"
                  >
                    Log out
                  </button>
                </>
              )}
              {isLoggedIn === false && (
                <>
                  <Link href="/dashboard" onClick={closeMenu}>
                    <button className="text-xs font-bold text-white bg-black px-4 py-2 rounded-md">
                      Open Dashboard
                    </button>
                  </Link>
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="text-sm font-medium text-ink/80 hover:text-ink transition-colors"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
