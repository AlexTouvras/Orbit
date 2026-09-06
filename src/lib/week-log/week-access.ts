import { redirect } from "next/navigation";
import { isStudioAccessible } from "@/lib/auth";
import {
  isCanonicalCurrentWeek,
  legacyWeekRedirect,
  resolveWeekParam,
} from "@/lib/week-log/week-routes";
import { weekHref } from "@/lib/week-log/topics";
import type { WeekTopicSlug } from "@/lib/week-log/topics";

export async function ensureStudioWeekAccess(
  nextPath: string,
  topic: WeekTopicSlug | null,
  queryWeek?: string | null,
): Promise<void> {
  if (!(await isStudioAccessible())) {
    redirect(`/studio/login?next=${encodeURIComponent(nextPath)}`);
  }
  const legacy = legacyWeekRedirect(topic, queryWeek);
  if (legacy) redirect(legacy);
}

export function ensureWeekIdSegment(
  rawWeekId: string,
  topic: WeekTopicSlug | null,
  inner?: string | null,
): string {
  const weekId = resolveWeekParam(rawWeekId);
  if (!weekId) redirect(weekHref(topic, null, inner));

  if (isCanonicalCurrentWeek(weekId)) {
    redirect(weekHref(topic, null, inner));
  }

  return weekId;
}
