import { currentIsoWeekId, normalizeWeekId, parseIsoWeekId } from "@/lib/iso-week";
import { weekHref, type WeekTopicSlug } from "@/lib/week-log/topics";

/** Resolve a week id from a path segment and/or legacy `?week=` query. */
export function resolveWeekParam(
  pathWeekId?: string | null,
  queryWeek?: string | null,
): string | undefined {
  const raw = pathWeekId ?? queryWeek;
  if (!raw) return undefined;
  const parsed = parseIsoWeekId(raw);
  if (!parsed) return undefined;
  return normalizeWeekId(raw);
}

/** Redirect legacy `?week=` links to path-based URLs (fixes client nav dropping query). */
export function legacyWeekRedirect(
  topic: WeekTopicSlug | null,
  queryWeek?: string | null,
): string | null {
  if (!queryWeek?.trim()) return null;
  const weekId = resolveWeekParam(null, queryWeek);
  if (!weekId) return null;
  return weekHref(topic, weekId);
}

export function isCanonicalCurrentWeek(weekId: string): boolean {
  return weekId === currentIsoWeekId();
}
