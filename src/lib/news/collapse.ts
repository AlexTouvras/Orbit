import type { NewsItem } from "@/lib/types";

/**
 * SQLBI publishes each piece twice: `/articles/…` and `/tv/…` with the same
 * path tail. Keep the article. Anything else stays as its own link.
 */
export function collapseReadingTwins(items: NewsItem[]): NewsItem[] {
  const chosen = new Map<string, NewsItem>();
  const order: string[] = [];

  for (const item of items) {
    const key = twinKey(item.link);
    const prev = chosen.get(key);
    if (!prev) {
      chosen.set(key, item);
      order.push(key);
      continue;
    }
    if (prefer(item, prev)) chosen.set(key, item);
  }

  return order.map((key) => chosen.get(key)!);
}

function twinKey(link: string): string {
  try {
    const url = new URL(link);
    const path = url.pathname.replace(/\/+$/, "");
    const stripped = path.replace(/^\/(?:tv|articles)(?=\/)/, "");
    if (stripped !== path) return `${url.host}${stripped}`;
  } catch {
    // Relative or malformed links stay distinct.
  }
  return link;
}

/** Article beats the video. Otherwise keep the newer date. */
function prefer(next: NewsItem, prev: NewsItem): boolean {
  const nextVideo = /\/tv\//.test(next.link);
  const prevVideo = /\/tv\//.test(prev.link);
  if (nextVideo !== prevVideo) return !nextVideo;
  const nextTime = next.pubDate ? Date.parse(next.pubDate) : 0;
  const prevTime = prev.pubDate ? Date.parse(prev.pubDate) : 0;
  return nextTime > prevTime;
}
