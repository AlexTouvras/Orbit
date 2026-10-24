"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from "react";
import { ArrowUp, Heart, Loader2, Text } from "lucide-react";
import { cn, relativeTime } from "@/lib/utils";
import type { EssayFeedbackEntry } from "@/lib/essay-feedback-types";

type Place = "title" | "end";
type Tone = "ink" | "paper";

const heartStorageKey = (slug: string) => `orbit-essay-heart:${slug}`;
const HEART_EVENT = "orbit-essay-heart";

interface ReactionsContextValue {
  tone: Tone;
  slug: string;
  liked: boolean;
  hearts: number;
  notes: EssayFeedbackEntry[];
  sendingHeart: boolean;
  sendingNote: boolean;
  composer: Place | null;
  draft: string;
  error: { place: Place; message: string } | null;
  toggleComposer: (place: Place) => void;
  setDraft: (value: string) => void;
  heart: (place: Place) => void;
  sendNote: (place: Place) => void;
}

const ReactionsContext = createContext<ReactionsContextValue | null>(null);

function useReactions(): ReactionsContextValue {
  const value = useContext(ReactionsContext);
  if (!value) {
    throw new Error("Essay reactions are outside the article.");
  }
  return value;
}

function noteText(entry: EssayFeedbackEntry): string | null {
  const note = entry.note?.trim();
  return note ? note : null;
}

async function postReaction(
  slug: string,
  body: Record<string, unknown>,
): Promise<EssayFeedbackEntry> {
  const res = await fetch("/api/essay-feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, website: "", ...body }),
  });
  const data = (await res.json().catch(() => null)) as
    | { error?: string; entry?: EssayFeedbackEntry }
    | null;
  if (!res.ok || !data?.entry) {
    throw new Error(data?.error || "Could not save.");
  }
  return data.entry;
}

