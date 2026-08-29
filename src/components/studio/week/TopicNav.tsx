import Link from "next/link";
import { WEEK_TOPICS, weekHref, type WeekTopicSlug } from "@/lib/week-log/topics";

export function TopicNav({
  active,
  weekId,
}: {
  active?: WeekTopicSlug | null;
  weekId: string;
}) {
  return (
    <nav aria-label="Week topics" className="mt-6 flex flex-wrap gap-2">
      <Link
        href={weekHref(null, weekId)}
        className={
          !active
            ? "rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 px-3 py-1.5 text-sm text-neon-cyan"
            : "rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:border-white/30 hover:text-white"
        }
      >
        Overview
      </Link>
      {WEEK_TOPICS.map((topic) => {
        const isActive = active === topic.slug;
        return (
          <Link
            key={topic.slug}
            href={weekHref(topic.slug, weekId)}
            className={
              isActive
                ? "rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 px-3 py-1.5 text-sm text-neon-cyan"
                : "rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:border-white/30 hover:text-white"
            }
          >
            {topic.label}
          </Link>
        );
      })}
    </nav>
  );
}
