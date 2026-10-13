"use client";

import { useEffect } from "react";

/** Space between the Orbit bar and the line a button scrolls into view. */
const AIR_BELOW_BAR_PX = 28;

/**
 * Buttons inside the hosted product call scrollIntoView. That aligns the
 * result with the top of the viewport, under the fixed Orbit bar. Pad this
 * page's scroll so the result stops a little below the bar.
 */
export function ProductScrollClearance() {
  useEffect(() => {
    const root = document.documentElement;

    const apply = () => {
      const bar = document.querySelector("header.fixed")?.getBoundingClientRect().height ?? 0;
      root.style.scrollPaddingTop = `${Math.ceil(bar + AIR_BELOW_BAR_PX)}px`;
    };

    apply();
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      root.style.scrollPaddingTop = "";
    };
  }, []);

  return null;
}
