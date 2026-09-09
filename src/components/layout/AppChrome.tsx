"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { ParticleBackground } from "@/components/layout/ParticleBackground";

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
      <Header />
      <main
        id="main-content"
        className="relative z-10 mx-auto min-h-[70vh] w-full max-w-5xl px-4 pt-28 pb-12 sm:pt-32"
      >
        {children}
      </main>
      {footer}
    </>
  );
}
