import "server-only";
import { hasGithubStorage, readRepoFile } from "@/lib/github-storage";
import { readNewsCache as readNewsCacheFs } from "@/lib/news/cache";
import type { NewsCache } from "@/lib/types";

export const NEWS_CACHE_RELATIVE_PATH = "data/news-cache.json";

function parseNewsCacheJson(raw: string): NewsCache | null {
  try {
    const parsed = JSON.parse(raw) as NewsCache;
    if (!Array.isArray(parsed.items)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Read news cache — GitHub first when configured (Vercel after cron commit). */
export async function readNewsCacheRemote(): Promise<NewsCache> {
  if (hasGithubStorage()) {
    const remote = await readRepoFile(NEWS_CACHE_RELATIVE_PATH);
    if (remote) {
      const parsed = parseNewsCacheJson(remote);
      if (parsed) return parsed;
    }
  }
  return readNewsCacheFs();
}
