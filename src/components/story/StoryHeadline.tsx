import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared public-page title: portrait + kicker on one row, then a two-line display. */
export function StoryHeadline({
  kicker,
  line,
  accent,
  mark,
  className,
}: {
  kicker?: ReactNode;
  line: string;
  accent: string;
  /** Sits beside the kicker. The display line stays full width underneath. */
  mark?: ReactNode;
  className?: string;
}) {
  return (
    <h1 className={cn("max-w-5xl", className)}>
      {kicker || mark ? (
        <span className="flex items-center gap-4 sm:gap-5">
          {mark ? <span className="shrink-0">{mark}</span> : null}
          {kicker ? (
            <span className="min-w-0 font-mono text-xs uppercase leading-relaxed tracking-[0.18em] text-slate-400">
              {kicker}
            </span>
          ) : null}
        </span>
      ) : null}
      <span className="mt-6 block font-display text-story font-bold text-white">
        {line}
        <br />
        <span className="text-gradient">{accent}</span>
      </span>
    </h1>
  );
}
