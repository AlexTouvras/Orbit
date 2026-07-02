import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone =
  | "cyan"
  | "violet"
  | "blue"
  | "neutral"
  | "green"
  | "amber"
  | "red";

const tones: Record<Tone, string> = {
  cyan: "border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan",
  violet: "border-neon-violet/30 bg-neon-violet/10 text-neon-violet",
  blue: "border-neon-blue/30 bg-neon-blue/10 text-neon-blue",
  neutral: "border-white/10 bg-white/5 text-slate-300",
  green: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  amber: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  red: "border-rose-400/30 bg-rose-400/10 text-rose-300",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
