import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

import { isStudioAccessible } from "@/lib/auth";
import { runFitnessApplyCourse } from "@/lib/week-log/apply-course";
import { coursePhaseForDate } from "@/lib/week-log/fitness";
import type { LiftIntent, LiftStyle, RaceEffort } from "@/lib/week-log/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const INTENTS: LiftIntent[] = ["maintenance", "strength", "hypertrophy"];
const STYLES: LiftStyle[] = ["full", "standard", "simplified"];
const EFFORTS: RaceEffort[] = ["peak", "test", "skip"];

function asIntent(value: unknown): LiftIntent | null {
  return typeof value === "string" && INTENTS.includes(value as LiftIntent)
    ? (value as LiftIntent)
    : null;
}

function asStyle(value: unknown): LiftStyle | null {
  return typeof value === "string" && STYLES.includes(value as LiftStyle)
    ? (value as LiftStyle)
    : null;
}

function asEffort(value: unknown): RaceEffort | null {
  return typeof value === "string" && EFFORTS.includes(value as RaceEffort)
    ? (value as RaceEffort)
    : null;
}

function sanitizeRaceDate(value: unknown): string | null | undefined {
  if (value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  return value;
}

export async function POST(req: NextRequest) {
  if (!(await isStudioAccessible())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
  const row = body as Record<string, unknown>;
  const timeEfficient = row.timeEfficient === true;
  const gtgOptional = row.gtgOptional === true;
  const liftIntent = asIntent(row.liftIntent);
  const liftStyle = asStyle(row.liftStyle);
  const raceEffort = asEffort(row.raceEffort);
  const raceDate = sanitizeRaceDate(row.raceDate);
  if (!liftIntent || !liftStyle || !raceEffort || raceDate === undefined) {
    return NextResponse.json({ error: "Invalid course fields." }, { status: 422 });
  }

  const derived = coursePhaseForDate(raceDate);
  const futureEvent = Boolean(raceDate) && !derived.eventExpired;
  if (liftIntent === "hypertrophy" && raceEffort === "peak" && futureEvent) {
    return NextResponse.json(
      { error: "Hypertrophy cannot pair with a Peak race." },
      { status: 422 },
    );
  }
  if (liftIntent === "hypertrophy" && timeEfficient) {
    return NextResponse.json(
      { error: "Hypertrophy does not fit Short windows. Use Strength + Focus." },
      { status: 422 },
    );
  }
  if (
    liftIntent === "hypertrophy" &&
    (derived.phase === "sharpen" || derived.phase === "taper")
  ) {
    return NextResponse.json(
      { error: "Hypertrophy is blocked in sharpen/taper. Set it after the race." },
      { status: 422 },
    );
  }

  const warnings: string[] = [];
  if ((liftIntent === "strength" || liftIntent === "hypertrophy") && raceEffort === "peak" && futureEvent) {
    warnings.push("Strength + Peak splits the block. Test is the usual pair.");
  }
  if (liftStyle === "full" && timeEfficient) {
    warnings.push("Short windows already cap Full to about four lifts.");
  }

  const result = await runFitnessApplyCourse({
    flags: {
      time_efficient: timeEfficient,
      race_effort: futureEvent ? raceEffort : "peak",
      lift_intent: liftIntent,
      lift_style: liftStyle,
      gtg_optional: gtgOptional,
    },
    race_date: raceDate,
  });

  if (!result.ok) {
    const detail = (result.stderr || result.stdout || "Could not apply course.").trim();
    return NextResponse.json(
      { error: detail.slice(0, 800) },
      { status: 500 },
    );
  }

  revalidatePath("/studio/week/fitness");
  revalidatePath("/studio/week");

  return NextResponse.json({
    ok: true,
    message: "Applied to this week’s plan.",
    warnings,
    output: result.stdout.trim().slice(0, 500),
  });
}
