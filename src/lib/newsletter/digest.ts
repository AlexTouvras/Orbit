import {
  isoWeekId,
  weekOfMonday,
} from "@/lib/iso-week";
import {
  INTAKE_CATEGORY_ORDER,
  interleaveByCategory,
} from "@/lib/news/balance";
import { readNewsCache } from "@/lib/news/cache";
import { getSiteUrl } from "@/lib/site";
import { getAllWrites } from "@/lib/writes";
import { fetchRavensForDigest } from "@/lib/newsletter/ravens";
import type {
  NewsletterDigest,
  NewsletterRavenItem,
  NewsletterSignalItem,
  NewsletterWriteItem,
} from "@/lib/newsletter/types";

export { isoWeekId, weekOfMonday };

export const NEWSLETTER_LEDE =
  "This week's highlights — the new Write, a few Related articles, and one note from each Ravens beat.";

const WRITE_WINDOW_DAYS = 7;
const SIGNAL_WINDOW_DAYS = 10;
const SIGNAL_LIMIT = 4;

function daysAgo(iso: string | null | undefined, days: number): boolean {
  if (!iso) return false;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return false;
  return Date.now() - t <= days * 24 * 60 * 60 * 1000;
}

export function digestIdFor(date = new Date()): string {
  return `newsletter-${isoWeekId(date)}`;
}

function snippet(text: string, max = 180): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

export function hasLocalDigestMaterial(): boolean {
  const writes = getAllWrites().filter((w) => daysAgo(w.date, WRITE_WINDOW_DAYS));
  const cache = readNewsCache();
  const recentSignals = cache.items.filter((item) =>
    daysAgo(item.pubDate, SIGNAL_WINDOW_DAYS),
  );
  return writes.length > 0 || recentSignals.length > 0;
}

export async function buildNewsletterDigest(
  date = new Date(),
): Promise<NewsletterDigest | null> {
  const ravens: NewsletterRavenItem[] = await fetchRavensForDigest(date);
  if (!hasLocalDigestMaterial() && ravens.length === 0) return null;

  const base = getSiteUrl();
  const writes: NewsletterWriteItem[] = getAllWrites()
    .filter((w) => daysAgo(w.date, WRITE_WINDOW_DAYS))
    .map((w) => ({
      slug: w.slug,
      title: w.title,
      summary: w.summary,
      date: w.date,
      href: `${base}/writes/${w.slug}`,
    }));

  const cache = readNewsCache();
  const recent = interleaveByCategory(
    cache.items.filter((item) => daysAgo(item.pubDate, SIGNAL_WINDOW_DAYS)),
    INTAKE_CATEGORY_ORDER,
  );
  const fallback = interleaveByCategory(cache.items, INTAKE_CATEGORY_ORDER);
  const pool =
    recent.length > 0 ? recent : writes.length > 0 ? fallback : [];

  const signals: NewsletterSignalItem[] = pool.slice(0, SIGNAL_LIMIT).map((item) => ({
    title: item.title,
    link: item.link,
    source: item.source,
    category: item.category,
    snippet: snippet(item.contentSnippet || "", 120),
  }));

  const weekOf = weekOfMonday(date);
  const id = digestIdFor(date);

  return {
    id,
    status: "pending",
    createdAt: new Date().toISOString(),
    weekOf,
    subject: `Orbit weekly — week of ${weekOf}`,
    lede: NEWSLETTER_LEDE,
    writes,
    signals,
    ravens,
  };
}
