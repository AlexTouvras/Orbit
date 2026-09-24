"use client";

import { SignalField } from "@/components/layout/SignalField";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

/**
 * Site background: Signal Convergence.
 * Records travel in streams, one chain links across them, and scroll bends
 * that same field into a vortex. Static streams when motion is reduced.
 * /card and /qr-code never mount this (see AppChrome).
 */
export function ParticleBackground() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-void">
      <div className="absolute inset-0 bg-radial-glow" />
      <SignalField reduced={reducedMotion} />
    </div>
  );
}
