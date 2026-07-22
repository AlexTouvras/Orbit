"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import type { ReactNode } from "react";
import { socialIconFor } from "@/content/profile";
import { OrbitSignature } from "@/components/ui/OrbitSignature";
import { useHydrated } from "@/lib/use-hydrated";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const ease = [0.22, 1, 0.36, 1] as const;

function HeroItem({
  children,
  delay,
  animate,
}: {
  children: ReactNode;
  delay: number;
  animate: boolean;
}) {
  if (!animate) return <>{children}</>;
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
  availability: string;
  socials: { label: string; href: string }[];
}

export function HubHero({
  name,
  pillars,
  tagline,
  availability,
  socials,
}: HubHeroProps) {
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const animate = hydrated && !reduced;

  return (
    <section className="relative overflow-hidden pb-4">
      <div
        className="pointer-events-none absolute -right-12 -top-8 h-72 w-72"
        aria-hidden
      >
        <OrbitSignature variant="cyan" />
      </div>

      <HeroItem delay={0} animate={animate}>
        <Link
          href="/contact"
          className="focus-ring group mb-8 inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-neon-cyan/35 bg-neon-cyan/10 px-4 py-2 text-xs font-medium tracking-wide text-neon-cyan transition-[transform,background-color,border-color,box-shadow] active:scale-[0.98] hover:border-neon-cyan/55 hover:bg-neon-cyan/15 motion-safe:hover:shadow-[0_0_20px_-6px_rgba(34,211,238,0.45)]"
          aria-label={`${availability} — go to contact`}
        >
          <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-neon-cyan" />
          <span>{availability}</span>
          <Mail className="h-3.5 w-3.5 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" aria-hidden />
        </Link>
      </HeroItem>

      <HeroItem delay={0.06} animate={animate}>
        <h1 className="font-display max-w-3xl text-display font-bold tracking-tight text-white">
          {name}
        </h1>
      </HeroItem>

      <HeroItem delay={0.12} animate={animate}>
        <p className="mt-4 max-w-2xl font-display text-xl font-medium tracking-tight text-slate-200 sm:text-2xl">
          {pillars}
        </p>
      </HeroItem>

      <HeroItem delay={0.18} animate={animate}>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          {tagline}
        </p>
      </HeroItem>

      <HeroItem delay={0.24} animate={animate}>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/contact"
            className="focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl bg-neon-cyan px-5 py-3 text-sm font-semibold text-void shadow-glow transition-[transform,box-shadow] active:scale-[0.98] motion-safe:hover:shadow-[0_0_32px_-4px_rgba(34,211,238,0.55)]"
          >
            Get in touch
            <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/#selected-work"
            className="focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-[transform,border-color,color] active:scale-[0.98] hover:border-neon-cyan/50 hover:text-neon-cyan"
          >
            Selected work
            <ArrowRight className="h-3.5 w-3.5 opacity-60 transition-transform motion-safe:group-hover:translate-x-0.5" />
          </Link>
        </div>
      </HeroItem>

      <HeroItem delay={0.3} animate={animate}>
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
