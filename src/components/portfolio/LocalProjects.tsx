import Link from "next/link";
import { FolderGit2, ExternalLink, PenLine } from "lucide-react";
import { getPublicProjects } from "@/lib/projects-local";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { StatusBadge } from "./StatusBadge";

function isInternalHref(href: string): boolean {
  return href.startsWith("/");
}

export function LocalProjects() {
  const projects = getPublicProjects();
  if (projects.length === 0) return null;

  return (
    <section id="projects" className="scroll-mt-28">
      <Reveal>
        <SectionHeading
          eyebrow="Local work"
          title="Projects"
          description="A live snapshot of projects from my machine — each with its current status."
        />
      </Reveal>

      <Stagger className="mt-8 grid gap-6 sm:grid-cols-2">
        {projects.map((p) => {
          const hasLinks = Boolean(p.repoUrl || p.liveUrl);
          return (
            <StaggerItem key={p.id}>
              <GlassCard className="flex h-full flex-col p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="mr-auto text-lg font-semibold text-white">
                    {p.name}
                  </h3>
                  <StatusBadge status={p.status} />
                </div>

                {p.description && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {p.description}
                  </p>
                )}

                {p.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <Badge key={t} tone="neutral">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}

                {hasLinks && (
                  <div className="mt-4 flex flex-wrap gap-4 border-t border-white/5 pt-4 text-sm">
                    {p.repoUrl && (
                      <a
                        href={p.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-ring inline-flex min-h-11 items-center gap-1.5 text-slate-300 transition-colors hover:text-neon-cyan"
                      >
                        <FolderGit2 className="h-4 w-4" aria-hidden />
                        Code
                      </a>
                    )}
                    {p.liveUrl &&
                      (isInternalHref(p.liveUrl) ? (
                        <Link
                          href={p.liveUrl}
                          className="focus-ring inline-flex min-h-11 items-center gap-1.5 text-slate-300 transition-colors hover:text-neon-cyan"
                        >
                          <PenLine className="h-4 w-4" aria-hidden />
                          Case study
                        </Link>
                      ) : (
                        <a
                          href={p.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="focus-ring inline-flex min-h-11 items-center gap-1.5 text-slate-300 transition-colors hover:text-neon-cyan"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden />
                          Live
                        </a>
                      ))}
                  </div>
                )}
              </GlassCard>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
