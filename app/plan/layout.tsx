import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Your SEO Growth Plan for Contractors | RankinSEO",
    description:
      "Get a personalized SEO growth plan with domain audits, keyword tracking and weekly AI content ideas. Start with a 14-day free trial, then $49/month.",
    alternates: { canonical: "https://rankinseo.xyz/plan/" },
  };

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}