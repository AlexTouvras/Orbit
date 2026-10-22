export interface AppointmentWindow {
  timezone: string;
  /** 0 Sunday … 6 Saturday, in `timezone`. */
  days: number[];
  /** HH:MM, 24-hour, inclusive. */
  start: string;
  /** HH:MM, 24-hour. A slot must finish by this time. */
  end: string;
  slotMinutes: number;
  horizonDays: number;
}

export interface AppointmentBooking {
  id: string;
  /** UTC instant for the slot start. */
  start: string;
  name: string;
  email: string;
  note?: string;
  createdAt: string;
}

export interface OpenSlot {
  start: string;
  timeLabel: string;
}

export interface SlotDay {
  /** Calendar date in the window timezone, YYYY-MM-DD. */
  key: string;
  label: string;
  slots: OpenSlot[];
}

export const LEAD_MS = 2 * 60 * 60 * 1000;

export const DEFAULT_WINDOW: AppointmentWindow = {
  timezone: "Europe/Helsinki",
  days: [1, 2, 3, 4, 5],
  start: "10:00",
  end: "16:00",
  slotMinutes: 30,
  horizonDays: 14,
};

const SLOT_LENGTHS = new Set([15, 30, 45, 60]);
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function isValidTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** Milliseconds to add to a UTC instant to get the wall clock in `timeZone`, encoded as UTC. */
export function timeZoneOffsetMs(instant: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(
    dtf
      .formatToParts(instant)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  const hour = parts.hour === "24" ? "0" : parts.hour;
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - instant.getTime();
}

/** Wall-clock time in `timeZone` as a UTC instant. */
export function zonedLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offset1 = timeZoneOffsetMs(new Date(guess), timeZone);
  let utc = guess - offset1;
  const offset2 = timeZoneOffsetMs(new Date(utc), timeZone);
  if (offset2 !== offset1) utc = guess - offset2;
  return new Date(utc);
}

function parseHm(value: string): { h: number; m: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return { h, m };
}

function minutes(hm: { h: number; m: number }): number {
  return hm.h * 60 + hm.m;
}

function ymdInZone(instant: Date, timeZone: string): { y: number; m: number; d: number } {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(
    dtf
      .formatToParts(instant)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return {
    y: Number(parts.year),
    m: Number(parts.month),
    d: Number(parts.day),
  };
}

function addCalendarDays(
  y: number,
  m: number,
  d: number,
  days: number,
): { y: number; m: number; d: number } {
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return {
    y: next.getUTCFullYear(),
    m: next.getUTCMonth() + 1,
    d: next.getUTCDate(),
  };
}

function weekdayOf(y: number, m: number, d: number, timeZone: string): number {
  const noon = zonedLocalToUtc(y, m, d, 12, 0, timeZone);
  const short = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(noon);
  const index = WEEKDAY_SHORT.indexOf(short as (typeof WEEKDAY_SHORT)[number]);
  return index === -1 ? -1 : index;
}

export function validateWindow(window: AppointmentWindow): string | null {
  if (!isValidTimeZone(window.timezone)) return "Enter a timezone such as Europe/Helsinki.";
  const start = parseHm(window.start);
  const end = parseHm(window.end);
  if (!start || !end) return "Use 24-hour times, such as 10:00 and 16:00.";
  if (!SLOT_LENGTHS.has(window.slotMinutes)) return "Slot length is 15, 30, 45, or 60 minutes.";
  if (minutes(end) - minutes(start) < window.slotMinutes) {
    return "The window has to fit at least one slot.";
  }
  if (!Array.isArray(window.days) || window.days.length === 0) {
    return "Pick at least one day.";
  }
  if (window.days.some((day) => !Number.isInteger(day) || day < 0 || day > 6)) {
    return "Days are Sunday through Saturday.";
  }
  if (
    !Number.isInteger(window.horizonDays) ||
    window.horizonDays < 1 ||
    window.horizonDays > 28
  ) {
    return "Show between 1 and 28 days ahead.";
  }
  return null;
}

function isWeekdays(days: number[]): boolean {
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  return sorted.length === 5 && sorted.every((day, index) => day === index + 1);
}

export function describeWindow(window: AppointmentWindow): string {
  const ordered = DAY_ORDER.filter((day) => window.days.includes(day));
  const daysLabel = isWeekdays(window.days)
    ? "Weekdays"
    : ordered.map((day) => WEEKDAY_SHORT[day]).join(", ");
  const place =
    window.timezone === "Europe/Helsinki" ? "Helsinki time" : window.timezone;
  return `${daysLabel}, ${window.start}–${window.end} ${place}. Each slot is ${window.slotMinutes} minutes.`;
}

export function formatWhen(
  startIso: string,
  window: AppointmentWindow,
): { date: string; range: string } {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + window.slotMinutes * 60_000);
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: window.timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(start);
  const timeFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: window.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return { date, range: `${timeFmt.format(start)}–${timeFmt.format(end)}` };
}

export function listOpenDays(
  window: AppointmentWindow,
  bookings: AppointmentBooking[],
  now: Date,
): SlotDay[] {
  if (validateWindow(window)) return [];
  const startHm = parseHm(window.start);
  const endHm = parseHm(window.end);
  if (!startHm || !endHm) return [];

  const taken = new Set(bookings.map((booking) => booking.start));
  const today = ymdInZone(now, window.timezone);
  const lead = now.getTime() + LEAD_MS;
  const days: SlotDay[] = [];
  const startMinutes = minutes(startHm);
  const endMinutes = minutes(endHm);

  for (let offset = 0; offset < window.horizonDays; offset += 1) {
    const date = addCalendarDays(today.y, today.m, today.d, offset);
    const weekday = weekdayOf(date.y, date.m, date.d, window.timezone);
    if (!window.days.includes(weekday)) continue;

    const slots: OpenSlot[] = [];
    for (
      let cursor = startMinutes;
      cursor + window.slotMinutes <= endMinutes;
      cursor += window.slotMinutes
    ) {
      const hour = Math.floor(cursor / 60);
      const minute = cursor % 60;
      const instant = zonedLocalToUtc(
        date.y,
        date.m,
        date.d,
        hour,
        minute,
        window.timezone,
      );
      if (instant.getTime() < lead) continue;
      const start = instant.toISOString();
      if (taken.has(start)) continue;
      const label = new Intl.DateTimeFormat("en-GB", {
        timeZone: window.timezone,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(instant);
      slots.push({ start, timeLabel: label });
    }

    if (slots.length === 0) continue;
    const label = new Intl.DateTimeFormat("en-GB", {
      timeZone: window.timezone,
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(zonedLocalToUtc(date.y, date.m, date.d, 12, 0, window.timezone));
    const key = `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
    days.push({ key, label, slots });
  }

  return days;
}
