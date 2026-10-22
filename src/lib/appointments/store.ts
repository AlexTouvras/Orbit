import "server-only";
import fs from "node:fs";
import path from "node:path";
import { persistDataJson } from "@/lib/data-persist";
import { hasGithubStorage, readRepoFile } from "@/lib/github-storage";
import { listBookableDays } from "@/lib/appointments/calendar";
import {
  DEFAULT_WINDOW,
  validateWindow,
  type AppointmentBooking,
  type AppointmentWindow,
} from "@/lib/appointments/slots";

const RELATIVE_PATH = "data/appointments.json";
const FILE_PATH = path.join(process.cwd(), RELATIVE_PATH);
const KEEP_MS = 60 * 24 * 60 * 60 * 1000;

export interface AppointmentStore {
  window: AppointmentWindow;
  bookings: AppointmentBooking[];
}

export type LoadResult =
  | { ok: true; store: AppointmentStore }
  | { ok: false };

function asDays(value: unknown): number[] {
  if (!Array.isArray(value)) return [...DEFAULT_WINDOW.days];
  const days = [
    ...new Set(
      value.filter(
        (day): day is number =>
          typeof day === "number" && Number.isInteger(day) && day >= 0 && day <= 6,
      ),
    ),
  ];
  return days.length > 0 ? days : [...DEFAULT_WINDOW.days];
}

function normalizeWindow(raw: unknown): AppointmentWindow {
  const source =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};
  const window: AppointmentWindow = {
    timezone:
      typeof source.timezone === "string" && source.timezone.trim()
        ? source.timezone.trim()
        : DEFAULT_WINDOW.timezone,
    days: asDays(source.days),
    start: typeof source.start === "string" ? source.start : DEFAULT_WINDOW.start,
    end: typeof source.end === "string" ? source.end : DEFAULT_WINDOW.end,
    slotMinutes:
      typeof source.slotMinutes === "number"
        ? source.slotMinutes
        : DEFAULT_WINDOW.slotMinutes,
    horizonDays:
      typeof source.horizonDays === "number"
        ? source.horizonDays
        : DEFAULT_WINDOW.horizonDays,
  };
  return validateWindow(window) ? { ...DEFAULT_WINDOW, days: [...DEFAULT_WINDOW.days] } : window;
}

function normalizeBooking(raw: unknown): AppointmentBooking | null {
  if (typeof raw !== "object" || raw === null) return null;
  const booking = raw as Record<string, unknown>;
  const id = typeof booking.id === "string" ? booking.id.trim() : "";
  const start = typeof booking.start === "string" ? booking.start.trim() : "";
  const name = typeof booking.name === "string" ? booking.name.trim() : "";
  const email = typeof booking.email === "string" ? booking.email.trim() : "";
  const createdAt =
    typeof booking.createdAt === "string" && booking.createdAt.trim()
      ? booking.createdAt.trim()
      : new Date(0).toISOString();
  if (!id || !name || !email || !Number.isFinite(Date.parse(start))) return null;
  const note =
    typeof booking.note === "string" && booking.note.trim()
      ? booking.note.trim()
      : undefined;
  return { id, start, name, email, createdAt, note };
}

export function normalizeStore(raw: unknown): AppointmentStore {
  const source =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};
  const bookings = Array.isArray(source.bookings)
    ? source.bookings
        .map(normalizeBooking)
        .filter((booking): booking is AppointmentBooking => booking !== null)
    : [];
  return { window: normalizeWindow(source.window), bookings };
}

function readLocalStore(): AppointmentStore {
  try {
    return normalizeStore(JSON.parse(fs.readFileSync(FILE_PATH, "utf8")) as unknown);
  } catch {
    return normalizeStore({});
  }
}

function prune(bookings: AppointmentBooking[], now: Date): AppointmentBooking[] {
  const cutoff = now.getTime() - KEEP_MS;
  return bookings.filter((booking) => Date.parse(booking.start) >= cutoff);
}

export async function loadAppointments(): Promise<LoadResult> {
  if (hasGithubStorage()) {
    const raw = await readRepoFile(RELATIVE_PATH);
    if (raw) {
      try {
        return { ok: true, store: normalizeStore(JSON.parse(raw) as unknown) };
      } catch {
        return { ok: false };
      }
    }
    if (process.env.VERCEL) return { ok: false };
  }
  return { ok: true, store: readLocalStore() };
}

async function writeStore(
  store: AppointmentStore,
  message: string,
): Promise<{ viaGithub: boolean; warning?: string }> {
  const next: AppointmentStore = {
    window: store.window,
    bookings: prune(store.bookings, new Date()),
  };
  return persistDataJson(RELATIVE_PATH, next, message);
}

export async function saveAppointmentWindow(
  window: AppointmentWindow,
): Promise<{ ok: true; viaGithub: boolean; warning?: string } | { ok: false; error: string }> {
  const error = validateWindow(window);
  if (error) return { ok: false, error };
  const loaded = await loadAppointments();
  if (!loaded.ok) return { ok: false, error: "Could not read the current bookings." };
  const result = await writeStore(
    { window, bookings: loaded.store.bookings },
    "chore(appointments): update the booking window",
  );
  return { ok: true, ...result };
}

export async function bookAppointment(input: {
  start: string;
  name: string;
  email: string;
  note?: string;
}): Promise<
  | { ok: true; booking: AppointmentBooking; viaGithub: boolean; warning?: string }
  | { ok: false; error: string; status: number }
> {
  const loaded = await loadAppointments();
  if (!loaded.ok) {
    return { ok: false, error: "Booking is unavailable right now.", status: 503 };
  }
  const { days: open } = await listBookableDays(
    loaded.store.window,
    loaded.store.bookings,
    new Date(),
  );
  const stillOpen = open.some((day) => day.slots.some((slot) => slot.start === input.start));
  if (!stillOpen) {
    return { ok: false, error: "That time was just taken. Pick another.", status: 409 };
  }

  const booking: AppointmentBooking = {
    id: crypto.randomUUID(),
    start: input.start,
    name: input.name,
    email: input.email,
    createdAt: new Date().toISOString(),
    note: input.note,
  };
  const result = await writeStore(
    { window: loaded.store.window, bookings: [...loaded.store.bookings, booking] },
    `chore(appointments): book ${input.start}`,
  );
  return { ok: true, booking, ...result };
}

export async function cancelAppointment(
  id: string,
): Promise<{ ok: true; viaGithub: boolean; warning?: string } | { ok: false; error: string }> {
  const loaded = await loadAppointments();
  if (!loaded.ok) return { ok: false, error: "Could not read the current bookings." };
  const bookings = loaded.store.bookings.filter((booking) => booking.id !== id);
  if (bookings.length === loaded.store.bookings.length) {
    return { ok: false, error: "That booking is already gone." };
  }
  const result = await writeStore(
    { window: loaded.store.window, bookings },
    "chore(appointments): cancel a booking",
  );
  return { ok: true, ...result };
}
