"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
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
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

interface HubHeroProps {
  name: string;
  pillars: string;
  tagline: string;
  contactCta: string;
  socials: { label: string; href: string }[];
  avatarUrl?: string;
}

export function HubHero({
  name,
  pillars,
  tagline,
  contactCta,
  socials,
  avatarUrl,
}: HubHeroProps) {
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const animate = hydrated && !reduced;

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -right-8 top-[-12%] h-[28rem] w-[28rem] opacity-80 sm:h-[36rem] sm:w-[36rem] lg:right-[-4%] lg:top-[-18%]"
        aria-hidden
      >
        <OrbitSignature variant="cyan" duration="110s" />
      </div>

      <HeroItem delay={0} animate={animate}>
        <div className="flex items-center gap-3 sm:gap-4">
          {avatarUrl ? <PixelAvatar src={avatarUrl} alt="" /> : null}
          <div>
            <p className="orbit-accent font-mono text-xs uppercase tracking-[0.3em]">
              00 / Open
            </p>
          </div>
        </div>
      </HeroItem>

      <HeroItem delay={0.1} animate={animate}>
        <h1 className="mt-8 max-w-5xl">
          <span className="block font-mono text-xs uppercase tracking-[0.22em] text-slate-400">
            {name} · {pillars}
          </span>
          <span className="mt-4 block font-display text-story font-bold text-white">
            Prove what
            <br />
            <span className="text-gradient">works.</span>
          </span>
        </h1>
      </HeroItem>

      <HeroItem delay={0.18} animate={animate}>
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-xl">
          {tagline}
        </p>
      </HeroItem>

      <HeroItem delay={0.26} animate={animate}>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/contact"
            className="orbit-accent-bg orbit-accent-glow orbit-accent-cta-glow focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-void transition-[transform,box-shadow] active:scale-[0.98]"
          >
            {contactCta}
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

      <HeroItem delay={0.36} animate={animate}>
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

      <HeroItem delay={0.42} animate={animate}>
        <a
          href="#story-gravity"
          className="focus-ring mt-16 inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-slate-500 transition-colors hover:text-neon-cyan"
        >
          <ArrowDown className="h-3.5 w-3.5 motion-safe:animate-float" />
          Scroll the story
        </a>
      </HeroItem>
    </div>
  );
}
