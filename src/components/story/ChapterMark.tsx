import { cn } from "@/lib/utils";
import { StoryReveal } from "@/components/story/StoryReveal";

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
      <p className="sticky top-20 z-20 -mx-1 flex w-fit items-baseline gap-3 bg-void/75 px-1 py-1 font-mono text-xs uppercase tracking-[0.3em] backdrop-blur-md sm:top-24">
        <span className="orbit-accent tabular-nums">{index}</span>
        <span className="text-slate-500">/</span>
        <span className="orbit-accent">{eyebrow}</span>
      </p>
      <StoryReveal>
        <h2 className="mt-4 font-display text-section font-bold tracking-tight text-white">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {description}
          </p>
        ) : null}
      </StoryReveal>
    </header>
  );
}
