"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const ease = [0.22, 1, 0.36, 1] as const;

function HeroItem({
  children,
  delay,
  reduced,
}: {
  children: ReactNode;
  delay: number;
  reduced: boolean;
}) {
  if (reduced) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export interface MissionStat {
  label: string;
  value: string;
}

interface MissionHeroProps {
  signature: ReactNode;
  badge: ReactNode;
  title: string;
  subtitle?: string;
  description?: string;
  stats?: MissionStat[];
  actions?: ReactNode;
  meta?: ReactNode;
}

/** Orchestrated above-the-fold hero — matches Hub motion cadence. */
export function MissionHero({
  signature,
  badge,
  title,
  subtitle,
  description,
  stats,
  actions,
  meta,
}: MissionHeroProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="relative overflow-hidden pb-4">
      <div
        className="pointer-events-none absolute -right-12 -top-8 h-64 w-64 sm:h-72 sm:w-72"
        aria-hidden
      >
        {signature}
      </div>

      <HeroItem delay={0} reduced={reduced}>
        {badge}
      </HeroItem>

      <HeroItem delay={0.06} reduced={reduced}>
        <h1 className="font-display max-w-3xl text-display font-bold tracking-tight text-white">
          {title}
        </h1>
      </HeroItem>

      {subtitle && (
        <HeroItem delay={0.12} reduced={reduced}>
          <p className="mt-4 max-w-2xl font-display text-xl font-medium tracking-tight text-slate-200 sm:text-2xl">
            {subtitle}
          </p>
        </HeroItem>
      )}

      {description && (
        <HeroItem delay={0.18} reduced={reduced}>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {description}
          </p>
        </HeroItem>
      )}

      {stats && stats.length > 0 && (
        <HeroItem delay={0.24} reduced={reduced}>
          <dl className="mt-8 grid max-w-xl grid-cols-3 gap-4 border-y border-white/8 py-5 sm:gap-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                  {stat.label}
                </dt>
                <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-neon-cyan sm:text-xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </HeroItem>
      )}

      {(actions || meta) && (
        <HeroItem delay={0.3} reduced={reduced}>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            {actions && (
              <div className="flex flex-wrap items-center gap-4">{actions}</div>
            )}
            {meta}
          </div>
        </HeroItem>
      )}
    </section>
  );
}
