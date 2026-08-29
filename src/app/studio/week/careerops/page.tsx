import { redirect } from "next/navigation";
import { isStudioAccessible } from "@/lib/auth";
import { loadWeekLog } from "@/lib/week-log";
import { CareeropsPanel } from "@/components/studio/week/CareeropsPanel";
import { WeekChrome } from "@/components/studio/week/WeekChrome";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default async function StudioWeekCareeropsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  if (!(await isStudioAccessible())) {
    redirect("/studio/login?next=/studio/week/careerops");
  }

  const { week } = await searchParams;
  const log = await loadWeekLog(week);

  return (
    <WeekChrome weekParam={week} topic="careerops">
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
