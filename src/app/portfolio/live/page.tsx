import type { Metadata } from "next";
import { LiveDeskReel } from "@/components/live/LiveDeskReel";
import { liveDesks } from "@/content/live-desks";
import { DeskCast } from "@/components/story/DeskCast";
import { StoryHeadline } from "@/components/story/StoryHeadline";
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
      <StoryHeadline
        kicker="Live desks"
        line="Ask it"
        accent="in plain words."
      />
      <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
        Electricity, Helsinki flats, Nordic stocks, the euro area. One question
        on the card. The picture stays on the desk.
      </p>

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
