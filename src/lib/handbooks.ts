import {
  HANDBOOKS,
  type Handbook,
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

export function chapterTitleForPage(handbook: Handbook, pageNumber: number): string {
  let title = handbook.contents[0]?.title ?? "";
  for (const entry of handbook.contents) {
    if (entry.page <= pageNumber) title = entry.title;
  }
  return title;
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
