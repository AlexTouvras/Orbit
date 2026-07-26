import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { getAllProjects, getProjectBySlug, getProjectSlugs } from "@/lib/projects";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { ProjectGallery } from "@/components/portfolio/ProjectGallery";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  const path = `/portfolio/${slug}`;
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: path },
    openGraph: {
      title: project.title,
      description: project.summary,
      type: "article",
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href="/portfolio"
        className="group inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to portfolio
      </Link>

      <header className="mt-8">
        <div className="flex items-center gap-3 font-mono text-xs text-slate-500">
          <span>{project.year}</span>
          {project.role && (
            <>
              <span className="text-slate-700">/</span>
              <span>{project.role}</span>
            </>
          )}
        </div>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
          {project.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-400">
          {project.summary}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {project.demo && (
            <Link
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-neon-cyan px-4 py-2 text-sm font-semibold text-void transition-transform hover:scale-[1.03]"
            >
              <ExternalLink className="h-4 w-4" />
              Live demo
            </Link>
          )}
          {project.repo && (
            <Link
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-white/30"
            >
              <GithubIcon className="h-4 w-4" />
              Source
            </Link>
          )}
        </div>
      </header>

      {/* Tech stack */}
      <GlassCard className="mt-10 p-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
          Tech stack
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <Badge key={tech} tone="violet">
              {tech}
            </Badge>
          ))}
        </div>
      </GlassCard>

      {/* Gallery / diagrams */}
      {project.gallery && project.gallery.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-sm font-mono uppercase tracking-[0.2em] text-slate-500">
            Screens &amp; architecture
          </h2>
          <ProjectGallery images={project.gallery} />
        </section>
      )}

      {/* MDX body */}
      <section className="mt-10">
        <MDXRemote source={project.content} components={mdxComponents} />
      </section>
    </article>
  );
}
