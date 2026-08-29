import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { currentIsoWeekId } from "@/lib/iso-week";
import { loadWeekLog } from "@/lib/week-log";
import { weekHref, type WeekTopicSlug } from "@/lib/week-log/topics";
import { LogoutButton } from "@/components/studio/LogoutButton";
import { StudioSessionRefresh } from "@/components/studio/StudioSessionRefresh";
import { TopicNav } from "@/components/studio/week/TopicNav";
import { WeekNav } from "@/components/studio/week/WeekNav";

export async function WeekChrome({
  weekParam,
  topic,
  children,
}: {
  weekParam?: string;
  topic?: WeekTopicSlug | null;
  children: React.ReactNode;
}) {
  const log = await loadWeekLog(weekParam);
  const current = currentIsoWeekId();
  const nextWeekId =
    log.nextWeekId && log.nextWeekId <= current ? log.nextWeekId : null;

  return (
    <div>
      <StudioSessionRefresh />
      <div className="flex items-start justify-between gap-4">
        <Link
          href={topic ? weekHref(null, log.weekId) : "/studio"}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {topic ? "Back to week overview" : "Back to Studio"}
        </Link>
        <LogoutButton />
      </div>

      <div className="mt-10">
        <WeekNav
          weekId={log.weekId}
          range={log.range}
          prevWeekId={log.prevWeekId}
          nextWeekId={nextWeekId}
          isCurrent={log.isCurrent}
          topic={topic}
        />
        <TopicNav active={topic} weekId={log.weekId} />
      </div>

      <div className="mt-10">{children}</div>
    </div>
  );
}
