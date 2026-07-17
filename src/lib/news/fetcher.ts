import crypto from "node:crypto";
import Parser from "rss-parser";
import type { NewsCache, NewsItem } from "@/lib/types";
import { FEED_SOURCES, type FeedSource } from "./sources";
import { readNewsCache, writeNewsCache } from "./cache";

const parser = new Parser({
  timeout: 15000,
  headers: {
    // Some publishers (InfoQ, Agile Alliance) reject non-browser UAs with 403/406.
    "User-Agent":
      "Mozilla/5.0 (compatible; OrbitNewsRadar/1.0; +https://github.com/AlexTouvras/Orbit)",
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
  },
});

const MAX_SNIPPET = 280;
const MAX_ITEMS_PER_FEED = 20;

function stableId(link: string): string {
  return crypto.createHash("sha1").update(link).digest("hex").slice(0, 12);
}

function cleanSnippet(raw?: string): string {
  if (!raw) return "";
  const text = raw.replace(/\s+/g, " ").trim();
  if (text.length <= MAX_SNIPPET) return text;
  return `${text.slice(0, MAX_SNIPPET).trimEnd()}…`;
}

/**
 * Keep the radar English-only. Mixed blogs (e.g. Crisp) publish SE/EN posts;
 * drop titles with Nordic letters or common non-English function words.
 */
function isEnglishTitle(title: string): boolean {
  if (/[åäöÅÄÖæøÆØüßẞ]/.test(title)) return false;
  // Whole-word cues common in Swedish / German titles that slip past Latin-1.
  if (
    /\b(och|att|det|som|för|med|är|från|vad|inte|på|av|om|den|ett|till|und|der|die|das|für|mit)\b/i.test(
      title,
    )
  ) {
    return false;
  }
  return true;
}

async function fetchFeed(source: FeedSource): Promise<NewsItem[]> {
  const feed = await parser.parseURL(source.url);
  const items = (feed.items ?? []).slice(0, MAX_ITEMS_PER_FEED);

  return items
    .filter((item) => item.link && item.title)
    .filter((item) => isEnglishTitle((item.title as string).trim()))
    .map((item) => {
      const link = item.link as string;
      const pubDate = item.isoDate ?? item.pubDate ?? null;
      return {
        id: stableId(link),
        title: (item.title as string).trim(),
        link,
        source: source.name,
        category: source.category,
        pubDate: pubDate ? new Date(pubDate).toISOString() : null,
        contentSnippet: cleanSnippet(item.contentSnippet ?? item.content),
      } satisfies NewsItem;
    });
}

/**
 * Fetch every configured feed in parallel, tolerating individual failures,
 * then dedupe by link and sort newest-first.
 */
export async function fetchAllNews(): Promise<NewsCache> {
  const results = await Promise.allSettled(FEED_SOURCES.map(fetchFeed));

  const seen = new Set<string>();
  const items: NewsItem[] = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      for (const item of result.value) {
        if (seen.has(item.link)) continue;
        seen.add(item.link);
        items.push(item);
      }
    } else {
      console.warn(
        `[news] failed to fetch "${FEED_SOURCES[i].name}":`,
        result.reason instanceof Error ? result.reason.message : result.reason,
      );
    }
  });

  items.sort((a, b) => {
    const ta = a.pubDate ? Date.parse(a.pubDate) : 0;
    const tb = b.pubDate ? Date.parse(b.pubDate) : 0;
    return tb - ta;
  });

  return {
    generatedAt: new Date().toISOString(),
    count: items.length,
    items,
  };
}

export function sameNewsItems(a: NewsCache, b: NewsCache): boolean {
  if (a.count !== b.count || a.items.length !== b.items.length) return false;
  for (let i = 0; i < a.items.length; i++) {
    if (a.items[i].id !== b.items[i].id) return false;
    if (a.items[i].title !== b.items[i].title) return false;
  }
  return true;
}

export type RefreshNewsResult = NewsCache & {
  viaGithub: boolean;
  unchanged: boolean;
};

/** Fetch and write the on-disk cache (local / GitHub Actions). */
export async function refreshNewsCache(): Promise<RefreshNewsResult> {
  const cache = await fetchAllNews();
  const previous = readNewsCache();

  if (previous.generatedAt && sameNewsItems(previous, cache)) {
    return { ...previous, viaGithub: false, unchanged: true };
  }

  writeNewsCache(cache);
  return { ...cache, viaGithub: false, unchanged: false };
}
