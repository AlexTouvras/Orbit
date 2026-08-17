/** ISO week helpers. Weeks are Monday–Sunday. Calendar "today" for ops is Europe/Helsinki. */

export const OPS_TIMEZONE = "Europe/Helsinki";

const WEEK_ID_RE = /^(\d{4})-W(\d{2})$/i;

export function calendarDateInZone(
  date = new Date(),
  timeZone = OPS_TIMEZONE,
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function dateFromYmd(ymd: string): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Monday (UTC) of the ISO week that contains `date`, YYYY-MM-DD. */
export function weekOfMonday(date = new Date()): string {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = d.getUTCDay() || 7;
  if (day !== 1) d.setUTCDate(d.getUTCDate() - (day - 1));
  return d.toISOString().slice(0, 10);
}

/** ISO week id, e.g. 2026-W33. */
export function isoWeekId(date = new Date()): string {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function parseIsoWeekId(
  value: string | null | undefined,
): { year: number; week: number } | null {
  if (!value) return null;
  const match = value.trim().match(WEEK_ID_RE);
  if (!match) return null;
  const year = Number(match[1]);
  const week = Number(match[2]);
  if (week < 1 || week > 53) return null;
  return { year, week };
}

export function mondayOfIsoWeek(weekId: string): string | null {
  const parsed = parseIsoWeekId(weekId);
  if (!parsed) return null;
  const jan4 = new Date(Date.UTC(parsed.year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1) + (parsed.week - 1) * 7);
  return monday.toISOString().slice(0, 10);
}

export function sundayOfIsoWeek(weekId: string): string | null {
  const monday = mondayOfIsoWeek(weekId);
  if (!monday) return null;
  const d = dateFromYmd(monday);
  d.setUTCDate(d.getUTCDate() + 6);
  return d.toISOString().slice(0, 10);
}

export function ymdInIsoWeek(ymd: string, weekId: string): boolean {
  const start = mondayOfIsoWeek(weekId);
  const end = sundayOfIsoWeek(weekId);
  if (!start || !end) return false;
  return ymd >= start && ymd <= end;
}

export function shiftIsoWeek(weekId: string, delta: number): string | null {
  const monday = mondayOfIsoWeek(weekId);
  if (!monday) return null;
  const d = dateFromYmd(monday);
  d.setUTCDate(d.getUTCDate() + delta * 7);
  return isoWeekId(d);
}

export function currentIsoWeekId(now = new Date()): string {
  return isoWeekId(dateFromYmd(calendarDateInZone(now)));
}

export function formatWeekRange(weekId: string): string {
  const monday = mondayOfIsoWeek(weekId);
  const sunday = sundayOfIsoWeek(weekId);
  if (!monday || !sunday) return weekId;
  const fmt = (ymd: string) =>
    dateFromYmd(ymd).toLocaleDateString("en-GB", {
      timeZone: "UTC",
      day: "numeric",
      month: "short",
    });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

export function normalizeWeekId(
  raw: string | null | undefined,
  fallback = currentIsoWeekId(),
): string {
  const parsed = parseIsoWeekId(raw);
  if (!parsed) return fallback;
  const id = `${parsed.year}-W${String(parsed.week).padStart(2, "0")}`;
  return mondayOfIsoWeek(id) ? id : fallback;
}
