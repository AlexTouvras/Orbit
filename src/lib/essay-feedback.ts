import "server-only";
import fs from "node:fs";
import path from "node:path";
import { persistDataJson } from "@/lib/data-persist";
import { hasGithubStorage, readRepoFile } from "@/lib/github-storage";
import type {
  EssayFeedbackEntry,
  EssayFeedbackRating,
  EssayFeedbackStore,
} from "@/lib/essay-feedback-types";

export type {
  EssayFeedbackEntry,
  EssayFeedbackRating,
  EssayFeedbackStore,
  EssayFeedbackThread,
} from "@/lib/essay-feedback-types";

const DATA_DIR = path.join(process.cwd(), "data");
const FEEDBACK_RELATIVE_PATH = "data/essay-feedback.json";
const FEEDBACK_PATH = path.join(DATA_DIR, "essay-feedback.json");

function asRating(value: unknown): EssayFeedbackRating | undefined {
  if (value === "yes" || value === "somewhat" || value === "no") return value;
  return undefined;
}

function normalizeStore(raw: unknown): EssayFeedbackStore {
  if (typeof raw !== "object" || raw === null) return {};

  const store: EssayFeedbackStore = {};
  for (const [slug, value] of Object.entries(raw)) {
    if (typeof value !== "object" || value === null) continue;
    const thread = value as Record<string, unknown>;
    const title =
      typeof thread.title === "string" && thread.title.trim()
        ? thread.title.trim()
        : slug;
    const entries: EssayFeedbackEntry[] = Array.isArray(thread.entries)
      ? thread.entries
          .filter(
            (entry): entry is Record<string, unknown> =>
              typeof entry === "object" && entry !== null,
          )
          .map((entry) => {
            const rating = asRating(entry.rating);
            const note =
              typeof entry.note === "string" && entry.note.trim()
                ? entry.note.trim()
                : undefined;
            const heart = entry.heart === true;
            if (!rating && !note && !heart) return null;
            const next: EssayFeedbackEntry = {
              at:
                typeof entry.at === "string" && entry.at.trim()
                  ? entry.at.trim()
                  : new Date(0).toISOString(),
            };
            if (rating) next.rating = rating;
            if (note) next.note = note;
            if (heart) next.heart = true;
            return next;
          })
          .filter((entry): entry is EssayFeedbackEntry => entry !== null)
      : [];

    store[slug] = { title, entries };
  }

  return store;
}

function readLocalStore(): EssayFeedbackStore {
  try {
    const raw = fs.readFileSync(FEEDBACK_PATH, "utf8");
    return normalizeStore(JSON.parse(raw) as unknown);
  } catch {
    return {};
  }
}

export async function readEssayFeedbackStore(): Promise<EssayFeedbackStore> {
  if (hasGithubStorage()) {
    const raw = await readRepoFile(FEEDBACK_RELATIVE_PATH);
    if (!raw) return {};
    try {
      return normalizeStore(JSON.parse(raw) as unknown);
    } catch {
      return {};
    }
  }

  return readLocalStore();
}

/** Entries for one essay, newest first. */
export async function getEssayFeedbackEntries(
  slug: string,
): Promise<EssayFeedbackEntry[]> {
  const store = await readEssayFeedbackStore();
  const entries = store[slug]?.entries ?? [];
  return [...entries].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}

export async function appendEssayFeedback(
  slug: string,
  title: string,
  entry: EssayFeedbackEntry,
): Promise<{ viaGithub: boolean; totalForEssay: number }> {
  const store = await readEssayFeedbackStore();
  const current = store[slug] ?? { title, entries: [] };
  const next: EssayFeedbackStore = {
    ...store,
    [slug]: {
      title,
      entries: [...current.entries, entry],
    },
  };

  const result = await persistDataJson(
    FEEDBACK_RELATIVE_PATH,
    next,
    `chore(feedback): save note for ${slug}`,
  );

  return {
    viaGithub: result.viaGithub,
    totalForEssay: next[slug].entries.length,
  };
}
