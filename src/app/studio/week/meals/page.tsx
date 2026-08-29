import { redirect } from "next/navigation";
import { isStudioAccessible } from "@/lib/auth";
import { loadWeekLog } from "@/lib/week-log";
import { MealsPanel } from "@/components/studio/week/MealsPanel";
import { WeekChrome } from "@/components/studio/week/WeekChrome";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default async function StudioWeekMealsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  if (!(await isStudioAccessible())) {
    redirect("/studio/login?next=/studio/week/meals");
  }

  const { week } = await searchParams;
  const log = await loadWeekLog(week);

  return (
    <WeekChrome weekParam={week} topic="meals">
      <SectionHeading
        eyebrow="Meals"
        title={log.meals.data?.title ?? "Meal plan"}
        description="This week's meal plan from mealplan-private."
      />
      <div className="mt-8">
        <MealsPanel lane={log.meals} />
      </div>
    </WeekChrome>
  );
}
