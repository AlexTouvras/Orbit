"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import {
  ORBIT_ACCENT_SELECTOR,
  orbitAccentDelayMs,
} from "@/lib/orbit-phase";

const SYNCED = "orbitSynced";

/**
 * Hex fg animations start at 0% on mount. After hydrate, stamp a wall-clock
 * delay on new accent nodes so a route change keeps the same hue.
 * Already-stamped nodes (header, etc.) keep running.
 * Delay is applied in useLayoutEffect only — Date.now() in SSR HTML mismatches.
 */
export function OrbitSync() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const delay = `${orbitAccentDelayMs()}ms`;
    const root = document.documentElement;
    if (root.dataset[SYNCED] !== "1") {
      root.style.setProperty("--orbit-fg-delay", delay);
      root.dataset[SYNCED] = "1";
    }
    document.querySelectorAll(ORBIT_ACCENT_SELECTOR).forEach((node) => {
      const el = node as HTMLElement;
      if (el.dataset[SYNCED] === "1") return;
      el.style.animationDelay = delay;
      el.dataset[SYNCED] = "1";
    });
  }, [pathname]);

  return null;
}
