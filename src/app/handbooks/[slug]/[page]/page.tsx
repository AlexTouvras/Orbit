import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HANDBOOKS } from "@/content/handbooks";
import { HandbookPageView } from "@/components/handbooks/HandbookPageView";
import { getEssayFeedbackEntries } from "@/lib/essay-feedback";
import { getPage, pageFeedbackSlug, pagePath } from "@/lib/handbooks";
import { pageOpenGraph } from "@/lib/seo/share";

export function generateStaticParams() {
  return HANDBOOKS.flatMap((handbook) =>
    handbook.pages.map((page) => ({
      slug: handbook.slug,
      page: String(page.number),
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; page: string }>;
}): Promise<Metadata> {
  const { slug, page: pageParam } = await params;
  const found = getPage(slug, pageParam);
  if (!found) return { title: "Page" };
  const path = pagePath(found.handbook.slug, found.page.number);
  return {
    title: `${found.page.title} · ${found.handbook.title}`,
    description: found.page.lede,
    alternates: { canonical: path },
    openGraph: pageOpenGraph(path),
  };
}

export default async function HandbookLeafPage({
  params,
}: {
  params: Promise<{ slug: string; page: string }>;
}) {
  const { slug, page: pageParam } = await params;
  const found = getPage(slug, pageParam);
  if (!found) notFound();
  const last = found.handbook.pages[found.handbook.pages.length - 1]?.number;
  const feedbackEntries =
    found.page.number === last
      ? await getEssayFeedbackEntries(
          pageFeedbackSlug(found.handbook.slug, found.page.number),
        )
      : [];
  return (
    <HandbookPageView
      handbook={found.handbook}
      page={found.page}
      feedbackEntries={feedbackEntries}
    />
  );
}
