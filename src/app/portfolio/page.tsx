import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectExplorer } from "@/components/portfolio/ProjectExplorer";
import { GithubRepos } from "@/components/portfolio/GithubRepos";
import { LocalProjects } from "@/components/portfolio/LocalProjects";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Case studies, agentic AI projects, and data dashboards.",
};

export default function PortfolioPage() {
  const projects = getAllProjects();

  return (
    <div>
      <Reveal>
        <SectionHeading
          eyebrow="Portfolio bank"
          title="Missions & case studies"
          description="Agentic AI systems, automation pipelines, and data platforms I've designed and shipped. Filter by focus area."
        />
      </Reveal>

      <div className="mt-10">
        <ProjectExplorer projects={projects} />
      </div>

      <LocalProjects />

      <GithubRepos />
    </div>
  );
}
