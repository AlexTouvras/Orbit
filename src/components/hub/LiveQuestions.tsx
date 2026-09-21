import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LiveDesk } from "@/content/live-desks";
import { ChapterMark } from "@/components/story/ChapterMark";
import { LiveDeskReel } from "@/components/live/LiveDeskReel";

export function LiveQuestions({
  desks,
  index = "04",
  id,
  description = "Public data, cadence-matched. The map and the tape live on the desk.",
}: {
  desks: LiveDesk[];
  index?: string;
  id?: string;
  description?: string;
}) {
  if (desks.length === 0) return null;

  return (
    <div id={id} className={id ? "scroll-mt-28" : undefined}>
      <LiveDeskReel
        desks={desks}
        header={
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <ChapterMark
              index={index}
              eyebrow="Live"
              title="Questions the desks answer"
              description={description}
            />
            <Link
              href="/portfolio/live"
              className="focus-ring group inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-medium text-neon-cyan"
            >
              Open live dashboards
              <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
            </Link>
          </div>
        }
      />
    </div>
  );
}
