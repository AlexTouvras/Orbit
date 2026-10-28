import { getGithubRepos } from "@/lib/github";
import { getEditableProfile } from "@/lib/profile-store";
import { GithubStage } from "@/components/portfolio/GithubStage";
import { TitleStageHeader } from "@/components/portfolio/TitleStage";
import { relativeTime } from "@/lib/utils";

export async function GithubRepos() {
  const profile = getEditableProfile();
  const repos = await getGithubRepos(
    profile.githubUsername,
    6,
    profile.githubRepoAllowlist,
  );
  if (repos.length === 0) return null;

  const profileUrl = `https://github.com/${profile.githubUsername}`;

  return (
    <section id="github" className="scroll-mt-28" aria-label="GitHub">
      <TitleStageHeader
        index="04"
        eyebrow="Open source"
        title="GitHub"
        description="Live from my public repositories, refreshed automatically."
        action={{ href: profileUrl, label: "View profile", external: true }}
      />
      <GithubStage
        repos={repos.map((repo) => ({
          id: repo.id,
          name: repo.name,
          description: repo.description,
          url: repo.url,
          language: repo.language,
          stars: repo.stars,
          updated: relativeTime(repo.pushedAt),
        }))}
      />
    </section>
  );
}
