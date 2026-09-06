import { ensureStudioWeekAccess } from "@/lib/week-log/week-access";
import { WeekFitnessView } from "@/components/studio/week/WeekViews";

export default async function StudioWeekFitnessCodexPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  await ensureStudioWeekAccess("/studio/week/fitness/codex", "fitness", week);
  return <WeekFitnessView sheet="codex" />;
}
