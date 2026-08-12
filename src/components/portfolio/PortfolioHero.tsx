import Link from "next/link";
import { ArrowRight, FolderGit2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MissionHero } from "@/components/ui/MissionHero";
import { OrbitSignature } from "@/components/ui/OrbitSignature";

const primaryCta =
  "focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl bg-neon-cyan px-5 py-3 text-sm font-semibold text-void shadow-glow transition-[transform,box-shadow] active:scale-[0.98] motion-safe:hover:shadow-[0_0_32px_-4px_rgba(34,211,238,0.55)]";

const secondaryCta =
  "focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-neon-cyan/40 hover:text-neon-cyan";

interface PortfolioHeroProps {
  workshopCount: number;
  tagCount: number;
  powerBiCount?: number;
  avatarUrl?: string;
}

export function PortfolioHero({
  workshopCount,
  tagCount,
  powerBiCount = 0,
  avatarUrl,
}: PortfolioHeroProps) {
  const stats = [
    { label: "Projects", value: workshopCount > 0 ? String(workshopCount) : "—" },
    {
      label: "Power BI",
      value: powerBiCount > 0 ? String(powerBiCount) : "—",
    },
    { label: "Tags", value: tagCount > 0 ? String(tagCount) : "—" },
  ];

  return (
    <MissionHero
      signature={<OrbitSignature variant="violet" duration="110s" />}
      badge={
        <Badge tone="violet" className="mb-8">
          <FolderGit2 className="mr-1.5 h-3.5 w-3.5" />
          Portfolio
        </Badge>
      }
      avatarUrl={avatarUrl}
      title="What I'm building"
      subtitle="Projects, open source, and Power BI"
      description="Workshop projects, GitHub repos, and Power BI pages that match the committed report definitions."
      stats={stats}
      actions={
        <>
          {workshopCount > 0 && (
            <a href="#workshop" className={primaryCta}>
              Projects
              <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
            </a>
          )}
          <a
            href="#github"
            className={workshopCount > 0 ? secondaryCta : primaryCta}
          >
            Open source
            <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
          </a>
          {powerBiCount > 0 && (
            <a href="#power-bi" className={secondaryCta}>
              Power BI reports
              <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
            </a>
          )}
        </>
      }
      meta={
        <Link
          href="/"
          className="focus-ring text-sm font-medium text-slate-400 transition-colors hover:text-neon-cyan"
        >
          ← Back to home
        </Link>
      }
    />
  );
}
