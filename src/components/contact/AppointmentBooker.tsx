"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { SlotDay } from "@/lib/appointments/slots";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-neon-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/40";

const labelClass =
  "font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400";

interface AppointmentBookerProps {
  available: boolean;
  summary: string;
  days: SlotDay[];
}

export function AppointmentBooker({
  available,
  summary,
  days,
}: AppointmentBookerProps) {
  const [openDays, setOpenDays] = useState(days);
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState<string | null>(null);
  const [mailSent, setMailSent] = useState(true);
  const nameRef = useRef<HTMLInputElement>(null);

  function choose(start: string) {
    setSelected(start);
    setError(null);
    setBooked(null);
    queueMicrotask(() => nameRef.current?.focus());
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          note: note.trim(),
          start: selected,
          website: honeypot,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        when?: string;
        mailSent?: boolean;
      };
      if (!res.ok) {
        if (res.status === 409) {
          setOpenDays((current) =>
            current
              .map((day) => ({
                ...day,
                slots: day.slots.filter((slot) => slot.start !== selected),
              }))
              .filter((day) => day.slots.length > 0),
          );
          setSelected(null);
        }
        setError(data.error ?? "Could not book that time.");
        return;
      }

      setOpenDays((current) =>
        current
          .map((day) => ({
            ...day,
            slots: day.slots.filter((slot) => slot.start !== selected),
          }))
          .filter((day) => day.slots.length > 0),
      );
      setBooked(typeof data.when === "string" ? data.when : "that time");
      setMailSent(data.mailSent !== false);
      setSelected(null);
      setName("");
      setEmail("");
      setNote("");
    } catch {
      setError("Network error. Try again or use the form above.");
    } finally {
      setLoading(false);
    }
  }

  if (!available) {
    return (
      <div>
        <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-slate-400">
          Book a time
        </h2>
        <p className="mt-3 text-sm text-slate-300">
          Booking is unavailable right now. Use the message form above.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-slate-400">
        Book a time
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">{summary}</p>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
        A meeting already on my calendar still shows as open here.
      </p>

      {booked && (
        <div className="mt-6 flex items-start gap-3" role="status">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-neon-cyan" aria-hidden />
          <p className="text-sm leading-relaxed text-slate-200">
            Booked: {booked}.
            {mailSent
              ? " A confirmation is on its way."
              : " I saved the time. The email did not go out, so send a message too."}
          </p>
        </div>
      )}

      {openDays.length === 0 ? (
        <p className="mt-6 text-sm text-slate-300">Nothing open in this window.</p>
      ) : (
        <div className="mt-8 space-y-8">
          {openDays.map((day) => (
            <div key={day.key}>
              <h3 className="text-sm font-medium text-white">{day.label}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {day.slots.map((slot) => {
                  const pressed = selected === slot.start;
                  return (
                    <button
                      key={slot.start}
                      type="button"
                      aria-pressed={pressed}
                      onClick={() => choose(slot.start)}
                      className={`focus-ring min-h-11 min-w-16 rounded-xl border px-3 text-sm font-medium transition-colors ${
                        pressed
                          ? "border-neon-cyan/60 bg-neon-cyan/15 text-white"
                          : "border-white/10 bg-white/5 text-slate-200 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {slot.timeLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <form onSubmit={onSubmit} className="mt-8 max-w-lg space-y-5" noValidate>
          <div className="space-y-2">
            <label htmlFor="appt-name" className={labelClass}>
              Name
            </label>
            <input
              ref={nameRef}
              id="appt-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="appt-email" className={labelClass}>
              Email
            </label>
            <input
              id="appt-email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="appt-note" className={labelClass}>
              What is it about
            </label>
            <textarea
              id="appt-note"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className={`${inputClass} resize-y`}
            />
          </div>
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-void hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Booking…
                </>
              ) : (
                "Book this time"
              )}
            </button>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="focus-ring min-h-11 text-sm text-slate-400 hover:text-white"
            >
              Keep looking
            </button>
          </div>
        </form>
      )}

      {!selected && error && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
