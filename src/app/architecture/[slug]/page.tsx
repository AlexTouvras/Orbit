import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft } from "lucide-react";
import {
  ARCHITECTURE_ESSAY_LINKS,
  getArchitectureBySlug,
  getArchitectureSlugs,
} from "@/lib/architecture";
import { mdxComponents } from "@/components/mdx/mdx-components";

export function generateStaticParams() {
  return getArchitectureSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getArchitectureBySlug(slug);
  if (!doc) return { title: "Architecture not found" };
  return {
    title: doc.title,
    description: doc.summary,
    robots: { index: false, follow: true },
  };
}

export default async function ArchitecturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getArchitectureBySlug(slug);
  if (!doc) notFound();

  const essay = ARCHITECTURE_ESSAY_LINKS[slug];

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href={essay?.href ?? "/writes"}
        className="focus-ring group inline-flex min-h-11 items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 transition-transform motion-safe:group-hover:-translate-x-0.5" />
        {essay ? `Back to ${essay.title}` : "Back to writes"}
      </Link>

      <header className="mt-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
          Architecture diagrams
        </p>
        <h1 className="font-display mt-3 text-section font-bold tracking-tight text-white sm:text-4xl">
          {doc.title}
        </h1>
        {doc.summary && (
          <p className="mt-4 text-lg leading-relaxed text-slate-300">
            {doc.summary}
          </p>
        )}
      </header>

      <section className="mt-10 border-t border-white/8 pt-10">
        <MDXRemote source={doc.content} components={mdxComponents} />
      </section>
    </article>
  );
}
