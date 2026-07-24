"use client";

import { createClient } from '@/lib/supabase/client';
import { useEffect } from "react";

declare global {
  interface Window {
    Paddle: any;
  }
}

const plans = [
  {
    name: "Starter",
    description: "For small projects & creators.",
    price: "$49",
    features: ["5 Domain Audits", "500 Keyword Tracks", "Weekly AI Content Ideas"],
    cta: "Start 14-day Trial",
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER,
    href: null,
    highlighted: false,
  },
  {
    name: "Growth",
    description: "Best for scaling businesses.",
    price: "$129",
    features: [
      "25 Domain Audits",
      "2,500 Keyword Tracks",
      "Daily AI Content Ideas",
      "Competitor Intelligence",
    ],
    cta: "Upgrade to Growth",
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_GROWTH,
    href: null,
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For large-scale SEO agencies.",
    price: "$499",
    features: [
      "Unlimited Audits",
      "20,000 Keyword Tracks",
      "White-label Reporting",
      "Dedicated Account Manager",
    ],
    cta: "Contact Sales",
    priceId: undefined,
    href: "/contact",
    highlighted: false,
  },
];

export default function PricingSection() {
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Paddle) {
      const script = document.createElement("script");
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.onload = () => {
        window.Paddle.Environment.set(
          process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox" ? "sandbox" : "production"
        );
        window.Paddle.Initialize({
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        });
      };
      document.body.appendChild(script);
    }
  }, []);

  const handleCheckout = async (priceId?: string) => {
    if (!priceId || !window.Paddle) return;
  
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) {
      window.location.href = `/login?redirect=/#pricing`;
      return;
    }
  
    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: { email: user.email },
      customData: { user_id: user.id },
    });
  };

  return (
    <section id="pricing" className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1 rounded-full border border-line text-sm text-ink/70 mb-6">
          Simple, Transparent Pricing
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-ink mb-4">
          Invest in High-Performance SEO
        </h2>
        <p className="text-ink/70 max-w-xl mx-auto">
          Scale your organic visibility with AI-driven insights. Choose a plan
          tailored to your growth trajectory.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-xl p-8 border ${
              plan.highlighted
                ? "border-accent-from bg-paper shadow-lg scale-105"
                : "border-line bg-surface"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-ink text-paper text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}

            <h3 className="text-xl font-semibold text-ink mb-1">{plan.name}</h3>
            <p className="text-sm text-ink/60 mb-6">{plan.description}</p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-ink">{plan.price}</span>
              <span className="text-ink/60">/mo</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-ink/80">
                  <svg
                    className="w-4 h-4 text-accent-from flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            {plan.href ? (
              
              <a href={plan.href}
                className={`w-full text-center py-2 rounded-md font-medium transition ${
                  plan.highlighted
                    ? "bg-ink text-paper hover:opacity-90"
                    : "border border-line text-ink hover:bg-surface"
                }`}
              >
                {plan.cta}
              </a>
            ) : (
              <button
                onClick={() => handleCheckout(plan.priceId)}
                className={`w-full text-center py-2 rounded-md font-medium transition ${
                  plan.highlighted
                    ? "bg-ink text-paper hover:opacity-90"
                    : "border border-line text-ink hover:bg-surface"
                }`}
              >
                {plan.cta}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}