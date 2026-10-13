import {
  HANDBOOKS,
  type Handbook,
  type HandbookChapter,
} from "@/content/handbooks";

export function handbookPath(slug: string): string {
  return `/handbooks/${slug}`;
}

export function chapterPath(handbookSlug: string, chapterSlug: string): string {
  return `/handbooks/${handbookSlug}/${chapterSlug}`;
}

/** Key in the shared feedback store. Matches the public path without the leading slash. */
export function chapterFeedbackSlug(handbookSlug: string, chapterSlug: string): string {
  return `handbooks/${handbookSlug}/${chapterSlug}`;
}

export function getHandbook(slug: string): Handbook | null {
  return HANDBOOKS.find((handbook) => handbook.slug === slug) ?? null;
}

export function getChapter(
  handbookSlug: string,
  chapterSlug: string,
): { handbook: Handbook; chapter: HandbookChapter; index: number } | null {
  const handbook = getHandbook(handbookSlug);
  if (!handbook) return null;
  const index = handbook.chapters.findIndex((chapter) => chapter.slug === chapterSlug);
  if (index < 0) return null;
  return { handbook, chapter: handbook.chapters[index], index };
}

export function handbookFeedbackPage(
  slug: string,
): { title: string; path: string } | null {
  const match = slug.match(/^handbooks\/([^/]+)\/([^/]+)$/);
  if (!match) return null;
  const found = getChapter(match[1], match[2]);
  if (!found) return null;
  return {
    title: `${found.handbook.title}: ${found.chapter.title}`,
    path: chapterPath(found.handbook.slug, found.chapter.slug),
  };
}
