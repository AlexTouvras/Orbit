import { redirect } from "next/navigation";
import { isStudioAccessible } from "@/lib/auth";
import { loadWeekLog } from "@/lib/week-log";
import { RavensPanel } from "@/components/studio/week/RavensPanel";
import { WeekChrome } from "@/components/studio/week/WeekChrome";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default async function StudioWeekRavensPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  if (!(await isStudioAccessible())) {
    redirect("/studio/login?next=/studio/week/ravens");
  }

  const { week } = await searchParams;
  const log = await loadWeekLog(week);

  return (
    <WeekChrome weekParam={week} topic="ravens">
      <SectionHeading
        eyebrow="Ravens"
        title="Findings this week"
        description="Inbox and signals. Stage-matched parenting clips appear under Watch."
      />
      <div className="mt-8">
        <RavensPanel
          lane={log.ravens}
          heimdall={log.heimdall.data ?? []}
        />
      </div>
    </WeekChrome>
  );
}
