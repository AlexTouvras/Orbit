import "server-only";
import {
  githubBlobUrl,
  opsGithubToken,
  parseRepoSlug,
  readGithubFile,
} from "@/lib/week-log/github";
import { listLocalDir, readLocalFile, siblingRoot } from "@/lib/week-log/local";
import type {
  ArcNarrativeView,
  DailyQuestView,
  FitnessCourseView,
  FitnessDay,
  FitnessKickoff,
  FitnessLift,
  FitnessSession,
  FitnessWeek,
  LiftIntent,
  LiftStyle,
  RaceEffort,
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
    arcTitle: asString(row.arc_title) || null,
    arcFlavor: asString(row.arc_flavor) || null,
    arcIcon: asString(row.arc_icon) || null,
  };
}

function parseNarrative(raw: unknown): ArcNarrativeView | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const gateRaw = row.gate;
  if (!gateRaw || typeof gateRaw !== "object") return null;
  const gate = gateRaw as Record<string, unknown>;
  const statsRaw = row.stats;
  const stats: ArcNarrativeView["stats"] = {};
  if (statsRaw && typeof statsRaw === "object") {
    for (const [key, val] of Object.entries(statsRaw)) {
      if (!val || typeof val !== "object") continue;
      const s = val as Record<string, unknown>;
      const display = asNumber(s.display);
      if (display === null) continue;
      stats[key] = {
        display,
        valueLabel: asString(s.value_label) || undefined,
        hint: asString(s.hint) || undefined,
        source: asString(s.source),
        raw: (s.raw as Record<string, unknown>) || {},
      };
    }
  }
  return {
    mode: asString(row.mode) || "arc",
    arcPhase: asString(row.arc_phase) || "",
    gate: {
      rank: asString(gate.rank) || "?",
      score: asNumber(gate.score) ?? 0,
      phaseCeiling: asString(gate.phase_ceiling) || "",
      readinessLock: asString(gate.readiness_lock) || null,
      rankHint: asString(gate.rank_hint) || undefined,
      scoreHint: asString(gate.score_hint) || undefined,
    },
    stats,
    deltas: (row.deltas as Record<string, unknown>) || {},
    boss: (row.boss as Record<string, unknown>) || null,
    warriorQuote: parseWarriorQuote(row.warrior_quote),
  };
}

function parseWarriorQuote(raw: unknown): ArcNarrativeView["warriorQuote"] {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const text = asString(row.text);
  if (!text) return null;
  return { text, source: asString(row.source) || "Way of the warrior" };
}

function parseDailyQuest(raw: unknown): DailyQuestView | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const targetsRaw = row.targets;
  if (!targetsRaw || typeof targetsRaw !== "object") return null;
  const targets: DailyQuestView["targets"] = {};
  for (const [key, val] of Object.entries(targetsRaw)) {
    if (!val || typeof val !== "object") continue;
    const t = val as Record<string, unknown>;
    const limit = asNumber(t.limit);
    const floor = asNumber(t.floor);
    const ceiling = asNumber(t.ceiling);
    if (limit !== null) {
      targets[key] = { limit, label: asString(t.label) || undefined };
    } else if (floor !== null && ceiling !== null) {
      targets[key] = { floor, ceiling, label: asString(t.label) || undefined };
    }
  }
  return {
    enabled: Boolean(row.enabled),
    cadence: asString(row.cadence) || undefined,
    title: asString(row.title) || undefined,
    deadline: asString(row.deadline) || undefined,
    deadlineLabel: asString(row.deadline_label) || undefined,
    logHint: asString(row.log_hint) || undefined,
    targets,
    progress: parseQuestProgress(row.progress),
    rules: asString(row.rules),
  };
}

function parseQuestProgress(raw: unknown): Record<string, number> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const out: Record<string, number> = {};
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    const n = asNumber(val);
    if (n !== null) out[key] = n;
  }
  return Object.keys(out).length > 0 ? out : undefined;
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

function parseKickoff(raw: unknown): FitnessKickoff | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const motivateUrl = asString(row.motivate_url);
  const quoteText = asString(row.quote_text);
  if (!motivateUrl && !quoteText) return null;
  return {
    quoteText: quoteText || null,
    quoteAttribution: asString(row.quote_attribution) || null,
    motivateSlug: asString(row.motivate_slug) || null,
    motivateTitle: asString(row.motivate_title) || null,
    motivateUrl: motivateUrl || null,
    motivateChannel: asString(row.motivate_channel) || null,
    spotifyRunningName: asString(row.spotify_running_name) || null,
    spotifyRunningUrl: asString(row.spotify_running_url) || null,
    spotifyStrengthName: asString(row.spotify_strength_name) || null,
    spotifyStrengthUrl: asString(row.spotify_strength_url) || null,
  };
}

