import { isStudioAccessible } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ensureWeekIdSegment } from "@/lib/week-log/week-access";
import { WeekNewsletterView } from "@/components/studio/week/WeekViews";

export default async function StudioWeekIdNewsletterPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  const { weekId: raw } = await params;
  if (!(await isStudioAccessible())) {
    redirect(
      `/studio/login?next=${encodeURIComponent(`/studio/week/${raw}/newsletter`)}`,
    );
  }

  const weekId = ensureWeekIdSegment(raw, "newsletter");
  return <WeekNewsletterView weekId={weekId} />;
}
