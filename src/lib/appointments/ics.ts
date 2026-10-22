import { isValidTimeZone, zonedLocalToUtc, type BusyInterval } from "./slots";

/**
 * Busy intervals from an iCalendar feed. Event titles stay in the feed.
 * Cancelled and transparent events are free. A weekly rule expands inside
 * the requested range, including the weeks after the first date.
 */

const WEEKDAY: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

interface Ymd {
  y: number;
  m: number;
  d: number;
}

interface Stamp extends Ymd {
  h: number;
  min: number;
  allDay: boolean;
  timeZone: string;
}

interface Byday {
  day: number;
  ordinal: number | null;
}

interface RRule {
  freq: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval: number;
  count: number | null;
  untilMs: number | null;
  byday: Byday[];
}

interface ParsedEvent {
  start: Stamp;
  startMs: number;
  durationMs: number;
  allDayDays: number;
  rrule: RRule | null;
  exdates: Set<number>;
  recurrenceId: number | null;
  cancelled: boolean;
  transparent: boolean;
}

function unfold(ics: string): string {
  return ics.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n[ \t]/g, "");
}

function addDays(date: Ymd, days: number): Ymd {
  const next = new Date(Date.UTC(date.y, date.m - 1, date.d + days));
  return {
    y: next.getUTCFullYear(),
    m: next.getUTCMonth() + 1,
    d: next.getUTCDate(),
  };
}

function daysBetween(start: Ymd, end: Ymd): number {
  const a = Date.UTC(start.y, start.m - 1, start.d);
  const b = Date.UTC(end.y, end.m - 1, end.d);
  return Math.round((b - a) / 86_400_000);
}

function utcWeekday(date: Ymd): number {
  return new Date(Date.UTC(date.y, date.m - 1, date.d)).getUTCDay();
}

function weekIndex(date: Ymd): number {
  const utc = Date.UTC(date.y, date.m - 1, date.d);
  const mondayOffset = (utcWeekday(date) + 6) % 7;
  return Math.floor((utc - mondayOffset * 86_400_000) / (7 * 86_400_000));
}

function stampMs(stamp: Stamp): number | null {
  if (stamp.timeZone === "UTC") {
    return Date.UTC(stamp.y, stamp.m - 1, stamp.d, stamp.h, stamp.min, 0);
  }
  if (!isValidTimeZone(stamp.timeZone)) return null;
  return zonedLocalToUtc(
    stamp.y,
    stamp.m,
    stamp.d,
    stamp.h,
    stamp.min,
    stamp.timeZone,
  ).getTime();
}

function parseStamp(
  value: string,
  params: Record<string, string>,
  fallbackTz: string,
): Stamp | null {
  const raw = value.trim();
  const dateOnly = params.VALUE?.toUpperCase() === "DATE" || /^\d{8}$/.test(raw);
  if (dateOnly) {
    const match = /^(\d{4})(\d{2})(\d{2})/.exec(raw);
    if (!match) return null;
    const stamp: Stamp = {
      y: Number(match[1]),
      m: Number(match[2]),
      d: Number(match[3]),
      h: 0,
      min: 0,
      allDay: true,
      timeZone: fallbackTz,
    };
    if (stamp.m < 1 || stamp.m > 12 || stamp.d < 1 || stamp.d > 31) return null;
    return stamp;
  }
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/i.exec(raw);
  if (!match) return null;
  const zulu = Boolean(match[7]);
  const zone = params.TZID?.replace(/^"|"$/g, "");
  const stamp: Stamp = {
    y: Number(match[1]),
    m: Number(match[2]),
    d: Number(match[3]),
    h: Number(match[4]),
    min: Number(match[5]),
    allDay: false,
    timeZone: zulu ? "UTC" : zone || fallbackTz,
  };
  if (
    stamp.m < 1 ||
    stamp.m > 12 ||
    stamp.d < 1 ||
    stamp.d > 31 ||
    stamp.h > 23 ||
    stamp.min > 59
  ) {
    return null;
  }
  return stamp;
}

