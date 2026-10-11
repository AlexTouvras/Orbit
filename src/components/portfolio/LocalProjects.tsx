import Link from "next/link";
import { ExternalLink, FolderGit2, LineChart, PenLine } from "lucide-react";
import { getPublicProjects } from "@/lib/projects-local";
import { ChapterMark } from "@/components/story/ChapterMark";
import { ScrollRail, ScrollRailCard } from "@/components/story/ScrollRail";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "./StatusBadge";

function isInternalHref(href: string): boolean {
  return href.startsWith("/");
}

function isWriteHref(href: string): boolean {
  return href.startsWith("/writes/") || href === "/writes";
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function LocalProjects() {
  const projects = getPublicProjects();
  if (projects.length === 0) return null;

  const ordered = [
    ...projects.filter((p) => p.featured),
    ...projects.filter((p) => !p.featured),
  ];

  return (
    <section id="workshop" className="scroll-mt-28">
      <ScrollRail
        fit
        length={ordered.length}
        header={
          <ChapterMark
            index="02"
            eyebrow="Workshop"
            title="Projects"
            description="A live snapshot of projects from my machine — each with its current status."
          />
        }
      >
        {ordered.map((p, i) => {
          const caseStudy =
            p.caseStudyUrl ||
            (p.liveUrl && isWriteHref(p.liveUrl) ? p.liveUrl : "");
          const researchOrLive =
            p.liveUrl && !isWriteHref(p.liveUrl) ? p.liveUrl : "";
          const hasLinks = Boolean(p.repoUrl || researchOrLive || caseStudy);

          return (
            <ScrollRailCard key={p.id} className="h-full min-h-0">
              <article className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-9">
                <p
                  className="story-index absolute right-4 top-2 select-none"
                  aria-hidden
                >
                  {pad(i + 1)}
                </p>
                <div className="shrink-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={p.status} />
                    {p.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} tone="neutral">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="relative mt-4 font-display text-xl font-semibold leading-tight tracking-tight text-white sm:mt-6 sm:text-3xl">
                    {p.name}
                  </h3>
                </div>
                {p.description ? (
                  <p className="mt-3 min-h-0 shrink overflow-hidden text-sm leading-relaxed text-slate-300 sm:mt-4 sm:text-base">
                    {p.description}
                  </p>
                ) : null}
                {hasLinks ? (
                  <div className="mt-auto flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/8 pt-3 text-sm sm:pt-5">
                    {p.repoUrl ? (
                      <a
                        href={p.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-ring inline-flex min-h-11 items-center gap-1.5 text-slate-300 transition-colors hover:text-white sm:min-h-0"
                      >
                        <FolderGit2 className="h-3.5 w-3.5" aria-hidden />
                        Code
                      </a>
                    ) : null}
                    {researchOrLive
                      ? isInternalHref(researchOrLive)
                        ? (
                            <Link
                              href={researchOrLive}
                              className="focus-ring inline-flex min-h-11 items-center gap-1.5 text-slate-300 transition-colors hover:text-white sm:min-h-0"
                            >
                              <LineChart className="h-3.5 w-3.5" aria-hidden />
                              Research
                            </Link>
                          )
                        : (
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
                      : null}
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
              </article>
            </ScrollRailCard>
          );
        })}
      </ScrollRail>
    </section>
  );
}
