import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { MissionHero } from "@/components/ui/MissionHero";
import { OrbitSignature } from "@/components/ui/OrbitSignature";
import { LiveDeskTile } from "@/components/live/LiveDeskTile";
import { LiveDeskCarousel } from "@/components/live/LiveDeskCarousel";
import { liveDesks } from "@/content/live-desks";
import { Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "Live dashboards",
  description:
    "One-page desks on Orbit: Nordic equity heatmap, EU Spot, and Helsinki housing. Not Power BI.",
  alternates: { canonical: "/portfolio/live" },
};

export default function LiveDesksPage() {
  const desks = liveDesks.filter((d) => d.status === "live");

  return (
    <div className="space-y-16">
      <MissionHero
        signature={<OrbitSignature variant="cyan" duration="90s" />}
        badge={
          <Badge tone="cyan" className="mb-8">
            <Activity className="mr-1.5 h-3.5 w-3.5" />
            Live dashboards
          </Badge>
        }
        title="Follow the tape"
        subtitle="Public data, cadence-matched, one question each"
        description="These sit next to Power BI screenshots, not inside them. Rail waits until its first honest snapshot exists."
        stats={[
          { label: "Desks", value: String(desks.length) },
          { label: "Grain", value: "Mixed" },
          { label: "Keys in browser", value: "None" },
        ]}
      />

      <LiveDeskCarousel className="mt-0" labels={desks.map((d) => d.title)}>
        {desks.map((desk) => (
          <LiveDeskTile key={desk.slug} desk={desk} />
        ))}
      </LiveDeskCarousel>
    </div>
  );
}
