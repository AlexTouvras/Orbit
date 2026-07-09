import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft, Clock } from "lucide-react";
import { getAllWrites, getWriteBySlug, getWriteSlugs } from "@/lib/writes";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

const categoryTone = {
  Career: "violet",
  Data: "blue",
  AI: "cyan",
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
  return { title: write.title, description: write.summary };
}

export default async function WriteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const write = getWriteBySlug(slug);
  if (!write) notFound();

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href="/writes"
        className="focus-ring group inline-flex min-h-11 items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 transition-transform motion-safe:group-hover:-translate-x-0.5" />
        Back to writes
      </Link>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={categoryTone[write.category]}>{write.category}</Badge>
          <span className="font-mono text-xs text-slate-400">
            {formatDate(write.date)}
          </span>
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
    </article>
  );
}
