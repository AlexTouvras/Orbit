import type { Metadata } from "next";
import { LiveDeskTile } from "@/components/live/LiveDeskTile";
import { LiveDeskCarousel } from "@/components/live/LiveDeskCarousel";
import { LiveQuestionList } from "@/components/live/LiveQuestionList";
import { liveDesks } from "@/content/live-desks";
import { DeskStoryHeader } from "@/components/story/DeskStoryHeader";
import { DeskCast } from "@/components/story/DeskCast";
import { StoryStat } from "@/components/story/StoryStat";
import { DeskPicture } from "@/components/story/DeskPicture";

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
        lede="Public data, cadence-matched, one question each. These sit next to Power BI screenshots, not inside them. The Hub names the question; the desk holds the map."
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

      <LiveQuestionList desks={desks} />

      <DeskPicture label="Desk previews">
        <LiveDeskCarousel className="mt-0" labels={desks.map((d) => d.title)}>
          {desks.map((desk) => (
            <LiveDeskTile key={desk.slug} desk={desk} />
          ))}
        </LiveDeskCarousel>
      </DeskPicture>
    </div>
  );
}
