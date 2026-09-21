import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ChapterMark } from "@/components/story/ChapterMark";
import { Reveal } from "@/components/ui/Reveal";

export function StoryClose({
  summary,
  contactCta,
}: {
  summary: string;
  contactCta: string;
}) {
  return (
    <Reveal>
      <ChapterMark index="06" eyebrow="Close" title="The record is longer than this page" />
      <p className="mt-8 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
        {summary}
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href="/about"
          className="focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-[transform,border-color,color] active:scale-[0.98] hover:border-neon-cyan/50 hover:text-neon-cyan"
        >
          Full background &amp; experience
          <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/contact"
          className="orbit-accent-bg orbit-accent-glow orbit-accent-cta-glow focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-void transition-[transform,box-shadow] active:scale-[0.98]"
        >
          {contactCta}
          <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
        </Link>
      </div>
    </Reveal>
  );
}
