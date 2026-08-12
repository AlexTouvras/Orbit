import type { BadgeTone } from "@/lib/project-status";
import type { NewsCategory } from "@/lib/types";

/**
 * Fixed category hues for scanability.
 * AI uses static `ai` (not brand `cyan`) so topic chips don't ride the orbit loop.
 */
export const NEWS_CATEGORY_TONE: Record<NewsCategory, BadgeTone> = {
  AI: "ai",
  Data: "blue",
  Delivery: "violet",
  Analytics: "neutral",
};

export const NEWS_FILTER_TONE: Record<"All" | NewsCategory, BadgeTone> = {
  All: "cyan",
  ...NEWS_CATEGORY_TONE,
};
