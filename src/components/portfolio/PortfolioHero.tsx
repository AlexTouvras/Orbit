import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OrbitSignature } from "@/components/ui/OrbitSignature";
import { MissionHero } from "@/components/ui/MissionHero";

interface PortfolioHeroProps {
  workshopCount: number;
  powerBiCount: number;
  liveCount: number;
  avatarUrl?: string;
}

export function PortfolioHero({
  workshopCount,
  powerBiCount,
  liveCount,
  avatarUrl,
}: PortfolioHeroProps) {
  return (
    <MissionHero
      signature={<OrbitSignature variant="violet" duration="110s" />}
      avatarUrl={avatarUrl}
      title="Portfolio"
      headline={{ line: "What survived", accent: "the cut." }}
      description="The projects I decided were worth building, with the requirement still attached and a way to check they still do the job."
      stats={[
        {
          label: "Projects",
          value: workshopCount > 0 ? String(workshopCount) : "—",
          countTo: workshopCount || undefined,
        },
        {
          label: "Live",
          value: liveCount > 0 ? String(liveCount) : "—",
          countTo: liveCount || undefined,
        },
        {
          label: "Power BI",
          value: powerBiCount > 0 ? String(powerBiCount) : "—",
          countTo: powerBiCount || undefined,
        },
      ]}
      actions={
        <>
          {workshopCount > 0 ? (
            <a
              href="#workshop"
              className="orbit-accent-bg orbit-accent-glow orbit-accent-cta-glow focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-void transition-[transform,box-shadow] active:scale-[0.98]"
            >
              Projects
              <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
            </a>
          ) : null}
          {liveCount > 0 ? (
            <Link
              href="/portfolio/live"
              className="focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-[transform,border-color,color] active:scale-[0.98] hover:border-neon-cyan/50 hover:text-neon-cyan"
            >
              Live dashboards
              <ArrowRight className="h-3.5 w-3.5 opacity-60 transition-transform motion-safe:group-hover:translate-x-0.5" />
            </Link>
          ) : null}
        </>
      }
    />
  );
}
