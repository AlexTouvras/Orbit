import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { HANDBOOKS } from "@/content/handbooks";
import { getHandbook, pagePath } from "@/lib/handbooks";

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
  return {
    title: handbook.title,
    description: handbook.thesis,
    alternates: opening
      ? { canonical: pagePath(handbook.slug, opening.number) }
      : undefined,
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
