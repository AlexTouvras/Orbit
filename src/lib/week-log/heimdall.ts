import "server-only";
import matter from "gray-matter";
import type { FitnessWeek, HeimdallVideo, WeekLane } from "@/lib/week-log/types";
import {
  githubBlobUrl,
  listGithubDir,
  opsGithubToken,
  parseRepoSlug,
  readGithubFile,
} from "@/lib/week-log/github";
import { listLocalDir, readLocalFile, siblingRoot } from "@/lib/week-log/local";
import { markdownSection } from "@/lib/week-log/markdown";

function ravensRepo() {
  return parseRepoSlug(
    process.env.RAVENS_GITHUB_REPO?.trim() || "AlexTouvras/ravens",
    process.env.RAVENS_GITHUB_BRANCH?.trim() || "main",
  );
}

export function slugifyHeimdall(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function firstLineItems(block: string): string[] {
  return block
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim())
    .filter(Boolean);
}

export function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace(/^\/+/, "") || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
    return null;
  } catch {
    return null;
  }
}

function videoFromWatchNote(text: string): HeimdallVideo | null {
  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(text);
  } catch {
    return null;
  }
  const data = parsed.data as Record<string, unknown>;
  const primaryUrl = typeof data.primary_url === "string" ? data.primary_url.trim() : "";
  if (!primaryUrl) return null;
  const videoId = extractYouTubeId(primaryUrl);
  return {
    id: typeof data.id === "string" ? data.id : primaryUrl,
    domain: typeof data.domain === "string" ? data.domain : "unknown",
    slug: typeof data.slug === "string" ? data.slug : "",
    title: typeof data.title === "string" ? data.title : "Watch note",
    stage: typeof data.stage === "string" ? data.stage : null,
    channel: typeof data.channel === "string" ? data.channel : null,
    duration: typeof data.duration === "string" ? data.duration : null,
    primaryUrl,
    embedUrl: videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null,
    why: markdownSection(parsed.content, "Why this clip") || null,
    cues: firstLineItems(markdownSection(parsed.content, "Cues to steal")),
    limits: firstLineItems(markdownSection(parsed.content, "Limits / do not apply when")),
    related: firstLineItems(markdownSection(parsed.content, "Related")),
  };
}

/** Candidate slugs for matching an exercise name to watch/fitness notes. */
export function exerciseMatchSlugs(exercise: string): string[] {
  const slugs = new Set<string>();
  const full = slugifyHeimdall(exercise);
  if (full) slugs.add(full);

  const beforeOr = exercise.split(/\s+or\s+/i)[0]?.trim() ?? "";
  if (beforeOr) {
    const part = slugifyHeimdall(beforeOr);
    if (part) slugs.add(part);
  }

  for (const slug of [...slugs]) {
    if (slug.endsWith("s") && slug.length > 4) slugs.add(slug.slice(0, -1));
    if (slug === "nordic-curls") slugs.add("nordic-curl");
    if (slug === "pull-ups") slugs.add("pull-up");
    if (slug === "bench-presses") slugs.add("bench-press");
  }
  return [...slugs];
}

export function matchHeimdallBySlug(
  videos: HeimdallVideo[],
  domain: string,
  candidates: string[],
): HeimdallVideo | null {
  const pool = videos.filter((video) => video.domain === domain);
  for (const candidate of candidates) {
    const hit = pool.find(
      (video) =>
        video.slug === candidate ||
        slugifyHeimdall(video.title) === candidate ||
        video.id.toLowerCase().endsWith(`-${candidate}`),
    );
    if (hit) return hit;
  }
  return null;
}

export function matchHeimdallForLift(
  exercise: string,
  videos: HeimdallVideo[],
): HeimdallVideo | null {
  return matchHeimdallBySlug(videos, "fitness", exerciseMatchSlugs(exercise));
}

function fitnessTargets(fitness: FitnessWeek | null): Set<string> {
  const slugs = new Set<string>();
  if (!fitness) return slugs;
  for (const day of fitness.days) {
    for (const session of day.sessions) {
      for (const lift of session.lifts) {
        for (const slug of exerciseMatchSlugs(lift.exercise)) slugs.add(slug);
      }
      const sessionSlug = slugifyHeimdall(session.title);
      if (sessionSlug.includes("bench-press")) slugs.add("bench-press");
      if (sessionSlug.includes("pull-up")) slugs.add("pull-up");
    }
  }
  return slugs;
}

