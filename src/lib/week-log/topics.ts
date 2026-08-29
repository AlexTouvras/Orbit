export const WEEK_TOPICS = [
  {
    slug: "fitness",
    label: "Fitness",
    blurb: "Weekly plan and technique clips",
  },
  {
    slug: "meals",
    label: "Meals",
    blurb: "Meal plan for the week",
  },
  {
    slug: "ravens",
    label: "Ravens",
    blurb: "Findings and parenting watch",
  },
  {
    slug: "newsletter",
    label: "Newsletter",
    blurb: "Digest draft and send status",
  },
  {
    slug: "careerops",
    label: "CareerOps",
    blurb: "Scan, offers, apply queues",
  },
] as const;

export type WeekTopicSlug = (typeof WEEK_TOPICS)[number]["slug"];

export function weekHref(topic?: WeekTopicSlug | null, weekId?: string | null) {
  const base = topic ? `/studio/week/${topic}` : "/studio/week";
  if (!weekId) return base;
  return `${base}?week=${encodeURIComponent(weekId)}`;
}
