import { ensureStudioWeekAccess } from "@/lib/week-log/week-access";
import { WeekMealsView } from "@/components/studio/week/WeekViews";

export default async function StudioWeekMealsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  await ensureStudioWeekAccess("/studio/week/meals", "meals", week);
  return <WeekMealsView />;
}
