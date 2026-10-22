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
  notesLabel?: string;
  /** Paper keeps the form readable on a handbook page. */
  tone?: "ink" | "paper";
}

export function EssayFeedback({
  slug,
  initialEntries = [],
  notesLabel = "Notes on this essay",
  tone = "ink",
}: EssayFeedbackProps) {
  const paper = tone === "paper";
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
    <aside className={cn("mt-12 space-y-8 border-t pt-8", paper ? "border-[var(--book-rule)]" : "border-white/8")}>
      {submitted ? (
        <p className={cn("text-sm", paper ? "text-[var(--book-ink)]" : "text-slate-300")} aria-live="polite">
          Thanks — noted.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <p className={cn("font-display text-base font-semibold", paper ? "text-[var(--book-ink)]" : "text-white")}>
              Was this useful?
            </p>
            <p className={cn("mt-1 text-sm", paper ? "text-[var(--book-muted)]" : "text-slate-400")}>
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
                  "focus-ring inline-flex min-h-11 items-center border px-4 text-sm font-medium",
                  paper ? "rounded-sm" : "rounded-full text-xs transition-[color,background-color,border-color,transform] active:scale-[0.98]",
                  rating === value
                    ? paper
                      ? "border-[var(--book-ink)] bg-[var(--book-ink)] text-[var(--book-paper)]"
                      : "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan"
                    : paper
                      ? "border-[var(--book-rule)] text-[var(--book-ink)]"
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
              className={cn(
                "w-full resize-y border px-4 py-3 text-sm focus:outline-none",
                paper
                  ? "rounded-sm border-[var(--book-rule)] bg-[var(--book-paper)] text-[var(--book-ink)] placeholder:text-[var(--book-muted)]"
                  : "rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-neon-cyan/50 focus-visible:ring-2 focus-visible:ring-neon-cyan/40",
              )}
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
            <p className={cn("text-sm", paper ? "text-[#8f1d1d]" : "text-rose-300")} role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!rating || sending}
            className={cn(
              "focus-ring inline-flex min-h-11 items-center gap-2 px-5 text-sm font-semibold",
              paper ? "rounded-sm" : "rounded-xl transition-[opacity,transform] active:scale-[0.98]",
              rating && !sending
                ? paper
                  ? "bg-[var(--book-ink)] text-[var(--book-paper)]"
                  : "bg-neon-cyan text-void hover:opacity-90"
                : paper
                  ? "cursor-not-allowed border border-[var(--book-rule)] text-[var(--book-muted)]"
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
          <p className={cn("text-sm font-medium", paper ? "text-[var(--book-muted)]" : "font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-500")}>
            {notesLabel}
          </p>
          <ul className="space-y-4">
            {entries.map((entry) => (
              <li
                key={`${entry.at}-${entry.rating}-${entry.note ?? ""}`}
                className={cn("border-t pt-4 first:border-t-0 first:pt-0", paper ? "border-[var(--book-rule)]" : "border-white/6")}
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className={cn("text-sm font-medium", paper ? "text-[var(--book-accent)]" : "text-xs text-neon-cyan")}>
                    {RATING_LABEL[entry.rating]}
                  </span>
                  <time
                    dateTime={entry.at}
                    className={cn(paper ? "text-sm text-[var(--book-muted)]" : "font-mono text-[0.65rem] text-slate-500")}
                  >
                    {relativeTime(entry.at)}
                  </time>
                </div>
                {entry.note ? (
                  <p className={cn("mt-2 text-sm leading-relaxed", paper ? "text-[var(--book-ink)]" : "text-slate-300")}>
                    {entry.note}
                  </p>
                ) : (
                  <p className={cn("mt-2 text-sm", paper ? "text-[var(--book-muted)]" : "text-slate-500")}>No note left.</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
