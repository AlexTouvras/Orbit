import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ChapterMark } from "@/components/story/ChapterMark";
import { StorySpine } from "@/components/story/StorySpine";
import { getStories, storyBeats } from "@/content/stories";

export function FlagshipStories() {
  const stories = getStories();
  if (stories.length === 0) return null;

  return (
    <section id="flagship" className="scroll-mt-28 space-y-10">
      <ChapterMark
        index="01"
        eyebrow="Flagship"
        title="The storytelling system"
        description="One reading order carried across the whole site: the question in plain words, the few figures that answer it, the picture, something you can press, then the source and the limit. Live data underneath, not a slide."
      />

      <StorySpine beats={storyBeats} compact />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <Link
          href="/portfolio/stories"
          className="orbit-accent-bg orbit-accent-glow orbit-accent-cta-glow focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-void transition-[transform,box-shadow] active:scale-[0.98]"
        >
          Open the stories
          <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
        </Link>
        <p className="font-mono text-[0.7rem] text-slate-500">
          {stories.length} running · more as they ship
        </p>
      </div>
    </section>
  );
}
