import "server-only";
import { ymdInIsoWeek } from "@/lib/iso-week";
import type { NewsletterRavenItem } from "@/lib/newsletter/types";
import {
  listGithubDir,
  opsGithubToken,
  parseRepoSlug,
  readGithubFile,
} from "@/lib/week-log/github";
import { listLocalDir, readLocalFile, siblingRoot } from "@/lib/week-log/local";
import type { WeekLane } from "@/lib/week-log/types";

function ravensRepo() {
  return parseRepoSlug(
    process.env.RAVENS_GITHUB_REPO?.trim() || "AlexTouvras/ravens",
    process.env.RAVENS_GITHUB_BRANCH?.trim() || "main",
  );
}

function snippet(text: string, max = 180): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

function parseInboxFindings(
  markdown: string,
  fileDate: string,
): NewsletterRavenItem[] {
  const items: NewsletterRavenItem[] = [];
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
    const href = field("source_url").trim();
    items.push({
      kind: "inbox",
      domain: field("domain") || "other",
      title,
      summary: snippet(field("claim") || field("why_it_matters")),
      href: /^https?:\/\//i.test(href) ? href : undefined,
      sourceTitle: field("source_title") || undefined,
      id: findingId,
      date: fileDate,
    });
  }
  return items;
}

async function listInbox(): Promise<Array<{ name: string; path: string; via: "github" | "local" }>> {
  const token = opsGithubToken();
  const repo = ravensRepo();
  const files: Array<{ name: string; path: string; via: "github" | "local" }> = [];

  if (token && repo) {
    const remote = await listGithubDir(repo, "inbox", token);
    if (remote.ok) {
      for (const entry of remote.entries) {
        if (entry.type === "file" && /^\d{4}-\d{2}-\d{2}\.md$/.test(entry.name)) {
          files.push({ name: entry.name, path: entry.path, via: "github" });
        }
      }
    }
  }

  const local = listLocalDir(siblingRoot("ravens"), "inbox");
  if (local) {
    for (const entry of local) {
      if (entry.type === "file" && /^\d{4}-\d{2}-\d{2}\.md$/.test(entry.name)) {
        if (!files.some((file) => file.path === entry.path)) {
          files.push({ name: entry.name, path: entry.path, via: "local" });
        }
      }
    }
  }

  return files;
}

async function readInbox(path: string, via: "github" | "local"): Promise<string | null> {
  if (via === "local") return readLocalFile(siblingRoot("ravens"), path);
  const token = opsGithubToken();
  const repo = ravensRepo();
  if (token && repo) {
    const remote = await readGithubFile(repo, path, token);
    if (remote.ok) return remote.text;
  }
  return readLocalFile(siblingRoot("ravens"), path);
}

export async function loadRavensWeek(
  weekId: string,
): Promise<WeekLane<NewsletterRavenItem[]>> {
  const files = await listInbox();
  const inWeek = files.filter((file) => {
    const ymd = file.name.replace(/\.md$/i, "");
    return ymdInIsoWeek(ymd, weekId);
  });

  if (inWeek.length === 0) {
    return {
      status: "empty",
      detail: `No Huginn inbox files dated ${weekId}.`,
      source: "ravens/inbox",
      data: [],
    };
  }

  const items: NewsletterRavenItem[] = [];
  for (const file of inWeek.sort((a, b) => b.name.localeCompare(a.name))) {
    const text = await readInbox(file.path, file.via);
    if (!text) continue;
    const ymd = file.name.replace(/\.md$/i, "");
    items.push(...parseInboxFindings(text, ymd));
  }

  if (items.length === 0) {
    return {
      status: "empty",
      detail: `Inbox files for ${weekId} had no FIND entries.`,
      source: "ravens/inbox",
      data: [],
    };
  }

  return {
    status: "ok",
    source: "ravens/inbox",
    data: items,
  };
}
