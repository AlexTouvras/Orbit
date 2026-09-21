"use client";

import { motion, useScroll } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

/** Document-level read bar. Native scroll; no jacking. Hidden when motion is reduced. */
export function ScrollLine() {
  const { scrollYProgress } = useScroll();
  const reduced = usePrefersReducedMotion();
  if (reduced) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-50 h-[2px] w-full origin-left orbit-accent-bg orbit-accent-glow"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
