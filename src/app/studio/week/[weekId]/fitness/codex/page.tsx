import { isStudioAccessible } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ensureWeekIdSegment } from "@/lib/week-log/week-access";
import { WeekFitnessView } from "@/components/studio/week/WeekViews";

export default async function StudioWeekIdFitnessCodexPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  const { weekId: raw } = await params;
  if (!(await isStudioAccessible())) {
    redirect(
      `/studio/login?next=${encodeURIComponent(`/studio/week/${raw}/fitness/codex`)}`,
    );
  }

  const weekId = ensureWeekIdSegment(raw, "fitness", "codex");
  return <WeekFitnessView weekId={weekId} sheet="codex" />;
}
