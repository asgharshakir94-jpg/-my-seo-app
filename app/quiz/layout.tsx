import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Website SEO Scan for Trade Businesses | RankinSEO",
  description:
    "See the RankinSEO plan for roofers, HVAC, solar, plumbing and electrical businesses. 14-day free trial, card required at checkout.",
  alternates: { canonical: "https://rankinseo.xyz/quiz/" },
};

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}