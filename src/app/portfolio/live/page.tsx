import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { MissionHero } from "@/components/ui/MissionHero";
import { OrbitSignature } from "@/components/ui/OrbitSignature";
import { LiveDeskTile } from "@/components/live/LiveDeskTile";
import { liveDesks } from "@/content/live-desks";
import { Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "Live dashboards",
  description:
    "One-page desks on Orbit: Nordic equity heatmap and Finland Power Pulse. Not Power BI.",
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
        description="These sit next to Power BI screenshots, not inside them. Housing and rail wait until their first honest snapshot exists."
        stats={[
          { label: "Desks", value: String(desks.length) },
          { label: "Grain", value: "15 min" },
          { label: "Keys in browser", value: "None" },
        ]}
      />

      <ul className="grid gap-6 sm:grid-cols-2">
        {desks.map((desk) => (
          <li key={desk.slug}>
            <LiveDeskTile desk={desk} />
          </li>
        ))}
      </ul>
    </div>
  );
}
