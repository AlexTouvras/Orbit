import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MissionHero } from "@/components/ui/MissionHero";
import { OrbitSignature } from "@/components/ui/OrbitSignature";
import { formatDate } from "@/lib/utils";

interface WritesHeroProps {
  articleCount: number;
  categoryCount: number;
  latestDate: string | null;
  avatarUrl?: string;
}

export function WritesHero({
  articleCount,
  categoryCount,
  latestDate,
  avatarUrl,
}: WritesHeroProps) {
  const stats = [
    { label: "Articles", value: articleCount > 0 ? String(articleCount) : "—" },
    { label: "Topics", value: String(categoryCount) },
    {
      label: "Latest",
      value: latestDate ? formatDate(latestDate).replace(/, \d{4}$/, "") : "—",
    },
  ];

  return (
    <MissionHero
      signature={<OrbitSignature variant="cyan" duration="85s" />}
      badge={
        <Badge tone="cyan" className="mb-8">
          <PenLine className="mr-1.5 h-3.5 w-3.5" />
          Build in public
        </Badge>
      }
      avatarUrl={avatarUrl}
      title="Blog"
      subtitle="What I learn, ship, and figure out along the way"
      description="Evergreen notes from delivery, data, and AI — one clear question per article. Documented for future me and anyone on a similar path."
      stats={stats}
      actions={
        <a
          href="#articles"
          className="focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl bg-neon-cyan px-5 py-3 text-sm font-semibold text-void shadow-glow transition-[transform,box-shadow] active:scale-[0.98] motion-safe:hover:shadow-glow"
        >
          Browse articles
          <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
        </a>
      }
      meta={
        <Link
          href="/"
          className="focus-ring text-sm font-medium text-slate-400 transition-colors hover:text-neon-cyan"
        >
          ← Back to home
        </Link>
      }
    />
  );
}
