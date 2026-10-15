import Link from "next/link";
import { HANDBOOKS } from "@/content/handbooks";
import { HandbookFieldLandscape } from "@/components/handbooks/HandbookBoard";
import { StoryHeadline } from "@/components/story/StoryHeadline";
import { pagePath } from "@/lib/handbooks";

export function HandbookLibrary() {
  return (
    <div>
      <StoryHeadline
        kicker="Handbooks"
        line="The method"
        accent="behind the cards."
      />
      <p className="mt-8 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
        A handbook is a book about one field. The field card is the picture.
        The book is how I would operate. A story shows how a decision unfolded.
        The portfolio is what was delivered. An illustration is not a record.
      </p>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400">
        Each book is an operating rule, the day, the limit, and how I would know.
      </p>
      <HandbookFieldLandscape />
      <ol className="mt-12 border-t border-white/10">
        {HANDBOOKS.map((handbook) => {
          const opening = handbook.pages[0];
          if (!opening) return null;
          return (
            <li
              key={handbook.slug}
              className="grid gap-3 border-b border-white/10 py-6 sm:grid-cols-[4.5rem_1fr] sm:gap-6"
            >
              <span className="font-mono text-sm tabular-nums text-slate-500">
                {handbook.index}
              </span>
              <div>
                <Link
                  href={pagePath(handbook.slug, opening.number)}
                  className="focus-ring group block rounded-sm"
                >
                  <span className="block font-display text-2xl font-semibold text-white group-hover:text-neon-cyan">
                    {handbook.title}
                  </span>
                  <span className="mt-2 block max-w-xl text-sm leading-relaxed text-slate-400">
                    {handbook.thesis}
                  </span>
                </Link>
                <a
                  href={handbook.card.href}
                  className="focus-ring mt-3 inline-block rounded-sm font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-500 hover:text-white"
                >
                  {handbook.card.label}
                </a>
                <ol className="mt-4 max-w-xl border-t border-white/10 pt-3">
                  {handbook.contents.map((entry) => (
                    <li key={entry.page}>
                      <Link
                        href={pagePath(handbook.slug, entry.page)}
                        className="focus-ring flex gap-3 rounded-sm py-1.5 text-sm text-slate-300 hover:text-white"
                      >
                        <span className="w-4 shrink-0 font-mono text-xs tabular-nums text-slate-500">
                          {entry.page}
                        </span>
                        <span>{entry.title}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
