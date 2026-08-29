import { redirect } from "next/navigation";
import { isStudioAccessible } from "@/lib/auth";
import { loadWeekLog } from "@/lib/week-log";
import { FitnessPanel } from "@/components/studio/week/FitnessPanel";
import { WeekChrome } from "@/components/studio/week/WeekChrome";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default async function StudioWeekFitnessPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  if (!(await isStudioAccessible())) {
    redirect("/studio/login?next=/studio/week/fitness");
  }

  const { week } = await searchParams;
  const log = await loadWeekLog(week);

  return (
    <WeekChrome weekParam={week} topic="fitness">
      <SectionHeading
        eyebrow="Fitness"
        title={log.fitness.data?.theme ?? "Weekly plan"}
        description="Lifts with a Heimdall note show Technique — expand for form cues."
      />
      <div className="mt-8">
        <FitnessPanel
          lane={log.fitness}
          heimdall={log.heimdall.data ?? []}
        />
      </div>
    </WeekChrome>
  );
}
