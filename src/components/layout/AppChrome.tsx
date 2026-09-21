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
  const live = pathname.startsWith("/portfolio/live");
  const story = pathname === "/";
  const scrollStory =
    story ||
    live ||
    pathname === "/about" ||
    pathname === "/portfolio";

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
        className={
          story
            ? "relative z-10 min-h-[70vh] w-full pt-20 pb-24 sm:pt-24"
            : `relative z-10 mx-auto min-h-[70vh] w-full px-4 pt-28 pb-12 sm:pt-32 ${
                live ? "max-w-6xl" : "max-w-5xl"
              }`
        }
      >
        {children}
      </main>
      {footer}
    </>
  );
}
