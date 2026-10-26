import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Your SEO Growth Plan for Contractors | RankinSEO",
    description:
      "See the RankinSEO Starter plan for trade businesses: 10 SEO articles a month. 14-day free trial, card required at checkout, then $49/month.",
    alternates: { canonical: "https://rankinseo.xyz/plan/" },
  };

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}