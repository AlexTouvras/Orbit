import { ensureStudioWeekAccess } from "@/lib/week-log/week-access";
import { WeekHubView } from "@/components/studio/week/WeekViews";

export default async function StudioWeekHubPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  await ensureStudioWeekAccess("/studio/week", null, week);
  return <WeekHubView />;
}
