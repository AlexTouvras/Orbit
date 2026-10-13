import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HANDBOOKS } from "@/content/handbooks";
import { HandbookCover } from "@/components/handbooks/HandbookCover";
import { getHandbook, handbookPath } from "@/lib/handbooks";

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
  return {
    title: handbook.title,
    description: handbook.thesis,
    alternates: { canonical: handbookPath(handbook.slug) },
  };
}

export default async function HandbookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const handbook = getHandbook(slug);
  if (!handbook) notFound();
  return <HandbookCover handbook={handbook} />;
}
