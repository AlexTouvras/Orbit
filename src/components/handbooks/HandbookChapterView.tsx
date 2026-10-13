import Link from "next/link";
import { CLAIM_LABEL, type Handbook, type HandbookChapter } from "@/content/handbooks";
import { EssayFeedback } from "@/components/writes/EssayFeedback";
import type { EssayFeedbackEntry } from "@/lib/essay-feedback-types";
import { HandbookChain } from "@/components/handbooks/HandbookChain";
import { SiteLink } from "@/components/handbooks/SiteLink";
import { chapterFeedbackSlug, chapterPath, handbookPath } from "@/lib/handbooks";

export function HandbookChapterView({
  handbook,
  chapter,
  index,
  feedbackEntries,
}: {
  handbook: Handbook;
  chapter: HandbookChapter;
  index: number;
  feedbackEntries: EssayFeedbackEntry[];
}) {
  const previous = index > 0 ? handbook.chapters[index - 1] : null;
  const next =
    index < handbook.chapters.length - 1 ? handbook.chapters[index + 1] : null;

  return (
    <article>
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
        <Link href="/handbooks" className="focus-ring rounded-sm hover:text-white">
          Handbooks
        </Link>
        <span className="px-2 text-slate-600">/</span>
        <Link
          href={handbookPath(handbook.slug)}
          className="focus-ring rounded-sm hover:text-white"
        >
          {handbook.title}
        </Link>
      </p>
      <p className="mt-6 font-mono text-xs uppercase tracking-[0.22em]">
        <span className="orbit-accent tabular-nums">
          {handbook.index} / {chapter.index}
        </span>
        <span className="px-2 text-slate-600">/</span>
        <span className="text-slate-400">{chapter.roleLabel}</span>
      </p>
      <h1 className="mt-4 max-w-3xl font-display text-display font-bold text-white">
        {chapter.title}
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
        {chapter.lede}
      </p>

      <nav className="mt-10 max-w-2xl" aria-label="On this chapter">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
          On this chapter
        </p>
        <ol className="mt-3 flex flex-col gap-2">
          {chapter.sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="focus-ring inline-flex min-h-11 items-baseline gap-3 text-sm text-slate-300 hover:text-white sm:min-h-0"
              >
                <span className="font-mono text-xs tabular-nums text-slate-500">
                  {section.index}
                </span>
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-16 max-w-2xl space-y-16">
        {chapter.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-28">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
              <span className="tabular-nums">{section.index}</span>
              {section.claim ? (
                <span className="text-neon-cyan"> · {CLAIM_LABEL[section.claim]}</span>
              ) : null}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {section.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-200 sm:text-lg">
              {section.lead}
            </p>
            {section.paragraphs?.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-4 text-base leading-relaxed text-slate-300"
              >
                {paragraph}
              </p>
            ))}
            {section.steps ? (
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-base leading-relaxed text-slate-300">
                {section.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            ) : null}
            {section.lines ? (
              <dl className="mt-4 border-t border-white/10">
                {section.lines.map((line) => (
                  <div key={line.term} className="border-b border-white/10 py-3">
                    <dt className="font-mono text-xs uppercase tracking-[0.16em] text-slate-400">
                      {line.term}
                    </dt>
                    <dd className="mt-1 text-base leading-relaxed text-slate-200">
                      {line.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {section.id === "framework" && chapter.chain ? (
              <HandbookChain lead={chapter.chain.lead} support={chapter.chain.support} />
            ) : null}
            {section.links && section.links.length > 0 ? (
              <ul className="mt-4 space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <SiteLink href={link.href}>{link.label}</SiteLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      <aside className="mt-16 max-w-2xl border-t border-white/10 pt-8">
        <h2 className="font-display text-xl font-semibold text-white">From here</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {chapter.related.map((link) => (
            <li key={link.href}>
              <SiteLink href={link.href}>{link.label}</SiteLink>
            </li>
          ))}
        </ul>
      </aside>

      <nav
        className="mt-12 grid max-w-2xl gap-4 border-t border-white/10 pt-8 sm:grid-cols-2"
        aria-label="Chapters"
      >
        {previous ? (
          <Link
            href={chapterPath(handbook.slug, previous.slug)}
            className="focus-ring rounded-xl border border-white/10 px-4 py-4 hover:border-white/25"
          >
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
              Previous
            </span>
            <span className="mt-1 block font-display text-lg font-semibold text-white">
              {previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={chapterPath(handbook.slug, next.slug)}
            className="focus-ring rounded-xl border border-white/10 px-4 py-4 text-right hover:border-white/25 sm:col-start-2"
          >
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
              Next
            </span>
            <span className="mt-1 block font-display text-lg font-semibold text-white">
              {next.title}
            </span>
          </Link>
        ) : null}
      </nav>

      <div className="max-w-2xl">
        <EssayFeedback
          slug={chapterFeedbackSlug(handbook.slug, chapter.slug)}
          initialEntries={feedbackEntries}
          notesLabel="Notes on this chapter"
        />
      </div>
    </article>
  );
}
