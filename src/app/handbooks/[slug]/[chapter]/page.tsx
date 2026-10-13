import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HANDBOOKS } from "@/content/handbooks";
import { HandbookChapterView } from "@/components/handbooks/HandbookChapterView";
import { getEssayFeedbackEntries } from "@/lib/essay-feedback";
import {
  chapterFeedbackSlug,
  chapterPath,
  getChapter,
} from "@/lib/handbooks";

export function generateStaticParams() {
  return HANDBOOKS.flatMap((handbook) =>
    handbook.chapters.map((chapter) => ({
      slug: handbook.slug,
      chapter: chapter.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}): Promise<Metadata> {
  const { slug, chapter: chapterSlug } = await params;
  const found = getChapter(slug, chapterSlug);
  if (!found) return { title: "Chapter" };
  return {
    title: found.chapter.title,
    description: found.chapter.lede,
    alternates: {
      canonical: chapterPath(found.handbook.slug, found.chapter.slug),
    },
  };
}

export default async function HandbookChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const { slug, chapter: chapterSlug } = await params;
  const found = getChapter(slug, chapterSlug);
  if (!found) notFound();
  const feedbackEntries = await getEssayFeedbackEntries(
    chapterFeedbackSlug(found.handbook.slug, found.chapter.slug),
  );
  return (
    <HandbookChapterView
      handbook={found.handbook}
      chapter={found.chapter}
      index={found.index}
      feedbackEntries={feedbackEntries}
    />
  );
}
