import type { StoryBeat } from "@/content/stories";
import { cn } from "@/lib/utils";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** The reading order as one figure: five beats on a hairline spine. */
export function StorySpine({
  beats,
  compact = false,
  className,
}: {
  beats: StoryBeat[];
  /** Tighter type and padding for a section teaser. */
  compact?: boolean;
  className?: string;
}) {
  if (beats.length === 0) return null;

  return (
    <ol
      className={cn(
        "grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-5",
        className,
      )}
    >
      {beats.map((beat, i) => (
        <li
          key={beat.id}
          className={cn(
            "flex flex-col bg-void",
            compact ? "px-4 py-4" : "px-4 py-5 sm:px-5 sm:py-7",
          )}
        >
          <span className="flex items-center gap-2" aria-hidden>
            <span className="orbit-accent-bg h-1.5 w-1.5 shrink-0 rounded-full" />
            <span className="h-px flex-1 bg-white/10" />
          </span>
          <p className="mt-3 flex items-baseline gap-2 font-mono text-[0.65rem] uppercase tracking-[0.2em]">
            <span className="orbit-accent tabular-nums">{pad(i + 1)}</span>
            <span className="text-white">{beat.name}</span>
          </p>
          <p
            className={cn(
              "mt-2 leading-relaxed text-slate-400",
              compact ? "text-sm" : "text-sm sm:text-base",
            )}
          >
            {beat.line}
          </p>
        </li>
      ))}
    </ol>
  );
}
