import { ensureStudioWeekAccess } from "@/lib/week-log/week-access";
import { WeekNewsletterView } from "@/components/studio/week/WeekViews";

export default async function StudioWeekNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  await ensureStudioWeekAccess("/studio/week/newsletter", "newsletter", week);
  return <WeekNewsletterView />;
}
