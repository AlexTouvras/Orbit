import Link from "next/link";
import { HANDBOOKS, LATER_HANDBOOKS } from "@/content/handbooks";
import { StoryHeadline } from "@/components/story/StoryHeadline";
import { handbookPath } from "@/lib/handbooks";

export function HandbookLibrary() {
  const published = HANDBOOKS.map((handbook) => ({
    index: handbook.index,
    title: handbook.title,
    line: handbook.thesis,
    href: handbookPath(handbook.slug),
  }));
  const later = LATER_HANDBOOKS.map((handbook) => ({
    index: handbook.index,
    title: handbook.title,
    line: "Not written.",
    href: null as string | null,
  }));

  return (
    <div>
      <StoryHeadline
        kicker="Handbooks"
        line="The method"
        accent="behind the cards."
      />
      <p className="mt-8 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
        The field cards are the fields. A handbook is the chain across them: a
        business problem, then data, an intelligent system, delivery, and a
        measured outcome.
      </p>
      <ol className="mt-12 border-t border-white/10">
        {[...published, ...later].map((handbook) => {
          const body = (
            <>
              <span className="font-mono text-sm tabular-nums text-slate-500">
                {handbook.index}
              </span>
              <span>
                <span className="block font-display text-2xl font-semibold text-white group-hover:text-neon-cyan">
                  {handbook.title}
                </span>
                <span className="mt-2 block max-w-xl text-sm leading-relaxed text-slate-400">
                  {handbook.line}
                </span>
              </span>
            </>
          );
          return (
            <li key={handbook.index} className="border-b border-white/10">
              {handbook.href ? (
                <Link
                  href={handbook.href}
                  className="focus-ring group grid gap-2 py-6 sm:grid-cols-[4.5rem_1fr] sm:gap-6"
                >
                  {body}
                </Link>
              ) : (
                <div className="grid gap-2 py-6 sm:grid-cols-[4.5rem_1fr] sm:gap-6">
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
