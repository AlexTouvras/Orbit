import Link from "next/link";
import {
  HANDBOOKS,
  LATER_HANDBOOKS,
} from "@/content/handbooks";
import { StoryHeadline } from "@/components/story/StoryHeadline";
import { StoryScene } from "@/components/story/StoryScene";
import { chapterPath, handbookPath } from "@/lib/handbooks";

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
        A field card says what the field is. A handbook says how I move from a
        business problem to a measured outcome. A story or an essay shows what
        happened when a method met a real problem.
      </p>

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
          Named, and not written
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
          The flagship has to hold before these open. They are boundaries, so
          the first handbook does not try to be every field card.
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
                  {item.scope}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </StoryScene>
    </div>
  );
}
