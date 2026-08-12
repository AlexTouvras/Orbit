import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { Write } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

const categoryTone = {
  Career: "violet",
  Data: "blue",
  AI: "ai",
  Delivery: "violet",
  Learning: "neutral",
} as const;

export function WriteCard({ write }: { write: Write }) {
  return (
    <Link
      href={`/writes/${write.slug}`}
      className="focus-ring block h-full rounded-2xl"
    >
      <GlassCard hover className="group flex h-full flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={categoryTone[write.category]}>{write.category}</Badge>
          <span className="font-mono text-xs text-slate-400">
            {formatDate(write.date)}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 font-mono text-xs text-slate-400">
            <Clock className="h-3 w-3" aria-hidden />
            {write.readingTime} min
          </span>
        </div>

        <h3 className="mt-4 text-lg font-semibold leading-snug text-white">
          {write.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-300">
          {write.summary}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {write.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} tone="neutral">
              {tag}
            </Badge>
          ))}
        </div>

        <span className="mt-4 inline-flex min-h-11 items-center gap-1 text-xs font-medium text-neon-cyan sm:min-h-0">
          Read
          <ArrowRight className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:translate-x-0.5" />
        </span>
      </GlassCard>
    </Link>
  );
}
