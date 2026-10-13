import Link from "next/link";
import type { Handbook } from "@/content/handbooks";
import { SiteLink } from "@/components/handbooks/SiteLink";
import { StoryHeadline } from "@/components/story/StoryHeadline";
import { chapterPath } from "@/lib/handbooks";

export function HandbookCover({ handbook }: { handbook: Handbook }) {
  return (
    <article>
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
        <Link href="/handbooks" className="focus-ring rounded-sm hover:text-white">
          Handbooks
        </Link>
        <span className="px-2 text-slate-600">/</span>
        {handbook.index}
      </p>
      <StoryHeadline
        className="mt-6"
        kicker={handbook.kicker}
        line={handbook.line}
        accent={handbook.accent}
      />
      <p className="mt-8 max-w-2xl font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
        {handbook.edition}
      </p>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
        {handbook.thesis}
      </p>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
        {handbook.reader}
      </p>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300">
        Extends the{" "}
        <SiteLink href={handbook.extends.href}>{handbook.extends.label}</SiteLink>
        . {handbook.extends.line}
      </p>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
        A cyan mark on a section says the line is an operating principle, a
        practice I treat as given, or a hypothesis.
      </p>

      <ol className="mt-10 border-t border-white/10">
        {handbook.chapters.map((chapter) => (
          <li key={chapter.slug} className="border-b border-white/10">
            <Link
              href={chapterPath(handbook.slug, chapter.slug)}
              className="focus-ring group grid gap-2 py-6 sm:grid-cols-[4.5rem_1fr] sm:gap-6"
            >
              <span className="font-mono text-sm tabular-nums text-slate-500">
                {chapter.index}
              </span>
              <span>
                <span className="block font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
                  {chapter.roleLabel}
                </span>
                <span className="mt-1 block font-display text-2xl font-semibold text-white group-hover:text-neon-cyan">
                  {chapter.title}
                </span>
                <span className="mt-2 block max-w-xl text-sm leading-relaxed text-slate-400">
                  {chapter.lede}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <section className="mt-12 max-w-2xl" aria-labelledby="non-goals">
        <h2 id="non-goals" className="font-display text-xl font-semibold text-white">
          What this edition leaves out
        </h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
          {handbook.nonGoals.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
