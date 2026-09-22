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
  avatarUrl?: string;
}

export function RadarHero({
  totalSignals,
  categoryCounts,
  generatedAt,
  avatarUrl,
}: RadarHeroProps) {
  const stats = [
    { label: "Articles", value: totalSignals > 0 ? String(totalSignals) : "—" },
    { label: "AI", value: String(categoryCounts.AI ?? 0) },
    { label: "Data", value: String(categoryCounts.Data ?? 0) },
    { label: "Analytics", value: String(categoryCounts.Analytics ?? 0) },
    { label: "Delivery", value: String(categoryCounts.Delivery ?? 0) },
    { label: "Economics", value: String(categoryCounts.Economics ?? 0) },
    { label: "Credit", value: String(categoryCounts.Credit ?? 0) },
  ];

  return (
    <MissionHero
      signature={<OrbitSignature variant="cyan" duration="75s" />}
      badge={
        <Badge tone="cyan" className="mb-8">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-neon-cyan" />
          Curated · daily refresh
        </Badge>
      }
      avatarUrl={avatarUrl}
      title="Related"
      headline={{ line: "What I read", accent: "before I decide." }}
      description="External writing on delivery, data, AI, economics, and banking. I keep a piece when it changes a requirement or a check."
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
