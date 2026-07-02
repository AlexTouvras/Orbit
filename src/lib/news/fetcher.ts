import crypto from "node:crypto";
import Parser from "rss-parser";
import type { NewsCache, NewsItem } from "@/lib/types";
import { FEED_SOURCES, type FeedSource } from "./sources";
import { writeNewsCache } from "./cache";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent":
      "OrbitNewsRadar/1.0 (+https://example.com) personal-site-aggregator",
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

async function fetchFeed(source: FeedSource): Promise<NewsItem[]> {
  const feed = await parser.parseURL(source.url);
  const items = (feed.items ?? []).slice(0, MAX_ITEMS_PER_FEED);

  return items
    .filter((item) => item.link && item.title)
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

/** Fetch and persist to the on-disk cache. Returns the fresh cache. */
export async function refreshNewsCache(): Promise<NewsCache> {
  const cache = await fetchAllNews();
  writeNewsCache(cache);
  return cache;
}
