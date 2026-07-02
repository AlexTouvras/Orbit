import type { Metadata } from "next";
import { Radio, TriangleAlert } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { RadarExplorer } from "@/components/radar/RadarExplorer";
import { readNewsCache } from "@/lib/news/cache";
import { relativeTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Radar",
  description:
    "An auto-updating radar of the latest in AI, Data, and Delivery — aggregated from curated RSS feeds.",
};

// Re-read the cache periodically; the cron job keeps the file fresh.
export const revalidate = 1800;

const STALE_AFTER_MS = 12 * 60 * 60 * 1000;

export default function RadarPage() {
  const cache = readNewsCache();
  const hasItems = cache.items.length > 0;
  const generatedMs = cache.generatedAt ? Date.parse(cache.generatedAt) : 0;
  // Server component: comparing against the current time at render is intentional.
  // eslint-disable-next-line react-hooks/purity
  const isStale = generatedMs > 0 && Date.now() - generatedMs > STALE_AFTER_MS;

  return (
    <div>
      <Reveal>
        <div className="flex items-start justify-between gap-4">
          <SectionHeading
            eyebrow="Insights"
            title="The Radar"
            description="A self-updating sweep of the latest across AI, Data, and Delivery. Aggregated every 6 hours from curated sources and served from cache for instant loads."
          />
          {hasItems && (
            <div className="hidden shrink-0 items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 sm:flex">
              <Radio className="h-3.5 w-3.5 text-neon-cyan" />
              <span className="font-mono text-xs text-slate-400">
                updated {relativeTime(cache.generatedAt)}
              </span>
            </div>
          )}
        </div>
      </Reveal>

      {isStale && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          Showing cached results from {relativeTime(cache.generatedAt)}. Run the
          fetcher to refresh.
        </div>
      )}

      <div className="mt-10">
        {hasItems ? (
          <RadarExplorer items={cache.items} />
        ) : (
          <GlassCard className="flex flex-col items-center py-16 text-center">
            <Radio className="h-10 w-10 text-slate-600" />
            <h3 className="mt-4 text-lg font-semibold text-white">
              The radar is empty
            </h3>
            <p className="mt-2 max-w-md text-sm text-slate-400">
              No news has been fetched yet. Run{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-neon-cyan">
                npm run news:fetch
              </code>{" "}
              to populate the cache, or trigger{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-neon-cyan">
                /api/cron/news
              </code>
              .
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
