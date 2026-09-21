import type { Metadata } from "next";
import { LiveDeskReel } from "@/components/live/LiveDeskReel";
import { liveDesks } from "@/content/live-desks";
import { DeskStoryHeader } from "@/components/story/DeskStoryHeader";
import { DeskCast } from "@/components/story/DeskCast";
import { StoryStat } from "@/components/story/StoryStat";

export const metadata: Metadata = {
  title: "Live dashboards",
  description:
    "One-page desks on Orbit: Nordic equity, EU Spot, Helsinki housing, and Europe power mix. Not Power BI.",
  alternates: { canonical: "/portfolio/live" },
};

export default function LiveDesksPage() {
  const desks = liveDesks.filter((d) => d.status === "live");

  return (
    <div className="space-y-16">
      <DeskStoryHeader
        kicker="Live desks"
        question="Questions the desks answer"
        lede="Public data, cadence-matched, one question each. These sit next to Power BI screenshots, not inside them."
      />

      <DeskCast className="lg:grid-cols-3">
        <StoryStat
          label="Desks"
          value={String(desks.length)}
          countTo={desks.length}
        />
        <StoryStat label="Grain" value="Mixed" />
        <StoryStat label="Keys in browser" value="None" />
      </DeskCast>

      <LiveDeskReel desks={desks} />
    </div>
  );
}
