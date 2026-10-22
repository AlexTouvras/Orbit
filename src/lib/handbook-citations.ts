import type { HandbookLink, HandbookPage } from "@/content/handbooks";

export type PageReference = {
  n: number;
  href: string;
  label: string;
};

/** The work, without a section hash. */
export function workKey(href: string): string {
  const hash = href.indexOf("#");
  const base = hash >= 0 ? href.slice(0, hash) : href;
  return base.replace(/\/$/, "");
}

/** Another chapter of a handbook. It stays a chapter link. */
export function isChapterLink(href: string): boolean {
  return href.startsWith("/handbooks/");
}

function sameWork(listed: string, href: string): boolean {
  return workKey(listed) === workKey(href);
}

/**
 * The page's works, in the order they are listed, then any section work
 * that list does not already name. Chapter links are not works.
 */
export function pageReferences(page: HandbookPage): PageReference[] {
  const items: HandbookLink[] = [...page.sources];
  for (const section of page.sections) {
    for (const source of section.sources ?? []) {
      if (isChapterLink(source.href)) continue;
      if (items.some((item) => sameWork(item.href, source.href))) continue;
      items.push(source);
    }
  }
  return items.map((item, index) => ({ n: index + 1, href: item.href, label: item.label }));
}

export function referenceNumber(references: PageReference[], href: string): number | null {
  if (isChapterLink(href)) return null;
  return references.find((item) => sameWork(item.href, href))?.n ?? null;
}

/** One number per work this section cites, in the section's order. */
export function citationMarks(
  references: PageReference[],
  sources: HandbookLink[] | undefined,
): number[] {
  const seen = new Set<number>();
  const marks: number[] = [];
  for (const source of sources ?? []) {
    const n = referenceNumber(references, source.href);
    if (n == null || seen.has(n)) continue;
    seen.add(n);
    marks.push(n);
  }
  return marks;
}

export function chapterLinks(sources: HandbookLink[] | undefined): HandbookLink[] {
  return (sources ?? []).filter((source) => isChapterLink(source.href));
}
