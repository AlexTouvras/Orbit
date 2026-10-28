import Link from "next/link";
import type { Handbook, HandbookPage, HandbookSection } from "@/content/handbooks";
import type { PageReference } from "@/lib/handbook-citations";
import { EssayReactionBar, EssayReactions } from "@/components/writes/EssayFeedback";
import type { EssayFeedbackEntry } from "@/lib/essay-feedback-types";
import { adjacentPages, chapterForPage, chapterPlace, pagePath } from "@/lib/handbooks";
import { CiteMarks, ReferenceItem } from "@/components/handbooks/Citations";
import { BookLink } from "@/components/handbooks/volume/BookLink";
import { chapterLinks, citationMarks, pageReferences } from "@/lib/handbook-citations";
import { ChapterKeys } from "@/components/handbooks/volume/ChapterKeys";
import { ContentsList } from "@/components/handbooks/volume/ContentsList";
import {
  CoverModels,
  CoverSheets,
  VolumeFigure,
  VolumeLines,
  VolumePicture,
} from "@/components/handbooks/volume/VolumeFigures";

export function VolumeReader({
  handbook,
  page,
  feedbackEntries,
  feedbackSlug,
  showFeedback,
}: {
  handbook: Handbook;
  page: HandbookPage;
  feedbackEntries: EssayFeedbackEntry[];
  feedbackSlug: string;
  showFeedback: boolean;
}) {
  const opening = handbook.pages[0];
  const cover = opening?.number === page.number;
  const bookHref = opening ? pagePath(handbook.slug, opening.number) : "/handbooks";
  const { previous, next } = adjacentPages(handbook, page.number);
  const previousHref = previous ? pagePath(handbook.slug, previous.number) : null;
  const nextHref = next ? pagePath(handbook.slug, next.number) : null;
  const chapter = chapterForPage(handbook, page.number);
  const { place, count } = chapterPlace(handbook, page.number);
  const chapterName = chapter && chapter.title !== page.title ? chapter.title : null;

  const references = pageReferences(page);

  let figureNumber = 0;
  const sections = page.sections.map((section) => {
    const lines = section.lines?.length ? ++figureNumber : 0;
    const diagram = section.figure ? ++figureNumber : 0;
    const photo = section.picture ? ++figureNumber : 0;
    return { section, lines, diagram, photo };
  });

  return (
    <div className="handbook-volume min-h-dvh" data-handbook-volume data-chapter={page.number}>
      <ChapterKeys previous={previousHref} next={nextHref} />
      <div className="mx-auto w-full max-w-[90rem] lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-x-12 lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto py-8 pr-2">
            <BookIdentity handbook={handbook} bookHref={bookHref} />
            <div className="mt-8">
              <ContentsList handbook={handbook} pageNumber={page.number} />
            </div>
          </div>
        </aside>

        <div className="min-w-0 px-5 pt-6 pb-24 sm:px-8 lg:px-0 lg:pt-10 lg:pr-10">
          <div className="sticky top-14 z-30 -mx-5 border-b border-[var(--book-rule)] bg-[var(--book-paper)] px-5 py-2 sm:-mx-8 sm:px-8 lg:hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-display text-lg leading-tight font-semibold">
                  <Link href={bookHref} className="book-link">
                    {handbook.title}
                  </Link>
                </p>
                <p className="book-kicker mt-0.5">
                  <Link href="/handbooks" className="book-link">
                    Handbooks
                  </Link>
                  <span className="px-1.5">Vol. {handbook.index}</span>
                </p>
              </div>
              <p className="pt-1 font-mono text-sm tabular-nums" aria-label={`Address ${page.number}`}>
                {page.number}
              </p>
            </div>
            <details className="relative">
              <summary className="book-summary">Contents</summary>
              <div className="absolute inset-x-0 top-full z-40 max-h-[70dvh] overflow-y-auto border border-[var(--book-rule)] bg-[var(--book-paper)] px-4 py-4">
                <ContentsList handbook={handbook} pageNumber={page.number} showHeading={false} />
              </div>
            </details>
          </div>

          {cover ? (
            <header id="cover" className="book-spread scroll-mt-48 pt-8 lg:scroll-mt-20 lg:pt-2">
              {page.plate === "pipeline" ? (
                <>
                  <p className="book-kicker">Orbit handbooks · Volume {handbook.index}</p>
                  <p className="mt-5 max-w-[11ch] font-display text-[clamp(2.75rem,6vw,4.5rem)] leading-[0.96] font-semibold tracking-tight">
                    {handbook.title}
                  </p>
                  <div className="mt-10">
                    <CoverModels />
                  </div>
                  <div className="mt-10 max-w-[40rem]">
                    <p className="text-[1.2rem] leading-relaxed">{handbook.thesis}</p>
                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                      <a href="#chapter" className="book-start">
                        Start reading
                      </a>
                      <BookLink href={handbook.card.href}>{handbook.card.label}</BookLink>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="book-kicker">Orbit handbooks</p>
                  <div className="mt-4 grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
                    <div className="max-w-[40rem]">
                      <p className="max-w-[11ch] font-display text-[clamp(2.75rem,6vw,4.5rem)] leading-[0.96] font-semibold tracking-tight">
                        {handbook.title}
                      </p>
                      <p className="mt-5 text-[1.2rem] leading-relaxed">Volume {handbook.index}</p>
                      <p className="mt-3 max-w-[36rem] text-[1.15rem] leading-relaxed">{handbook.thesis}</p>
                      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                        <a href="#chapter" className="book-start">
                          Start reading
                        </a>
                        <BookLink href={handbook.card.href}>{handbook.card.label}</BookLink>
                      </div>
                    </div>
                    {page.plate === "ledger" ? <CoverSheets /> : null}
                  </div>
                </>
              )}
              <div className="book-measure mt-16 border-t border-[var(--book-rule)] pt-6">
                <ContentsList handbook={handbook} pageNumber={page.number} />
              </div>
            </header>
          ) : null}

          <article className={cover ? "mt-16" : "mt-6 lg:mt-0"}>
            <EssayReactions slug={feedbackSlug} initialEntries={feedbackEntries} tone="paper">
            <header id="chapter" className="book-measure scroll-mt-48 lg:scroll-mt-20">
              <div className="flex items-baseline justify-between gap-4">
                <p className="book-kicker">
                  Chapter {place} of {count}
                </p>
                <p className="hidden font-mono text-sm tabular-nums lg:block" aria-label={`Address ${page.number}`}>
                  {page.number}
                </p>
              </div>
              {chapterName ? <p className="mt-3 text-[1.05rem]">{chapterName}</p> : null}
              <h1 className="mt-3 font-display text-[clamp(2.15rem,4vw,3.25rem)] leading-[1.05] font-semibold tracking-tight">
                {page.title}
              </h1>
              {showFeedback ? <EssayReactionBar place="title" className="mt-4" /> : null}
              <p className="mt-5 text-[1.2rem] leading-[1.65]">{page.lede}</p>
              {page.rule ? (
                <div className="mt-8 border-l-2 border-[var(--book-accent)] pl-5">
                  <p className="book-kicker text-[var(--book-accent)]">Operating rule</p>
                  <p className="mt-2 text-[1.125rem] leading-[1.7]">{page.rule}</p>
                </div>
              ) : null}
              <p className="mt-6 text-[1.02rem] leading-relaxed text-[var(--book-muted)]">
                This chapter is how I would operate.
                {page.illustration ? ` ${page.illustration}` : ""}
                {page.story ? (
                  <>
                    {" "}
                    <BookLink href={page.story.href}>{page.story.label}</BookLink> shows how a decision unfolded.
                  </>
                ) : null}
                {page.work ? (
                  <>
                    {" "}
                    <BookLink href={page.work.href}>{page.work.label}</BookLink> is what was delivered.
                  </>
                ) : null}
                {!page.story && !page.work ? " No story or delivered work is linked here." : null}
              </p>
              <p className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[0.95rem] text-[var(--book-muted)]">
                <span>Checked {page.reviewed}</span>
                <BookLink href={handbook.card.href}>{handbook.card.label}</BookLink>
              </p>
            </header>

            {sections.map(({ section, lines, diagram, photo }) => (
              <SectionBlock
                key={section.id}
                section={section}
                lines={lines}
                diagram={diagram}
                photo={photo}
                references={references}
              />
            ))}

            {references.length ? (
              <section className="book-measure mt-16 scroll-mt-48 border-t border-[var(--book-rule)] pt-8 lg:scroll-mt-20" aria-labelledby="references-heading">
                <h2 id="references-heading" className="font-display text-[1.6rem] leading-tight font-semibold">
                  References
                </h2>
                <ol className="mt-4 space-y-3 text-[1.02rem] leading-relaxed">
                  {references.map((item) => (
                    <li id={`ref-${item.n}`} key={item.n} className="grid scroll-mt-48 grid-cols-[1.75rem_minmax(0,1fr)] gap-2 lg:scroll-mt-20">
                      <ReferenceItem item={item} />
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {showFeedback ? (
              <div className="book-measure mt-12">
                <EssayReactionBar place="end" />
              </div>
            ) : null}

            <nav aria-label="Chapters" className="book-measure mt-16 border-t-2 border-[var(--book-ink)] pt-8">
              <p className="book-kicker">
                Chapter {place} of {count}
              </p>
              <div className="mt-6 grid gap-8 sm:grid-cols-2">
                {previous ? (
                  <Link href={pagePath(handbook.slug, previous.number)} className="book-turn">
                    <span className="book-kicker">Previous</span>
                    <span className="mt-1 block font-display text-2xl leading-tight font-semibold">{previous.title}</span>
                  </Link>
                ) : (
                  <Link href="/handbooks" className="book-turn">
                    <span className="book-kicker">Handbooks</span>
                    <span className="mt-1 block font-display text-2xl leading-tight font-semibold">All books</span>
                  </Link>
                )}
                {next ? (
                  <Link href={pagePath(handbook.slug, next.number)} className="book-turn sm:text-right">
                    <span className="book-kicker">Next</span>
                    <span className="mt-1 block font-display text-2xl leading-tight font-semibold">{next.title}</span>
                  </Link>
                ) : (
                  <span />
                )}
              </div>
            </nav>
            </EssayReactions>
          </article>
        </div>
      </div>
    </div>
  );
}

function BookIdentity({
  handbook,
  bookHref,
}: {
  handbook: Handbook;
  bookHref: string;
}) {
  return (
    <div>
      <p className="book-kicker">
        <Link href="/handbooks" className="book-link">
          Handbooks
        </Link>
        <span className="px-2 text-[var(--book-muted)]">Vol. {handbook.index}</span>
      </p>
      <p className="mt-2 font-display text-xl leading-tight font-semibold">
        <Link href={bookHref} className="book-link">
          {handbook.title}
        </Link>
      </p>
      <p className="mt-2 text-[0.95rem]">
        <BookLink href={handbook.card.href}>{handbook.card.label}</BookLink>
      </p>
    </div>
  );
}

function SectionBlock({
  section,
  lines,
  diagram,
  photo,
  references,
}: {
  section: HandbookSection;
  lines: number;
  diagram: number;
  photo: number;
  references: PageReference[];
}) {
  const marks = citationMarks(references, section.sources);
  const links = chapterLinks(section.sources);
  const lastParagraph = (section.paragraphs?.length ?? 0) - 1;
  const lastClosing = (section.closing?.length ?? 0) - 1;
  const citesOnParagraphs = marks.length > 0 && lastClosing < 0 && lastParagraph >= 0;
  const citesOnClosing = marks.length > 0 && lastClosing >= 0;
  return (
    <section id={section.id} className="mt-14 scroll-mt-48 border-t border-[var(--book-rule)] pt-8 lg:scroll-mt-20" aria-labelledby={`${section.id}-title`}>
      <h2 id={`${section.id}-title`} className="book-measure font-display text-[1.7rem] leading-tight font-semibold">
        {section.title}
      </h2>
      {section.paragraphs?.length ? (
        <div className="book-measure mt-4 space-y-4 text-[1.125rem] leading-[1.75]">
          {section.paragraphs.map((paragraph, index) => (
            <p key={`${section.id}-p-${index}`}>
              {paragraph}
              {citesOnParagraphs && index === lastParagraph ? <CiteMarks marks={marks} /> : null}
            </p>
          ))}
        </div>
      ) : null}
      {section.lines?.length && lines ? (
        <VolumeLines lines={section.lines} n={lines} caption={section.title} />
      ) : null}
      {section.figure && diagram ? (
        <VolumeFigure figure={section.figure} n={diagram} fallback={section.title} />
      ) : null}
      {section.steps?.length ? (
        <ol className="book-measure mt-4 list-decimal space-y-3 pl-6 text-[1.125rem] leading-[1.7]">
          {section.steps.map((step, index) => (
            <li key={`${section.id}-step-${index}`} className="pl-1">
              {step}
            </li>
          ))}
        </ol>
      ) : null}
      {section.closing?.length ? (
        <div className="book-measure mt-4 space-y-4 text-[1.125rem] leading-[1.75]">
          {section.closing.map((paragraph, index) => (
            <p key={`${section.id}-c-${index}`}>
              {paragraph}
              {citesOnClosing && index === lastClosing ? <CiteMarks marks={marks} /> : null}
            </p>
          ))}
        </div>
      ) : null}
      {section.picture && photo ? <VolumePicture picture={section.picture} n={photo} /> : null}
      {marks.length > 0 && lastParagraph < 0 && lastClosing < 0 ? (
        <p className="book-measure mt-4 text-[1.125rem] leading-[1.75]">
          <CiteMarks marks={marks} />
        </p>
      ) : null}
      {links.length ? (
        <p className="book-measure mt-4 text-[1rem] leading-relaxed">
          {links.map((source, index) => (
            <span key={`${source.href}-${index}`}>
              {index > 0 ? (
                <span className="px-2 text-[var(--book-muted)]" aria-hidden="true">
                  ·
                </span>
              ) : null}
              <BookLink href={source.href}>{source.label}</BookLink>
            </span>
          ))}
        </p>
      ) : null}
    </section>
  );
}
