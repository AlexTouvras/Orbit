"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

/** Mission-control filter control — 44px touch target, focus ring, press feedback. */
export function FilterChip({
  active,
  onClick,
  children,
  className,
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "focus-ring inline-flex min-h-11 items-center rounded-full border px-4 text-xs font-medium transition-[color,background-color,border-color,transform]",
        "active:scale-[0.98]",
        active
          ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan"
          : "border-white/10 text-slate-300 hover:border-white/20 hover:text-white",
        className,
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
