'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FeaturesSection } from '@/components/FeaturesSection';
import SecuritySection from "@/components/SecuritySection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";

import Footer from '@/components/Footer';
import FloatingRobotWidget from './FloatingRobotWidget';
import { HeroVideo } from "@/components/HeroVideo";
import Nav from "@/components/Nav";

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
    

      <main className="max-w-7xl mx-auto p-4 md:p-4 space-y-4">
        <div className="pt-16 pb-4 px-2">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-ink leading-tight">
                Publish SEO content while<br />you focus on everything else.
              </h1>
              <p className="mt-4 text-lg text-slate max-w-2xl">
                RankinSEO researches keywords, drafts optimized articles, and pushes them
                straight to your CMS — so your traffic keeps growing without you
                touching a keyboard.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link href="/audit">
                  <button className="px-8 py-4 bg-black text-white rounded-md font-medium text-base">
                    Free SEO Audit
                  </button>
                </Link>
                <p className="text-base font-medium text-slate w-full sm:w-auto">
                  Free 14-day trial · Cancel anytime
                </p>
              </div>
            </div>
            <div className="flex-1 w-full rounded-xl overflow-hidden border border-line shadow-lg">
              <HeroVideo />
            </div>
          </div>
        </div>
   
        <FeaturesSection />
        <SecuritySection />
        <PricingSection />
        <FAQSection />
        
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
      
    </div>
  );
}