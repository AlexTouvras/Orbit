"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Radar } from "lucide-react";
import type { ReactNode } from "react";
import { socialIconFor } from "@/content/profile";
import { Badge } from "@/components/ui/Badge";
import { OrbitSignature } from "@/components/ui/OrbitSignature";
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

interface HubHeroProps {
  name: string;
  pillars: string;
  tagline: string;
  stats: { label: string; value: string }[];
  socials: { label: string; href: string }[];
}

export function HubHero({ name, pillars, tagline, stats, socials }: HubHeroProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="relative overflow-hidden pb-4">
      <div
        className="pointer-events-none absolute -right-12 -top-8 h-72 w-72"
        aria-hidden
      >
        <OrbitSignature variant="cyan" />
      </div>

      <HeroItem delay={0} reduced={reduced}>
        <Badge tone="cyan" className="mb-8">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-neon-cyan" />
          Open to delivery &amp; AI work
        </Badge>
      </HeroItem>

      <HeroItem delay={0.06} reduced={reduced}>
        <h1 className="font-display max-w-3xl text-display font-bold tracking-tight text-white">
          {name}
        </h1>
      </HeroItem>

      <HeroItem delay={0.12} reduced={reduced}>
        <p className="mt-4 max-w-2xl font-display text-xl font-medium tracking-tight text-slate-200 sm:text-2xl">
          {pillars}
        </p>
      </HeroItem>

      <HeroItem delay={0.18} reduced={reduced}>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          {tagline}
        </p>
      </HeroItem>

      <HeroItem delay={0.24} reduced={reduced}>
        <dl className="mt-8 grid max-w-xl grid-cols-3 gap-4 border-y border-white/8 py-5 sm:gap-6">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
                {stat.label}
              </dt>
              <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-neon-cyan sm:text-xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </HeroItem>

      <HeroItem delay={0.3} reduced={reduced}>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/portfolio"
            className="focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl bg-neon-cyan px-5 py-3 text-sm font-semibold text-void shadow-glow transition-[transform,box-shadow] active:scale-[0.98] motion-safe:hover:shadow-[0_0_32px_-4px_rgba(34,211,238,0.55)]"
          >
            See case studies
            <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/radar"
            className="focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            <Radar className="h-4 w-4 text-neon-violet/80" />
            Radar feed
            <ArrowRight className="h-3.5 w-3.5 opacity-60 transition-transform motion-safe:group-hover:translate-x-0.5" />
          </Link>
        </div>
      </HeroItem>

      <HeroItem delay={0.36} reduced={reduced}>
        <div className="mt-8 flex items-center gap-1 sm:hidden">
          {socials.map((social) => {
            const Icon = socialIconFor(social.label);
            return (
            <Link
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-500 transition-colors hover:text-neon-cyan"
            >
              <Icon className="h-5 w-5" />
            </Link>
            );
          })}
        </div>
      </HeroItem>
    </section>
  );
}
