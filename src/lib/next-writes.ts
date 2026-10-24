export interface NextWriteCandidate {
  slug: string;
  date: string;
  tags: string[];
  category: string;
}

export interface RankedNextWrites<T extends NextWriteCandidate> {
  writes: T[];
  /** True when at least one other essay shares the category or a tag. */
  related: boolean;
}

function tagKey(tag: string): string {
  return tag.trim().toLowerCase();
}

function sharedTagCount(current: string[], other: string[]): number {
  const keys = new Set(current.map(tagKey).filter(Boolean));
  const seen = new Set<string>();
  let count = 0;
  for (const tag of other) {
    const key = tagKey(tag);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    if (keys.has(key)) count += 1;
  }
  return count;
}

function publishedAt(date: string): number {
  const parsed = Date.parse(date);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Up to `limit` other essays.
 * Same category first, then the number of shared tags, then newer date.
 * An essay with no shared category or tag is left out while any related essay exists.
 * When nothing is related, the newest other essays fill the list.
 */
export function rankNextWrites<T extends NextWriteCandidate>(
  current: T,
  all: readonly T[],
  limit = 3,
): RankedNextWrites<T> {
  const ranked = all
    .filter((item) => item.slug !== current.slug)
    .map((item) => {
      const sameCategory = item.category === current.category;
      const shared = sharedTagCount(current.tags, item.tags);
      return {
        item,
        related: sameCategory || shared > 0,
        sameCategory: sameCategory ? 1 : 0,
        shared,
        date: publishedAt(item.date),
      };
    })
    .sort(
      (a, b) =>
        b.sameCategory - a.sameCategory ||
        b.shared - a.shared ||
        b.date - a.date ||
        a.item.slug.localeCompare(b.item.slug),
    );

  const related = ranked.filter((row) => row.related);
  const chosen = (related.length > 0 ? related : ranked).slice(0, limit);
  return {
    writes: chosen.map((row) => row.item),
    related: related.length > 0,
  };
}
