import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LiveDesk } from "@/content/live-desks";
import { ChapterMark } from "@/components/story/ChapterMark";
import { Reveal } from "@/components/ui/Reveal";

export function LiveQuestions({ desks }: { desks: LiveDesk[] }) {
  if (desks.length === 0) return null;

  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <Reveal>
          <ChapterMark
            index="04"
            eyebrow="Live"
            title="Questions the desks answer"
            description="Public data, cadence-matched. The map and the tape live on the desk — the Hub only names the question."
          />
        </Reveal>
        <Link
          href="/portfolio/live"
          className="focus-ring group inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-medium text-neon-cyan"
        >
          Open live dashboards
          <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
        </Link>
      </div>

      <ul className="mt-12 border-t border-white/10">
        {desks.map((desk) => (
          <li key={desk.slug} className="border-b border-white/10">
            <Link
              href={`/portfolio/live/${desk.slug}`}
              className="focus-ring group grid gap-2 py-8 sm:grid-cols-[9rem_1fr_auto] sm:items-baseline sm:gap-8"
            >
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-500 transition-colors group-hover:text-neon-cyan">
                {desk.title}
              </span>
              <span className="font-display text-xl font-semibold tracking-tight text-white sm:text-2xl lg:text-3xl">
                {desk.question}
              </span>
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
                {desk.cadence}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
