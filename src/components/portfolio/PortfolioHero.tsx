import Link from "next/link";
import { ArrowRight, FolderGit2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MissionHero } from "@/components/ui/MissionHero";
import { OrbitSignature } from "@/components/ui/OrbitSignature";

interface PortfolioHeroProps {
  caseStudyCount: number;
  workshopCount: number;
  tagCount: number;
}

export function PortfolioHero({
  caseStudyCount,
  workshopCount,
  tagCount,
}: PortfolioHeroProps) {
  const stats = [
    { label: "Case studies", value: String(caseStudyCount) },
    { label: "Workshop", value: workshopCount > 0 ? String(workshopCount) : "—" },
    { label: "Focus areas", value: String(tagCount) },
  ];

  return (
    <MissionHero
      signature={<OrbitSignature variant="violet" duration="110s" />}
      badge={
        <Badge tone="violet" className="mb-8">
          <FolderGit2 className="mr-1.5 h-3.5 w-3.5" />
          Portfolio bank
        </Badge>
      }
      title="Missions & case studies"
      subtitle="Agentic systems, data platforms, and delivery work"
      description="Filter by focus area, browse case studies, or explore what's shipping from the workshop and GitHub."
      stats={stats}
      actions={
        <>
          <a
            href="#case-studies"
            className="focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl bg-neon-cyan px-5 py-3 text-sm font-semibold text-void shadow-glow transition-[transform,box-shadow] active:scale-[0.98] motion-safe:hover:shadow-[0_0_32px_-4px_rgba(34,211,238,0.55)]"
          >
            Browse case studies
            <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
          </a>
          {workshopCount > 0 && (
            <a
              href="#workshop"
              className="focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Workshop projects
              <ArrowRight className="h-3.5 w-3.5 opacity-60 transition-transform motion-safe:group-hover:translate-x-0.5" />
            </a>
          )}
        </>
      }
      meta={
        <Link
          href="/"
          className="focus-ring text-sm font-medium text-slate-400 transition-colors hover:text-neon-cyan"
        >
          ← Back to hub
        </Link>
      }
    />
  );
}
