import {
  HANDBOOKS,
  type Handbook,
  type HandbookContentsEntry,
  type HandbookPage,
} from "@/content/handbooks";

export function handbookPath(slug: string): string {
  return `/handbooks/${slug}`;
}

export function pagePath(handbookSlug: string, page: number): string {
  return `/handbooks/${handbookSlug}/${page}`;
}

/** Key in the shared feedback store. The note sits on the last page. */
export function pageFeedbackSlug(handbookSlug: string, page: number): string {
  return `handbooks/${handbookSlug}/${page}`;
}

export function getHandbook(slug: string): Handbook | null {
  return HANDBOOKS.find((handbook) => handbook.slug === slug) ?? null;
}

export function chapterForPage(handbook: Handbook, pageNumber: number): HandbookContentsEntry | null {
  for (const entry of handbook.contents) {
    if (entry.page === pageNumber) return entry;
    if (entry.sections?.some((section) => section.page === pageNumber)) return entry;
  }
  let found: HandbookContentsEntry | null = handbook.contents[0] ?? null;
  for (const entry of handbook.contents) {
    if (entry.page <= pageNumber) found = entry;
  }
  return found;
}

export function chapterTitleForPage(handbook: Handbook, pageNumber: number): string {
  return chapterForPage(handbook, pageNumber)?.title ?? "";
}

/** The library's chapter count. The page number stays the address. */
export function chapterPlace(handbook: Handbook, pageNumber: number): { place: number; count: number } {
  const index = handbook.contents.findIndex(
    (entry) => entry.page === pageNumber || entry.sections?.some((section) => section.page === pageNumber),
  );
  return { place: index >= 0 ? index + 1 : 1, count: handbook.contents.length };
}

export function adjacentPages(
  handbook: Handbook,
  pageNumber: number,
): { index: number; previous: HandbookPage | null; next: HandbookPage | null } {
  const index = handbook.pages.findIndex((item) => item.number === pageNumber);
  return {
    index,
    previous: index > 0 ? handbook.pages[index - 1] : null,
    next: index >= 0 && index < handbook.pages.length - 1 ? handbook.pages[index + 1] : null,
  };
}

export function getPage(
  handbookSlug: string,
  pageParam: string,
): { handbook: Handbook; page: HandbookPage; index: number } | null {
  if (!/^[1-9]\d*$/.test(pageParam)) return null;
  const number = Number(pageParam);
  const handbook = getHandbook(handbookSlug);
  if (!handbook) return null;
  const index = handbook.pages.findIndex((page) => page.number === number);
  if (index < 0) return null;
  return { handbook, page: handbook.pages[index], index };
}

export function handbookFeedbackPage(
  slug: string,
): { title: string; path: string } | null {
  const match = slug.match(/^handbooks\/([^/]+)\/([1-9]\d*)$/);
  if (!match) return null;
  const found = getPage(match[1], match[2]);
  if (!found) return null;
  return {
    title: `${found.handbook.title}, page ${found.page.number}`,
    path: pagePath(found.handbook.slug, found.page.number),
  };
}
