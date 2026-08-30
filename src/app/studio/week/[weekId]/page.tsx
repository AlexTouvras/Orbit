import { isStudioAccessible } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ensureWeekIdSegment } from "@/lib/week-log/week-access";
import { WeekHubView } from "@/components/studio/week/WeekViews";

export default async function StudioWeekIdHubPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  const { weekId: raw } = await params;
  if (!(await isStudioAccessible())) {
    redirect(`/studio/login?next=${encodeURIComponent(`/studio/week/${raw}`)}`);
  }

  const weekId = ensureWeekIdSegment(raw, null);
  return <WeekHubView weekId={weekId} />;
}
