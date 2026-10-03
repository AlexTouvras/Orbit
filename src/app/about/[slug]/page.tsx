import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { PlaceMark } from "@/components/about/PlaceMark";
import { BackLink } from "@/components/ui/BackLink";
import { getPlace, listPlaceSlugs } from "@/content/cv";

export function generateStaticParams() {
  return listPlaceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const place = getPlace(slug);
  if (!place) return { title: "Not found" };
  return {
    title: place.name,
    description: place.about,
    alternates: { canonical: `/about/${place.slug}` },
  };
}

export default async function AboutPlacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = getPlace(slug);
  if (!place) notFound();

  const back =
    place.kind === "school" ? "/about#education" : "/about#experience";
  const experience = place.experience;
  const education = place.education;

  return (
    <article>
      <BackLink fallbackHref={back} label="Back to about" />

      <header className="mt-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
          {place.kind === "school" ? "Education" : "Employer"}
        </p>
        <div className="mt-4 flex items-center gap-4">
          <PlaceMark mark={place.mark} size="lg" />
          <h1 className="min-w-0 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {place.name}
          </h1>
        </div>
        {place.location ? (
          <p className="mt-4 font-mono text-xs uppercase tracking-wide text-slate-400">
            {place.location}
          </p>
        ) : null}
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          {place.about}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
          A public note on the time there. The institution tells its own story
          on its site.
        </p>
        <a
          href={place.url}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-neon-cyan"
        >
          {place.urlLabel}
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
      </header>

      <section className="mt-12 border-t border-white/10 pt-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
          Time there
        </p>

        {experience ? (
          <div className="mt-8 space-y-8">
            {experience.roles.map((role) => (
              <div key={role.title + role.period}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="orbit-accent font-medium">{role.title}</p>
                  <p className="font-mono text-xs text-slate-400">
                    {role.period}
                  </p>
                </div>
                <ul className="mt-3 space-y-2">
                  {role.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="relative pl-4 text-sm leading-relaxed text-slate-300 before:absolute before:left-0 before:top-2.5 before:h-1 before:w-1 before:rounded-full before:bg-slate-500"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}

        {education ? (
          <div className="mt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="orbit-accent font-medium">{education.degree}</p>
              {education.period ? (
                <p className="font-mono text-xs text-slate-400">
                  {education.period}
                </p>
              ) : null}
            </div>
            {education.thesisTitle ? (
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Thesis: {education.thesisTitle}
              </p>
            ) : null}
            {education.detail ? (
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {education.detail}
              </p>
            ) : null}
            {education.thesisUrl ? (
              <a
                href={education.thesisUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-neon-cyan"
              >
                Press for master&apos;s thesis
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            ) : null}
          </div>
        ) : null}
      </section>
    </article>
  );
}
