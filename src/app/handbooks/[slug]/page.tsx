import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { HANDBOOKS } from "@/content/handbooks";
import { getHandbook, pagePath } from "@/lib/handbooks";
import { pageOpenGraph } from "@/lib/seo/share";

export function generateStaticParams() {
  return HANDBOOKS.map((handbook) => ({ slug: handbook.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const handbook = getHandbook(slug);
  if (!handbook) return { title: "Handbook" };
  const opening = handbook.pages[0];
  const path = opening ? pagePath(handbook.slug, opening.number) : `/handbooks/${handbook.slug}`;
  return {
    title: handbook.title,
    description: handbook.thesis,
    alternates: { canonical: path },
    openGraph: pageOpenGraph(path),
  };
}

export default async function HandbookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const handbook = getHandbook(slug);
  const opening = handbook?.pages[0];
  if (!handbook || !opening) notFound();
  redirect(pagePath(handbook.slug, opening.number));
}
