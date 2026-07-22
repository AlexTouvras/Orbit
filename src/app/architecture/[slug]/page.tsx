import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  ARCHITECTURE_ESSAY_LINKS,
  getArchitectureBySlug,
  getArchitectureSlugs,
} from "@/lib/architecture";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { BackLink } from "@/components/ui/BackLink";

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
      <BackLink fallbackHref={essay?.href ?? "/#selected-work"} />

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
