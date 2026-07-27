"use client";

import { useState, useSyncExternalStore } from "react";
import { Loader2 } from "lucide-react";
import { cn, relativeTime } from "@/lib/utils";
import type { EssayFeedbackEntry } from "@/lib/essay-feedback-types";

type Rating = "yes" | "somewhat" | "no";

const RATINGS: { value: Rating; label: string }[] = [
  { value: "yes", label: "Useful" },
  { value: "somewhat", label: "Somewhat" },
  { value: "no", label: "Not useful" },
];

const RATING_LABEL: Record<Rating, string> = {
  yes: "Useful",
  somewhat: "Somewhat",
  no: "Not useful",
};

const storageKey = (slug: string) => `orbit-essay-feedback:${slug}`;

interface EssayFeedbackProps {
  slug: string;
  initialEntries?: EssayFeedbackEntry[];
}

export function EssayFeedback({
  slug,
  initialEntries = [],
}: EssayFeedbackProps) {
  const [rating, setRating] = useState<Rating | null>(null);
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState(initialEntries);
  const [localSubmitted, setLocalSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const storedSubmitted = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return window.localStorage.getItem(storageKey(slug)) !== null;
      } catch {
        return false;
      }
    },
    () => false,
  );
  const submitted = localSubmitted || storedSubmitted;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating || sending) return;

    setError(null);
    setSending(true);

    try {
      const res = await fetch("/api/essay-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          rating,
          note: note.trim(),
          website: "",
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { error?: string; entry?: EssayFeedbackEntry }
        | null;

      if (!res.ok) {
        throw new Error(data?.error || "Could not save feedback.");
      }

      const saved: EssayFeedbackEntry = data?.entry ?? {
        rating,
        note: note.trim() || undefined,
        at: new Date().toISOString(),
      };

      setEntries((prev) => [saved, ...prev]);
      window.localStorage.setItem(
        storageKey(slug),
        JSON.stringify({
          rating: saved.rating,
          note: saved.note,
          at: saved.at,
        }),
      );
      setLocalSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save feedback.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <aside className="mt-12 border-t border-white/8 pt-8 space-y-8">
      {submitted ? (
        <p className="text-sm text-slate-300" aria-live="polite">
          Thanks — noted.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <p className="font-display text-base font-semibold text-white">
              Was this useful?
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Optional note welcome — one line is enough.
            </p>
          </div>

          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Was this useful?"
          >
            {RATINGS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-pressed={rating === value}
                className={cn(
                  "focus-ring inline-flex min-h-11 items-center rounded-full border px-4 text-xs font-medium transition-[color,background-color,border-color,transform]",
                  "active:scale-[0.98]",
                  rating === value
                    ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan"
                    : "border-white/10 text-slate-300 hover:border-white/20 hover:text-white",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor={`essay-note-${slug}`} className="sr-only">
              Optional note
            </label>
            <textarea
              id={`essay-note-${slug}`}
              rows={2}
              maxLength={280}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything unclear, missing, or worth keeping?"
              className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-neon-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/40"
            />
          </div>

          <input
            type="text"
            name="website"
            autoComplete="off"
            tabIndex={-1}
            className="hidden"
            aria-hidden="true"
          />

          {error ? (
            <p className="text-sm text-rose-300" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!rating || sending}
            className={cn(
              "focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold transition-[opacity,transform]",
              "active:scale-[0.98]",
              rating && !sending
                ? "bg-neon-cyan text-void hover:opacity-90"
                : "cursor-not-allowed bg-white/10 text-slate-500",
            )}
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Sending...
              </>
            ) : (
              "Send"
            )}
          </button>
        </form>
      )}

      {entries.length > 0 ? (
        <div className="space-y-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
            Notes on this essay
          </p>
          <ul className="space-y-4">
            {entries.map((entry) => (
              <li
                key={`${entry.at}-${entry.rating}-${entry.note ?? ""}`}
                className="border-t border-white/6 pt-4 first:border-t-0 first:pt-0"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-xs font-medium text-neon-cyan">
                    {RATING_LABEL[entry.rating]}
                  </span>
                  <time
                    dateTime={entry.at}
                    className="font-mono text-[0.65rem] text-slate-500"
                  >
                    {relativeTime(entry.at)}
                  </time>
                </div>
                {entry.note ? (
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {entry.note}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No note left.</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
