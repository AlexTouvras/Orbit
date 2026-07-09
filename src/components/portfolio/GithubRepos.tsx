import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getGithubRepos } from "@/lib/github";
import { getEditableProfile } from "@/lib/profile-store";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { RepoCard } from "./RepoCard";

export async function GithubRepos() {
  const profile = getEditableProfile();
  const repos = await getGithubRepos(profile.githubUsername);
  if (repos.length === 0) return null;

  const profileUrl = `https://github.com/${profile.githubUsername}`;

  return (
    <section>
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Open source"
            title="From GitHub"
            description="Live from my public repositories, refreshed automatically."
          />
          <Link
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring group inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-medium text-neon-cyan"
          >
            View profile
            <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Reveal>

      <Stagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {repos.map((repo) => (
          <StaggerItem key={repo.id}>
            <RepoCard repo={repo} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
