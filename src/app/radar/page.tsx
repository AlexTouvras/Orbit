import type { Metadata } from "next";
import { Radio, TriangleAlert } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { RadarExplorer } from "@/components/radar/RadarExplorer";
import { RadarHero } from "@/components/radar/RadarHero";
import { readNewsCacheRemote } from "@/lib/news/cache-remote";
import { relativeTime } from "@/lib/utils";
import type { NewsCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "Related articles",
  description:
    "Curated reading across AI, Data, Analytics (Power BI / Fabric), and Delivery — aggregated from RSS and served from cache.",
  alternates: { canonical: "/radar" },
};

export const dynamic = "force-dynamic";

const STALE_AFTER_MS = 36 * 60 * 60 * 1000;

export default async function RadarPage() {
  const cache = await readNewsCacheRemote();
  const hasItems = cache.items.length > 0;
  const generatedMs = cache.generatedAt ? Date.parse(cache.generatedAt) : 0;
  // eslint-disable-next-line react-hooks/purity
  const isStale = generatedMs > 0 && Date.now() - generatedMs > STALE_AFTER_MS;

  const categoryCounts = cache.items.reduce(
    (acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    },
    { AI: 0, Data: 0, Delivery: 0, Analytics: 0 } as Record<NewsCategory, number>,
  );

  return (
    <div className="space-y-24 sm:space-y-32">
      <RadarHero
        totalSignals={cache.count}
        categoryCounts={categoryCounts}
        generatedAt={cache.generatedAt}
      />

      {isStale && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-sm text-amber-100"
        >
          <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
          <p>
            Showing cached results from {relativeTime(cache.generatedAt)}. The
            daily fetch may be delayed — check back later or refresh manually.
          </p>
        </div>
      )}

      <section id="signals" className="scroll-mt-28">
        <Reveal>
          <SectionHeading
            eyebrow="Feed"
            title="From the web"
            description="Filter by topic or search titles, summaries, and sources."
          />
        </Reveal>

        <div className="mt-8">
          {hasItems ? (
            <RadarExplorer items={cache.items} />
          ) : (
            <GlassCard className="flex flex-col items-center py-16 text-center">
              <Radio className="h-10 w-10 text-slate-500" aria-hidden />
              <h3 className="mt-4 text-lg font-semibold text-white">
                No related articles yet
              </h3>
              <p className="mt-2 max-w-md text-sm text-slate-300">
                Items will appear here when the feed refreshes. Check back soon
                for curated updates across AI, Data, Analytics, and Delivery.
              </p>
            </GlassCard>
          )}
        </div>
      </section>
    </div>
  );
}
