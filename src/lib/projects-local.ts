import "server-only";
import fs from "node:fs";
import path from "node:path";
import { persistDataJson } from "@/lib/data-persist";
import type {
  ProjectActivity,
  ProjectStatus,
  PublishedProject,
  PublicProject,
  ScannedProject,
} from "./project-status";
import { STATUS_ORDER } from "./project-status";

// Directory to scan for sibling projects. Defaults to the parent of the
// website folder (i.e. ~/.cursor/projects), overridable for other hosts.
const SCAN_DIR =
  process.env.PROJECTS_SCAN_DIR ?? path.dirname(process.cwd());
const DATA_DIR = path.join(process.cwd(), "data");
const PUBLISHED_PATH = path.join(DATA_DIR, "published-projects.json");

// Folders that are Cursor internals or build artifacts — never real projects.
const EXCLUDE_NAME = [
  /^c-?users/i,
  /^\d+$/,
  /temp/i,
  /^\./,
  /^node_modules$/i,
];
const HEAVY_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  "out",
  ".turbo",
  "coverage",
  ".cache",
]);
const PROJECT_MARKERS = [
  "package.json",
  "README.md",
  "readme.md",
  "src",
  ".git",
  "index.html",
  "pyproject.toml",
  "requirements.txt",
  "Cargo.toml",
  "go.mod",
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function safeRead(file: string): string | null {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

function readPackageJson(dir: string): {
  name?: string;
  description?: string;
  repository?: string | { url?: string };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
} | null {
  const raw = safeRead(path.join(dir, "package.json"));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readmeSummary(dir: string): { title?: string; description?: string } {
  const raw =
    safeRead(path.join(dir, "README.md")) ??
    safeRead(path.join(dir, "readme.md"));
  if (!raw) return {};
  const lines = raw.split(/\r?\n/);
  let title: string | undefined;
  let description: string | undefined;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (!title && trimmed.startsWith("#")) {
      title = trimmed.replace(/^#+\s*/, "").trim();
      continue;
    }
    if (
      title &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("![") &&
      !trimmed.startsWith("<") &&
      !trimmed.startsWith("[!")
    ) {
      description = trimmed.replace(/[*_`]/g, "");
      break;
    }
  }
  return { title, description };
}

function detect(dir: string, pkg: ReturnType<typeof readPackageJson>): {
  language: string;
  tags: string[];
} {
  const tags = new Set<string>();
  let language = "Unknown";
  const has = (f: string) => fs.existsSync(path.join(dir, f));

  if (pkg) {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (has("tsconfig.json")) language = "TypeScript";
    else language = "JavaScript";
    if (deps.next) tags.add("Next.js");
    if (deps.react) tags.add("React");
    if (deps.vite) tags.add("Vite");
    if (deps.express || deps.fastify) tags.add("Node API");
    if (deps.electron) tags.add("Electron");
    if (deps["@playwright/test"] || deps.playwright) tags.add("Playwright");
  } else if (has("pyproject.toml") || has("requirements.txt")) {
    language = "Python";
  } else if (has("Cargo.toml")) {
    language = "Rust";
  } else if (has("go.mod")) {
    language = "Go";
  } else if (has("index.html")) {
    language = "Web";
  }
  if (language !== "Unknown") tags.add(language);
  return { language, tags: [...tags] };
}

function gitRemote(dir: string, pkg: ReturnType<typeof readPackageJson>): string {
  const config = safeRead(path.join(dir, ".git", "config"));
  if (config) {
    const m = config.match(/\[remote "origin"\][^[]*?url\s*=\s*(.+)/);
    if (m) {
      let url = m[1].trim();
      if (url.startsWith("git@")) {
        url = url.replace(":", "/").replace("git@", "https://");
      }
      url = url.replace(/\.git$/, "");
      return url;
    }
  }
  if (pkg?.repository) {
    const url =
      typeof pkg.repository === "string"
        ? pkg.repository
        : pkg.repository.url;
    if (url) return url.replace(/^git\+/, "").replace(/\.git$/, "");
  }
  return "";
}

function lastActivity(dir: string): { iso: string | null; bucket: ProjectActivity } {
  let newest = 0;
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && HEAVY_DIRS.has(entry.name)) continue;
      try {
        const st = fs.statSync(path.join(dir, entry.name));
        if (st.mtimeMs > newest) newest = st.mtimeMs;
      } catch {
        // ignore unreadable entry
      }
    }
  } catch {
    return { iso: null, bucket: "unknown" };
  }
  if (!newest) return { iso: null, bucket: "unknown" };
  const days = (Date.now() - newest) / 86_400_000;
  const bucket: ProjectActivity =
    days < 30 ? "active" : days < 120 ? "recent" : "stale";
  return { iso: new Date(newest).toISOString(), bucket };
}

function isCandidate(name: string, full: string): boolean {
  if (EXCLUDE_NAME.some((re) => re.test(name))) return false;
  try {
    if (!fs.statSync(full).isDirectory()) return false;
  } catch {
    return false;
  }
  return PROJECT_MARKERS.some((m) => fs.existsSync(path.join(full, m)));
}

/** Discover sibling projects on disk, merged with current published state. */
export function scanLocalProjects(): ScannedProject[] {
  const published = getPublishedProjects();
  const byPath = new Map(published.map((p) => [p.sourcePath, p]));

  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(SCAN_DIR, { withFileTypes: true });
  } catch {
    return [];
  }

  const results: ScannedProject[] = [];
  const seenIds = new Set<string>();

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const full = path.join(SCAN_DIR, entry.name);
    if (!isCandidate(entry.name, full)) continue;

    const pkg = readPackageJson(full);
    const readme = readmeSummary(full);
    const { language, tags } = detect(full, pkg);
    const { iso, bucket } = lastActivity(full);

    let id = slugify(pkg?.name?.split("/").pop() ?? entry.name);
    while (seenIds.has(id)) id = `${id}-x`;
    seenIds.add(id);

    const current = byPath.get(full);
    results.push({
      id,
      name: current?.name ?? pkg?.name?.split("/").pop() ?? readme.title ?? entry.name,
      description:
        current?.description ?? pkg?.description ?? readme.description ?? "",
      detectedLanguage: language,
      detectedTags: tags,
      repoUrl: current?.repoUrl ?? gitRemote(full, pkg),
      lastActivity: iso,
      activity: bucket,
      sourcePath: full,
      published: Boolean(current),
      current,
    });
  }

  // Most-recently active first.
  results.sort((a, b) => (b.lastActivity ?? "").localeCompare(a.lastActivity ?? ""));
  return results;
}

function coerceStatus(value: unknown): ProjectStatus {
  return STATUS_ORDER.includes(value as ProjectStatus)
    ? (value as ProjectStatus)
    : "wip";
}

/** Read the persisted published projects (admin view, includes sourcePath). */
export function getPublishedProjects(): PublishedProject[] {
  const raw = safeRead(PUBLISHED_PATH);
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((p): p is Record<string, unknown> => typeof p === "object" && p !== null)
    .map((p, i) => ({
      id: String(p.id ?? `project-${i}`),
      name: String(p.name ?? "Untitled"),
      description: String(p.description ?? ""),
      status: coerceStatus(p.status),
      tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
      repoUrl: String(p.repoUrl ?? ""),
      liveUrl: String(p.liveUrl ?? ""),
      featured: Boolean(p.featured),
      sourcePath: String(p.sourcePath ?? ""),
      order: typeof p.order === "number" ? p.order : i,
    }))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

/** Public, path-stripped published projects for rendering on the site. */
export function getPublicProjects(): PublicProject[] {
  return getPublishedProjects().map(({ sourcePath, ...rest }) => {
    void sourcePath;
    return rest;
  });
}

export function getFeaturedPublicProjects(): PublicProject[] {
  return getPublicProjects().filter((p) => p.featured);
}

/** Persist the published project set. */
export async function writePublishedProjects(
  list: PublishedProject[],
): Promise<{ viaGithub: boolean }> {
  return persistDataJson(
    "data/published-projects.json",
    list,
    "chore(studio): update published projects",
  );
}
