import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectExplorer } from "@/components/portfolio/ProjectExplorer";
import { GithubRepos } from "@/components/portfolio/GithubRepos";
import { LocalProjects } from "@/components/portfolio/LocalProjects";
import { PortfolioHero } from "@/components/portfolio/PortfolioHero";
import { getAllProjects } from "@/lib/projects";
import { getPublicProjects } from "@/lib/projects-local";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Case studies, agentic AI projects, and data dashboards.",
};

export default function PortfolioPage() {
  const projects = getAllProjects();
  const workshop = getPublicProjects();
  const tagCount = new Set(projects.flatMap((p) => p.tags)).size;

  return (
    <div className="space-y-24 sm:space-y-32">
      <PortfolioHero
        caseStudyCount={projects.length}
        workshopCount={workshop.length}
        tagCount={tagCount}
      />

      <section id="case-studies" className="scroll-mt-28">
        <Reveal>
          <SectionHeading
            eyebrow="Case studies"
            title="Deep dives"
            description="MDX-authored missions with architecture, stack, and outcomes."
          />
        </Reveal>
        <div className="mt-8">
          <ProjectExplorer projects={projects} />
        </div>
      </section>

      <div id="workshop" className="scroll-mt-28">
        <LocalProjects />
      </div>

      <GithubRepos />
    </div>
  );
}
