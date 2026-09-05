import "server-only";

export interface GithubRepoRef {
  owner: string;
  repo: string;
  branch: string;
}

function normalizeToken(value: string | undefined): string {
  if (!value) return "";
  return value.trim().replace(/^["']|["']$/g, "");
}

/** PAT that can read private ops repos. Orbit's GITHUB_TOKEN is often Orbit-only. */
export function opsGithubToken(): string {
  return (
    normalizeToken(process.env.OPS_GITHUB_TOKEN) ||
    // Vercel secret sometimes saved under this short name.
    normalizeToken(process.env.studioweek) ||
    normalizeToken(process.env.STUDIOWEEK) ||
    normalizeToken(process.env.RAVENS_GITHUB_TOKEN) ||
    normalizeToken(process.env.GITHUB_TOKEN)
  );
}

export function parseRepoSlug(
  slug: string,
  fallbackBranch: string,
): GithubRepoRef | null {
  const cleaned = slug.trim().replace(/^https?:\/\/github\.com\//i, "");
  const [owner, repo] = cleaned.split("/");
  if (!owner || !repo) return null;
  return { owner, repo: repo.replace(/\.git$/, ""), branch: fallbackBranch };
}

function githubHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function githubJson<T>(
  url: string,
  token: string,
): Promise<{ ok: true; data: T } | { ok: false; status: number }> {
  const timeoutMs =
    process.env.NODE_ENV === "development" ? 3_000 : 15_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: githubHeaders(token),
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false, status: res.status };
    return { ok: true, data: (await res.json()) as T };
  } catch {
    return { ok: false, status: 0 };
  } finally {
    clearTimeout(timer);
  }
}

function decodeBase64(content: string): string {
  return Buffer.from(content.replace(/\n/g, ""), "base64").toString("utf8");
}

export async function readGithubFile(
  repo: GithubRepoRef,
  filePath: string,
  token: string,
): Promise<{ ok: true; text: string } | { ok: false; status: number }> {
  const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${encodeURI(filePath)}?ref=${encodeURIComponent(repo.branch)}`;
  const result = await githubJson<{ content?: string; encoding?: string }>(
    url,
    token,
  );
  if (!result.ok) return { ok: false, status: result.status };
  if (typeof result.data.content !== "string") {
    return { ok: false, status: 422 };
  }
  return { ok: true, text: decodeBase64(result.data.content) };
}

export async function listGithubDir(
  repo: GithubRepoRef,
  dirPath: string,
  token: string,
): Promise<
  | { ok: true; entries: Array<{ name: string; path: string; type: string }> }
  | { ok: false; status: number }
> {
  const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${encodeURI(dirPath)}?ref=${encodeURIComponent(repo.branch)}`;
  const result = await githubJson<
    Array<{ name?: string; path?: string; type?: string }> | { message?: string }
  >(url, token);
  if (!result.ok) return { ok: false, status: result.status };
  if (!Array.isArray(result.data)) return { ok: false, status: 422 };
  return {
    ok: true,
    entries: result.data
      .map((entry) => ({
        name: entry.name ?? "",
        path: entry.path ?? "",
        type: entry.type ?? "",
      }))
      .filter((entry) => entry.name && entry.path),
  };
}

export function githubBlobUrl(repo: GithubRepoRef, filePath: string): string {
  return `https://github.com/${repo.owner}/${repo.repo}/blob/${repo.branch}/${filePath}`;
}

export async function dispatchRepositoryEvent(
  repo: GithubRepoRef,
  eventType: string,
  clientPayload: Record<string, unknown>,
  token: string,
): Promise<{ ok: true } | { ok: false; status: number; detail: string }> {
  const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/dispatches`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...githubHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: eventType,
        client_payload: clientPayload,
      }),
      cache: "no-store",
      signal: controller.signal,
    });
    if (res.status === 204) return { ok: true };
    const text = await res.text();
    let detail = text.slice(0, 400) || `GitHub dispatch failed (${res.status}).`;
    try {
      const parsed = JSON.parse(text) as { message?: string };
      if (parsed.message) detail = parsed.message;
    } catch {
      /* keep text */
    }
    return { ok: false, status: res.status, detail };
  } catch (err) {
    const message = err instanceof Error ? err.message : "dispatch aborted";
    return { ok: false, status: 0, detail: message };
  } finally {
    clearTimeout(timer);
  }
}

export async function listRepositoryDispatchRuns(
  repo: GithubRepoRef,
  token: string,
): Promise<
  | {
      ok: true;
      runs: Array<{
        status: string;
        conclusion: string | null;
        created_at: string;
        html_url: string;
      }>;
    }
  | { ok: false; status: number }
> {
  const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/actions/runs?event=repository_dispatch&per_page=8`;
  const result = await githubJson<{
    workflow_runs?: Array<{
      status?: string;
      conclusion?: string | null;
      created_at?: string;
      html_url?: string;
    }>;
  }>(url, token);
  if (!result.ok) return { ok: false, status: result.status };
  return {
    ok: true,
    runs: (result.data.workflow_runs ?? []).map((run) => ({
      status: run.status ?? "",
      conclusion: run.conclusion ?? null,
      created_at: run.created_at ?? "",
      html_url: run.html_url ?? "",
    })),
  };
}
