import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ParticleBackground } from "@/components/layout/ParticleBackground";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getEditableProfile } from "@/lib/profile-store";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const profile = getEditableProfile();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${profile.name} — ${profile.role}`,
      template: `%s — ${profile.name}`,
    },
    description: profile.tagline,
    openGraph: {
      title: `${profile.name} — ${profile.role}`,
      description: profile.tagline,
      type: "website",
      url: siteUrl,
    },
    twitter: { card: "summary_large_image" },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <ParticleBackground />
        <Header />
        <main className="relative z-10 mx-auto min-h-[70vh] w-full max-w-5xl px-4 pt-28 pb-12 sm:pt-32">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
