import { isStudioAccessible } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ensureWeekIdSegment } from "@/lib/week-log/week-access";
import { WeekMealsView } from "@/components/studio/week/WeekViews";

export default async function StudioWeekIdMealsPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  const { weekId: raw } = await params;
  if (!(await isStudioAccessible())) {
    redirect(
      `/studio/login?next=${encodeURIComponent(`/studio/week/${raw}/meals`)}`,
    );
  }

  const weekId = ensureWeekIdSegment(raw, "meals");
  return <WeekMealsView weekId={weekId} />;
}
