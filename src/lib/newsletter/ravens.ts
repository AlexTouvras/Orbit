import matter from "gray-matter";
import type { NewsletterRavenItem } from "@/lib/newsletter/types";

/** Stable ravens domain folders. New domains still flow through; this is display order only. */
export const RAVENS_DOMAIN_ORDER = [
  "ai-agents",
  "data-bi",
  "career",
  "food",
  "fitness",
  "finance",
  "content",
] as const;

export const RAVENS_DOMAIN_LABELS: Record<string, string> = {
  "ai-agents": "AI agents",
  "data-bi": "Data / BI",
  career: "Career",
  food: "Food",
  fitness: "Fitness",
  finance: "Finance",
  content: "Content",
};

const DEFAULT_REPO = "AlexTouvras/ravens";
const HIGHLIGHT_WINDOW_DAYS = 7;
const SUMMARY_MAX = 140;

function normalizeToken(value: string | undefined): string {
  if (!value) return "";
  return value.trim().replace(/^["']|["']$/g, "");
}

function ravensToken(): string {
  return (
    normalizeToken(process.env.RAVENS_GITHUB_TOKEN) ||
    normalizeToken(process.env.GITHUB_TOKEN)
  );
}

function ravensRepo(): { owner: string; repo: string } | null {
  const slug = (process.env.RAVENS_GITHUB_REPO?.trim() || DEFAULT_REPO).replace(
    /^https?:\/\/github\.com\//i,
    "",
  );
  const [owner, repo] = slug.split("/");
  if (!owner || !repo) return null;
  return { owner, repo };
}

function githubHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function asString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(asString).filter(Boolean);
}

function snippet(text: string, max = SUMMARY_MAX): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

function ymdUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysAgo(iso: string, days: number, now: Date): boolean {
  const t = Date.parse(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(t)) return false;
  return now.getTime() - t <= days * 24 * 60 * 60 * 1000;
}

function publicHref(url: string): string | undefined {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return undefined;
  if (/github\.com\/[^/]+\/ravens(\/|$)/i.test(trimmed)) return undefined;
  return trimmed;
}

function firstPublicUrl(text: string): string | undefined {
  const match = text.match(/https?:\/\/[^\s)\]>'"]+/i);
  return match ? publicHref(match[0].replace(/[.,;]+$/, "")) : undefined;
}

function markdownSection(markdown: string, heading: string): string {
  const re = new RegExp(
    `^##\\s+${heading}\\s*\\n([\\s\\S]*?)(?=^##\\s+|$)`,
    "im",
  );
  return markdown.match(re)?.[1]?.trim() ?? "";
}

function decodeBase64(content: string): string {
  return Buffer.from(content.replace(/\n/g, ""), "base64").toString("utf8");
}

async function githubJson<T>(
  url: string,
  token: string,
): Promise<{ ok: true; data: T } | { ok: false; status: number }> {
  const res = await fetch(url, {
    headers: githubHeaders(token),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    return { ok: false, status: res.status };
  }
  return { ok: true, data: (await res.json()) as T };
}

async function fetchFile(
  owner: string,
  repo: string,
  path: string,
  token: string,
): Promise<string | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURI(path)}`;
  const result = await githubJson<{ content?: string }>(url, token);
  if (!result.ok || typeof result.data.content !== "string") return null;
  return decodeBase64(result.data.content);
}

function parseInboxFindings(
  markdown: string,
  fileDate: string,
): Array<NewsletterRavenItem & { findingId: string }> {
  const items: Array<NewsletterRavenItem & { findingId: string }> = [];
  const parts = markdown.split(/^####\s+(FIND-\d{8}-\d+)\s*$/m);
  for (let i = 1; i < parts.length; i += 2) {
    const findingId = parts[i];
    const body = parts[i + 1] ?? "";
    const field = (name: string): string => {
      const match = body.match(
        new RegExp(`^-\\s*\\*\\*${name}:\\*\\*\\s*(.*)$`, "im"),
      );
      return (match?.[1] ?? "").trim();
    };
    const title = field("title");
    if (!title) continue;
    const domain = field("domain") || "other";
    const claim = field("claim") || field("why_it_matters");
    items.push({
      kind: "inbox",
      domain,
      title,
      summary: snippet(claim),
      href: publicHref(field("source_url")),
      sourceTitle: field("source_title") || undefined,
      id: findingId,
      date: field("published") !== "unknown" ? field("published") || fileDate : fileDate,
      findingId,
    });
  }
  return items;
}

function parseKnowledge(
  markdown: string,
  path: string,
  now: Date,
): (NewsletterRavenItem & { sourceFindings: string[] }) | null {
  const parsed = matter(markdown);
  const data = parsed.data as Record<string, unknown>;
  if (asString(data.status).toLowerCase() !== "active") return null;
  const updated = asString(data.updated) || asString(data.created);
  if (!updated || !daysAgo(updated, HIGHLIGHT_WINDOW_DAYS, now)) return null;

  const title = asString(data.title);
  if (!title) return null;

  const domainFromPath = path.split("/")[1] ?? "";
  const domain = asString(data.domain) || domainFromPath;
  const sources = Array.isArray(data.canonical_sources)
    ? data.canonical_sources
    : [];
  const firstSource = sources[0] as { url?: unknown; title?: unknown } | undefined;
  const guidance = markdownSection(parsed.content, "Guidance");
  const bullets = guidance
    .split("\n")
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");

  return {
    kind: "knowledge",
    domain,
    title,
    summary: snippet(bullets || guidance),
    href: publicHref(asString(firstSource?.url)),
    sourceTitle: asString(firstSource?.title) || undefined,
    id: asString(data.id) || undefined,
    date: updated,
    sourceFindings: asStringList(data.source_findings),
  };
}

function parseSignal(
  markdown: string,
  now: Date,
): (NewsletterRavenItem & { sourceFindings: string[] }) | null {
  const parsed = matter(markdown);
  const data = parsed.data as Record<string, unknown>;
  if (asString(data.status).toLowerCase() !== "watching") return null;
  const expires = asString(data.expires);
  if (expires && expires < ymdUtc(now)) return null;
  const opened = asString(data.opened);
  if (!opened || !daysAgo(opened, HIGHLIGHT_WINDOW_DAYS, now)) return null;

  const title = asString(data.title);
  if (!title) return null;

  const why = markdownSection(parsed.content, "Why open");
  return {
    kind: "signal",
    domain: asString(data.domain) || "other",
    title,
    summary: snippet(why),
    href: firstPublicUrl(parsed.content),
    id: asString(data.id) || undefined,
    date: asString(data.opened) || undefined,
    priority: asString(data.priority) || undefined,
    sourceFindings: asStringList(data.source_findings),
  };
}

function kindRank(kind: NewsletterRavenItem["kind"]): number {
  if (kind === "knowledge") return 0;
  if (kind === "signal") return 1;
  return 2;
}

/** Prefer this week's finding over a watch item or a durable note. */
function highlightKindRank(kind: NewsletterRavenItem["kind"]): number {
  if (kind === "inbox") return 0;
  if (kind === "signal") return 1;
  return 2;
}

/** One item per domain — highlights, not the whole vault. */
export function pickWeeklyHighlights(
  items: NewsletterRavenItem[],
): NewsletterRavenItem[] {
  const byDomain = new Map<string, NewsletterRavenItem[]>();
  for (const item of items) {
    const list = byDomain.get(item.domain) ?? [];
    list.push(item);
    byDomain.set(item.domain, list);
  }

  const order: string[] = [...RAVENS_DOMAIN_ORDER];
  for (const domain of byDomain.keys()) {
    if (!order.includes(domain)) order.push(domain);
  }

  const picked: NewsletterRavenItem[] = [];
  for (const domain of order) {
    const list = byDomain.get(domain);
    if (!list?.length) continue;
    list.sort((a, b) => {
      const kind = highlightKindRank(a.kind) - highlightKindRank(b.kind);
      if (kind !== 0) return kind;
      return (b.date ?? "").localeCompare(a.date ?? "");
    });
    picked.push(list[0]);
  }
  return picked;
}

export function sortRavensItems(
  items: NewsletterRavenItem[],
): NewsletterRavenItem[] {
  const domainRank = new Map(
    RAVENS_DOMAIN_ORDER.map((domain, index) => [domain, index]),
  );
  return [...items].sort((a, b) => {
    const da = domainRank.get(a.domain as (typeof RAVENS_DOMAIN_ORDER)[number]);
    const db = domainRank.get(b.domain as (typeof RAVENS_DOMAIN_ORDER)[number]);
    const ra = da ?? RAVENS_DOMAIN_ORDER.length;
    const rb = db ?? RAVENS_DOMAIN_ORDER.length;
    if (ra !== rb) return ra - rb;
    if (a.domain !== b.domain) return a.domain.localeCompare(b.domain);
    const ka = kindRank(a.kind);
    const kb = kindRank(b.kind);
    if (ka !== kb) return ka - kb;
    return (b.date ?? "").localeCompare(a.date ?? "");
  });
}

export function groupRavensByDomain(
  items: NewsletterRavenItem[],
): Array<{ domain: string; label: string; items: NewsletterRavenItem[] }> {
  const grouped = new Map<string, NewsletterRavenItem[]>();
  for (const item of sortRavensItems(items)) {
    const list = grouped.get(item.domain) ?? [];
    list.push(item);
    grouped.set(item.domain, list);
  }
  return [...grouped.entries()].map(([domain, groupedItems]) => ({
    domain,
    label: RAVENS_DOMAIN_LABELS[domain] ?? domain,
    items: groupedItems,
  }));
}

/**
 * This week's highlight per domain (inbox first, then a new watch/note).
 * No domain allowlist. Fail-soft: [] if the token cannot read ravens.
 */
export async function fetchRavensForDigest(
  now = new Date(),
): Promise<NewsletterRavenItem[]> {
  const token = ravensToken();
  const repo = ravensRepo();
  if (!token || !repo) {
    console.warn(
      "[newsletter/ravens] RAVENS_GITHUB_TOKEN (or GITHUB_TOKEN) unset — skipping ravens section.",
    );
    return [];
  }

  try {
    const treeUrl = `https://api.github.com/repos/${repo.owner}/${repo.repo}/git/trees/main?recursive=1`;
    const tree = await githubJson<{
      truncated?: boolean;
      tree?: Array<{ path?: string; type?: string }>;
    }>(treeUrl, token);

    if (!tree.ok) {
      console.warn(
        `[newsletter/ravens] tree fetch failed (${tree.status}). Need contents:read on ${repo.owner}/${repo.repo}.`,
      );
      return [];
    }

    if (tree.data.truncated) {
      console.warn("[newsletter/ravens] git tree truncated; some notes may be missing.");
    }

    const paths = (tree.data.tree ?? [])
      .map((node) => node.path ?? "")
      .filter(Boolean);

    const inboxPaths = paths.filter((path) => {
      const match = path.match(/^inbox\/(\d{4}-\d{2}-\d{2})\.md$/);
      return match ? daysAgo(match[1], HIGHLIGHT_WINDOW_DAYS, now) : false;
    });
    const knowledgePaths = paths.filter(
      (path) =>
        /^knowledge\/[^/]+\/[^/]+\.md$/.test(path) &&
        !path.endsWith("/README.md"),
    );
    const signalPaths = paths.filter((path) =>
      /^signals\/SIG-\d{8}-\d+\.md$/.test(path),
    );

    const load = async (path: string): Promise<{ path: string; text: string } | null> => {
      const text = await fetchFile(repo.owner, repo.repo, path, token);
      return text ? { path, text } : null;
    };

    const [inboxFiles, knowledgeFiles, signalFiles] = await Promise.all([
      Promise.all(inboxPaths.map(load)),
      Promise.all(knowledgePaths.map(load)),
      Promise.all(signalPaths.map(load)),
    ]);

    const promoted = new Set<string>();
    const knowledge: NewsletterRavenItem[] = [];
    for (const file of knowledgeFiles) {
      if (!file) continue;
      const item = parseKnowledge(file.text, file.path, now);
      if (!item) continue;
      item.sourceFindings.forEach((id) => promoted.add(id));
      knowledge.push({
        kind: item.kind,
        domain: item.domain,
        title: item.title,
        summary: item.summary,
        href: item.href,
        sourceTitle: item.sourceTitle,
        id: item.id,
        date: item.date,
      });
    }

    const signals: NewsletterRavenItem[] = [];
    for (const file of signalFiles) {
      if (!file) continue;
      const item = parseSignal(file.text, now);
      if (!item) continue;
      item.sourceFindings.forEach((id) => promoted.add(id));
      signals.push({
        kind: item.kind,
        domain: item.domain,
        title: item.title,
        summary: item.summary,
        href: item.href,
        id: item.id,
        date: item.date,
        priority: item.priority,
      });
    }

    const inbox: NewsletterRavenItem[] = [];
    for (const file of inboxFiles) {
      if (!file) continue;
      const fileDate = file.path.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? "";
      for (const item of parseInboxFindings(file.text, fileDate)) {
        if (promoted.has(item.findingId)) continue;
        inbox.push({
          kind: item.kind,
          domain: item.domain,
          title: item.title,
          summary: item.summary,
          href: item.href,
          sourceTitle: item.sourceTitle,
          id: item.id,
          date: item.date,
        });
      }
    }

    return pickWeeklyHighlights([...knowledge, ...signals, ...inbox]);
  } catch (err) {
    console.warn("[newsletter/ravens] fetch failed:", err);
    return [];
  }
}