function parseDuration(value: string): number | null {
  const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(value.trim());
  if (!match) return null;
  const days = Number(match[1] ?? 0);
  const hours = Number(match[2] ?? 0);
  const mins = Number(match[3] ?? 0);
  const secs = Number(match[4] ?? 0);
  const ms = (((days * 24 + hours) * 60 + mins) * 60 + secs) * 1000;
  return ms > 0 ? ms : null;
}

function parseByday(value: string | undefined): Byday[] {
  if (!value) return [];
  const out: Byday[] = [];
  for (const part of value.split(",")) {
    const match = /^([+-]?\d+)?([A-Z]{2})$/.exec(part.trim().toUpperCase());
    if (!match || WEEKDAY[match[2]] == null) continue;
    out.push({
      day: WEEKDAY[match[2]],
      ordinal: match[1] ? Number(match[1]) : null,
    });
  }
  return out;
}

function parseRrule(value: string, fallbackTz: string): RRule | null {
  const fields = new Map<string, string>();
  for (const part of value.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    fields.set(part.slice(0, eq).trim().toUpperCase(), part.slice(eq + 1).trim());
  }
  const freq = fields.get("FREQ");
  if (freq !== "DAILY" && freq !== "WEEKLY" && freq !== "MONTHLY" && freq !== "YEARLY") {
    return null;
  }
  const interval = Math.max(1, Number(fields.get("INTERVAL")) || 1);
  const countRaw = fields.get("COUNT");
  const count = countRaw == null ? null : Number(countRaw);
  let untilMs: number | null = null;
  const until = fields.get("UNTIL");
  if (until) {
    const stamp = parseStamp(until, {}, fallbackTz);
    if (stamp) {
      if (stamp.allDay) {
        const end = addDays(stamp, 1);
        untilMs = stampMs({ ...stamp, ...end, h: 0, min: 0, allDay: true }) ;
      } else {
        untilMs = stampMs(stamp);
      }
    }
  }
  return {
    freq,
    interval,
    count: count != null && Number.isFinite(count) ? count : null,
    untilMs,
    byday: parseByday(fields.get("BYDAY")),
  };
}

function nthWeekday(date: Ymd): number {
  return Math.floor((date.d - 1) / 7) + 1;
}

function isLastWeekday(date: Ymd): boolean {
  return addDays(date, 7).m !== date.m;
}

function matchesByday(date: Ymd, byday: Byday[], monthly: boolean): boolean {
  const weekday = utcWeekday(date);
  return byday.some((item) => {
    if (item.day !== weekday) return false;
    if (!monthly || item.ordinal == null) return true;
    if (item.ordinal === -1) return isLastWeekday(date);
    return item.ordinal === nthWeekday(date);
  });
}

function dateMatches(start: Stamp, date: Ymd, rule: RRule): boolean {
  const delta = daysBetween(start, date);
  if (delta < 0) return false;
  if (rule.freq === "DAILY") return delta % rule.interval === 0;
  if (rule.freq === "WEEKLY") {
    const allowed = rule.byday.length > 0 ? rule.byday : [{ day: utcWeekday(start), ordinal: null }];
    if (!matchesByday(date, allowed, false)) return false;
    const weeks = weekIndex(date) - weekIndex(start);
    return weeks >= 0 && weeks % rule.interval === 0;
  }
  if (rule.freq === "MONTHLY") {
    const months = (date.y - start.y) * 12 + (date.m - start.m);
    if (months < 0 || months % rule.interval !== 0) return false;
    if (rule.byday.length > 0) return matchesByday(date, rule.byday, true);
    return date.d === start.d;
  }
  const years = date.y - start.y;
  if (years < 0 || years % rule.interval !== 0) return false;
  return date.m === start.m && date.d === start.d;
}

interface Prop {
  params: Record<string, string>;
  value: string;
}

