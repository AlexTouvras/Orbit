import type { ReactNode } from "react";

/** Opening beat for a live desk: cadence, then the question as the headline. */
export function DeskStoryHeader({
  kicker,
  question,
  lede,
}: {
  kicker: string;
  question: string;
  lede?: ReactNode;
}) {
  return (
    <header>
      <p className="orbit-accent mb-4 font-mono text-xs uppercase tracking-[0.3em]">
        {kicker}
      </p>
      <h1 className="max-w-4xl font-display text-display font-bold tracking-tight text-white">
        {question}
      </h1>
      {lede ? (
        <div className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
          {lede}
        </div>
      ) : null}
    </header>
  );
}
