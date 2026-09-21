import type { Metadata } from "next";
import { GithubRepos } from "@/components/portfolio/GithubRepos";
import { LocalProjects } from "@/components/portfolio/LocalProjects";
import { PortfolioHero } from "@/components/portfolio/PortfolioHero";
import { PowerBiShowcase } from "@/components/portfolio/PowerBiShowcase";
import { LiveQuestions } from "@/components/hub/LiveQuestions";
import { StoryClose } from "@/components/hub/StoryClose";
import { liveDesks } from "@/content/live-desks";
import { powerBiReports } from "@/content/power-bi-reports";
import { profile as profileDefaults } from "@/content/profile";
import { getPublicProjects } from "@/lib/projects-local";
import { getEditableProfile } from "@/lib/profile-store";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Projects, open-source work from GitHub, Power BI report pages, and live dashboards.",
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioPage() {
  const profile = getEditableProfile();
  const workshop = getPublicProjects();
  const desks = liveDesks.filter((d) => d.status === "live");

  return (
    <div className="space-y-24 sm:space-y-32">
      <PortfolioHero
        workshopCount={workshop.length}
        powerBiCount={powerBiReports.length}
        liveCount={desks.length}
        avatarUrl={profile.avatarUrl}
      />

      <LocalProjects />

      <LiveQuestions
        desks={desks}
        id="live"
        index="02"
        description="One-page desks that refresh at the grain the data actually moves. Screenshots stay in the Power BI lane."
      />

      <PowerBiShowcase reports={powerBiReports} />

      <GithubRepos />

      <StoryClose
        index="05"
        summary={profile.summary}
        contactCta={profileDefaults.contactCta}
      />
    </div>
  );
}
