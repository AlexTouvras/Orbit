"use client";

import type { ReactNode } from "react";
import type { BadgeTone } from "@/lib/project-status";
import { cn } from "@/lib/utils";

const activeTones: Record<BadgeTone, string> = {
  cyan: "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan",
  ai: "border-neon-ai/50 bg-neon-ai/10 text-neon-ai",
  violet: "border-neon-violet/50 bg-neon-violet/10 text-neon-violet",
  blue: "border-neon-blue/50 bg-neon-blue/10 text-neon-blue",
  neutral: "border-white/25 bg-white/10 text-slate-200",
  green: "border-emerald-400/50 bg-emerald-400/10 text-emerald-300",
  amber: "border-amber-400/50 bg-amber-400/10 text-amber-300",
  red: "border-rose-400/50 bg-rose-400/10 text-rose-300",
};

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  /** Active accent — match topic badge tones when filtering by category. */
  tone?: BadgeTone;
}

/** Mission-control filter control — 44px touch target, focus ring, press feedback. */
export function FilterChip({
  active,
  onClick,
  children,
  className,
  tone = "cyan",
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "focus-ring inline-flex min-h-11 items-center rounded-full border px-4 text-xs font-medium transition-[color,background-color,border-color,transform]",
        "active:scale-[0.98]",
        active
          ? activeTones[tone]
          : "border-white/10 text-slate-300 hover:border-white/20 hover:text-white",
        className,
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
