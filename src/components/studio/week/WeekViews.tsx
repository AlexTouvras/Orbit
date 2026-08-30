import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { loadWeekLog } from "@/lib/week-log";
import { loadFitnessWeek } from "@/lib/week-log/fitness";
import { WEEK_TOPICS, weekHref } from "@/lib/week-log/topics";
import { FitnessPanel } from "@/components/studio/week/FitnessPanel";
import { MealsPanel } from "@/components/studio/week/MealsPanel";
import { RavensPanel } from "@/components/studio/week/RavensPanel";
import { NewsletterPanel } from "@/components/studio/week/NewsletterPanel";
import { CareeropsPanel } from "@/components/studio/week/CareeropsPanel";
import { WeekChrome } from "@/components/studio/week/WeekChrome";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import type { WeekLaneStatus } from "@/lib/week-log/types";

function statusLabel(status: WeekLaneStatus): string {
  if (status === "ok") return "Ready";
  if (status === "empty") return "Empty";
  return "Unavailable";
}

export async function WeekHubView({ weekId }: { weekId?: string }) {
  const log = await loadWeekLog(weekId);

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
    <WeekChrome log={log}>
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

export async function WeekFitnessView({ weekId }: { weekId?: string }) {
  const log = await loadWeekLog(weekId);
  const nextWeekReady =
    log.isCurrent && log.nextWeekId
      ? await (async () => {
          const next = await loadFitnessWeek(log.nextWeekId!);
          if (next.status !== "ok" || !next.data) return null;
          return { weekId: log.nextWeekId!, theme: next.data.theme };
        })()
      : null;

  return (
    <WeekChrome log={log} topic="fitness">
      <SectionHeading
        eyebrow="Fitness"
        title={log.fitness.data?.theme ?? "Weekly plan"}
        description="Week kickoff clip, daily sessions, and Heimdall technique links on lifts."
      />
      <div className="mt-8">
        <FitnessPanel
          lane={log.fitness}
          heimdall={log.heimdall.data ?? []}
          nextWeekReady={nextWeekReady}
        />
      </div>
    </WeekChrome>
  );
}

export async function WeekMealsView({ weekId }: { weekId?: string }) {
  const log = await loadWeekLog(weekId);

  return (
    <WeekChrome log={log} topic="meals">
      <SectionHeading
        eyebrow="Meals"
        title={log.meals.data?.title ?? "Meal plan"}
        description="This week's meal plan from mealplan-private."
      />
      <div className="mt-8">
        <MealsPanel lane={log.meals} />
      </div>
    </WeekChrome>
  );
}

export async function WeekRavensView({ weekId }: { weekId?: string }) {
  const log = await loadWeekLog(weekId);

  return (
    <WeekChrome log={log} topic="ravens">
      <SectionHeading
        eyebrow="Ravens"
        title="Findings this week"
        description="Inbox and signals. Stage-matched parenting clips appear under Watch."
      />
      <div className="mt-8">
        <RavensPanel lane={log.ravens} heimdall={log.heimdall.data ?? []} />
      </div>
    </WeekChrome>
  );
}

export async function WeekNewsletterView({ weekId }: { weekId?: string }) {
  const log = await loadWeekLog(weekId);

  return (
    <WeekChrome log={log} topic="newsletter">
      <SectionHeading
        eyebrow="Newsletter"
        title={log.newsletter.data?.subject ?? "Weekly digest"}
        description="Draft status for this week's Orbit digest."
      />
      <div className="mt-8">
        <NewsletterPanel lane={log.newsletter} />
      </div>
    </WeekChrome>
  );
}

export async function WeekCareeropsView({ weekId }: { weekId?: string }) {
  const log = await loadWeekLog(weekId);

  return (
    <WeekChrome log={log} topic="careerops">
      <SectionHeading
        eyebrow="CareerOps"
        title={log.careerops.data?.title ?? "Weekly scan"}
        description="Scan metrics and apply queues for this week."
      />
      <div className="mt-8">
        <CareeropsPanel lane={log.careerops} />
      </div>
    </WeekChrome>
  );
}
