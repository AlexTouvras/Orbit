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
    <section className="mt-24">
      <Reveal>
        <div className="flex items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Open source"
            title="From GitHub"
            description="Live from my public repositories, refreshed automatically."
          />
          <Link
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group hidden items-center gap-1 whitespace-nowrap text-sm font-medium text-neon-cyan sm:inline-flex"
          >
            View profile
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Reveal>

      <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {repos.map((repo) => (
          <StaggerItem key={repo.id}>
            <RepoCard repo={repo} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
