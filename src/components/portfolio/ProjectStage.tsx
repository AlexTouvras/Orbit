"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, FolderGit2, LineChart, PenLine } from "lucide-react";
import type { PublicProject } from "@/lib/project-status";
import { TitleStage } from "@/components/portfolio/TitleStage";
import { StatusBadge } from "@/components/portfolio/StatusBadge";
import { Badge } from "@/components/ui/Badge";

function isInternalHref(href: string): boolean {
  return href.startsWith("/");
}

function isWriteHref(href: string): boolean {
  return href.startsWith("/writes/") || href === "/writes";
}

export function ProjectStage({ projects }: { projects: PublicProject[] }) {
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? "");
  const project =
    projects.find((item) => item.id === selectedId) ?? projects[0];
  if (!project) return null;

  const caseStudy =
    project.caseStudyUrl ||
    (project.liveUrl && isWriteHref(project.liveUrl) ? project.liveUrl : "");
  const researchOrLive =
    project.liveUrl && !isWriteHref(project.liveUrl) ? project.liveUrl : "";
  const hasLinks = Boolean(project.repoUrl || researchOrLive || caseStudy);

  return (
    <TitleStage
      items={projects.map((item) => ({ id: item.id, title: item.name }))}
      selectedId={project.id}
      onSelect={setSelectedId}
      listId="project-list"
      tabPrefix="project-tab"
      panelId="project-panel"
      ariaLabel="Projects"
    >
      <div className="flex min-h-[12rem] flex-col">
        <div className="px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={project.status} />
            {project.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} tone="neutral">
                {tag}
              </Badge>
            ))}
          </div>
          {project.description ? (
            <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
              {project.description}
            </p>
          ) : null}
        </div>
        {hasLinks ? (
          <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-white/10 px-4 py-2 text-sm sm:px-6 sm:py-3">
            {project.repoUrl ? (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring inline-flex min-h-11 items-center gap-1.5 text-slate-300 transition-colors hover:text-white sm:min-h-0"
              >
                <FolderGit2 className="h-3.5 w-3.5" aria-hidden />
                Code
              </a>
            ) : null}
            {researchOrLive ? (
              isInternalHref(researchOrLive) ? (
                <Link
                  href={researchOrLive}
                  className="focus-ring inline-flex min-h-11 items-center gap-1.5 text-slate-300 transition-colors hover:text-white sm:min-h-0"
                >
                  <LineChart className="h-3.5 w-3.5" aria-hidden />
                  Research
                </Link>
              ) : (
                <a
                  href={researchOrLive}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring inline-flex min-h-11 items-center gap-1.5 text-slate-300 transition-colors hover:text-white sm:min-h-0"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  Live
                </a>
              )
            ) : null}
            {caseStudy ? (
              <Link
                href={caseStudy}
                className="focus-ring inline-flex min-h-11 items-center gap-1.5 font-medium text-neon-cyan sm:min-h-0"
              >
                <PenLine className="h-3.5 w-3.5" aria-hidden />
                Case study
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </TitleStage>
  );
}
