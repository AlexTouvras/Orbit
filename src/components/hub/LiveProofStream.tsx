"use client";

import Link from "next/link";
import type { LiveDesk } from "@/content/live-desks";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

type PulseLine = {
  key: string;
  label: string;
  detail: string;
  href?: string;
};

function buildPulse(desks: LiveDesk[], pillars: string): PulseLine[] {
  const live = desks.filter((d) => d.status === "live");
  const deskLines: PulseLine[] = live.map((d) => ({
    key: `desk-${d.slug}`,
    label: d.question,
    detail: d.cadence,
    href: `/portfolio/live/${d.slug}`,
  }));
  const system: PulseLine[] = [
    {
      key: "pulse-orbit",
      label: "Orbit desks live",
      detail: `${live.length} questions on the floor`,
    },
    {
      key: "pulse-pillars",
      label: pillars,
      detail: "Delivery · Data · AI",
    },
  ];
  return [...deskLines, ...system];
}

function PulseItem({ line }: { line: PulseLine }) {
  const inner = (
    <>
      <span className="text-slate-400">{line.label}</span>
      <span className="text-slate-600" aria-hidden>
        ·
      </span>
      <span className="text-slate-500">{line.detail}</span>
    </>
  );

  const className =
    "inline-flex shrink-0 items-baseline gap-2 whitespace-nowrap font-mono text-[11px] tracking-wide sm:text-xs";

  if (line.href) {
    return (
      <Link
        href={line.href}
        className={`${className} transition-colors hover:text-neon-cyan`}
      >
        {inner}
      </Link>
    );
  }

  return <span className={className}>{inner}</span>;
}

/**
 * Live product-as-atmosphere for Hub Open (Pinloop cue).
 * Desk questions + system pulse under the thesis — not a card grid, not a badge overlay.
 */
export function LiveProofStream({
  desks,
  pillars,
}: {
  desks: LiveDesk[];
  pillars: string;
}) {
  const reduced = usePrefersReducedMotion();
  const lines = buildPulse(desks, pillars);

  if (lines.length === 0) return null;

  if (reduced) {
    return (
      <div className="mt-14 border-t border-white/10 pt-6" aria-label="Live desks">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
          Live now
        </p>
        <ul className="flex flex-col gap-2">
          {lines.slice(0, 5).map((line) => (
            <li key={line.key}>
              <PulseItem line={line} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Duplicate track for seamless CSS marquee (globals: proof-stream-scroll).
  const track = [...lines, ...lines];

  return (
    <div
      className="relative left-1/2 mt-14 w-screen max-w-[100vw] -translate-x-1/2 border-t border-white/10 pt-6"
      aria-label="Live desks"
    >
      <p className="mx-auto mb-3 max-w-5xl px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:px-6">
        Live now
      </p>
      <div className="overflow-hidden">
        <div className="flex w-max gap-10 motion-safe:animate-[proof-stream-scroll_48s_linear_infinite] px-4 sm:px-6">
          {track.map((line, i) => (
            <PulseItem key={`${line.key}-${i}`} line={line} />
          ))}
        </div>
      </div>
      {/* Second row, reverse direction for depth */}
      <div className="mt-3 overflow-hidden">
        <div className="flex w-max gap-10 motion-safe:animate-[proof-stream-scroll-reverse_56s_linear_infinite] px-4 sm:px-6">
          {[...track].reverse().map((line, i) => (
            <PulseItem key={`rev-${line.key}-${i}`} line={line} />
          ))}
        </div>
      </div>
    </div>
  );
}
