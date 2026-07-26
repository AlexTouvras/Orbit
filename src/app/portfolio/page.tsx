import type { Metadata } from "next";
import { GithubRepos } from "@/components/portfolio/GithubRepos";
import { LocalProjects } from "@/components/portfolio/LocalProjects";
import { PortfolioHero } from "@/components/portfolio/PortfolioHero";
import { PowerBiShowcase } from "@/components/portfolio/PowerBiShowcase";
import { powerBiReports } from "@/content/power-bi-reports";
import { getPublicProjects } from "@/lib/projects-local";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Projects, open-source work from GitHub, and Power BI report pages.",
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioPage() {
  const workshop = getPublicProjects();
  const tagCount = new Set(workshop.flatMap((p) => p.tags)).size;

  return (
    <div className="space-y-24 sm:space-y-32">
      <PortfolioHero
        workshopCount={workshop.length}
        tagCount={tagCount}
        powerBiCount={powerBiReports.length}
      />

      <div id="workshop" className="scroll-mt-28">
        <LocalProjects />
      </div>

      <GithubRepos />

      <PowerBiShowcase reports={powerBiReports} />
    </div>
  );
}
