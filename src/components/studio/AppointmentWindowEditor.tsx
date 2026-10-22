"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { AppointmentWindow } from "@/lib/appointments/slots";
import { GlassCard } from "@/components/ui/GlassCard";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-neon-cyan/50 focus:outline-none focus:ring-1 focus:ring-neon-cyan/30";

const DAY_OPTIONS = [
  { day: 1, label: "Mon" },
  { day: 2, label: "Tue" },
  { day: 3, label: "Wed" },
  { day: 4, label: "Thu" },
  { day: 5, label: "Fri" },
  { day: 6, label: "Sat" },
  { day: 0, label: "Sun" },
] as const;

export interface UpcomingBooking {
  id: string;
  label: string;
  name: string;
  email: string;
  note?: string;
}

interface AppointmentWindowEditorProps {
  initialWindow: AppointmentWindow;
  upcoming: UpcomingBooking[];
}

export function AppointmentWindowEditor({
  initialWindow,
  upcoming,
}: AppointmentWindowEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<AppointmentWindow>(initialWindow);
  const [bookings, setBookings] = useState(upcoming);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  function toggleDay(day: number) {
    setForm((current) => {
      const has = current.days.includes(day);
      const days = has ? current.days.filter((item) => item !== day) : [...current.days, day];
      return { ...current, days };
    });
    setStatus("idle");
  }

  async function onSave() {
    setStatus("saving");
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/studio/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ window: form }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Save failed.");
        setStatus("error");
        return;
      }
      setMessage(data.message ?? "Saved.");
      setStatus("saved");
      router.refresh();
    } catch {
      setError("Network error.");
      setStatus("error");
    }
  }

  async function onCancel(id: string) {
    setCancelling(id);
    setError(null);
    try {
      const res = await fetch("/api/studio/appointments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not cancel.");
        return;
      }
      setBookings((current) => current.filter((booking) => booking.id !== id));
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setCancelling(null);
    }
  }

  return (
    <GlassCard className="p-6">
      <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-slate-500">
        Appointment window
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
        People book these hours on the contact page. The list does not check
        Google Calendar, so leave the hours free of other meetings. Times that
        start within 2 hours stay hidden.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {DAY_OPTIONS.map((option) => {
          const on = form.days.includes(option.day);
          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={on}
              onClick={() => toggleDay(option.day)}
              className={`focus-ring min-h-11 min-w-14 rounded-lg border px-3 text-sm ${
                on
                  ? "border-neon-cyan/50 bg-neon-cyan/15 text-white"
                  : "border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
            From
          </span>
          <input
            type="time"
            value={form.start}
            onChange={(event) => setForm((current) => ({ ...current, start: event.target.value }))}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
            Until
          </span>
          <input
            type="time"
            value={form.end}
            onChange={(event) => setForm((current) => ({ ...current, end: event.target.value }))}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
            Slot
          </span>
          <select
            value={form.slotMinutes}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                slotMinutes: Number(event.target.value),
              }))
            }
            className={`${inputClass} [color-scheme:dark]`}
          >
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
            Days ahead
          </span>
          <input
            type="number"
            min={1}
            max={28}
            value={form.horizonDays}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                horizonDays: Number(event.target.value),
              }))
            }
            className={inputClass}
          />
        </label>
      </div>

      <label className="mt-4 block max-w-sm">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
          Timezone
        </span>
        <input
          type="text"
          value={form.timezone}
          onChange={(event) =>
            setForm((current) => ({ ...current, timezone: event.target.value }))
          }
          className={inputClass}
          spellCheck={false}
        />
      </label>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onSave}
          disabled={status === "saving"}
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-void hover:bg-slate-100 disabled:opacity-50"
        >
          {status === "saving" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            "Save window"
          )}
        </button>
        {message && <p className="text-sm text-slate-300">{message}</p>}
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <h3 className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Upcoming
        </h3>
        {bookings.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No bookings yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {bookings.map((booking) => (
              <li
                key={booking.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-white/10 px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm text-white">{booking.label}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {booking.name} · {booking.email}
                  </p>
                  {booking.note && (
                    <p className="mt-1 text-sm text-slate-500">{booking.note}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onCancel(booking.id)}
                  disabled={cancelling === booking.id}
                  className="focus-ring min-h-11 text-sm text-slate-400 hover:text-red-300 disabled:opacity-50"
                >
                  {cancelling === booking.id ? "Cancelling…" : "Cancel"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </GlassCard>
  );
}
