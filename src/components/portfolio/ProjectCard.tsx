import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";

const accentGlow: Record<NonNullable<Project["accent"]>, string> = {
  cyan: "from-neon-cyan/20",
  violet: "from-neon-violet/20",
  blue: "from-neon-blue/20",
};

export function ProjectCard({ project }: { project: Project }) {
  const accent = project.accent ?? "cyan";

  return (
    <Link href={`/portfolio/${project.slug}`} className="block h-full">
      <GlassCard hover className="group relative h-full overflow-hidden">
        <div
          className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${accentGlow[accent]} to-transparent blur-2xl`}
        />
        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-slate-500">
              {project.year}
            </span>
            <ArrowUpRight className="h-5 w-5 text-slate-500 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neon-cyan" />
          </div>

          <h3 className="mt-3 text-xl font-semibold text-white">
            {project.title}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
            {project.summary}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} tone="neutral">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
