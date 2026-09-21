import { cn } from "@/lib/utils";

interface ChapterMarkProps {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
}

/** Numbered chapter header — Light Factory process energy, Orbit voice. */
export function ChapterMark({
  index,
  eyebrow,
  title,
  description,
  className,
}: ChapterMarkProps) {
  return (
    <header className={cn("max-w-3xl", className)}>
      <p className="flex items-baseline gap-3 font-mono text-xs uppercase tracking-[0.3em]">
        <span className="orbit-accent tabular-nums">{index}</span>
        <span className="text-slate-500">/</span>
        <span className="orbit-accent">{eyebrow}</span>
      </p>
      <h2 className="mt-4 font-display text-section font-bold tracking-tight text-white">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          {description}
        </p>
      ) : null}
    </header>
  );
}
