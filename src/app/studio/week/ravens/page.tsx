import { ensureStudioWeekAccess } from "@/lib/week-log/week-access";
import { WeekRavensView } from "@/components/studio/week/WeekViews";

export default async function StudioWeekRavensPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  await ensureStudioWeekAccess("/studio/week/ravens", "ravens", week);
  return <WeekRavensView />;
}
