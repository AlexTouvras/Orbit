import { ensureStudioWeekAccess } from "@/lib/week-log/week-access";
import { WeekFitnessView } from "@/components/studio/week/WeekViews";

export default async function StudioWeekFitnessPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  await ensureStudioWeekAccess("/studio/week/fitness", "fitness", week);
  return <WeekFitnessView />;
}
