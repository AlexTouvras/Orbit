"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ArrowRight, ArrowUpRight, QrCode } from "lucide-react";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/use-hydrated";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

export interface IdentityHudLink {
  href: string;
  label: string;
}

export interface IdentityHudPillar {
  id: string;
  shortTitle: string;
  title: string;
  verbs?: string;
  description: string;
  accent: "cyan" | "violet" | "blue" | "amber";
  links?: IdentityHudLink[];
}

export interface IdentityHudStat {
  id: string;
  label: string;
  value: string;
  /** Short unit under the figure (e.g. master's) so phone tiles stay one-line. */
  unit?: string;
  title: string;
  description: string;
  links?: IdentityHudLink[];
}

export interface IdentityHudProps {
  name: string;
  role: string;
  location: string;
  tagline: string;
  contactCta: string;
  avatarUrl: string;
  stats: IdentityHudStat[];
  pillars: IdentityHudPillar[];
  /** Owner-only control. Omitted for everyone else. */
  privateAction?: { label: string; onClick: () => void } | null;
}

const accentTile: Record<IdentityHudPillar["accent"], string> = {
  cyan: "hover:border-neon-cyan/40",
  violet: "hover:border-neon-violet/40",
  blue: "hover:border-neon-blue/40",
  amber: "hover:border-neon-amber/40",
};

const accentActive: Record<IdentityHudPillar["accent"], string> = {
  cyan: "border-neon-cyan/50 bg-neon-cyan/10",
  violet: "border-neon-violet/50 bg-neon-violet/10",
  blue: "border-neon-blue/50 bg-neon-blue/10",
  amber: "border-neon-amber/50 bg-neon-amber/10",
};

type HintId = string;

