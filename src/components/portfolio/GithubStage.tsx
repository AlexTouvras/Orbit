"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { TitleStage } from "@/components/portfolio/TitleStage";

export type GithubStageRepo = {
  id: number;
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  updated: string;
};

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

export function GithubStage({ repos }: { repos: GithubStageRepo[] }) {
  const [selectedId, setSelectedId] = useState(repos[0]?.id ?? 0);
  const repo = repos.find((item) => item.id === selectedId) ?? repos[0];
  if (!repo) return null;

  const meta = [
    repo.language ?? "Repo",
    `${repo.stars} stars`,
    repo.updated || null,
  ].filter((part): part is string => Boolean(part));

  return (
    <TitleStage
      items={repos.map((item) => ({ id: String(item.id), title: item.name }))}
      selectedId={String(repo.id)}
      onSelect={(id) => setSelectedId(Number(id))}
      listId="github-list"
      tabPrefix="github-tab"
      panelId="github-panel"
      ariaLabel="Repositories"
    >
      <div className="flex min-h-[12rem] flex-col px-4 py-4 sm:px-6 sm:py-6">
        <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-500 sm:tracking-[0.2em]">
          {repo.language ? (
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: languageColor[repo.language] ?? "#64748b",
              }}
              aria-hidden
            />
          ) : null}
          {meta.join(" · ")}
        </p>
        {repo.description ? (
          <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
            {repo.description}
          </p>
        ) : null}
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring mt-auto inline-flex min-h-11 items-center gap-1 self-start pt-4 text-sm font-medium text-neon-cyan sm:min-h-0"
        >
          View repo
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </TitleStage>
  );
}
