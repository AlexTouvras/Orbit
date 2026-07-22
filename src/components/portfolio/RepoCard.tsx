import { Star, GitFork } from "lucide-react";
import type { GithubRepo } from "@/lib/github";
import { GlassCard } from "@/components/ui/GlassCard";
import { GithubIcon } from "@/components/ui/BrandIcons";

// A few common language accent colors; falls back to slate.
const languageColor: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  "C#": "#178600",
  Ruby: "#701516",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
};

export function RepoCard({ repo }: { repo: GithubRepo }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-ring block h-full rounded-2xl"
    >
      <GlassCard hover className="group flex h-full flex-col">
        <div className="flex items-center gap-2">
          <GithubIcon className="h-4 w-4 text-slate-400 transition-colors group-hover:text-neon-cyan" />
          <span className="truncate font-mono text-sm font-medium text-white">
            {repo.name}
          </span>
        </div>

        {repo.description ? (
          <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-300 line-clamp-3">
            {repo.description}
          </p>
        ) : (
          <p className="mt-3 flex-1 text-sm italic leading-relaxed text-slate-500">
            No description on GitHub.
          </p>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
          {repo.language && (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: languageColor[repo.language] ?? "#64748b" }}
              />
              {repo.language}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            {repo.stars}
          </span>
          <span className="inline-flex items-center gap-1">
            <GitFork className="h-3.5 w-3.5" />
            {repo.forks}
          </span>
        </div>
      </GlassCard>
    </a>
  );
}
