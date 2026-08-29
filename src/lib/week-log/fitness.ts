import "server-only";
import {
  githubBlobUrl,
  opsGithubToken,
  parseRepoSlug,
  readGithubFile,
} from "@/lib/week-log/github";
import { listLocalDir, readLocalFile, siblingRoot } from "@/lib/week-log/local";
import type {
  FitnessDay,
  FitnessLift,
  FitnessSession,
  FitnessWeek,
  WeekLane,
} from "@/lib/week-log/types";

function fitnessRepo() {
  return parseRepoSlug(
    process.env.FITNESS_GITHUB_REPO?.trim() || "AlexTouvras/fitness-coach",
    process.env.FITNESS_GITHUB_BRANCH?.trim() || "master",
  );
}

function asString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function parseLift(raw: unknown): FitnessLift | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const exercise = asString(row.exercise);
  if (!exercise) return null;
  return {
    exercise,
    sets: asString(row.sets),
    reps: asString(row.reps),
    rpe: asString(row.rpe) || null,
    notes: asString(row.notes) || null,
  };
}

function parseSession(raw: unknown): FitnessSession | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const title = asString(row.title);
  if (!title) return null;
  const lifts = Array.isArray(row.lifts)
    ? row.lifts.map(parseLift).filter((lift): lift is FitnessLift => Boolean(lift))
    : [];
  return {
    sport: asString(row.sport),
    focus: asString(row.focus),
    title,
    prescription: asString(row.prescription),
    durationMin: asNumber(row.duration_min),
    lifts,
  };
}

function parseDay(raw: unknown): FitnessDay | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const date = asString(row.date);
  if (!date) return null;
  const sessions = Array.isArray(row.sessions)
    ? row.sessions
        .map(parseSession)
        .filter((session): session is FitnessSession => Boolean(session))
    : [];
  return {
    date,
    weekday: asString(row.weekday) || date,
    notes: asString(row.notes) || null,
    sessions,
  };
}

function parsePlan(text: string, fallbackWeekId: string): FitnessWeek | null {
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const days = Array.isArray(parsed.days)
      ? parsed.days.map(parseDay).filter((day): day is FitnessDay => Boolean(day))
      : [];
    return {
      weekId: asString(parsed.week_id) || fallbackWeekId,
      generatedAt: asString(parsed.generated_at) || null,
      theme: asString(parsed.theme) || "Weekly plan",
      raceContext: asString(parsed.race_context) || null,
      days,
    };
  } catch {
    return null;
  }
}

async function readPlanText(
  weekId: string,
): Promise<{ text: string; via: "github" | "local"; path: string } | null> {
  const filePath = `data/plans/${weekId}.json`;
  const token = opsGithubToken();
  const repo = fitnessRepo();
  if (token && repo) {
    const remote = await readGithubFile(repo, filePath, token);
    if (remote.ok) return { text: remote.text, via: "github", path: filePath };
  }
  const local = readLocalFile(siblingRoot("fitness"), filePath);
  if (local) return { text: local, via: "local", path: filePath };
  return null;
}

function latestLocalPlanId(atMost: string): string | null {
  const entries = listLocalDir(siblingRoot("fitness"), "data/plans");
  if (!entries) return null;
  const weeks = entries
    .filter((entry) => entry.type === "file" && /^\d{4}-W\d{2}\.json$/i.test(entry.name))
    .map((entry) => entry.name.replace(/\.json$/i, ""))
    .filter((id) => id <= atMost)
    .sort();
  return weeks.at(-1) ?? null;
}

export async function loadFitnessWeek(weekId: string): Promise<WeekLane<FitnessWeek>> {
  const exact = await readPlanText(weekId);
  if (exact) {
    const data = parsePlan(exact.text, weekId);
    if (!data) {
      return {
        status: "unavailable",
        detail: "Fitness plan JSON did not parse.",
        source: exact.path,
        data: null,
      };
    }
    const repo = fitnessRepo();
    return {
      status: "ok",
      source: exact.path,
      href: exact.via === "github" && repo ? githubBlobUrl(repo, exact.path) : undefined,
      data,
    };
  }

  const latestId = latestLocalPlanId(weekId);
  if (latestId) {
    const latest = await readPlanText(latestId);
    const data = latest ? parsePlan(latest.text, latestId) : null;
    if (data) {
      return {
        status: "ok",
        stale: `Latest plan is ${latestId} — nothing committed for ${weekId} yet.`,
        source: latest?.path,
        data,
      };
    }
  }

  return {
    status: "empty",
    detail: `No Sunday plan for ${weekId}, and no older plan on this machine.`,
    source: `data/plans/${weekId}.json`,
    data: null,
  };
}
