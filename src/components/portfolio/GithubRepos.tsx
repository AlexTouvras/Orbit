import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getGithubRepos } from "@/lib/github";
import { getEditableProfile } from "@/lib/profile-store";
import { ChapterMark } from "@/components/story/ChapterMark";
import { ScrollSpot } from "@/components/story/ScrollSpot";
import { relativeTime } from "@/lib/utils";

const languageColor: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  "C#": "#178600",
  Ruby: "#701516",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
};

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
    <section id="github" className="scroll-mt-28">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <ChapterMark
          index="05"
          eyebrow="Open source"
          title="GitHub"
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

      <ul className="mt-12 border-t border-white/10">
        {repos.map((repo) => {
          const updated = relativeTime(repo.pushedAt);
          return (
            <li key={repo.id} className="border-b border-white/10">
              <ScrollSpot>
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring group grid gap-3 py-7 sm:grid-cols-[7.5rem_1fr_auto] sm:items-baseline sm:gap-8"
              >
                <span className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-slate-500">
                  {repo.language ? (
                    <>
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            languageColor[repo.language] ?? "#64748b",
                        }}
                        aria-hidden
                      />
                      {repo.language}
                    </>
                  ) : (
                    "Repo"
                  )}
                </span>
                <span>
                  <span className="block font-display text-xl font-semibold tracking-tight text-white transition-colors group-hover:text-neon-cyan sm:text-2xl">
                    {repo.name}
                  </span>
                  {repo.description ? (
                    <span className="mt-2 block max-w-2xl text-sm leading-relaxed text-slate-400">
                      {repo.description}
                    </span>
                  ) : null}
                </span>
                <span className="inline-flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
                  {repo.stars} stars
                  {updated ? <span>{updated}</span> : null}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:translate-x-0.5" />
                </span>
              </a>
              </ScrollSpot>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
