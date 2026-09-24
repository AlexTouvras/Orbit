import { NextResponse } from "next/server";
import { isStudioAccessible } from "@/lib/auth";
import { currentIsoWeekId } from "@/lib/iso-week";
import { loadFitnessWeek } from "@/lib/week-log/fitness";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "private, no-store" };

function missing() {
  return NextResponse.json({ error: "not found" }, { status: 404, headers: NO_STORE });
}

/** Owner-only Arc HUD payload for the back of `/card`. Strangers get 404. */
export async function GET() {
  if (!(await isStudioAccessible())) return missing();

  try {
    const week = await loadFitnessWeek(currentIsoWeekId());
    const data = week.data;
    if (!data?.narrative) return missing();
    return NextResponse.json(
      {
        weekId: data.weekId,
        narrative: data.narrative,
        dailyQuest: data.dailyQuest,
        days: data.days,
      },
      { headers: NO_STORE },
    );
  } catch {
    return missing();
  }
}
