import Link from "next/link";
import { CLAIM_LABEL, type Handbook, type HandbookPage } from "@/content/handbooks";
import { EssayFeedback } from "@/components/writes/EssayFeedback";
import { HandbookPageTurn } from "@/components/handbooks/HandbookPageTurn";
import { SiteLink } from "@/components/handbooks/SiteLink";
import type { EssayFeedbackEntry } from "@/lib/essay-feedback-types";
import {
  chapterTitleForPage,
  handbookPath,
  pageFeedbackSlug,
  pagePath,
} from "@/lib/handbooks";

export function HandbookPageView({
  handbook,
  page,
  feedbackEntries,
}: {
  handbook: Handbook;
  page: HandbookPage;
  feedbackEntries: EssayFeedbackEntry[];
}) {
  const last = handbook.pages[handbook.pages.length - 1]?.number ?? page.number;
  const previous =
    page.number <= 1 ? handbookPath(handbook.slug) : pagePath(handbook.slug, page.number - 1);
  const next = page.number >= last ? null : pagePath(handbook.slug, page.number + 1);
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
            href={handbookPath(handbook.slug)}
            className="focus-ring rounded-sm hover:text-white"
          >
            {handbook.title}
          </Link>
        </p>
        <p className="shrink-0 whitespace-nowrap font-mono text-sm tabular-nums text-slate-400">
          <span className="text-white">{page.number}</span>
          <span className="text-slate-600"> / {last}</span>
        </p>
      </header>

      <div className="py-10 sm:py-14">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
          {chapter}
          {page.claim ? (
            <span className="text-neon-cyan"> · {CLAIM_LABEL[page.claim]}</span>
          ) : null}
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {page.title}
        </h1>
        {page.paragraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="mt-6 text-base leading-relaxed text-slate-300 sm:text-lg"
          >
            {paragraph}
          </p>
        ))}
        {page.steps ? (
          <ol className="mt-6 list-decimal space-y-2 pl-5 text-base leading-relaxed text-slate-300">
            {page.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        ) : null}
        {page.lines ? (
          <dl className="mt-8 border-t border-white/10">
            {page.lines.map((line) => (
              <div key={line.term} className="border-b border-white/10 py-3">
                <dt className="font-mono text-xs uppercase tracking-[0.16em] text-slate-400">
                  {line.term}
                </dt>
                <dd className="mt-1 text-base leading-relaxed text-slate-200">{line.detail}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {page.links && page.links.length > 0 ? (
          <p className="mt-8 text-sm leading-relaxed text-slate-400">
            {page.links.map((link, index) => (
              <span key={link.href}>
                {index > 0 ? <span className="px-2 text-slate-600">·</span> : null}
                <SiteLink href={link.href}>{link.label}</SiteLink>
              </span>
            ))}
          </p>
        ) : null}
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
            {page.number <= 1 ? "Cover" : "Previous"}
          </span>
          <span className="mt-1 block font-display text-lg font-semibold text-white">
            {page.number <= 1 ? handbook.title : "Page " + (page.number - 1)}
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
              Page {page.number + 1}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>

      {page.number === last ? (
        <div className="mt-16 border-t border-white/10 pt-10">
          <EssayFeedback
            slug={pageFeedbackSlug(handbook.slug, page.number)}
            initialEntries={feedbackEntries}
            notesLabel="Notes on this book"
          />
        </div>
      ) : null}
    </article>
  );
}
