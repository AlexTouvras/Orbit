import { redirect } from "next/navigation";
import { isStudioAccessible } from "@/lib/auth";
import { loadWeekLog } from "@/lib/week-log";
import { NewsletterPanel } from "@/components/studio/week/NewsletterPanel";
import { WeekChrome } from "@/components/studio/week/WeekChrome";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default async function StudioWeekNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  if (!(await isStudioAccessible())) {
    redirect("/studio/login?next=/studio/week/newsletter");
  }

  const { week } = await searchParams;
  const log = await loadWeekLog(week);

  return (
    <WeekChrome weekParam={week} topic="newsletter">
      <SectionHeading
        eyebrow="Newsletter"
        title={log.newsletter.data?.subject ?? "Weekly digest"}
        description="Draft status for this week's Orbit digest."
      />
      <div className="mt-8">
        <NewsletterPanel lane={log.newsletter} />
      </div>
    </WeekChrome>
  );
}
