"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { ParticleBackground } from "@/components/layout/ParticleBackground";
import { ScrollLine } from "@/components/story/ScrollLine";
import { isVolumeReaderPath } from "@/lib/handbook-reader";

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
  /** Flagship landing + films need full-viewport sticky chrome (matches storytelling repo). */
  const storiesPage =
    pathname === "/stories" || pathname.startsWith("/stories/");
  const deskPage = /^\/portfolio\/live\/[^/]+/.test(pathname);
  const scrollStory =
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/portfolio" ||
    pathname === "/products" ||
    pathname === "/writes" ||
    pathname === "/contact" ||
    pathname === "/radar" ||
    pathname === "/newsletter" ||
    (pathname.startsWith("/handbooks") && !/\/handbooks\/[^/]+\/\d+$/.test(pathname)) ||
    pathname.startsWith("/portfolio/live");

  if (bare || storiesPage) {
    return (
      <main id="main-content" className="relative z-10 min-h-dvh w-full">
        {children}
      </main>
    );
  }

  const volume = isVolumeReaderPath(pathname);
  const handbookLeaf = /\/handbooks\/[^/]+\/\d+$/.test(pathname) && !volume;
  const handbookBoard = pathname === "/handbooks" || handbookLeaf;

  if (volume) {
    return (
      <>
        <Header />
        <main id="main-content" className="handbook-volume relative z-10 min-h-dvh w-full pt-14">
          {children}
        </main>
      </>
    );
  }
  const mainWidth = handbookBoard
    ? "max-w-7xl px-4"
    : deskPage
      ? "max-w-6xl px-4"
      : "max-w-5xl px-4";

  if (handbookLeaf) {
    return (
      <>
        <ParticleBackground />
        <Header />
        <main
          id="main-content"
          className="fixed inset-x-0 top-0 z-10 flex h-dvh min-h-0 flex-col overflow-hidden px-0 pt-16 pb-0 lg:px-4 lg:pt-28 lg:pb-3"
        >
          {children}
        </main>
      </>
    );
  }

  return (
    <>
      <ParticleBackground />
      {scrollStory ? <ScrollLine /> : null}
      <Header />
      <main
        id="main-content"
        className={`relative z-10 mx-auto min-h-[70vh] w-full pt-28 pb-16 sm:pt-32 ${mainWidth}`}
      >
        {children}
      </main>
      {footer}
    </>
  );
}
