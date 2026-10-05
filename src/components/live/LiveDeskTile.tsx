import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LiveDesk } from "@/content/live-desks";
import { EuSpotPeek } from "@/components/live/EuSpotPeek";
import { HeatmapPeek } from "@/components/live/HeatmapPeek";
import { HousingPeek } from "@/components/live/HousingPeek";
import { PowerMixPeek } from "@/components/live/PowerMixPeek";
import { EconomyPeek } from "@/components/live/EconomyPeek";
import { WhichModelPeek } from "@/components/live/WhichModelPeek";
import { ScrollRailCard } from "@/components/story/ScrollRail";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function PeekFallback() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-neon-cyan/15 to-transparent" />
  );
}

async function DeskPeek({ slug }: { slug: string }) {
  if (slug === "eu-spot") return <EuSpotPeek />;
  if (slug === "nordic-equity") return <HeatmapPeek />;
  if (slug === "housing") return <HousingPeek />;
  if (slug === "power-mix") return <PowerMixPeek />;
  if (slug === "economy") return <EconomyPeek />;
  if (slug === "which-model") return <WhichModelPeek />;
  return <PeekFallback />;
}

/** Peek + question for the live ScrollRail. Question sits on the image. */
export function LiveDeskTile({
  desk,
  index,
}: {
  desk: LiveDesk;
  index: number;
}) {
  const href = `/portfolio/live/${desk.slug}`;

  return (
    <ScrollRailCard>
      <article className="group relative isolate overflow-hidden rounded-3xl border border-white/10 bg-void-800">
        <div className="pointer-events-none h-[min(42vh,24rem)] w-full">
          <Suspense fallback={<PeekFallback />}>
            <DeskPeek slug={desk.slug} />
          </Suspense>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-void via-void/90 to-transparent px-6 pb-6 pt-16 sm:px-8 sm:pb-7">
          <p
            className="story-index absolute right-4 top-4 select-none sm:top-6"
            aria-hidden
          >
            {pad(index + 1)}
          </p>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
            {desk.cadence}
          </p>
          <h3 className="relative mt-2 max-w-xl font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {desk.question}
          </h3>
          <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
            {desk.title}
            <span className="text-slate-600"> · </span>
            {desk.source}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-neon-cyan">
            Open desk
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" />
          </span>
        </div>
        <Link
          href={href}
          className="focus-ring absolute inset-0 z-10 rounded-3xl"
          aria-label={desk.question}
        />
      </article>
    </ScrollRailCard>
  );
}
