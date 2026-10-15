import Link from "next/link";
import type { Handbook, HandbookPage } from "@/content/handbooks";
import { SiteLink } from "@/components/handbooks/SiteLink";
import { pagePath } from "@/lib/handbooks";

export function ChapterRail({ handbook, page }: { handbook: Handbook; page: HandbookPage }) {
  const index = handbook.pages.findIndex((item) => item.number === page.number);
  const previous = index > 0 ? handbook.pages[index - 1] : null;
  const next = index >= 0 && index < handbook.pages.length - 1 ? handbook.pages[index + 1] : null;

  return (
    <nav aria-label="Chapter" data-chapter-rail className="shrink-0 border-b border-white/10 px-3 py-2 sm:px-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-[0.65rem] uppercase tracking-[0.14em]">
        <SiteLink href={handbook.card.href}>{handbook.card.label}</SiteLink>
        <Link href="/handbooks" className="text-slate-400 hover:text-white">
          {handbook.title}
        </Link>
        <span className="text-slate-600">
          {page.number} / {handbook.pages.length}
        </span>
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-3 text-sm">
        {previous ? (
          <Link
            href={pagePath(handbook.slug, previous.number)}
            className="focus-ring min-w-0 truncate text-slate-300 hover:text-white"
          >
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={pagePath(handbook.slug, next.number)}
            className="focus-ring min-w-0 truncate text-right text-slate-300 hover:text-white"
          >
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        This chapter is how I would operate.
        {page.illustration ? ` ${page.illustration}` : ""}
        {page.story ? (
          <>
            {" "}
            <SiteLink href={page.story.href}>{page.story.label}</SiteLink> shows how a decision unfolded.
          </>
        ) : null}
        {page.work ? (
          <>
            {" "}
            <SiteLink href={page.work.href}>{page.work.label}</SiteLink> is what was delivered.
          </>
        ) : null}
        {!page.story && !page.work ? " No story or delivered work is linked here." : null}
      </p>
    </nav>
  );
}
