import { isStudioAccessible } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ensureWeekIdSegment } from "@/lib/week-log/week-access";
import { WeekCareeropsView } from "@/components/studio/week/WeekViews";

export default async function StudioWeekIdCareeropsPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  const { weekId: raw } = await params;
  if (!(await isStudioAccessible())) {
    redirect(
      `/studio/login?next=${encodeURIComponent(`/studio/week/${raw}/careerops`)}`,
    );
  }

  const weekId = ensureWeekIdSegment(raw, "careerops");
  return <WeekCareeropsView weekId={weekId} />;
}
