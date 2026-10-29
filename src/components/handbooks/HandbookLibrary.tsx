import { HANDBOOKS } from "@/content/handbooks";
import { HandbookCover, HandbookFieldLandscape } from "@/components/handbooks/HandbookBoard";
import { StoryHeadline } from "@/components/story/StoryHeadline";

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
      </p>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400">
        Each book is an operating rule, the day, the limit, and how I would know.
      </p>
      <HandbookFieldLandscape />
      <ul className="mt-14 grid list-none items-end gap-x-10 gap-y-14 border-b border-white/15 md:grid-cols-2">
        {HANDBOOKS.map((handbook) => (
          <li key={handbook.slug} className="min-w-0">
            <HandbookCover handbook={handbook} />
          </li>
        ))}
      </ul>
    </div>
  );
}
