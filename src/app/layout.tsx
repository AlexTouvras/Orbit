import type { Metadata } from "next";
import { Syne, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ParticleBackground } from "@/components/layout/ParticleBackground";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getEditableProfile } from "@/lib/profile-store";
import { getSiteUrl } from "@/lib/site";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
});
const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = getEditableProfile();
  const siteUrl = getSiteUrl();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${profile.name} — ${profile.role}`,
      template: `%s — ${profile.name}`,
    },
    description: profile.tagline,
    alternates: {
      canonical: "/",
      types: {
        "application/rss+xml": [
          { url: "/feed.xml", title: `${profile.name} — Blog` },
        ],
      },
    },
    openGraph: {
      title: `${profile.name} — ${profile.role}`,
      description: profile.tagline,
      type: "website",
      url: siteUrl,
      siteName: "Orbit",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${profile.name} — ${profile.role}`,
      description: profile.tagline,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${ibmPlex.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased">
        <JsonLd />
        <a
          href="#main-content"
          className="focus-ring sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-neon-cyan focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-void"
        >
          Skip to content
        </a>
        <ParticleBackground />
        <Header />
        <main
          id="main-content"
          className="relative z-10 mx-auto min-h-[70vh] w-full max-w-5xl px-4 pt-28 pb-12 sm:pt-32"
        >
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
