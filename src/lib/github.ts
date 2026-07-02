export interface GithubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  pushedAt: string | null;
}

interface RawRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
  pushed_at: string | null;
  fork: boolean;
  archived: boolean;
}

const REVALIDATE_SECONDS = 3600; // cache repo data for an hour

/**
 * Fetch a user's public repositories, newest activity first, excluding forks
 * and archived repos. Cached at the data layer via Next's fetch revalidation,
 * so the GitHub API is hit at most once per hour regardless of traffic.
 *
 * Fails soft: returns [] on any error so the page never breaks.
 */
export async function getGithubRepos(
  username: string,
  limit = 6,
): Promise<GithubRepo[]> {
  if (!username || username === "yourhandle") return [];

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(
        username,
      )}/repos?per_page=100&sort=updated`,
      { headers, next: { revalidate: REVALIDATE_SECONDS } },
    );

    if (!res.ok) {
      console.warn(`[github] repo fetch failed: ${res.status} ${res.statusText}`);
      return [];
    }

    const raw = (await res.json()) as RawRepo[];
    if (!Array.isArray(raw)) return [];

    return raw
      .filter((r) => !r.fork && !r.archived)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, limit)
      .map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        url: r.html_url,
        homepage: r.homepage,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        topics: r.topics ?? [],
        pushedAt: r.pushed_at,
      }));
  } catch (err) {
    console.warn(
      "[github] repo fetch error:",
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}
