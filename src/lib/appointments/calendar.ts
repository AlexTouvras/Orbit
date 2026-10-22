import "server-only";
import { allowedCalendarFeedUrl, calendarFeedUrls } from "./calendar-url";
import { parseIcsBusy } from "./ics";
import {
  listOpenDays,
  type AppointmentBooking,
  type AppointmentWindow,
  type BusyInterval,
  type SlotDay,
} from "./slots";

export type CalendarFeed =
  | { connected: false }
  | { connected: true; intervals: BusyInterval[]; error?: string };

const OK_TTL_MS = 5 * 60 * 1000;
const ERR_TTL_MS = 60 * 1000;
const MAX_BYTES = 2_000_000;

let cache: { key: string; at: number; feed: CalendarFeed } | null = null;

async function fetchFeed(
  url: string,
  rangeStart: Date,
  rangeEnd: Date,
  timeZone: string,
): Promise<BusyInterval[]> {
  const init = {
    headers: {
      Accept: "text/calendar, text/plain;q=0.9",
      "User-Agent": "OrbitAppointments",
    },
    cache: "no-store" as const,
    signal: AbortSignal.timeout(8000),
  };
  let response = await fetch(url, { ...init, redirect: "manual" });
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    const next = location
      ? allowedCalendarFeedUrl(new URL(location, url).toString())
      : null;
    if (!next) throw new Error("redirect");
    response = await fetch(next, { ...init, redirect: "error" });
  }
  if (!response.ok) throw new Error("status");
  const text = await response.text();
  if (text.length > MAX_BYTES) throw new Error("size");
  return parseIcsBusy(text, rangeStart, rangeEnd, timeZone);
}

function feedError(message: string): CalendarFeed {
  return { connected: true, intervals: [], error: message };
}

export async function readCalendarBusy(
  window: AppointmentWindow,
  now: Date,
): Promise<CalendarFeed> {
  const raw = process.env.APPOINTMENT_CALENDAR_ICS_URL;
  if (!(raw ?? "").trim()) return { connected: false };
  const { urls, invalid } = calendarFeedUrls(raw);
  if (urls.length === 0) return feedError("The calendar address is not a supported https feed.");

  const key = `${window.timezone}|${window.horizonDays}|${urls.join(" ")}|${invalid}`;
  const cached = cache;
  const ttl =
    cached != null && cached.feed.connected && cached.feed.error
      ? ERR_TTL_MS
      : OK_TTL_MS;
  if (cached && cached.key === key && now.getTime() - cached.at < ttl) return cached.feed;

  const rangeStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const rangeEnd = new Date(
    now.getTime() + (window.horizonDays + 2) * 24 * 60 * 60 * 1000,
  );
  const loaded = await Promise.all(
    urls.map(async (url) => {
      try {
        return await fetchFeed(url, rangeStart, rangeEnd, window.timezone);
      } catch {
        return null;
      }
    }),
  );
  const intervals: BusyInterval[] = [];
  let failed = 0;
  for (const item of loaded) {
    if (!item) failed += 1;
    else intervals.push(...item);
  }
  const problems: string[] = [];
  if (invalid > 0) problems.push("A calendar address is not a supported https feed.");
  if (failed === urls.length) problems.push("The calendar feed did not load.");
  else if (failed > 0) problems.push("One calendar feed did not load.");
  const error = problems.length > 0 ? problems.join(" ") : undefined;
  const feed: CalendarFeed = error
    ? { connected: true, intervals, error }
    : { connected: true, intervals };
  cache = { key, at: now.getTime(), feed };
  return feed;
}

export async function listBookableDays(
  window: AppointmentWindow,
  bookings: AppointmentBooking[],
  now: Date,
): Promise<{ days: SlotDay[]; feed: CalendarFeed }> {
  const feed = await readCalendarBusy(window, now);
  const busy = feed.connected ? feed.intervals : [];
  return { days: listOpenDays(window, bookings, now, busy), feed };
}

export function calendarStatus(feed: CalendarFeed): string {
  if (!feed.connected) {
    return "Bookings made here are already hidden. Meetings on your calendars stay visible until APPOINTMENT_CALENDAR_ICS_URL lists their secret iCal addresses, separated by a space. Google Calendar: Settings, the calendar, Integrate calendar, Secret address in iCal format. Work Outlook: Settings, Calendar, Shared calendars, Publish a calendar, Can view when I'm busy, then the ICS link. Times that start within 2 hours stay hidden.";
  }
  if (feed.error) {
    return `${feed.error} Meetings on it may still show as open. Times that start within 2 hours stay hidden.`;
  }
  return "Times that overlap a meeting on your calendars are hidden. A slot that ends when a meeting starts stays open. Times that start within 2 hours stay hidden.";
}
