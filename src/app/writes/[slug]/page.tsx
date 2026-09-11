import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Clock } from "lucide-react";
import { getWriteBySlug, getWriteSlugs } from "@/lib/writes";
import { getEssayFeedbackEntries } from "@/lib/essay-feedback";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { Badge } from "@/components/ui/Badge";
import { BackLink } from "@/components/ui/BackLink";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";
import { EssayFeedback } from "@/components/writes/EssayFeedback";
import { getEditableProfile } from "@/lib/profile-store";
import {
  getWriteModifiedDate,
  writeOgImageUrl,
  writePath,
} from "@/lib/seo/writes";
import { formatDate } from "@/lib/utils";

const categoryTone = {
  Career: "violet",
  Data: "blue",
  AI: "ai",
  Delivery: "violet",
  Learning: "neutral",
} as const;

export function generateStaticParams() {
  return getWriteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const write = getWriteBySlug(slug);
  if (!write) return { title: "Article not found" };
  const profile = getEditableProfile();
  const path = writePath(slug);
  const modified = getWriteModifiedDate(write);
  const ogImage = writeOgImageUrl(slug);
  return {
    title: write.title,
    description: write.summary,
    authors: [{ name: profile.name, url: "/" }],
    alternates: { canonical: path },
    openGraph: {
      title: write.title,
      description: write.summary,
      type: "article",
      url: path,
      publishedTime: write.date,
      modifiedTime: modified,
      authors: [profile.name],
      tags: write.tags,
      images: [{ url: ogImage, width: 1200, height: 630, alt: write.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: write.title,
      description: write.summary,
      images: [ogImage],
    },
  };
}

export default async function WriteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug.endsWith("-architecture")) {
    redirect(`/architecture/${slug.replace(/-architecture$/, "")}`);
  }
  const write = getWriteBySlug(slug);
  if (!write) notFound();

  const fallbackHref = write.showcase ? "/#selected-work" : "/writes";
  const feedbackEntries = await getEssayFeedbackEntries(write.slug);

  return (
    <article className="mx-auto max-w-3xl">
      <ArticleJsonLd write={write} />
      <BackLink fallbackHref={fallbackHref} />

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={categoryTone[write.category]}>{write.category}</Badge>
          <span className="font-mono text-xs text-slate-400">
            {formatDate(write.date)}
          </span>
          {write.updated && write.updated !== write.date && (
            <span className="font-mono text-xs text-slate-500">
              Updated {formatDate(write.updated)}
            </span>
          )}
          <span className="inline-flex items-center gap-1 font-mono text-xs text-slate-400">
            <Clock className="h-3 w-3" aria-hidden />
            {write.readingTime} min read
          </span>
        </div>

        <h1 className="font-display mt-4 text-section font-bold tracking-tight text-white sm:text-4xl">
          {write.title}
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-slate-300">
          {write.summary}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {write.tags.map((tag) => (
            <Badge key={tag} tone="neutral">
              {tag}
            </Badge>
          ))}
        </div>
      </header>

      <section className="mt-10 border-t border-white/8 pt-10">
        <MDXRemote source={write.content} components={mdxComponents} />
      </section>

      <EssayFeedback slug={write.slug} initialEntries={feedbackEntries} />
    </article>
  );
}
