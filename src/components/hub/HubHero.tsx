"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import type { ReactNode } from "react";
import { socialIconFor } from "@/content/profile";
import { OrbitSignature } from "@/components/ui/OrbitSignature";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
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
  whyOrbit: string;
  availability: string;
  socials: { label: string; href: string }[];
  avatarUrl?: string;
}

/** First "orbit" shares the brand accent orbit (cyan → purple). */
function withOrbitMark(text: string) {
  const i = text.toLowerCase().indexOf("orbit");
  if (i < 0) return text;
  const end = i + "orbit".length;
  return (
    <>
      {text.slice(0, i)}
      <span className="font-medium text-neon-cyan">{text.slice(i, end)}</span>
      {text.slice(end)}
    </>
  );
}

export function HubHero({
  name,
  pillars,
  tagline,
  whyOrbit,
  availability,
  socials,
  avatarUrl,
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
          className="orbit-accent orbit-accent-border orbit-accent-soft-bg orbit-accent-hover-border orbit-accent-hover-soft-bg orbit-accent-hover-glow focus-ring group mb-8 inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition-[transform,background-color,border-color,box-shadow] active:scale-[0.98]"
          aria-label={`${availability} — go to contact`}
        >
          <span className="orbit-accent-bg h-1.5 w-1.5 shrink-0 animate-pulse rounded-full" />
          <span>{availability}</span>
          <Mail className="h-3.5 w-3.5 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" aria-hidden />
        </Link>
      </HeroItem>

      <HeroItem delay={0.06} animate={animate}>
        <div className="flex max-w-3xl items-center gap-4 sm:gap-5">
          {avatarUrl ? (
            <PixelAvatar src={avatarUrl} alt="" />
          ) : null}
          <h1 className="font-display text-display font-bold tracking-tight text-white">
            {name}
          </h1>
        </div>
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

      <HeroItem delay={0.21} animate={animate}>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
          {withOrbitMark(whyOrbit)}{" "}
          <Link
            href="/writes/building-orbit"
            className="focus-ring font-medium text-neon-cyan transition-opacity hover:opacity-100"
          >
            Why the name
          </Link>
        </p>
      </HeroItem>

      <HeroItem delay={0.24} animate={animate}>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/contact"
            className="orbit-accent-bg orbit-accent-glow orbit-accent-cta-glow focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-void transition-[transform,box-shadow] active:scale-[0.98]"
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
