import assert from "node:assert/strict";
import { resolveVerifiedFrom } from "../mail-from";
import {
  DEFAULT_WINDOW,
  describeWindow,
  listOpenDays,
  validateWindow,
  zonedLocalToUtc,
  type AppointmentBooking,
} from "./slots";

const summer = zonedLocalToUtc(2026, 10, 22, 10, 0, "Europe/Helsinki");
assert.equal(summer.toISOString(), "2026-10-22T07:00:00.000Z");

const winter = zonedLocalToUtc(2026, 1, 15, 10, 0, "Europe/Helsinki");
assert.equal(winter.toISOString(), "2026-01-15T08:00:00.000Z");

assert.equal(validateWindow(DEFAULT_WINDOW), null);
assert.ok(validateWindow({ ...DEFAULT_WINDOW, start: "16:00", end: "10:00" }));
assert.ok(validateWindow({ ...DEFAULT_WINDOW, timezone: "Not/AZone" }));
assert.ok(validateWindow({ ...DEFAULT_WINDOW, days: [] }));

assert.equal(
  describeWindow(DEFAULT_WINDOW),
  "Weekdays, 10:00–16:00 Helsinki time. Each slot is 30 minutes.",
);

const now = new Date("2026-10-22T06:00:00.000Z");
const days = listOpenDays(DEFAULT_WINDOW, [], now);
const thursday = days.find((day) => day.key === "2026-10-22");
assert.ok(thursday);
assert.equal(thursday.slots[0]?.timeLabel, "11:00");
assert.equal(thursday.slots.at(-1)?.timeLabel, "15:30");
assert.ok(days.some((day) => day.key === "2026-10-23"));
assert.equal(
  days.some((day) => day.key === "2026-10-24"),
  false,
);

const bookedStart = thursday.slots[0]?.start;
assert.ok(bookedStart);
const booking: AppointmentBooking = {
  id: "1",
  start: bookedStart,
  name: "A",
  email: "a@b.co",
  createdAt: now.toISOString(),
};
const after = listOpenDays(DEFAULT_WINDOW, [booking], now);
const thursdayAfter = after.find((day) => day.key === "2026-10-22");
assert.equal(
  thursdayAfter?.slots.some((slot) => slot.start === bookedStart),
  false,
);

assert.equal(
  resolveVerifiedFrom("onboarding@resend.dev", "Orbit <hello@alextouvras.com>"),
  "Orbit <hello@alextouvras.com>",
);
assert.equal(
  resolveVerifiedFrom("Orbit <hello@alextouvras.com>", "other@example.com"),
  "Orbit <hello@alextouvras.com>",
);
assert.equal(resolveVerifiedFrom("  ", "onboarding@resend.dev"), "");

console.log("appointment slots ok");
