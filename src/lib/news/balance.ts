import type { NewsCategory, NewsItem } from "@/lib/types";
import { NEWS_CATEGORIES } from "./sources";

/**
 * Round-robin across categories (newest-first within each lane).
 * Stops "All" / weekly intake from reading as AI-only when AI blogs post daily.
 */
export function interleaveByCategory(
  items: NewsItem[],
  categories: readonly NewsCategory[] = NEWS_CATEGORIES,
): NewsItem[] {
  const buckets = new Map<NewsCategory, NewsItem[]>();
  for (const cat of categories) buckets.set(cat, []);

  for (const item of items) {
    const list = buckets.get(item.category);
    if (list) list.push(item);
  }

  for (const list of buckets.values()) {
    list.sort((a, b) => {
      const ta = a.pubDate ? Date.parse(a.pubDate) : 0;
      const tb = b.pubDate ? Date.parse(b.pubDate) : 0;
      return tb - ta;
    });
  }

  const indices = Object.fromEntries(categories.map((c) => [c, 0])) as Record<
    NewsCategory,
    number
  >;
  const out: NewsItem[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const cat of categories) {
      const list = buckets.get(cat) ?? [];
      const i = indices[cat];
      if (i < list.length) {
        out.push(list[i]);
        indices[cat] = i + 1;
        added = true;
      }
    }
  }
  return out;
}

/** Prefer Analytics → Data → Delivery → AI when filling a fixed slot budget. */
export const INTAKE_CATEGORY_ORDER: NewsCategory[] = [
  "Analytics",
  "Data",
  "Delivery",
  "AI",
];
