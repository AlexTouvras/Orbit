import Link from "next/link";
import { UserRound } from "lucide-react";
import { profile } from "@/content/profile";
import { Badge } from "@/components/ui/Badge";
import { MissionHero } from "@/components/ui/MissionHero";
import { OrbitSignature } from "@/components/ui/OrbitSignature";

interface AboutHeroProps {
  name: string;
  role: string;
  yearsExperience: string;
  languageCount: number;
  languageHint: string;
  degreeCount: number;
  avatarUrl?: string;
}

function yearsCount(yearsExperience: string): number {
  const n = Number.parseInt(yearsExperience, 10);
  return Number.isFinite(n) ? n : 0;
}

export function AboutHero({
  name,
  role,
  yearsExperience,
  languageCount,
  languageHint,
  degreeCount,
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
      label: "Languages",
      value: String(languageCount),
      countTo: languageCount,
      hint: languageHint,
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
      avatarAlt=""
      title={name}
      titleNote={role}
      headline={{ line: profile.aboutStatement, size: "display" }}
      description={profile.aboutLede.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      stats={stats}
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
