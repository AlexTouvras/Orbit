"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ARC_HUD_HREF, ARC_HUD_LABEL } from "@/components/card/href";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { StoryHeadline } from "@/components/story/StoryHeadline";
import { StoryStat } from "@/components/story/StoryStat";
import { useHydrated } from "@/lib/use-hydrated";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

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

export interface MissionStat {
  label: string;
  value: string;
  countTo?: number;
  suffix?: string;
  hint?: string;
}

interface MissionHeroProps {
  signature: ReactNode;
  badge?: ReactNode;
  title: string;
  /** Second kicker line under `title` — the public role, in the HUD's own casing. */
  titleNote?: string;
  /** Two-line display title. `title` becomes the mono kicker above it. */
  headline?: { line: string; accent: string };
  subtitle?: string;
  description?: string;
  stats?: MissionStat[];
  actions?: ReactNode;
  meta?: ReactNode;
  avatarUrl?: string;
  avatarAlt?: string;
  /** Portrait control. Defaults to the Arc HUD. Pass "" to leave the avatar static. */
  avatarHref?: string;
  avatarHrefLabel?: string;
}

function Kicker({ title, titleNote }: { title: string; titleNote?: string }) {
  if (!titleNote) return title;
  return (
    <>
      {title}
      <span className="mt-1.5 block normal-case tracking-normal text-slate-300">
        {titleNote}
      </span>
    </>
  );
}

/** Orchestrated above-the-fold hero — matches Hub motion cadence. Visible on SSR. */
export function MissionHero({
  signature,
  badge,
  title,
  titleNote,
  headline,
  subtitle,
  description,
  stats,
  actions,
  meta,
  avatarUrl,
  avatarAlt = "",
  avatarHref = ARC_HUD_HREF,
  avatarHrefLabel = ARC_HUD_LABEL,
}: MissionHeroProps) {
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const animate = hydrated && !reduced;
  const root = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: root,
    offset: ["start start", "end start"],
  });
  const orbitY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section ref={root} className="relative overflow-hidden pb-4">
      <motion.div
        className="pointer-events-none absolute -right-12 -top-8 h-64 w-64 sm:h-72 sm:w-72"
        aria-hidden
        style={animate ? { y: orbitY } : undefined}
      >
        {signature}
      </motion.div>

      {badge ? (
        <HeroItem delay={0} animate={animate}>
          {badge}
        </HeroItem>
      ) : null}

      <HeroItem delay={0.06} animate={animate}>
        {headline ? (
          <StoryHeadline
            mark={
              avatarUrl ? (
                avatarHref ? (
                  <Link
                    href={avatarHref}
                    className="focus-ring inline-flex rounded-xl"
                    aria-label={avatarHrefLabel}
                  >
                    <PixelAvatar src={avatarUrl} alt="" />
                  </Link>
                ) : (
                  <PixelAvatar src={avatarUrl} alt={avatarAlt} />
                )
              ) : undefined
            }
            kicker={<Kicker title={title} titleNote={titleNote} />}
            line={headline.line}
            accent={headline.accent}
          />
        ) : (
          <div className="flex items-center gap-4 sm:gap-5">
            {avatarUrl ? (
              avatarHref ? (
                <Link
                  href={avatarHref}
                  className="focus-ring inline-flex rounded-xl"
                  aria-label={avatarHrefLabel}
                >
                  <PixelAvatar src={avatarUrl} alt="" />
                </Link>
              ) : (
                <PixelAvatar src={avatarUrl} alt={avatarAlt} />
              )
            ) : null}
            <h1 className="font-display text-display font-bold tracking-tight text-white">
              {title}
            </h1>
          </div>
        )}
      </HeroItem>

      {subtitle && (
        <HeroItem delay={0.12} animate={animate}>
          <p className="mt-4 max-w-2xl font-display text-xl font-medium tracking-tight text-slate-200 sm:text-2xl">
            {subtitle}
          </p>
        </HeroItem>
      )}

      {description && (
        <HeroItem delay={0.18} animate={animate}>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {description}
          </p>
        </HeroItem>
      )}

      {stats && stats.length > 0 && (
        <HeroItem delay={0.24} animate={animate}>
          <div
            className={cn(
              "mt-8 grid gap-4 border-y border-white/8 py-5 sm:gap-6",
              stats.length <= 3
                ? "max-w-xl grid-cols-3"
                : stats.length > 5
                  ? "max-w-3xl grid-cols-2 sm:grid-cols-4"
                  : "max-w-3xl grid-cols-2 sm:grid-cols-3 md:grid-cols-5",
            )}
          >
            {stats.map((stat) => (
              <StoryStat
                key={stat.label}
                label={stat.label}
                value={stat.value}
                countTo={stat.countTo}
                suffix={stat.suffix}
                hint={stat.hint}
                className="min-w-0"
                valueClassName="orbit-accent"
              />
            ))}
          </div>
        </HeroItem>
      )}

      {(actions || meta) && (
        <HeroItem delay={0.3} animate={animate}>
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
