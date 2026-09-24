import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ChapterMark } from "@/components/story/ChapterMark";
import { DeskCast } from "@/components/story/DeskCast";
import { ScrollSpot } from "@/components/story/ScrollSpot";
import { StoryHeadline } from "@/components/story/StoryHeadline";
import { StorySpine } from "@/components/story/StorySpine";
import { StoryStat } from "@/components/story/StoryStat";
import { getStories, storyBeats } from "@/content/stories";

export const metadata: Metadata = {
  title: "The storytelling system",
  description:
    "One reading order across every public surface on Orbit: the question, the figures, the picture, the move, and the limit.",
  alternates: { canonical: "/portfolio/stories" },
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function StoriesPage() {
  const stories = getStories();

  return (
    <div className="space-y-24 sm:space-y-32">
      <div className="space-y-10">
        <StoryHeadline
          kicker="Flagship · The storytelling system"
          line="One question,"
          accent="all the way down."
        />
        <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          Every public surface here reads the same way. You meet a question in
          plain words, you see the system that can answer it, and you can follow
          that question into the proof — with the source and the limit still
          attached.
        </p>

        <DeskCast className="lg:grid-cols-3">
          <StoryStat
            label="Stories"
            value={String(stories.length)}
            countTo={stories.length}
          />
          <StoryStat
            label="Beats"
            value={String(storyBeats.length)}
            countTo={storyBeats.length}
          />
          <StoryStat label="Grain" value="Mixed" />
        </DeskCast>
      </div>

      <section id="grammar" className="scroll-mt-28 space-y-10">
        <ChapterMark
          index="01"
          eyebrow="Grammar"
          title="The reading order"
          description="Five beats, in the same order, whatever the subject is. A desk runs all five. The front door runs the Open for the whole site."
        />
        <StorySpine beats={storyBeats} />
      </section>

      <section id="stories" className="scroll-mt-28 space-y-10">
        <ChapterMark
          index="02"
          eyebrow="Stories"
          title="Pick a question"
          description="Each one opens on its own surface. New stories land here as they ship."
        />

        <ol className="border-t border-white/10">
          {stories.map((story, i) => (
            <li key={story.id}>
              <ScrollSpot>
                <Link
                  href={story.href}
                  className="focus-ring group flex flex-col gap-4 border-b border-white/10 py-7 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-baseline sm:gap-8 sm:py-9"
                >
                  <span
                    className="orbit-accent shrink-0 font-mono text-xs tabular-nums tracking-[0.3em]"
                    aria-hidden
                  >
                    {pad(i + 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                      {story.surface}
                    </span>
                    <span className="mt-2 block font-display text-xl font-semibold leading-tight tracking-tight text-white transition-colors group-hover:text-neon-cyan sm:text-3xl">
                      {story.line}
                    </span>
                    <span className="mt-3 block font-mono text-[0.7rem] text-slate-500">
                      {story.cadence} · {story.source}
                    </span>
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-slate-500 transition-[transform,color] group-hover:text-neon-cyan motion-safe:group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </ScrollSpot>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