function HintLinks({ links }: { links: IdentityHudLink[] }) {
  return (
    <ul className="mt-2 space-y-1">
      {links.map((link) => {
        const remote = /^https?:\/\//i.test(link.href);
        const staticHtml = link.href.includes(".html");
        const className =
          "focus-ring inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-neon-cyan sm:min-h-0";
        if (remote || staticHtml) {
          return (
            <li key={link.href}>
              <a
                href={link.href}
                className={className}
                {...(remote
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </a>
            </li>
          );
        }
        return (
          <li key={link.href}>
            <Link href={link.href} className={className}>
              {link.label}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function IdentityHud({
  name,
  role,
  location,
  tagline,
  contactCta,
  avatarUrl,
  stats,
  pillars,
  privateAction,
}: IdentityHudProps) {
  const [activeHint, setActiveHint] = useState<HintId | null>(null);
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const animate = hydrated && !reduced;

  const onToggle = useCallback((id: HintId) => {
    setActiveHint((prev) => (prev === id ? null : id));
  }, []);

  const activeStat = stats.find((s) => s.id === activeHint) ?? null;
  const activePillar = pillars.find((p) => p.id === activeHint) ?? null;
  const hint: {
    title: string;
    verbs?: string;
    description: string;
    links?: IdentityHudLink[];
  } | null = activeStat
    ? {
        title: activeStat.title,
        description: activeStat.description,
        links: activeStat.links,
      }
    : activePillar
      ? {
          title: activePillar.title,
          verbs: activePillar.verbs,
          description: activePillar.description,
          links: activePillar.links,
        }
      : null;

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 to-slate-950/60 p-4 sm:p-5",
        animate && "motion-safe:animate-fade-up",
      )}
    >
      <div className="flex items-start gap-3">
        <PixelAvatar
          src={avatarUrl}
          alt=""
          className="h-14 w-14 sm:h-16 sm:w-16"
        />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-violet-300/80">
            Identity HUD
          </p>
          <h1 className="mt-0.5 text-xl font-semibold text-white sm:text-2xl">
            {name}
          </h1>
          <p className="mt-1 text-sm leading-snug text-slate-300">{role}</p>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-400">{location}</p>

      {tagline ? (
        <blockquote className="mt-3 border-l-2 border-amber-500/40 pl-3 text-sm italic leading-snug text-slate-300">
          {tagline}
        </blockquote>
      ) : null}

      <div className="mt-4 grid grid-cols-3 gap-2">
        {stats.map((stat) => {
          const isActive = activeHint === stat.id;
          return (
            <button
              key={stat.id}
              type="button"
              onClick={() => onToggle(stat.id)}
              className={cn(
                "focus-ring flex min-h-[4.75rem] w-full flex-col rounded-xl border border-white/10 bg-black/20 px-2 py-2.5 text-left transition-colors hover:border-violet-400/40",
                isActive && "border-violet-400/50 bg-violet-500/15",
              )}
              aria-expanded={isActive}
              aria-controls={isActive ? "hud-hint" : undefined}
            >
              <span className="whitespace-nowrap font-mono text-[0.6rem] uppercase tracking-[0.12em] text-violet-300/70">
                {stat.label}
              </span>
              <span className="mt-1 font-display text-2xl font-bold leading-none text-white">
                {stat.value}
              </span>
              {stat.unit ? (
                <span className="mt-0.5 whitespace-nowrap text-[0.65rem] font-medium leading-none text-slate-400">
                  {stat.unit}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-3 items-stretch gap-2">
        {pillars.map((pillar) => {
          const isActive = activeHint === pillar.id;
          return (
            <button
              key={pillar.id}
              type="button"
              onClick={() => onToggle(pillar.id)}
              className={cn(
                "focus-ring flex min-h-12 w-full flex-col rounded-xl border border-white/10 bg-black/20 px-1.5 py-2.5 text-left transition-colors min-[400px]:px-2 sm:px-3",
                accentTile[pillar.accent],
                isActive && accentActive[pillar.accent],
              )}
              aria-expanded={isActive}
              aria-controls={isActive ? "hud-hint" : undefined}
            >
              <span className="font-mono text-[0.5rem] uppercase leading-none tracking-[0.02em] text-violet-300/70 min-[400px]:text-[0.6rem] min-[400px]:tracking-[0.12em]">
                {pillar.shortTitle}
              </span>
              <span className="mt-1 text-xs leading-4 text-slate-400">Tap</span>
            </button>
          );
        })}
      </div>

      {hint ? (
        <div
          id="hud-hint"
          className="mt-3 rounded-lg border border-violet-400/30 bg-violet-950/60 px-3 py-2.5"
          role="status"
        >
          <p className="text-xs font-medium text-white">{hint.title}</p>
          {hint.verbs ? (
            <p className="mt-1 font-mono text-[0.7rem] leading-snug text-slate-400">
              {hint.verbs}
            </p>
          ) : null}
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            {hint.description}
          </p>
          {hint.links?.length ? <HintLinks links={hint.links} /> : null}
        </div>
      ) : (
        <p className="mt-2 text-[0.65rem] text-slate-600">
          Tap a figure or a lane for details.
        </p>
      )}

      <Link
        href="/contact"
        className="focus-ring group mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-neon-cyan px-5 py-3 text-sm font-semibold text-void transition-[transform,box-shadow] active:scale-[0.97] motion-safe:hover:shadow-glow"
      >
        {contactCta}
        <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
      </Link>

      <nav
        aria-label="Continue on the site"
        className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1"
      >
        <Link
          href="/portfolio"
          className="focus-ring inline-flex min-h-11 items-center text-sm font-medium text-slate-300 hover:text-neon-cyan sm:min-h-0"
        >
          Portfolio
        </Link>
        <Link
          href="/writes"
          className="focus-ring inline-flex min-h-11 items-center text-sm font-medium text-slate-300 hover:text-neon-cyan sm:min-h-0"
        >
          Blog
        </Link>
        <Link
          href="/about"
          className="focus-ring inline-flex min-h-11 items-center text-sm font-medium text-slate-300 hover:text-neon-cyan sm:min-h-0"
        >
          About
        </Link>
        <Link
          href="/qr-code"
          className="focus-ring ml-auto inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-neon-cyan sm:min-h-0"
        >
          <QrCode className="h-4 w-4" aria-hidden />
          Show QR
        </Link>
      </nav>

      {privateAction ? (
        <button
          type="button"
          onClick={privateAction.onClick}
          className="focus-ring mt-4 w-full border-t border-white/10 pt-3 text-center font-mono text-[0.65rem] uppercase tracking-[0.18em] text-violet-300/80 hover:text-violet-100"
        >
          {privateAction.label}
        </button>
      ) : null}
    </div>
  );
}
