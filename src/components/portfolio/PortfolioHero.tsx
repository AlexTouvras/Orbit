"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { OrbitSignature } from "@/components/ui/OrbitSignature";
import { DeskCast } from "@/components/story/DeskCast";
import { StoryStat } from "@/components/story/StoryStat";
import { useHydrated } from "@/lib/use-hydrated";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

interface PortfolioHeroProps {
  workshopCount: number;
  powerBiCount: number;
  liveCount: number;
  avatarUrl?: string;
}

export function PortfolioHero({
  workshopCount,
  powerBiCount,
  liveCount,
  avatarUrl,
}: PortfolioHeroProps) {
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const animate = hydrated && !reduced;
  const root = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: root,
    offset: ["start start", "end start"],
  });
  const orbitY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <header ref={root} className="relative">
      <motion.div
        className="pointer-events-none absolute -right-8 top-[-12%] h-[22rem] w-[22rem] opacity-70 sm:h-[28rem] sm:w-[28rem] lg:right-[-4%]"
        aria-hidden
        style={animate ? { y: orbitY } : undefined}
      >
        <OrbitSignature variant="violet" duration="110s" />
      </motion.div>

      <div className="flex items-center gap-3 sm:gap-4">
        {avatarUrl ? <PixelAvatar src={avatarUrl} alt="" /> : null}
        <p className="orbit-accent font-mono text-xs uppercase tracking-[0.3em]">
          00 / Portfolio
        </p>
      </div>

      <h1 className="mt-8 max-w-4xl font-display text-display font-bold tracking-tight text-white">
        What I&apos;m building
      </h1>

      <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
        Workshop projects, GitHub repos, Power BI screenshots, and one-page
        desks that refresh at the grain the data actually moves.
      </p>

      <DeskCast className="mt-10 lg:grid-cols-3">
        <StoryStat
          label="Projects"
          value={workshopCount > 0 ? String(workshopCount) : "—"}
          countTo={workshopCount || undefined}
        />
        <StoryStat
          label="Live"
          value={liveCount > 0 ? String(liveCount) : "—"}
          countTo={liveCount || undefined}
        />
        <StoryStat
          label="Power BI"
          value={powerBiCount > 0 ? String(powerBiCount) : "—"}
          countTo={powerBiCount || undefined}
        />
      </DeskCast>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        {workshopCount > 0 ? (
          <a
            href="#workshop"
            className="orbit-accent-bg orbit-accent-glow orbit-accent-cta-glow focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-void transition-[transform,box-shadow] active:scale-[0.98]"
          >
            Projects
            <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
          </a>
        ) : null}
        {liveCount > 0 ? (
          <Link
            href="/portfolio/live"
            className="focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-[transform,border-color,color] active:scale-[0.98] hover:border-neon-cyan/50 hover:text-neon-cyan"
          >
            Live dashboards
            <ArrowRight className="h-3.5 w-3.5 opacity-60 transition-transform motion-safe:group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </div>
    </header>
  );
}