function parentingWindows(stageReadme: string): Set<string> {
  const section = markdownSection(stageReadme, "Current stage");
  const line = section.match(/Scan windows now:\s*([^\n]+)/i)?.[1] ?? "";
  const windows = new Set<string>();
  for (const match of line.matchAll(/`([^`]+)`/g)) {
    windows.add(match[1]);
  }
  return windows;
}

type DirEntry = { name: string; path: string; type: string };

async function listWatch(dirPath: string): Promise<DirEntry[]> {
  const local = listLocalDir(siblingRoot("ravens"), dirPath);
  if (
    local &&
    (process.env.NODE_ENV === "development" ||
      process.env.STUDIO_DEV_OPEN?.trim() === "1")
  ) {
    return local.map((entry) => ({
      name: entry.name,
      path: entry.path,
      type: entry.type,
    }));
  }
  const token = opsGithubToken();
  const repo = ravensRepo();
  const files: DirEntry[] = [];
  if (token && repo) {
    const remote = await listGithubDir(repo, dirPath, token);
    if (remote.ok) files.push(...remote.entries);
  }
  if (local) {
    for (const entry of local) {
      if (!files.some((file) => file.path === entry.path)) files.push(entry);
    }
  }
  return files;
}

async function readWatch(filePath: string): Promise<string | null> {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.STUDIO_DEV_OPEN?.trim() === "1"
  ) {
    const local = readLocalFile(siblingRoot("ravens"), filePath);
    if (local) return local;
  }
  const token = opsGithubToken();
  const repo = ravensRepo();
  if (token && repo) {
    const remote = await readGithubFile(repo, filePath, token);
    if (remote.ok) return remote.text;
  }
  return readLocalFile(siblingRoot("ravens"), filePath);
}

export async function loadHeimdallWeek(
  fitness: FitnessWeek | null,
): Promise<WeekLane<HeimdallVideo[]>> {
  const [fitnessDir, parentingDir, parentingHubText] = await Promise.all([
    listWatch("watch/fitness"),
    listWatch("watch/parenting"),
    (async () => {
      if (
        process.env.NODE_ENV === "development" ||
        process.env.STUDIO_DEV_OPEN?.trim() === "1"
      ) {
        const local = readLocalFile(
          siblingRoot("ravens"),
          "knowledge/parenting/README.md",
        );
        if (local) return local;
      }
      const token = opsGithubToken();
      const repo = ravensRepo();
      if (token && repo) {
        const remote = await readGithubFile(repo, "knowledge/parenting/README.md", token);
        if (remote.ok) return remote.text;
      }
      return readLocalFile(siblingRoot("ravens"), "knowledge/parenting/README.md");
    })(),
  ]);

  if (fitnessDir.length === 0 && parentingDir.length === 0) {
    return {
      status: "empty",
      detail: "No Heimdall watch notes in ravens/watch.",
      data: [],
    };
  }

  const targets = fitnessTargets(fitness);
  const windows = parentingHubText ? parentingWindows(parentingHubText) : new Set<string>();
  const matchFitness = targets.size > 0;
  const selectedPaths = [
    ...fitnessDir
      .filter((entry) => entry.name.endsWith(".md"))
      .filter((entry) =>
        matchFitness ? targets.has(entry.name.replace(/\.md$/i, "")) : true,
      )
      .map((entry) => entry.path),
    ...parentingDir.filter((entry) => entry.name.endsWith(".md")).map((entry) => entry.path),
  ];

  const videos: HeimdallVideo[] = [];
  for (const filePath of selectedPaths) {
    const text = await readWatch(filePath);
    if (!text) continue;
    const video = videoFromWatchNote(text);
    if (!video) continue;
    if (video.domain === "parenting") {
      const stage = video.stage?.trim();
      if (windows.size > 0 && stage && stage !== "none" && !windows.has(stage)) continue;
    }
    videos.push(video);
  }

  videos.sort((a, b) => a.domain.localeCompare(b.domain) || a.title.localeCompare(b.title));

  if (videos.length === 0) {
    return {
      status: "empty",
      detail: "No Heimdall clips match this week's plan or parenting stage.",
      data: [],
    };
  }

  const repo = ravensRepo();
  return {
    status: "ok",
    source: "ravens/watch",
    href: repo ? githubBlobUrl(repo, "watch/README.md") : undefined,
    data: videos,
  };
}
