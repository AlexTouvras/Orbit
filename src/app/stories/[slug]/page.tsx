import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryLayout } from "@/components/storytelling/StoryLayout";
import { listManifestSlugs, loadStoryManifest } from "@/lib/loadStory";
import { pageOpenGraph } from "@/lib/seo/share";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return listManifestSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const manifest = loadStoryManifest(slug);
    const path = `/stories/${slug}`;
    return {
      title: manifest.meta.title,
      description: manifest.meta.summary,
      alternates: { canonical: path },
      openGraph: pageOpenGraph(path),
    };
  } catch {
    return { title: "Story not found" };
  }
}

export default async function StoryPage({ params }: PageProps) {
  const { slug } = await params;
  let manifest;
  try {
    manifest = loadStoryManifest(slug);
  } catch {
    notFound();
  }

  return <StoryLayout manifest={manifest} />;
}
