"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type RefObject } from "react";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/use-hydrated";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const satellites = [
  { label: "products", href: "/portfolio", slot: "top" },
  { label: "essays", href: "/writes", slot: "right" },
  { label: "signals", href: "/radar", slot: "bottom" },
  { label: "projects", href: "/#selected-work", slot: "left" },
] as const;

const slotClass: Record<(typeof satellites)[number]["slot"], string> = {
  top: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
  right: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
  bottom: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
  left: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
};

/** Brand metaphor as a diagram: rings and satellites turn with page scroll. */
export function GravityField({
  className,
  containerRef,
}: {
  className?: string;
  containerRef?: RefObject<HTMLElement | null>;
}) {
  const localRef = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const live = hydrated && !reduced;
  const { scrollYProgress } = useScroll({
    target: containerRef ?? localRef,
    offset: ["start 0.9", "end 0.1"],
  });
  const rotate = useTransform(scrollYProgress, [0, 1], [-28, 42]);
  const unrotate = useTransform(scrollYProgress, [0, 1], [28, -42]);
  const scale = useTransform(scrollYProgress, [0, 0.45, 1], [0.82, 1, 1.08]);

  return (
    <div
      ref={localRef}
      className={cn(
        "relative mx-auto aspect-square w-full max-w-[22rem] sm:max-w-md",
        className,
      )}
    >
      <motion.div
        className="absolute inset-0"
        style={live ? { rotate, scale } : undefined}
      >
        <div
          className="pointer-events-none absolute inset-[8%] rounded-full border border-dashed border-white/20 motion-safe:animate-[orbit-drift_80s_linear_infinite]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-[26%] rounded-full border border-white/15"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-[44%] rounded-full border border-white/10"
          aria-hidden
        />
        {satellites.map((item) => (
          <div key={item.label} className={cn("absolute", slotClass[item.slot])}>
            <motion.div style={live ? { rotate: unrotate } : undefined}>
              <Link
                href={item.href}
                className="focus-ring rounded-full border border-white/15 bg-void/90 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-200 backdrop-blur-sm transition-colors hover:border-neon-cyan/40 hover:text-neon-cyan"
              >
                {item.label}
              </Link>
            </motion.div>
          </div>
        ))}
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="max-w-[7.5rem] text-center font-display text-lg font-semibold leading-tight tracking-tight text-white sm:text-xl">
          how I
          <br />
          <span className="orbit-accent">build</span>
        </p>
      </div>
    </div>
  );
}