function parsePlan(text: string, fallbackWeekId: string): FitnessWeek | null {
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const days = Array.isArray(parsed.days)
      ? parsed.days.map(parseDay).filter((day): day is FitnessDay => Boolean(day))
      : [];
    const coachNotes = Array.isArray(parsed.coach_notes)
      ? parsed.coach_notes.map(asString).filter(Boolean)
      : [];
    return {
      weekId: asString(parsed.week_id) || fallbackWeekId,
      generatedAt: asString(parsed.generated_at) || null,
      theme: asString(parsed.theme) || "Weekly plan",
      blockLabel: asString(parsed.block_label) || null,
      raceContext: asString(parsed.race_context) || null,
      kickoff: parseKickoff(parsed.kickoff),
      coachNotes,
      days,
      narrative: parseNarrative(parsed.narrative),
      dailyQuest: parseDailyQuest(parsed.daily_quest),
      course: null,
    };
  } catch {
    return null;
  }
}

function preferLocalSibling(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.STUDIO_DEV_OPEN?.trim() === "1"
  );
}

async function readPlanText(
  weekId: string,
): Promise<{ text: string; via: "github" | "local"; path: string } | null> {
  const filePath = `data/plans/${weekId}.json`;
  if (preferLocalSibling()) {
    const local = readLocalFile(siblingRoot("fitness"), filePath);
    if (local) return { text: local, via: "local", path: filePath };
  }
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

function parseLiftIntent(raw: unknown, strengthEmphasis: unknown): LiftIntent {
  if (raw === "maintenance" || raw === "strength" || raw === "hypertrophy") {
    return raw;
  }
  return strengthEmphasis === "build" ? "strength" : "maintenance";
}

function parseLiftStyle(raw: unknown): LiftStyle {
  if (raw === "standard" || raw === "full" || raw === "simplified") return raw;
  if (raw === "focus") return "simplified";
  return "full";
}

function parseRaceEffort(raw: unknown): RaceEffort {
  if (raw === "peak" || raw === "test" || raw === "skip") return raw;
  return "peak";
}

export function coursePhaseForDate(raceDate: string | null, today = new Date()): {
  phase: FitnessCourseView["phase"];
  daysToEvent: number | null;
  eventExpired: boolean;
} {
  if (!raceDate) {
    return { phase: "open", daysToEvent: null, eventExpired: false };
  }
  const stamp = Date.parse(`${raceDate}T00:00:00`);
  if (!Number.isFinite(stamp)) {
    return { phase: "open", daysToEvent: null, eventExpired: false };
  }
  const start = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.round((stamp - start) / 86_400_000);
  if (days < 0) {
    return { phase: "open", daysToEvent: days, eventExpired: true };
  }
  if (days <= 7) return { phase: "taper", daysToEvent: days, eventExpired: false };
  if (days <= 21) return { phase: "sharpen", daysToEvent: days, eventExpired: false };
  return { phase: "build", daysToEvent: days, eventExpired: false };
}

function parseCourse(
  courseRaw: unknown,
  profileRaw: unknown,
): FitnessCourseView {
  const course =
    courseRaw && typeof courseRaw === "object"
      ? (courseRaw as Record<string, unknown>)
      : {};
  const flags =
    course.flags && typeof course.flags === "object"
      ? (course.flags as Record<string, unknown>)
      : {};
  const profile =
    profileRaw && typeof profileRaw === "object"
      ? (profileRaw as Record<string, unknown>)
      : {};
  const goals =
    profile.goals && typeof profile.goals === "object"
      ? (profile.goals as Record<string, unknown>)
      : {};
  const primary =
    goals.primary && typeof goals.primary === "object"
      ? (goals.primary as Record<string, unknown>)
      : {};
  const raceDate = asString(primary.race_date) || asString(primary.end_date) || null;
  const derived = coursePhaseForDate(raceDate);
  return {
    timeEfficient: Boolean(flags.time_efficient),
    raceEffort: parseRaceEffort(flags.race_effort),
    liftIntent: parseLiftIntent(flags.lift_intent, flags.strength_emphasis),
    liftStyle: parseLiftStyle(flags.lift_style),
    gtgOptional: Boolean(flags.gtg_optional),
    raceDate,
    eventName: asString(primary.event) || asString(primary.sport) || "Event",
    ...derived,
  };
}

async function readJsonText(
  filePath: string,
): Promise<{ text: string; via: "github" | "local" } | null> {
  if (preferLocalSibling()) {
    const local = readLocalFile(siblingRoot("fitness"), filePath);
    if (local) return { text: local, via: "local" };
  }
  const token = opsGithubToken();
  const repo = fitnessRepo();
  if (token && repo) {
    const remote = await readGithubFile(repo, filePath, token);
    if (remote.ok) return { text: remote.text, via: "github" };
  }
  const local = readLocalFile(siblingRoot("fitness"), filePath);
  if (local) return { text: local, via: "local" };
  return null;
}

export async function loadFitnessCourse(): Promise<FitnessCourseView | null> {
  const [courseFile, profileFile] = await Promise.all([
    readJsonText("data/course.json"),
    readJsonText("data/profile.json"),
  ]);
  if (!courseFile && !profileFile) return null;
  let courseRaw: unknown = null;
  let profileRaw: unknown = null;
  try {
    if (courseFile) courseRaw = JSON.parse(courseFile.text);
  } catch {
    courseRaw = null;
  }
  try {
    if (profileFile) profileRaw = JSON.parse(profileFile.text);
  } catch {
    profileRaw = null;
  }
  return parseCourse(courseRaw, profileRaw);
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
    data.course = await loadFitnessCourse();
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
      data.course = await loadFitnessCourse();
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
