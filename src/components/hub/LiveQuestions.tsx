import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LiveDesk } from "@/content/live-desks";
import { ChapterMark } from "@/components/story/ChapterMark";
import { Reveal } from "@/components/ui/Reveal";
import { LiveQuestionList } from "@/components/live/LiveQuestionList";

export function LiveQuestions({ desks }: { desks: LiveDesk[] }) {
  if (desks.length === 0) return null;

  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <Reveal>
          <ChapterMark
            index="04"
            eyebrow="Live"
            title="Questions the desks answer"
            description="Public data, cadence-matched. The map and the tape live on the desk. The Hub only names the question."
          />
        </Reveal>
        <Link
          href="/portfolio/live"
          className="focus-ring group inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-medium text-neon-cyan"
        >
          Open live dashboards
          <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-12">
        <LiveQuestionList desks={desks} />
      </div>
    </div>
  );
}
