import Link from "next/link";
import { ArrowRight, Boxes } from "lucide-react";
import type { Write } from "@/lib/types";
import { architectureSlugForWrite } from "@/lib/architecture";
import { ChapterMark } from "@/components/story/ChapterMark";
import { ScrollRail, ScrollRailCard } from "@/components/story/ScrollRail";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function ProofReel({ writes }: { writes: Write[] }) {
  if (writes.length === 0) return null;

  return (
    <ScrollRail
      length={writes.length}
      header={
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <ChapterMark
            index="03"
            eyebrow="Proof"
            title="Systems I've built"
            description="Write-ups with architecture, the evidence behind the craft."
          />
          <Link
            href="/portfolio"
            className="focus-ring group inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-medium text-neon-cyan"
          >
            Full portfolio
            <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
          </Link>
        </div>
      }
    >
      {writes.map((write, i) => {
        const architectureSlug = architectureSlugForWrite(write.slug);
        const essayHref = `/writes/${write.slug}`;
        return (
          <ScrollRailCard key={write.slug}>
            <article className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-9">
              <p className="story-index absolute right-4 top-2 select-none" aria-hidden>
                {pad(i + 1)}
              </p>
              <div>
                <h3 className="relative mt-2 font-display text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
                  <Link
                    href={essayHref}
                    className="focus-ring rounded-sm hover:text-neon-cyan"
                  >
                    {write.title}
                  </Link>
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                  {write.summary}
                </p>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/8 pt-5 text-sm">
                <Link
                  href={essayHref}
                  className="focus-ring inline-flex min-h-11 items-center gap-1.5 font-medium text-neon-cyan sm:min-h-0"
                >
                  Case study
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                {architectureSlug ? (
                  <Link
                    href={`/architecture/${architectureSlug}`}
                    className="focus-ring inline-flex min-h-11 items-center gap-1.5 text-slate-300 transition-colors hover:text-white sm:min-h-0"
                  >
                    <Boxes className="h-3.5 w-3.5" aria-hidden />
                    Architecture
                  </Link>
                ) : null}
              </div>
            </article>
          </ScrollRailCard>
        );
      })}
    </ScrollRail>
  );
}
