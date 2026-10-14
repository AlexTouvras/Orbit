import Link from "next/link";
import { HANDBOOKS } from "@/content/handbooks";
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
        The book is how you work.
      </p>
      <ol className="mt-12 border-t border-white/10">
        {HANDBOOKS.map((handbook) => {
          const opening = handbook.pages[0];
          if (!opening) return null;
          return (
            <li key={handbook.slug} className="border-b border-white/10">
              <Link
                href={pagePath(handbook.slug, opening.number)}
                className="focus-ring group grid gap-2 py-6 sm:grid-cols-[4.5rem_1fr] sm:gap-6"
              >
                <span className="font-mono text-sm tabular-nums text-slate-500">
                  {handbook.index}
                </span>
                <span>
                  <span className="block font-display text-2xl font-semibold text-white group-hover:text-neon-cyan">
                    {handbook.title}
                  </span>
                  <span className="mt-2 block max-w-xl text-sm leading-relaxed text-slate-400">
                    {handbook.thesis}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
