'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FeaturesSection } from '@/components/FeaturesSection';
import SecuritySection from "@/components/SecuritySection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import CaseStudiesSection from "@/components/CaseStudiesSection";
import Footer from '@/components/Footer';
import FloatingRobotWidget from './FloatingRobotWidget';

export default function HomePageClient() {
  const [email, setEmail] = useState<string>("");
  const [subscribing, setSubscribing] = useState<boolean>(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Subscribed! Thanks for joining.");
        setEmail("");
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch (err) {
      alert("Network error occurred.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans antialiased selection:bg-accent-soft">
      <nav className="border-b border-line bg-paper/90 backdrop-blur-md sticky top-0 z-50 px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-accent-from to-accent-to shadow-accent" />
            <span className="font-bold tracking-tight text-lg text-ink">
              RankinSEO <span className="text-sand font-medium">Project Platform</span>
            </span>
          </div>
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
          <button className="text-xs font-bold text-wh...">
          Open Dashboard
          </button>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-4 space-y-4">
        <div className="pt-16 pb-4 px-2">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-ink leading-tight">
            Publish SEO content while<br />you focus on everything else.
          </h1>
          <p className="mt-4 text-lg text-slate max-w-2xl">
            RankinSEO researches keywords, drafts optimized articles, and pushes them
            straight to your CMS — so your traffic keeps growing without you
            touching a keyboard.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <Link href="/audit">
              <button className="px-8 py-4 bg-black text-white rounded-md font-medium text-base">
                Start Ranking
              </button>
            </Link>

           
          </div>
        </div>
        <FeaturesSection />
        <SecuritySection />
        <PricingSection />
        <FAQSection />
        <CaseStudiesSection />
        <div className="bg-surface border border-line rounded-lg p-6 shadow-flat">
          <h2 className="text-lg font-bold text-ink mb-1">Get notified about new features</h2>
          <p className="text-sm text-slate mb-4">
            Join other site owners getting updates on RankinSEO.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={subscribing}
             className="flex-1 px-4 py-2 border-2 border-ink/50 rounded-md text-ink bg-paper placeholder-sand shadow-md focus:outline-none focus:ring-2 focus:ring-accent-from/30 focus:border-accent-from"
            />
            <button
              type="submit"
              disabled={subscribing}
              className="px-4 py-2 bg-black text-white rounded-md font-medium hover:bg-ink/90 transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              {subscribing ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        </div>
      </main>
      <FloatingRobotWidget />
      <Footer/>
    </div>
  );
}