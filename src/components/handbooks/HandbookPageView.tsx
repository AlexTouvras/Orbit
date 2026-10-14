import Link from "next/link";
import type { Handbook, HandbookFigure, HandbookPage } from "@/content/handbooks";
import { EssayFeedback } from "@/components/writes/EssayFeedback";
import { HandbookPageTurn } from "@/components/handbooks/HandbookPageTurn";
import { SiteLink } from "@/components/handbooks/SiteLink";
import type { EssayFeedbackEntry } from "@/lib/essay-feedback-types";
import { chapterTitleForPage, pageFeedbackSlug, pagePath } from "@/lib/handbooks";

export function HandbookPageView({
  handbook,
  page,
  feedbackEntries,
}: {
  handbook: Handbook;
  page: HandbookPage;
  feedbackEntries: EssayFeedbackEntry[];
}) {
  const previous =
    page.number <= 1 ? "/handbooks" : pagePath(handbook.slug, page.number - 1);
  const nextPage = handbook.pages.find((item) => item.number === page.number + 1) ?? null;
  const next = nextPage ? pagePath(handbook.slug, nextPage.number) : null;
  const chapter = chapterTitleForPage(handbook, page.number);

  return (
    <article className="mx-auto flex w-full max-w-2xl flex-col">
      <HandbookPageTurn previous={previous} next={next} />
      <header className="flex items-baseline justify-between gap-6 border-b border-white/15 pb-3">
        <p className="min-w-0 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
          <Link href="/handbooks" className="focus-ring rounded-sm hover:text-white">
            Handbooks
          </Link>
          <span className="px-2 text-slate-600">/</span>
          <Link
            href={pagePath(handbook.slug, handbook.pages[0]?.number ?? page.number)}
            className="focus-ring rounded-sm hover:text-white"
          >
            {handbook.title}
          </Link>
        </p>
        <p className="shrink-0 text-right font-mono text-sm tabular-nums text-white">
          <span className="block">{page.number}</span>
          <span className="mt-1 block text-[0.65rem] font-normal uppercase tracking-[0.14em] text-slate-500">
            Reviewed {page.reviewed}
          </span>
        </p>
      </header>

      <div className="py-10 sm:py-14">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
          {page.topic}
          <span className="px-2 text-slate-600">/</span>
          {chapter}
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {page.title}
        </h1>
        <p className="mt-6 text-base leading-relaxed text-slate-200 sm:text-lg">{page.lede}</p>
        {page.rule ? (
          <p className="mt-6 border-l border-neon-cyan/60 pl-4 text-base leading-relaxed text-white">
            {page.rule}
          </p>
        ) : null}
        <nav className="mt-8" aria-label="On this page">
          <ol className="flex flex-col gap-2">
            {page.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="focus-ring text-sm text-slate-400 hover:text-white"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        {page.sections.map((section) => (
          <section key={section.id} id={section.id} className="mt-14 scroll-mt-28">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-white">
              {section.title}
            </h2>
            {section.paragraphs?.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-4 text-base leading-relaxed text-slate-300"
              >
                {paragraph}
              </p>
            ))}
            {section.figure ? <HandbookFigureView figure={section.figure} /> : null}
            {section.steps ? (
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-base leading-relaxed text-slate-300">
                {section.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            ) : null}
            {section.sources && section.sources.length > 0 ? (
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                {section.sources.map((source, index) => (
                  <span key={source.href}>
                    {index > 0 ? <span className="px-2 text-slate-600">·</span> : null}
                    <SiteLink href={source.href}>{source.label}</SiteLink>
                  </span>
                ))}
              </p>
            ) : null}
          </section>
        ))}
        <section className="mt-14 border-t border-white/10 pt-8" aria-labelledby="sources">
          <h2 id="sources" className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
            References
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed">
            {page.sources.map((source) => (
              <li key={source.href}>
                <SiteLink href={source.href}>{source.label}</SiteLink>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <nav
        aria-label="Pages"
        className="grid grid-cols-2 gap-4 border-t border-white/15 pt-4"
      >
        <Link
          href={previous}
          className="focus-ring min-h-11 text-sm text-slate-300 hover:text-white"
        >
          <span className="block font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">
            {page.number <= 1 ? "Handbooks" : "Previous"}
          </span>
          <span className="mt-1 block font-display text-lg font-semibold text-white">
            {page.number <= 1
              ? "Library"
              : handbook.contents.find((entry) => entry.page === page.number - 1)?.title ??
                "Page " + (page.number - 1)}
          </span>
        </Link>
        {next ? (
          <Link
            href={next}
            className="focus-ring min-h-11 text-right text-sm text-slate-300 hover:text-white"
          >
            <span className="block font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">
              Next
            </span>
            <span className="mt-1 block font-display text-lg font-semibold text-white">
              {nextPage
                ? handbook.contents.find((entry) => entry.page === nextPage.number)?.title ??
                  nextPage.title
                : null}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>

      {next ? null : (
        <div className="mt-16 border-t border-white/10 pt-10">
          <EssayFeedback
            slug={pageFeedbackSlug(handbook.slug, page.number)}
            initialEntries={feedbackEntries}
            notesLabel="Notes on this page"
          />
        </div>
      )}
    </article>
  );
}

function HandbookFigureView({ figure }: { figure: HandbookFigure }) {
  if (figure.kind === "pyramid") {
    return (
      <figure className="mt-6">
        <ol className="mx-auto flex max-w-lg flex-col items-center gap-2">
          {figure.steps.map((step, index) => (
            <li
              key={step.term}
              className="border border-white/15 px-4 py-3 text-center"
              style={{ width: `${100 - index * 18}%` }}
            >
              <span className="block font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">
                {step.term}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-slate-200">
                {step.detail}
              </span>
            </li>
          ))}
        </ol>
        <figcaption className="mt-3 text-sm leading-relaxed text-slate-400">
          {figure.caption}
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="mt-6">
      <ol>
        {figure.steps.map((step, index) => {
          const last = index === figure.steps.length - 1;
          return (
            <li key={step.term} className="relative flex gap-4 pb-5 last:pb-0">
              {last ? null : (
                <span
                  aria-hidden
                  className="absolute top-6 bottom-0 left-3 w-px -translate-x-1/2 bg-neon-cyan/35"
                />
              )}
              <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neon-cyan/50 bg-void font-mono text-[0.6rem] tabular-nums text-neon-cyan">
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-400">
                  {step.term}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-slate-200">
                  {step.detail}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      <figcaption className="mt-3 text-sm leading-relaxed text-slate-400">
        {figure.caption}
      </figcaption>
    </figure>
  );
}
