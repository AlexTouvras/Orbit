import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Write } from "@/lib/types";
import { ChapterMark } from "@/components/story/ChapterMark";
import { ScrollRail, ScrollRailCard } from "@/components/story/ScrollRail";
import { formatDate } from "@/lib/utils";

export function SignalList({ writes }: { writes: Write[] }) {
  if (writes.length === 0) return null;

  return (
    <ScrollRail
      length={writes.length}
      header={
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
      }
    >
      {writes.map((write) => (
        <ScrollRailCard key={write.slug}>
          <article className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-9">
            <div>
              <p className="orbit-accent font-mono text-[0.65rem] uppercase tracking-[0.22em]">
                {write.category}
              </p>
              <h3 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
                <Link
                  href={`/writes/${write.slug}`}
                  className="focus-ring rounded-sm hover:text-neon-cyan"
                >
                  {write.title}
                </Link>
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                {write.summary}
              </p>
            </div>
            <p className="mt-8 flex items-center gap-3 border-t border-white/8 pt-5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
              {formatDate(write.date)}
              <span>{write.readingTime} min</span>
            </p>
          </article>
        </ScrollRailCard>
      ))}
    </ScrollRail>
  );
}
