import Link from "next/link";
import {
  HANDBOOKS,
  LATER_HANDBOOKS,
} from "@/content/handbooks";
import { SiteLink } from "@/components/handbooks/SiteLink";
import { StoryHeadline } from "@/components/story/StoryHeadline";
import { StoryScene } from "@/components/story/StoryScene";
import { chapterPath, handbookPath } from "@/lib/handbooks";

const PATH = [
  {
    index: "01",
    title: "Field card",
    line: "What the field is, in one picture.",
  },
  {
    index: "02",
    title: "Handbook",
    line: "That card, as a method you can run on Monday.",
  },
  {
    index: "03",
    title: "Story",
    line: "The same method on a problem you can open.",
  },
];

export function HandbookLibrary() {
  const flagship = HANDBOOKS[0];

  return (
    <div>
      <StoryHeadline
        kicker="Handbooks"
        line="The method"
        accent="behind the cards."
      />
      <p className="mt-8 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
        A handbook extends one field card. It keeps that card’s rule, writes
        the method, and ends on a story. Edition 1 publishes one handbook, so
        the next ones have a standard to follow.
      </p>
      <ol className="mt-10 max-w-2xl border-t border-white/10">
        {PATH.map((step) => (
          <li
            key={step.index}
            className="grid gap-2 border-b border-white/10 py-5 sm:grid-cols-[4.5rem_1fr] sm:gap-6"
          >
            <span className="font-mono text-sm tabular-nums text-slate-500">
              {step.index}
            </span>
            <span>
              <span className="font-display text-xl font-semibold text-white">
                {step.title}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-slate-400">
                {step.line}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <StoryScene id="flagship" width="copy" className="!pb-0">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
          {flagship.index} · {flagship.edition}
        </p>
        <h2 className="mt-4 font-display text-section font-bold text-white">
          <Link
            href={handbookPath(flagship.slug)}
            className="focus-ring rounded-sm hover:text-neon-cyan"
          >
            {flagship.title}
          </Link>
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-300">
          {flagship.thesis}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          {flagship.reader}
        </p>
        <p className="mt-6 text-sm leading-relaxed text-slate-300">
          Extends the{" "}
          <SiteLink href={flagship.extends.href}>{flagship.extends.label}</SiteLink>
          . {flagship.extends.line}
        </p>
        <ol className="mt-10 border-t border-white/10">
          {flagship.chapters.map((chapter) => (
            <li key={chapter.slug} className="border-b border-white/10">
              <Link
                href={chapterPath(flagship.slug, chapter.slug)}
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
      </StoryScene>

      <StoryScene id="later" width="copy">
        <h2 className="font-display text-section font-bold text-white">
          The same standard, not written yet
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
          Each of these extends one card. None of them opens until this
          handbook has been read. The AI card and the SDLC card stay cards.
        </p>
        <ol className="mt-8 border-t border-white/10">
          {LATER_HANDBOOKS.map((item) => (
            <li
              key={item.index}
              className="grid gap-2 border-b border-white/10 py-6 sm:grid-cols-[4.5rem_1fr] sm:gap-6"
            >
              <span className="font-mono text-sm tabular-nums text-slate-500">
                {item.index}
              </span>
              <span>
                <span className="font-display text-xl font-semibold text-white">
                  {item.title}
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-slate-400">
                  Extends the{" "}
                  <SiteLink href={item.card.href}>{item.card.label}</SiteLink>
                  .
                </span>
              </span>
            </li>
          ))}
        </ol>
      </StoryScene>
    </div>
  );
}
