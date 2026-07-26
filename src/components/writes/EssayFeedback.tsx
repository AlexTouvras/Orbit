"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Rating = "yes" | "somewhat" | "no";

const RATINGS: { value: Rating; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "somewhat", label: "Somewhat" },
  { value: "no", label: "No" },
];

const storageKey = (slug: string) => `orbit-essay-feedback:${slug}`;

interface EssayFeedbackProps {
  slug: string;
}

export function EssayFeedback({ slug }: EssayFeedbackProps) {
  const [rating, setRating] = useState<Rating | null>(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(storageKey(slug))) {
        setSubmitted(true);
      }
    } catch {
      // private mode / blocked storage — still show the form
    }
    setReady(true);
  }, [slug]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return;

    try {
      window.localStorage.setItem(
        storageKey(slug),
        JSON.stringify({
          rating,
          note: note.trim() || undefined,
          at: new Date().toISOString(),
        }),
      );
    } catch {
      // still acknowledge locally
    }

    setSubmitted(true);
  }

  if (!ready) {
    return <div className="mt-12 min-h-[7rem]" aria-hidden />;
  }

  if (submitted) {
    return (
      <aside className="mt-12 border-t border-white/8 pt-8" aria-live="polite">
        <p className="text-sm text-slate-300">Thanks — noted.</p>
      </aside>
    );
  }

  return (
    <aside className="mt-12 border-t border-white/8 pt-8">
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

        <button
          type="submit"
          disabled={!rating}
          className={cn(
            "focus-ring inline-flex min-h-11 items-center rounded-xl px-5 text-sm font-semibold transition-[opacity,transform]",
            "active:scale-[0.98]",
            rating
              ? "bg-neon-cyan text-void hover:opacity-90"
              : "cursor-not-allowed bg-white/10 text-slate-500",
          )}
        >
          Send
        </button>
      </form>
    </aside>
  );
}
