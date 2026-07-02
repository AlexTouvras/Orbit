"use client";

import { useCallback, useMemo } from "react";
import { Particles, ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

/**
 * Subtle, performance-conscious "drifting nodes / starfield" background.
 * - capped FPS, modest particle count, retina-aware
 * - non-interactive (pointer-events: none) and pinned behind all content
 * - fully disabled for users who prefer reduced motion (static gradient instead)
 */
export function ParticleBackground() {
  const reducedMotion = usePrefersReducedMotion();

  // Must be stable across the app lifecycle (the provider enforces this).
  const init = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const options = useMemo<ISourceOptions>(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 60,
      detectRetina: true,
      background: { color: "transparent" },
      particles: {
        number: {
          value: 70,
          density: { enable: true, width: 1200, height: 1200 },
        },
        color: { value: ["#22d3ee", "#a855f7", "#e2e8f0"] },
        links: {
          enable: true,
          distance: 140,
          color: "#3b4663",
          opacity: 0.25,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.35,
          direction: "none",
          random: true,
          straight: false,
          outModes: { default: "out" },
        },
        opacity: {
          value: { min: 0.15, max: 0.7 },
          animation: { enable: true, speed: 0.5, sync: false },
        },
        size: { value: { min: 0.5, max: 2.2 } },
      },
      interactivity: {
        events: { onHover: { enable: false }, onClick: { enable: false } },
      },
    }),
    [],
  );

  // The outer wrapper + gradient render identically on server and client.
  // The ParticlesProvider renders no DOM until the engine loads (post-mount),
  // so toggling it for reduced-motion users never causes a hydration mismatch.
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-void">
      <div className="absolute inset-0 bg-radial-glow" />
      {!reducedMotion && (
        <ParticlesProvider init={init}>
          <Particles
            id="tsparticles"
            options={options}
            className="absolute inset-0 h-full w-full"
          />
        </ParticlesProvider>
      )}
    </div>
  );
}
