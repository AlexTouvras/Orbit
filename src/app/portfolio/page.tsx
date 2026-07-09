import type { Metadata } from "next";
import { GithubRepos } from "@/components/portfolio/GithubRepos";
import { LocalProjects } from "@/components/portfolio/LocalProjects";
import { PortfolioHero } from "@/components/portfolio/PortfolioHero";
import { getPublicProjects } from "@/lib/projects-local";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Workshop projects and open-source work from GitHub.",
};

export default function PortfolioPage() {
  const workshop = getPublicProjects();
  const tagCount = new Set(workshop.flatMap((p) => p.tags)).size;

  return (
    <div className="space-y-24 sm:space-y-32">
      <PortfolioHero workshopCount={workshop.length} tagCount={tagCount} />

      <div id="workshop" className="scroll-mt-28">
        <LocalProjects />
      </div>

      <GithubRepos />
    </div>
  );
}
