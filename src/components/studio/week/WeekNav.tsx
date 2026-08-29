import Link from "next/link";
import { weekHref, type WeekTopicSlug } from "@/lib/week-log/topics";

export function WeekNav({
  weekId,
  range,
  prevWeekId,
  nextWeekId,
  isCurrent,
  topic,
}: {
  weekId: string;
  range: string;
  prevWeekId: string | null;
  nextWeekId: string | null;
  isCurrent: boolean;
  topic?: WeekTopicSlug | null;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-slate-400">
          {weekId}
        </p>
        <p className="mt-1 font-display text-2xl font-bold tracking-tight text-white">
          {range}
        </p>
        <p className="mt-1 text-sm text-slate-400">
          {isCurrent ? "This week in Helsinki" : "Earlier week"}
        </p>
      </div>
      <nav aria-label="ISO week" className="flex gap-2">
        {prevWeekId ? (
          <Link
            href={weekHref(topic, prevWeekId)}
            className="focus-ring rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:border-white/30 hover:text-white"
          >
            Previous
          </Link>
        ) : null}
        {!isCurrent ? (
          <Link
            href={weekHref(topic)}
            className="focus-ring rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:border-white/30 hover:text-white"
          >
            This week
          </Link>
        ) : null}
        {nextWeekId && !isCurrent ? (
          <Link
            href={weekHref(topic, nextWeekId)}
            className="focus-ring rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:border-white/30 hover:text-white"
          >
            Next
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
