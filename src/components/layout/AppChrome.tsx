"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { ParticleBackground } from "@/components/layout/ParticleBackground";
import { ScrollLine } from "@/components/story/ScrollLine";

const BARE_ROUTES = new Set(["/card", "/qr-code"]);

export function AppChrome({
  children,
  footer,
}: {
  children: ReactNode;
  footer: ReactNode;
}) {
  const pathname = usePathname();
  const bare = BARE_ROUTES.has(pathname);
  const deskPage = /^\/portfolio\/live\/[^/]+/.test(pathname);
  const scrollStory =
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/portfolio" ||
    pathname === "/writes" ||
    pathname === "/contact" ||
    pathname === "/radar" ||
    pathname === "/newsletter" ||
    pathname.startsWith("/portfolio/live");

  if (bare) {
    return (
      <main id="main-content" className="relative z-10 min-h-dvh w-full">
        {children}
      </main>
    );
  }

  return (
    <>
      <ParticleBackground />
      {scrollStory ? <ScrollLine /> : null}
      <Header />
      <main
        id="main-content"
        className={`relative z-10 mx-auto min-h-[70vh] w-full px-4 pt-28 pb-16 sm:pt-32 ${
          deskPage ? "max-w-6xl" : "max-w-5xl"
        }`}
      >
        {children}
      </main>
      {footer}
    </>
  );
}
