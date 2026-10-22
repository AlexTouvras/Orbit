import assert from "node:assert/strict";
import { allowedCalendarFeedUrl, calendarFeedUrls } from "./calendar-url";
import { parseIcsBusy } from "./ics";
import { DEFAULT_WINDOW, listOpenDays } from "./slots";

const now = new Date("2026-10-22T06:00:00.000Z");
const rangeEnd = new Date("2026-11-24T00:00:00.000Z");
const zone = "Europe/Helsinki";

function fridaySlots(ics: string) {
  const busy = parseIcsBusy(ics, now, rangeEnd, zone);
  const days = listOpenDays(DEFAULT_WINDOW, [], now, busy);
  return days.find((day) => day.key === "2026-10-23");
}

const weekly = `
BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART:20261023T070000Z
DTEND:20261023T073000Z
RRULE:FREQ=WEEKLY;BYDAY=FR
SUMMARY:Standup
END:VEVENT
END:VCALENDAR
`;
const friday = fridaySlots(weekly);
assert.ok(friday);
assert.equal(
  friday.slots.some((slot) => slot.timeLabel === "10:00"),
  false,
);
assert.equal(
  friday.slots.some((slot) => slot.timeLabel === "10:30"),
  true,
);
const nextFriday = parseIcsBusy(weekly, now, rangeEnd, zone);
assert.equal(
  nextFriday.some((block) => block.startMs === Date.parse("2026-10-30T07:00:00.000Z")),
  true,
);

const helsinki = `
BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART;TZID=Europe/Helsinki:20261023T100000
DTEND;TZID=Europe/Helsinki:20261023T110000
END:VEVENT
END:VCALENDAR
`;
const blockedHour = fridaySlots(helsinki);
assert.equal(blockedHour?.slots.some((slot) => slot.timeLabel === "10:00"), false);
assert.equal(blockedHour?.slots.some((slot) => slot.timeLabel === "10:30"), false);
assert.equal(blockedHour?.slots.some((slot) => slot.timeLabel === "11:00"), true);

const folded = `
BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART:20261023T070
 000Z
DTEND:20261023T073000Z
END:VEVENT
END:VCALENDAR
`;
assert.equal(fridaySlots(folded)?.slots.some((slot) => slot.timeLabel === "10:00"), false);

const transparent = `
BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART:20261023T070000Z
DTEND:20261023T080000Z
TRANSP:TRANSPARENT
END:VEVENT
END:VCALENDAR
`;
assert.equal(fridaySlots(transparent)?.slots.some((slot) => slot.timeLabel === "10:00"), true);

const cancelled = `
BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART:20261023T070000Z
DTEND:20261023T080000Z
STATUS:CANCELLED
END:VEVENT
END:VCALENDAR
`;
assert.equal(fridaySlots(cancelled)?.slots.some((slot) => slot.timeLabel === "10:00"), true);

const allDay = `
BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART;VALUE=DATE:20261023
DTEND;VALUE=DATE:20261024
END:VEVENT
END:VCALENDAR
`;
const allDayFriday = fridaySlots(allDay);
assert.equal(allDayFriday, undefined);
const thursday = listOpenDays(
  DEFAULT_WINDOW,
  [],
  now,
  parseIcsBusy(allDay, now, rangeEnd, zone),
).find((day) => day.key === "2026-10-22");
assert.ok(thursday && thursday.slots.length > 0);

const excepted = `
BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART:20261023T070000Z
DTEND:20261023T073000Z
RRULE:FREQ=WEEKLY;BYDAY=FR
EXDATE:20261023T070000Z
END:VEVENT
END:VCALENDAR
`;
assert.equal(fridaySlots(excepted)?.slots.some((slot) => slot.timeLabel === "10:00"), true);
assert.equal(
  parseIcsBusy(excepted, now, rangeEnd, zone).some(
    (block) => block.startMs === Date.parse("2026-10-30T07:00:00.000Z"),
  ),
  true,
);

const monthly = `
BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART;TZID=Europe/Helsinki:20261023T100000
DTEND;TZID=Europe/Helsinki:20261023T103000
RRULE:FREQ=MONTHLY
END:VEVENT
END:VCALENDAR
`;
const november = parseIcsBusy(monthly, now, rangeEnd, zone);
assert.equal(
  november.some((block) => block.startMs === Date.parse("2026-11-23T08:00:00.000Z")),
  true,
);

const moved = `
BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART:20261023T070000Z
DTEND:20261023T073000Z
RRULE:FREQ=WEEKLY;BYDAY=FR
END:VEVENT
BEGIN:VEVENT
DTSTART:20261023T080000Z
DTEND:20261023T083000Z
RECURRENCE-ID:20261023T070000Z
END:VEVENT
END:VCALENDAR
`;
const movedFriday = fridaySlots(moved);
assert.equal(movedFriday?.slots.some((slot) => slot.timeLabel === "10:00"), true);
assert.equal(movedFriday?.slots.some((slot) => slot.timeLabel === "11:00"), false);

assert.equal(
  allowedCalendarFeedUrl("https://calendar.google.com/calendar/ical/secret/basic.ics"),
  "https://calendar.google.com/calendar/ical/secret/basic.ics",
);
assert.equal(
  allowedCalendarFeedUrl("https://caldav.icloud.com/published/2/secret"),
  "https://caldav.icloud.com/published/2/secret",
);
assert.equal(allowedCalendarFeedUrl("http://calendar.google.com/x"), null);
assert.equal(allowedCalendarFeedUrl("https://example.com/calendar.ics"), null);
assert.equal(allowedCalendarFeedUrl("https://user:pass@calendar.google.com/x"), null);
assert.equal(
  allowedCalendarFeedUrl("https://outlook.office365.com/owa/calendar/abc/calendar.ics"),
  "https://outlook.office365.com/owa/calendar/abc/calendar.ics",
);

const both = calendarFeedUrls(
  "https://calendar.google.com/calendar/ical/personal/basic.ics https://outlook.office365.com/owa/calendar/work/calendar.ics",
);
assert.deepEqual(both.urls, [
  "https://calendar.google.com/calendar/ical/personal/basic.ics",
  "https://outlook.office365.com/owa/calendar/work/calendar.ics",
]);
assert.equal(both.invalid, 0);
assert.equal(calendarFeedUrls("https://example.com/cal.ics").invalid, 1);

const freeBusy = `
BEGIN:VCALENDAR
BEGIN:VFREEBUSY
FREEBUSY;FBTYPE=BUSY:20261023T070000Z/20261023T073000Z
FREEBUSY;FBTYPE=FREE:20261023T080000Z/20261023T083000Z
END:VFREEBUSY
END:VCALENDAR
`;
const busyOnly = fridaySlots(freeBusy);
assert.equal(busyOnly?.slots.some((slot) => slot.timeLabel === "10:00"), false);
assert.equal(busyOnly?.slots.some((slot) => slot.timeLabel === "11:00"), true);

console.log("appointment calendar ok");
