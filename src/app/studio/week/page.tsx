import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { isStudioAccessible } from "@/lib/auth";
import { loadWeekLog } from "@/lib/week-log";
import { WEEK_TOPICS, weekHref } from "@/lib/week-log/topics";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { WeekChrome } from "@/components/studio/week/WeekChrome";
import type { WeekLaneStatus } from "@/lib/week-log/types";

function statusLabel(status: WeekLaneStatus): string {
  if (status === "ok") return "Ready";
  if (status === "empty") return "Empty";
  return "Unavailable";
}

export default async function StudioWeekHubPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  if (!(await isStudioAccessible())) {
    redirect("/studio/login?next=/studio/week");
  }

  const { week } = await searchParams;
  const log = await loadWeekLog(week);

  const cards = WEEK_TOPICS.map((topic) => {
    const lane =
      topic.slug === "fitness"
        ? log.fitness
        : topic.slug === "meals"
          ? log.meals
          : topic.slug === "ravens"
            ? log.ravens
            : topic.slug === "newsletter"
              ? log.newsletter
              : log.careerops;
    return { ...topic, status: lane.status, stale: lane.stale };
  });

  return (
    <WeekChrome weekParam={week}>
      <SectionHeading
        eyebrow="Studio"
        title="Week log"
        description="Pick a topic. Fitness includes technique clips where Heimdall has a match."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.slug}
            href={weekHref(card.slug, log.weekId)}
            className="block"
          >
            <GlassCard hover className="flex h-full items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{card.label}</p>
                <p className="mt-1 text-sm text-slate-400">{card.blurb}</p>
                <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
                  {statusLabel(card.status)}
                  {card.stale ? " · stale" : ""}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-slate-500" />
            </GlassCard>
          </Link>
        ))}
      </div>
    </WeekChrome>
  );
}