function eventProps(block: string): Map<string, Prop[]> {
  const map = new Map<string, Prop[]>();
  for (const line of block.split("\n")) {
    if (!line || line.startsWith("BEGIN:") || line.startsWith("END:")) continue;
    const splitAt = line.indexOf(":");
    if (splitAt < 0) continue;
    const left = line.slice(0, splitAt);
    const value = line.slice(splitAt + 1).trim();
    const [nameRaw, ...paramParts] = left.split(";");
    const params: Record<string, string> = {};
    for (const part of paramParts) {
      const eq = part.indexOf("=");
      if (eq < 0) continue;
      params[part.slice(0, eq).trim().toUpperCase()] = part.slice(eq + 1).trim().replace(/^"|"$/g, "");
    }
    const name = nameRaw.trim().toUpperCase();
    const list = map.get(name) ?? [];
    list.push({ params, value });
    map.set(name, list);
  }
  return map;
}

function instants(props: Prop[] | undefined, fallbackTz: string): Set<number> {
  const set = new Set<number>();
  for (const prop of props ?? []) {
    for (const piece of prop.value.split(",")) {
      const stamp = parseStamp(piece, prop.params, fallbackTz);
      const ms = stamp ? stampMs(stamp) : null;
      if (ms != null) set.add(ms);
    }
  }
  return set;
}

function parseEvent(block: string, fallbackTz: string): ParsedEvent | null {
  const props = eventProps(block);
  const startProp = props.get("DTSTART")?.[0];
  if (!startProp) return null;
  const start = parseStamp(startProp.value, startProp.params, fallbackTz);
  if (!start) return null;
  const startMs = stampMs(start);
  if (startMs == null) return null;

  let durationMs = 60 * 60 * 1000;
  let allDayDays = 0;
  const endProp = props.get("DTEND")?.[0];
  const durationProp = props.get("DURATION")?.[0]?.value;
  if (start.allDay) {
    allDayDays = 1;
    if (endProp) {
      const end = parseStamp(endProp.value, endProp.params, fallbackTz);
      if (end) allDayDays = Math.max(1, daysBetween(start, end));
    } else if (durationProp) {
      const ms = parseDuration(durationProp);
      if (ms) allDayDays = Math.max(1, Math.round(ms / 86_400_000));
    }
    durationMs = 0;
  } else if (endProp) {
    const end = parseStamp(endProp.value, endProp.params, fallbackTz);
    const endMs = end ? stampMs(end) : null;
    if (endMs != null && endMs > startMs) durationMs = endMs - startMs;
  } else if (durationProp) {
    const ms = parseDuration(durationProp);
    if (ms) durationMs = ms;
  }

  const ruleProp = props.get("RRULE")?.[0]?.value;
  const recurrence = props.get("RECURRENCE-ID")?.[0];
  const recurrenceStamp = recurrence
    ? parseStamp(recurrence.value, recurrence.params, fallbackTz)
    : null;
  const status = props.get("STATUS")?.[0]?.value.toUpperCase() ?? "";
  const transp = props.get("TRANSP")?.[0]?.value.toUpperCase() ?? "";

  return {
    start,
    startMs,
    durationMs,
    allDayDays,
    rrule: ruleProp ? parseRrule(ruleProp, start.timeZone) : null,
    exdates: instants(props.get("EXDATE"), start.timeZone),
    recurrenceId: recurrenceStamp ? stampMs(recurrenceStamp) : null,
    cancelled: status === "CANCELLED",
    transparent: transp === "TRANSPARENT",
  };
}

