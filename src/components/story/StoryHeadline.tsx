import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared public-page title: portrait + kicker on one row, then a two-line display. */
export function StoryHeadline({
  kicker,
  line,
  accent,
  mark,
  size = "story",
  className,
}: {
  kicker?: ReactNode;
  line: string;
  /** Gradient second line. Omit when `line` is already a full sentence. */
  accent?: string;
  /** Sits beside the kicker. The display line stays full width underneath. */
  mark?: ReactNode;
  /** `story` is the poster scale. `display` fits a full sentence. */
  size?: "story" | "display";
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
      <span
        className={cn(
          "mt-6 block font-display font-bold text-white",
          size === "display" ? "max-w-4xl text-balance text-display" : "text-story",
        )}
      >
        {line}
        {accent ? (
          <>
            <br />
            <span className="text-gradient">{accent}</span>
          </>
        ) : null}
      </span>
    </h1>
  );
}
