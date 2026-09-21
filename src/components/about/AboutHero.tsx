import Link from "next/link";
import { ArrowRight, Download, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MissionHero } from "@/components/ui/MissionHero";
import { OrbitSignature } from "@/components/ui/OrbitSignature";

interface AboutHeroProps {
  name: string;
  yearsExperience: string;
  employerCount: number;
  degreeCount: number;
  resumeUrl?: string;
  avatarUrl?: string;
}

function yearsCount(yearsExperience: string): number {
  const n = Number.parseInt(yearsExperience, 10);
  return Number.isFinite(n) ? n : 0;
}

export function AboutHero({
  name,
  yearsExperience,
  employerCount,
  degreeCount,
  resumeUrl,
  avatarUrl,
}: AboutHeroProps) {
  const years = yearsCount(yearsExperience);
  const stats = [
    {
      label: "Experience",
      value: yearsExperience,
      countTo: years || undefined,
      suffix: yearsExperience.includes("+") ? "+" : "",
    },
    {
      label: "Employers",
      value: String(employerCount),
      countTo: employerCount,
    },
    {
      label: "Degrees",
      value: String(degreeCount),
      countTo: degreeCount,
    },
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
      avatarUrl={avatarUrl}
      avatarHref="/card"
      avatarHrefLabel="Open identity HUD"
      avatarAlt=""
      title={name}
      subtitle="Background & experience"
      description="From PD models and portfolio steering to leading Azure application operations — with a growing focus on AI automation and agent systems."
      stats={stats}
      actions={
        <>
          <a
            href="#experience"
            className="focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl bg-neon-cyan px-5 py-3 text-sm font-semibold text-void shadow-glow transition-[transform,box-shadow] active:scale-[0.98] motion-safe:hover:shadow-glow"
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
