import Link from "next/link";
import { ArrowRight, Download, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MissionHero } from "@/components/ui/MissionHero";
import { OrbitSignature } from "@/components/ui/OrbitSignature";

interface AboutHeroProps {
  yearsExperience: string;
  employerCount: number;
  degreeCount: number;
  resumeUrl?: string;
}

export function AboutHero({
  yearsExperience,
  employerCount,
  degreeCount,
  resumeUrl,
}: AboutHeroProps) {
  const stats = [
    { label: "Experience", value: yearsExperience },
    { label: "Employers", value: String(employerCount) },
    { label: "Degrees", value: String(degreeCount) },
  ];

  return (
    <MissionHero
      signature={<OrbitSignature variant="blue" duration="100s" />}
      badge={
        <Badge tone="blue" className="mb-8">
          <UserRound className="mr-1.5 h-3.5 w-3.5" />
          Background dossier
        </Badge>
      }
      title="Background & experience"
      subtitle="Nordic banking, credit risk, and technology delivery"
      description="From PD models and portfolio steering to leading Azure application operations — with a growing focus on AI automation and agent systems."
      stats={stats}
      actions={
        <>
          <a
            href="#experience"
            className="focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl bg-neon-cyan px-5 py-3 text-sm font-semibold text-void shadow-glow transition-[transform,box-shadow] active:scale-[0.98] motion-safe:hover:shadow-[0_0_32px_-4px_rgba(34,211,238,0.55)]"
          >
            View experience
            <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
          </a>
          {resumeUrl && (
            <a
              href={resumeUrl}
              className="focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-[transform,border-color,color] active:scale-[0.98] hover:border-neon-cyan/50 hover:text-neon-cyan"
            >
              <Download className="h-4 w-4" />
              Download CV
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
