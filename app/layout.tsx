import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rankinseo.xyz"),
  title: "RankinSEO - Done-For-You SEO for Roofers, HVAC, Solar & Plumbing Companies",
  description: "RankinSEO is a done-for-you SEO SaaS built for trades businesses. No dashboard to learn — we research keywords, write optimized articles, and auto-publish 3-5 SEO articles a week so you get found on Google without touching a keyboard.",
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}