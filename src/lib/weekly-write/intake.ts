import fs from "node:fs";
import path from "node:path";
import {
  INTAKE_CATEGORY_ORDER,
  interleaveByCategory,
} from "@/lib/news/balance";
import { readNewsCache } from "@/lib/news/cache";
import type { PublishedProject } from "@/lib/project-status";
import {
  newsToIntakeSignal,
  type WeeklyIntake,
  type WeeklyIntakeProject,
} from "@/lib/weekly-write/types";

const ACTIVE_STATUSES = new Set(["live", "shipped", "wip", "prototype"]);

function isoWeekOf(date = new Date()): string {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = d.getUTCDay() || 7;
  if (day !== 1) d.setUTCDate(d.getUTCDate() - (day - 1));
  return d.toISOString().slice(0, 10);
}

function daysAgo(iso: string | null | undefined, days: number): boolean {
  if (!iso) return true;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return true;
  return Date.now() - t <= days * 24 * 60 * 60 * 1000;
}

function readPublishedProjectsFs(): PublishedProject[] {
  const dataDir = path.join(process.cwd(), "data");
  for (const name of ["published-projects.json", "published-projects.seed.json"]) {
    const full = path.join(dataDir, name);
    try {
      if (!fs.existsSync(full)) continue;
      const parsed = JSON.parse(fs.readFileSync(full, "utf8")) as unknown;
      if (!Array.isArray(parsed)) continue;
      return parsed as PublishedProject[];
    } catch {
      /* try next */
    }
  }
  return [];
}

/** Gather Signals + active workshop projects for the weekly draft. */
export function buildWeeklyIntake(options?: {
  signalLimit?: number;
  maxAgeDays?: number;
}): WeeklyIntake {
  const signalLimit = options?.signalLimit ?? 8;
  const maxAgeDays = options?.maxAgeDays ?? 10;

  const cache = readNewsCache();
  // Round-robin so weekly essays are not AI-only. Economics and Credit sit ahead of AI.
  const recent = interleaveByCategory(
    cache.items.filter((item) => daysAgo(item.pubDate, maxAgeDays)),
    INTAKE_CATEGORY_ORDER,
  );
  const fallback = interleaveByCategory(cache.items, INTAKE_CATEGORY_ORDER);
  const pool = recent.length > 0 ? recent : fallback;
  const resolvedSignals = pool
    .slice(0, signalLimit)
    .map(newsToIntakeSignal);

  const projects: WeeklyIntakeProject[] = readPublishedProjectsFs()
    .filter((p) => ACTIVE_STATUSES.has(p.status))
    .sort((a, b) => a.order - b.order)
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      tags: p.tags,
      repoUrl: p.repoUrl,
      liveUrl: p.liveUrl,
    }));

  return {
    weekOf: isoWeekOf(),
    generatedAt: new Date().toISOString(),
    signals: resolvedSignals,
    projects,
  };
}
