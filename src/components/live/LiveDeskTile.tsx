import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LiveDesk } from "@/content/live-desks";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { EuSpotPeek } from "@/components/live/EuSpotPeek";
import { HeatmapPeek } from "@/components/live/HeatmapPeek";
import { HousingPeek } from "@/components/live/HousingPeek";
import { PowerMixPeek } from "@/components/live/PowerMixPeek";

function DeskPeek({ slug }: { slug: string }) {
  if (slug === "eu-spot") return <EuSpotPeek />;
  if (slug === "nordic-equity") return <HeatmapPeek />;
  if (slug === "housing") return <HousingPeek />;
  if (slug === "power-mix") return <PowerMixPeek />;
  return (
    <div className="h-full w-full bg-gradient-to-br from-neon-cyan/15 to-transparent" />
  );
}

export async function LiveDeskTile({ desk }: { desk: LiveDesk }) {
  const href = `/portfolio/live/${desk.slug}`;

  return (
    <GlassCard hover className="group relative h-full overflow-hidden p-0">
      <div className="aspect-[16/10] overflow-hidden border-b border-white/10 bg-void-800">
        <DeskPeek slug={desk.slug} />
      </div>
      <div className="pointer-events-none relative p-6">
        <div className="flex items-center justify-between gap-3">
          <Badge tone="cyan">{desk.cadence}</Badge>
          <ArrowUpRight className="h-5 w-5 text-slate-500 transition-[transform,color] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neon-cyan" />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-white">{desk.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {desk.question}
        </p>
        <p className="mt-5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
          {desk.source}
        </p>
      </div>
      <Link
        href={href}
        className="focus-ring absolute inset-0 z-10 rounded-2xl"
        aria-label={`${desk.title}: ${desk.question}`}
      />
    </GlassCard>
  );
}
