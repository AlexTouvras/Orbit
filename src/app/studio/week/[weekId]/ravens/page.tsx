import { isStudioAccessible } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ensureWeekIdSegment } from "@/lib/week-log/week-access";
import { WeekRavensView } from "@/components/studio/week/WeekViews";

export default async function StudioWeekIdRavensPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  const { weekId: raw } = await params;
  if (!(await isStudioAccessible())) {
    redirect(
      `/studio/login?next=${encodeURIComponent(`/studio/week/${raw}/ravens`)}`,
    );
  }

  const weekId = ensureWeekIdSegment(raw, "ravens");
  return <WeekRavensView weekId={weekId} />;
}
