import fs from "node:fs";
import path from "node:path";
import type { NewsCache } from "@/lib/types";
import { collapseReadingTwins } from "./collapse";

const DATA_DIR = path.join(process.cwd(), "data");
const CACHE_PATH = path.join(DATA_DIR, "news-cache.json");

export function getCachePath() {
  return CACHE_PATH;
}

/** Read the on-disk news cache. Returns an empty cache if none exists yet. */
export function readNewsCache(): NewsCache {
  try {
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    const parsed = JSON.parse(raw) as NewsCache;
    if (!Array.isArray(parsed.items)) throw new Error("malformed cache");
    return presentNewsCache(parsed);
  } catch {
    return { generatedAt: "", count: 0, items: [] };
  }
}

/** Drop article/video twins so a cache written before that rule still reads cleanly. */
export function presentNewsCache(cache: NewsCache): NewsCache {
  const items = collapseReadingTwins(cache.items);
  if (items.length === cache.items.length) return cache;
  return { ...cache, items, count: items.length };
}

/** Persist the news cache to disk, creating the data directory if needed. */
export function writeNewsCache(cache: NewsCache): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf8");
}
