import { Suspense } from "react";
import { EconomyPeek } from "@/components/live/EconomyPeek";
import { EuSpotPeek } from "@/components/live/EuSpotPeek";
import { HeatmapPeek } from "@/components/live/HeatmapPeek";
import { HousingPeek } from "@/components/live/HousingPeek";
import { PowerMixPeek } from "@/components/live/PowerMixPeek";
import { WhichModelPeek } from "@/components/live/WhichModelPeek";

export function PeekFallback() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-neon-cyan/15 to-transparent" />
  );
}

export async function DeskPeek({ slug }: { slug: string }) {
  if (slug === "eu-spot") return <EuSpotPeek />;
  if (slug === "nordic-equity") return <HeatmapPeek />;
  if (slug === "housing") return <HousingPeek />;
  if (slug === "power-mix") return <PowerMixPeek />;
  if (slug === "economy") return <EconomyPeek />;
  if (slug === "which-model") return <WhichModelPeek />;
  return <PeekFallback />;
}

/** Sneak peek for a live desk. The heatmap read can suspend. */
export function DeskPeekFrame({ slug }: { slug: string }) {
  return (
    <Suspense fallback={<PeekFallback />}>
      <DeskPeek slug={slug} />
    </Suspense>
  );
}
