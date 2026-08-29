import "server-only";
import { ymdInIsoWeek } from "@/lib/iso-week";
import {
  githubBlobUrl,
  listGithubDir,
  opsGithubToken,
  parseRepoSlug,
  readGithubFile,
} from "@/lib/week-log/github";
import { listLocalDir, readLocalFile, siblingRoot } from "@/lib/week-log/local";
import {
  cellLink,
  firstMarkdownParagraph,
  markdownSection,
  parseMarkdownTable,
} from "@/lib/week-log/markdown";
import type { CareerOffer, CareerWeek, WeekLane } from "@/lib/week-log/types";

const APPLY_CAP = 12;

function careeropsRepo() {
  return parseRepoSlug(
    process.env.CAREEROPS_GITHUB_REPO?.trim() || "AlexTouvras/careerops-private",
    process.env.CAREEROPS_GITHUB_BRANCH?.trim() || "main",
  );
}

function ymdFromName(name: string, pattern: RegExp): string | null {
  const match = name.match(pattern);
  return match?.[1] ?? null;
}

function parseOffers(block: string, bandFallback = ""): CareerOffer[] {
  const table = parseMarkdownTable(block);
  if (table.rows.length === 0) return [];
  const scoreIdx = table.headers.findIndex((h) => /score/i.test(h));
  const bandIdx = table.headers.findIndex((h) => /band/i.test(h));
  const companyIdx = table.headers.findIndex((h) => /company/i.test(h));
  const roleIdx = table.headers.findIndex((h) => /role/i.test(h));
  return table.rows.slice(0, APPLY_CAP).map((row) => {
    const roleCell = cellLink(row[roleIdx >= 0 ? roleIdx : row.length - 1] ?? "");
    return {
      score: (row[scoreIdx >= 0 ? scoreIdx : 0] ?? "").replace(/~/g, "").trim(),
      band: (row[bandIdx] ?? bandFallback).trim(),
      company: row[companyIdx >= 0 ? companyIdx : 1] ?? "",
      role: roleCell.text.replace(/\s·\s*\[apply\].*$/i, "").trim(),
      href: roleCell.href,
    };
  });
}

function parseDigest(markdown: string, title: string): CareerWeek {
  const scanDate =
    markdown.match(/\*\*Scan date:\*\*\s*(\d{4}-\d{2}-\d{2})/i)?.[1] ?? null;
  const newOffers =
    markdown.match(/\*\*New offers:\*\*\s*([^\n]+)/i)?.[1]?.trim() ?? null;
  const summaryTable = parseMarkdownTable(markdownSection(markdown, "Scan summary"));
  const metrics = summaryTable.rows.map((row) => ({
    label: row[0] ?? "",
    value: row[1] ?? "",
  }));
  const headline =
    markdown.match(/\*\*Headline:\*\*\s*([^\n]+)/i)?.[1]?.trim() ||
    firstMarkdownParagraph(markdownSection(markdown, "What's new this week")) ||
    null;

  const newRows = parseOffers(markdownSection(markdown, "What's new this week"));
  const applyNow = parseOffers(
    markdownSection(markdown, "Ready to submit") ||
      markdownSection(markdown, "Apply shortlist"),
    "apply",
  );
  const stillOpen = parseOffers(
    markdownSection(markdown, "Still worth applying"),
    "apply",
  );

  return {
    title,
    scanDate,
    newOffers,
    headline,
    metrics,
    applyNow,
    stillOpen,
    newThisWeek: newRows.filter((row) => /apply|review/i.test(row.band)),
  };
}

type DatedFile = { path: string; ymd: string; via: "github" | "local" };

function datedFrom(
  entries: Array<{ name: string; path: string; type: string }>,
  pattern: RegExp,
  via: "github" | "local",
): DatedFile[] {
  return entries
    .filter((entry) => entry.type === "file")
    .filter((entry) => entry.name.endsWith(".md"))
    .map((entry) => ({
      path: entry.path,
      ymd: ymdFromName(entry.name, pattern),
      via,
    }))
    .filter((entry): entry is DatedFile => Boolean(entry.ymd));
}

async function collectFiles(): Promise<DatedFile[]> {
  const token = opsGithubToken();
  const repo = careeropsRepo();
  const files: DatedFile[] = [];

  if (token && repo) {
    const [digests, reports] = await Promise.all([
      listGithubDir(repo, "daily-digest", token),
      listGithubDir(repo, "reports", token),
    ]);
    if (digests.ok) {
      files.push(...datedFrom(digests.entries, /^(\d{4}-\d{2}-\d{2})\.md$/, "github"));
    }
    if (reports.ok) {
      files.push(
        ...datedFrom(reports.entries, /weekly-scan-(\d{4}-\d{2}-\d{2})\.md$/i, "github"),
      );
    }
  }

  const localDigests = listLocalDir(siblingRoot("careerops"), "daily-digest");
  if (localDigests) {
    files.push(...datedFrom(localDigests, /^(\d{4}-\d{2}-\d{2})\.md$/, "local"));
  }
  const localReports = listLocalDir(siblingRoot("careerops"), "reports");
  if (localReports) {
    files.push(
      ...datedFrom(localReports, /weekly-scan-(\d{4}-\d{2}-\d{2})\.md$/i, "local"),
    );
  }

  const unique = new Map<string, DatedFile>();
  for (const file of files.sort((a, b) => b.ymd.localeCompare(a.ymd))) {
    if (!unique.has(file.path)) unique.set(file.path, file);
  }
  return [...unique.values()].sort((a, b) => b.ymd.localeCompare(a.ymd));
}

async function readChosen(file: DatedFile): Promise<string | null> {
  if (file.via === "local") {
    return readLocalFile(siblingRoot("careerops"), file.path);
  }
  const token = opsGithubToken();
  const repo = careeropsRepo();
  if (!token || !repo) return readLocalFile(siblingRoot("careerops"), file.path);
  const remote = await readGithubFile(repo, file.path, token);
  if (remote.ok) return remote.text;
  return readLocalFile(siblingRoot("careerops"), file.path);
}

export async function loadCareeropsWeek(
  weekId: string,
): Promise<WeekLane<CareerWeek>> {
  const files = await collectFiles();
  if (files.length === 0) {
    return {
      status: "empty",
      detail: `No CareerOps digest or weekly-scan report found for ${weekId}.`,
      data: null,
    };
  }

  const inWeek = files.filter((file) => ymdInIsoWeek(file.ymd, weekId));
  const chosen = inWeek[0] ?? files[0];
  const text = await readChosen(chosen);
  if (!text) {
    return {
      status: "unavailable",
      detail: `Could not read ${chosen.path}.`,
      source: chosen.path,
      data: null,
    };
  }

  const titleMatch = text.match(/^#\s+(.+)$/m);
  const repo = careeropsRepo();
  return {
    status: "ok",
    stale: inWeek[0]
      ? undefined
      : `Latest scan is ${chosen.ymd} — nothing dated ${weekId}.`,
    source: chosen.path,
    href:
      chosen.via === "github" && repo ? githubBlobUrl(repo, chosen.path) : undefined,
    data: parseDigest(text, titleMatch?.[1]?.trim() || `CareerOps ${weekId}`),
  };
}
