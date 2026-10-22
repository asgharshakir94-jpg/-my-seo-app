import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Website SEO Scan for Trade Businesses | RankinSEO",
  description:
    "Enter your website and get a free scan, keyword ideas and a content plan built for roofers, HVAC, solar, plumbing and electrical businesses. No signup required.",
  alternates: { canonical: "https://rankinseo.xyz/quiz/" },
};

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}