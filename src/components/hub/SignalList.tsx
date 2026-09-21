import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Write } from "@/lib/types";
import { ChapterMark } from "@/components/story/ChapterMark";
import { ScrollSpot } from "@/components/story/ScrollSpot";
import { formatDate } from "@/lib/utils";

export function SignalList({ writes }: { writes: Write[] }) {
  if (writes.length === 0) return null;

  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <ChapterMark
            index="05"
            eyebrow="Signals"
            title="One question per article"
            description="What I'm learning in public: a decision rule, not a digest."
          />
        <Link
          href="/writes"
          className="focus-ring group inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-medium text-neon-cyan"
        >
          All posts
          <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
        </Link>
      </div>

      <ul className="mt-12 border-t border-white/10">
        {writes.map((write) => (
          <li key={write.slug} className="border-b border-white/10">
            <ScrollSpot>
            <Link
              href={`/writes/${write.slug}`}
              className="focus-ring group grid gap-3 py-7 sm:grid-cols-[6.5rem_1fr_auto] sm:items-baseline sm:gap-8"
            >
              <span className="orbit-accent font-mono text-[0.65rem] uppercase tracking-[0.22em]">
                {write.category}
              </span>
              <span>
                <span className="block font-display text-xl font-semibold tracking-tight text-white transition-colors group-hover:text-neon-cyan sm:text-2xl">
                  {write.title}
                </span>
                <span className="mt-2 block max-w-2xl text-sm leading-relaxed text-slate-400">
                  {write.summary}
                </span>
              </span>
              <span className="inline-flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
                {formatDate(write.date)}
                <span>{write.readingTime} min</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:translate-x-0.5" />
              </span>
            </Link>
            </ScrollSpot>
          </li>
        ))}
      </ul>
    </div>
  );
}
