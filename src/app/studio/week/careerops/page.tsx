import { ensureStudioWeekAccess } from "@/lib/week-log/week-access";
import { WeekCareeropsView } from "@/components/studio/week/WeekViews";

export default async function StudioWeekCareeropsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  await ensureStudioWeekAccess("/studio/week/careerops", "careerops", week);
  return <WeekCareeropsView />;
}
