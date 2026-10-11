import type { Metadata } from "next";
import { FlagshipTeaser } from "@/components/portfolio/FlagshipTeaser";
import { GithubRepos } from "@/components/portfolio/GithubRepos";
import { LocalProjects } from "@/components/portfolio/LocalProjects";
import { PortfolioHero } from "@/components/portfolio/PortfolioHero";
import { PowerBiShowcase } from "@/components/portfolio/PowerBiShowcase";
import { LiveQuestions } from "@/components/hub/LiveQuestions";
import { liveDesks } from "@/content/live-desks";
import { powerBiReports } from "@/content/power-bi-reports";
import { getPublicProjects } from "@/lib/projects-local";
import { getEditableProfile } from "@/lib/profile-store";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "The projects I decided were worth building, with the requirement still attached.",
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioPage() {
  const profile = getEditableProfile();
  const workshop = getPublicProjects();
  const desks = liveDesks.filter((d) => d.status === "live");

  return (
    <div className="space-y-24 sm:space-y-32">
      <div className="space-y-10 sm:space-y-12">
        <PortfolioHero
          workshopCount={workshop.length}
          powerBiCount={powerBiReports.length}
          liveCount={desks.length}
          avatarUrl={profile.avatarUrl}
        />

        <FlagshipTeaser />
      </div>

      <LocalProjects />

      <LiveQuestions
        desks={desks}
        id="live"
        index="02"
        description="One-page desks that refresh at the grain the data actually moves. Screenshots stay in the Power BI lane."
      />

      <PowerBiShowcase reports={powerBiReports} />

      <GithubRepos />
    </div>
  );
}
