import "server-only";

const DEFAULT_REPO = "AlexTouvras/agentic-ai-field-card";

function githubToken(): string {
  return (
    process.env.FIELD_CARD_GITHUB_TOKEN?.trim() ||
    process.env.GITHUB_TOKEN?.trim() ||
    ""
  );
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "orbit-field-card-approve",
  };
}

function parseRepo(slug: string): { owner: string; repo: string } {
  const [owner, repo] = slug.split("/");
  if (!owner || !repo) throw new Error(`Invalid repo slug: ${slug}`);
  return { owner, repo };
}

export async function getPullRequest(repoSlug: string, pr: number) {
  const token = githubToken();
  if (!token) throw new Error("GITHUB_TOKEN (or FIELD_CARD_GITHUB_TOKEN) is required");
  const { owner, repo } = parseRepo(repoSlug || DEFAULT_REPO);
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pr}`, {
    headers: headers(token),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`GitHub PR fetch failed (${res.status})`);
  }
  return (await res.json()) as {
    number: number;
    title: string;
    html_url: string;
    body: string | null;
    state: string;
    merged: boolean;
    draft?: boolean;
    head: { ref: string; sha: string };
  };
}

/** Fetch a text file from a commit/ref (e.g. PR head SHA). */
export async function getRepoFileText(
  repoSlug: string,
  path: string,
  ref: string,
): Promise<string> {
  const token = githubToken();
  if (!token) throw new Error("GITHUB_TOKEN (or FIELD_CARD_GITHUB_TOKEN) is required");
  const { owner, repo } = parseRepo(repoSlug || DEFAULT_REPO);
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`,
    {
      headers: headers(token),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    throw new Error(`GitHub contents fetch failed (${res.status}) for ${path}@${ref}`);
  }
  const data = (await res.json()) as { encoding?: string; content?: string };
  if (data.encoding !== "base64" || typeof data.content !== "string") {
    throw new Error(`Unexpected contents payload for ${path}`);
  }
  return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8");
}

/** Merge the weekly field-card PR (squash). */
export async function mergeFieldCardPullRequest(repoSlug: string, pr: number) {
  const token = githubToken();
  if (!token) throw new Error("GITHUB_TOKEN (or FIELD_CARD_GITHUB_TOKEN) is required");
  const { owner, repo } = parseRepo(repoSlug || DEFAULT_REPO);

  const existing = await getPullRequest(repoSlug, pr);
  if (existing.merged) return { alreadyMerged: true as const, title: existing.title, url: existing.html_url };
  if (existing.state !== "open") {
    throw new Error(`PR #${pr} is ${existing.state}, not open`);
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pr}/merge`, {
    method: "PUT",
    headers: {
      ...headers(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      commit_title: `chore: approve field card refresh (#${pr})`,
      commit_message: "Approved from Slack #orbit (same gate as weekly Writes).",
      merge_method: "squash",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Merge failed (${res.status}): ${errText.slice(0, 400)}`);
  }

  return { alreadyMerged: false as const, title: existing.title, url: existing.html_url };
}

/** Close the weekly field-card PR without merging (Skip). */
export async function closeFieldCardPullRequest(repoSlug: string, pr: number) {
  const token = githubToken();
  if (!token) throw new Error("GITHUB_TOKEN (or FIELD_CARD_GITHUB_TOKEN) is required");
  const { owner, repo } = parseRepo(repoSlug || DEFAULT_REPO);

  const existing = await getPullRequest(repoSlug, pr);
  if (existing.merged) {
    throw new Error(`PR #${pr} is already merged`);
  }
  if (existing.state !== "open") {
    return { alreadyClosed: true as const, title: existing.title, url: existing.html_url };
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pr}`, {
    method: "PATCH",
    headers: {
      ...headers(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ state: "closed" }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Close failed (${res.status}): ${errText.slice(0, 400)}`);
  }

  return { alreadyClosed: false as const, title: existing.title, url: existing.html_url };
}

/** @deprecated Prefer notifyFieldCardUpdateFyi for weekly update posts. */
export async function notifyFieldCardSlack(text: string, bodyMd: string) {
  const url =
    process.env.SLACK_ORBIT_WEBHOOK_URL?.trim() ||
    process.env.SLACK_WEBHOOK_URL?.trim();
  if (!url) return { ok: false as const, reason: "webhook_missing" };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: bodyMd },
        },
      ],
    }),
  });

  if (!res.ok) {
    return { ok: false as const, reason: `slack_${res.status}` };
  }
  return { ok: true as const };
}