function parseFreeBusy(
  ics: string,
  fallbackTz: string,
  rangeStartMs: number,
  rangeEndMs: number,
): BusyInterval[] {
  const text = unfold(ics);
  const intervals: BusyInterval[] = [];
  const pattern = /BEGIN:VFREEBUSY\n?([\s\S]*?)END:VFREEBUSY/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    const props = eventProps(match[1]);
    for (const prop of props.get("FREEBUSY") ?? []) {
      const kind = (prop.params.FBTYPE ?? "BUSY").toUpperCase();
      if (kind === "FREE") continue;
      for (const piece of prop.value.split(",")) {
        const [startRaw, endRaw] = piece.trim().split("/");
        if (!startRaw || !endRaw) continue;
        const start = parseStamp(startRaw, prop.params, fallbackTz);
        const end = parseStamp(endRaw, prop.params, fallbackTz);
        const startMs = start ? stampMs(start) : null;
        const endMs = end ? stampMs(end) : null;
        if (startMs == null || endMs == null || endMs <= startMs) continue;
        if (startMs < rangeEndMs && endMs > rangeStartMs) {
          intervals.push({ startMs, endMs });
        }
      }
    }
  }
  return intervals;
}

function parseEvents(ics: string, fallbackTz: string): ParsedEvent[] {
  const text = unfold(ics);
  const events: ParsedEvent[] = [];
  const pattern = /BEGIN:VEVENT\n?([\s\S]*?)END:VEVENT/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    const event = parseEvent(match[1], fallbackTz);
    if (event) events.push(event);
  }
  return events;
}

function occurrenceEnd(event: ParsedEvent, occStart: number, date: Ymd): number | null {
  if (event.allDayDays > 0) {
    return stampMs({
      ...event.start,
      ...addDays(date, event.allDayDays),
      h: 0,
      min: 0,
      allDay: true,
    });
  }
  return occStart + event.durationMs;
}

function expand(
  event: ParsedEvent,
  rangeStartMs: number,
  rangeEndMs: number,
  skip: Set<number>,
): BusyInterval[] {
  if (event.cancelled || event.transparent || event.durationMs < 0) return [];
  if (!event.allDayDays && event.durationMs === 0) return [];
  const intervals: BusyInterval[] = [];
  const span = rangeEndMs - event.startMs;
  const horizon = event.rrule
    ? Math.min(12_000, Math.max(0, Math.ceil(span / 86_400_000) + event.allDayDays + 2))
    : 0;
  let produced = 0;

  for (let i = 0; i <= horizon; i += 1) {
    const date = addDays(event.start, i);
    if (event.rrule && !dateMatches(event.start, date, event.rrule)) continue;
    const occStart = event.allDayDays
      ? stampMs({ ...event.start, ...date, h: 0, min: 0, allDay: true })
      : stampMs({ ...event.start, ...date });
    if (occStart == null) continue;
    if (event.rrule?.untilMs != null && occStart > event.rrule.untilMs) break;
    produced += 1;
    if (event.rrule?.count != null && produced > event.rrule.count) break;
    const occEnd = occurrenceEnd(event, occStart, date);
    const excluded = event.exdates.has(occStart) || skip.has(occStart);
    if (!excluded && occEnd != null && occStart < rangeEndMs && occEnd > rangeStartMs) {
      intervals.push({ startMs: occStart, endMs: occEnd });
    }
    if (!event.rrule) break;
    if (occStart >= rangeEndMs) break;
  }
  return intervals;
}

export function parseIcsBusy(
  ics: string,
  rangeStart: Date,
  rangeEnd: Date,
  timeZone: string,
): BusyInterval[] {
  const events = parseEvents(ics, timeZone);
  const overrides = new Map<number, ParsedEvent>();
  const masters: ParsedEvent[] = [];
  for (const event of events) {
    if (event.recurrenceId != null) overrides.set(event.recurrenceId, event);
    else masters.push(event);
  }
  const skip = new Set(overrides.keys());
  const rangeStartMs = rangeStart.getTime();
  const rangeEndMs = rangeEnd.getTime();
  const intervals: BusyInterval[] = [];
  for (const event of masters) {
    intervals.push(...expand(event, rangeStartMs, rangeEndMs, skip));
  }
  for (const override of overrides.values()) {
    intervals.push(...expand({ ...override, rrule: null }, rangeStartMs, rangeEndMs, new Set()));
  }
  intervals.push(...parseFreeBusy(ics, timeZone, rangeStartMs, rangeEndMs));
  return intervals;
}
