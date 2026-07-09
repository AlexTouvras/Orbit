import { Radio } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MissionHero } from "@/components/ui/MissionHero";
import { OrbitSignature } from "@/components/ui/OrbitSignature";
import { relativeTime } from "@/lib/utils";
import type { NewsCategory } from "@/lib/types";

interface RadarHeroProps {
  totalSignals: number;
  categoryCounts: Record<NewsCategory, number>;
  generatedAt: string | null;
}

export function RadarHero({
  totalSignals,
  categoryCounts,
  generatedAt,
}: RadarHeroProps) {
  const stats = [
    { label: "Signals", value: totalSignals > 0 ? String(totalSignals) : "—" },
    { label: "AI", value: String(categoryCounts.AI ?? 0) },
    { label: "Data", value: String(categoryCounts.Data ?? 0) },
  ];

  return (
    <MissionHero
      signature={<OrbitSignature variant="cyan" duration="75s" />}
      badge={
        <Badge tone="cyan" className="mb-8">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-neon-cyan" />
          Insights · daily sweep
        </Badge>
      }
      title="Signals"
      subtitle="AI, Data, and Delivery — aggregated and cached"
      description="External intake from curated RSS sources. Refreshed daily and served from cache — complementary to my own Writes."
      stats={stats}
      meta={
        generatedAt ? (
          <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 py-2">
            <Radio className="h-3.5 w-3.5 text-neon-cyan" aria-hidden />
            <span className="font-mono text-xs text-slate-300">
              Updated {relativeTime(generatedAt)}
            </span>
          </div>
        ) : undefined
      }
    />
  );
}
