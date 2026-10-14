import Link from "next/link";
import type { Handbook } from "@/content/handbooks";
import { SiteLink } from "@/components/handbooks/SiteLink";
import { StoryHeadline } from "@/components/story/StoryHeadline";
import { pagePath } from "@/lib/handbooks";

export function HandbookCover({ handbook }: { handbook: Handbook }) {
  const first = handbook.pages[0];

  return (
    <article className="mx-auto max-w-2xl">
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
      <h1 className="mt-8 font-display text-3xl font-bold text-white sm:text-4xl">
        {handbook.title}
      </h1>
      <p className="mt-6 text-base leading-relaxed text-slate-300 sm:text-lg">
        {handbook.thesis}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-slate-400">
        Extends the <SiteLink href={handbook.card.href}>{handbook.card.label}</SiteLink>
        . {handbook.rest}
      </p>
      {first ? (
        <p className="mt-10">
          <Link
            href={pagePath(handbook.slug, first.number)}
            className="focus-ring inline-flex min-h-11 items-center font-display text-lg font-semibold text-white hover:text-neon-cyan"
          >
            Read page {first.number}
          </Link>
        </p>
      ) : null}

      <h2 className="mt-14 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
        Contents
      </h2>
      <ol className="mt-3 border-t border-white/10">
        {handbook.contents.map((entry) => (
          <li key={entry.title} className="border-b border-white/10">
            <Link
              href={pagePath(handbook.slug, entry.page)}
              className="focus-ring group flex items-baseline justify-between gap-6 py-4"
            >
              <span className="font-display text-xl font-semibold text-white group-hover:text-neon-cyan">
                {entry.title}
              </span>
              <span className="font-mono text-sm tabular-nums text-slate-500">
                {entry.page}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
}