export function EssayReactions({
  slug,
  initialEntries = [],
  tone = "ink",
  children,
}: {
  slug: string;
  initialEntries?: EssayFeedbackEntry[];
  tone?: Tone;
  children: ReactNode;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [pendingLike, setPendingLike] = useState(false);
  const heartLock = useRef(false);
  const noteLock = useRef(false);
  const [sendingHeart, setSendingHeart] = useState(false);
  const [sendingNote, setSendingNote] = useState(false);
  const [composer, setComposer] = useState<Place | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<{ place: Place; message: string } | null>(
    null,
  );
  const storedLiked = useSyncExternalStore(
    (onStoreChange) => {
      const notify = () => onStoreChange();
      window.addEventListener("storage", notify);
      window.addEventListener(HEART_EVENT, notify);
      return () => {
        window.removeEventListener("storage", notify);
        window.removeEventListener(HEART_EVENT, notify);
      };
    },
    () => {
      try {
        return window.localStorage.getItem(heartStorageKey(slug)) === "1";
      } catch {
        return false;
      }
    },
    () => false,
  );

  const liked = storedLiked || pendingLike;
  const hearts = entries.filter((entry) => entry.heart).length;
  const notes = entries.filter((entry) => noteText(entry));

  function toggleComposer(place: Place) {
    if (sendingNote) return;
    setError(null);
    setComposer((current) => (current === place ? null : place));
  }

  async function heart(place: Place) {
    if (liked || heartLock.current) return;
    heartLock.current = true;
    setError(null);
    setPendingLike(true);
    setSendingHeart(true);
    const optimistic: EssayFeedbackEntry = {
      heart: true,
      at: new Date().toISOString(),
    };
    setEntries((prev) => [optimistic, ...prev]);

    try {
      const saved = await postReaction(slug, { action: "heart" });
      setEntries((prev) => prev.map((entry) => (entry === optimistic ? saved : entry)));
      try {
        window.localStorage.setItem(heartStorageKey(slug), "1");
        window.dispatchEvent(new Event(HEART_EVENT));
      } catch {
        // This session still shows the heart. A later visit can send it again.
      }
    } catch (err) {
      heartLock.current = false;
      setEntries((prev) => prev.filter((entry) => entry !== optimistic));
      setPendingLike(false);
      setError({
        place,
        message: err instanceof Error ? err.message : "Could not save.",
      });
    } finally {
      setSendingHeart(false);
    }
  }

  async function sendNote(place: Place) {
    const note = draft.trim();
    if (!note || noteLock.current) return;
    noteLock.current = true;
    setError(null);
    setSendingNote(true);

    try {
      const saved = await postReaction(slug, { action: "note", note });
      setEntries((prev) => [saved, ...prev]);
      setDraft("");
      setComposer(null);
    } catch (err) {
      setError({
        place,
        message: err instanceof Error ? err.message : "Could not save.",
      });
    } finally {
      noteLock.current = false;
      setSendingNote(false);
    }
  }

  return (
    <ReactionsContext.Provider
      value={{
        tone,
        slug,
        liked,
        hearts,
        notes,
        sendingHeart,
        sendingNote,
        composer,
        draft,
        error,
        toggleComposer,
        setDraft,
        heart,
        sendNote,
      }}
    >
      {children}
    </ReactionsContext.Provider>
  );
}

export function EssayReactionBar({
  place,
  className,
}: {
  place: Place;
  className?: string;
}) {
  const {
    tone,
    slug,
    liked,
    hearts,
    notes,
    sendingHeart,
    sendingNote,
    composer,
    draft,
    error,
    toggleComposer,
    setDraft,
    heart,
    sendNote,
  } = useReactions();
  const paper = tone === "paper";
  const open = composer === place;
  const fieldId = `essay-note-${slug}-${place}`;
  const quiet = paper ? "text-[var(--book-muted)]" : "text-slate-400";
  const hot = paper ? "text-[var(--book-accent)]" : "text-neon-cyan";

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void sendNote(place);
  }

  return (
    <div className={className} data-essay-reaction={place}>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => heart(place)}
          aria-pressed={liked}
          aria-busy={sendingHeart}
          data-essay-heart
          className={cn(
            "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-2 motion-safe:active:scale-95",
            paper ? "hover:text-[var(--book-ink)]" : "focus-ring hover:text-white",
            liked ? hot : quiet,
          )}
        >
          <Heart
            className={cn("h-5 w-5", liked && "fill-current")}
            strokeWidth={1.75}
            aria-hidden
          />
          <span className="sr-only">{liked ? "Hearted" : "Heart"}</span>
          {hearts > 0 ? (
            <span className="text-sm tabular-nums">{hearts}</span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => toggleComposer(place)}
          aria-expanded={open}
          aria-controls={fieldId}
          data-essay-note
          className={cn(
            "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full motion-safe:active:scale-95",
            paper ? "hover:text-[var(--book-ink)]" : "focus-ring hover:text-white",
            open ? hot : quiet,
          )}
        >
          <Text className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          <span className="sr-only">Note</span>
        </button>
      </div>

      {open ? (
        <form onSubmit={onSubmit} className="mt-2 max-w-xl">
          <label htmlFor={fieldId} className="sr-only">
            Note
          </label>
          <div
            className={cn(
              "flex items-end gap-2 border px-3 py-2",
              paper
                ? "rounded-sm border-[var(--book-rule)] bg-[var(--book-paper)]"
                : "rounded-xl border-white/10 bg-white/5",
            )}
          >
            <textarea
              id={fieldId}
              rows={2}
              maxLength={280}
              value={draft}
              autoFocus
              autoComplete="off"
              enterKeyHint="send"
              placeholder="Note"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  toggleComposer(place);
                }
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              className={cn(
                "min-h-11 w-full resize-none bg-transparent py-2 text-sm focus:outline-none",
                paper
                  ? "text-[var(--book-ink)] placeholder:text-[var(--book-muted)]"
                  : "text-white placeholder:text-slate-500",
              )}
            />
            <button
              type="submit"
              aria-label="Send note"
              disabled={!draft.trim() || sendingNote}
              className={cn(
                "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full disabled:cursor-not-allowed",
                paper
                  ? "text-[var(--book-ink)] disabled:text-[var(--book-muted)]"
                  : "focus-ring text-neon-cyan disabled:text-slate-600",
              )}
            >
              {sendingNote ? (
                <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden />
              ) : (
                <ArrowUp className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
        </form>
      ) : null}

      {error?.place === place ? (
        <p
          className={cn("mt-2 text-sm", paper ? "text-[#8f1d1d]" : "text-rose-300")}
          role="alert"
        >
          {error.message}
        </p>
      ) : null}

      {place === "end" ? (
        <ul
          id="essay-notes"
          aria-label="Notes"
          aria-live="polite"
          className={cn(notes.length > 0 && "mt-6 space-y-4")}
        >
          {notes.map((entry) => (
            <li
              key={`${entry.at}-${entry.note}`}
              className={cn(
                "border-t pt-4 first:border-t-0 first:pt-0",
                paper ? "border-[var(--book-rule)]" : "border-white/8",
              )}
            >
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  paper ? "text-[var(--book-ink)]" : "text-slate-300",
                )}
              >
                {entry.note}
              </p>
              <time
                dateTime={entry.at}
                suppressHydrationWarning
                className={cn(
                  "mt-1 block text-xs",
                  paper
                    ? "text-[var(--book-muted)]"
                    : "font-mono text-[0.65rem] text-slate-500",
                )}
              >
                {relativeTime(entry.at)}
              </time>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
