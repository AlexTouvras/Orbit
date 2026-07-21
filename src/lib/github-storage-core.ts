const DEFAULT_REPO = "AlexTouvras/Orbit";

interface RepoConfig {
  token: string;
  owner: string;
  repo: string;
}

function normalizeToken(value: string | undefined): string {
  if (!value) return "";
  return value.trim().replace(/^["']|["']$/g, "");
}

function getRepoConfig(): RepoConfig | null {
  const token = normalizeToken(process.env.GITHUB_TOKEN);
  if (!token) return null;

  const slug = process.env.GITHUB_REPO?.trim() || DEFAULT_REPO;
  const [owner, repo] = slug.split("/");
  if (!owner || !repo) return null;

  return { token, owner, repo };
}

function githubHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

/** True when Studio should persist via GitHub commits (Vercel / serverless). */
export function hasGithubStorage(): boolean {
  return getRepoConfig() !== null;
}

/** Read a UTF-8 file from the connected GitHub repo. */
export async function readRepoFile(filePath: string): Promise<string | null> {
  const cfg = getRepoConfig();
  if (!cfg) return null;

  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${filePath}`;
  const res = await fetch(url, {
    headers: githubHeaders(cfg.token),
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    console.error(`[github] read ${filePath}:`, await res.text());
    return null;
  }

  const data = (await res.json()) as { content?: string };
  if (typeof data.content !== "string") return null;
  return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8");
}

/** Commit a UTF-8 file to the connected GitHub repo (create or update). */
export async function writeRepoFile(
  filePath: string,
  content: string,
  message: string,
): Promise<void> {
  const cfg = getRepoConfig();
  if (!cfg) {
    throw new Error("GITHUB_TOKEN is not configured.");
  }

  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${filePath}`;

  let sha: string | undefined;
  const existing = await fetch(url, { headers: githubHeaders(cfg.token) });
  if (existing.ok) {
    const data = (await existing.json()) as { sha?: string };
    sha = data.sha;
  }

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      ...githubHeaders(cfg.token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      sha,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[github] write ${filePath}:`, errText);
    let detail = "GitHub could not save the file.";
    try {
      const parsed = JSON.parse(errText) as { message?: string };
      if (parsed.message) detail = parsed.message;
    } catch {
      /* keep default */
    }
    throw new Error(detail);
  }
}
