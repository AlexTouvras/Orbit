import { getPublicProjects } from "@/lib/projects-local";
import { TitleStageHeader } from "@/components/portfolio/TitleStage";
import { ProjectStage } from "@/components/portfolio/ProjectStage";

export function LocalProjects() {
  const projects = getPublicProjects();
  if (projects.length === 0) return null;

  const ordered = [
    ...projects.filter((p) => p.featured),
    ...projects.filter((p) => !p.featured),
  ];

  return (
    <section id="workshop" className="scroll-mt-28" aria-label="Projects">
      <TitleStageHeader
        index="01"
        eyebrow="Workshop"
        title="Projects"
        description="A live snapshot of projects from my machine — each with its current status."
      />
      <ProjectStage projects={ordered} />
    </section>
  );
}
