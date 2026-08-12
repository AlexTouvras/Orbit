import { ArrowUpRight } from "lucide-react";
import type { NewsItem } from "@/lib/types";
import { NEWS_CATEGORY_TONE } from "@/lib/news/category-tone";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { relativeTime } from "@/lib/utils";

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-ring block h-full rounded-2xl"
    >
      <GlassCard hover className="group flex h-full flex-col">
        <div className="flex items-center justify-between gap-3">
          <Badge tone={NEWS_CATEGORY_TONE[item.category]}>{item.category}</Badge>
          <span className="font-mono text-xs text-slate-400">
            {relativeTime(item.pubDate)}
          </span>
        </div>

        <h3 className="mt-4 text-base font-semibold leading-snug text-white">
          {item.title}
        </h3>

        {item.contentSnippet && (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-300">
            {item.contentSnippet}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
          <span className="text-xs text-slate-400">{item.source}</span>
          <span className="inline-flex min-h-11 items-center gap-1 text-xs font-medium text-neon-cyan sm:min-h-0 sm:opacity-0 sm:transition-opacity motion-safe:group-hover:opacity-100">
            Read
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </GlassCard>
    </a>
  );
}
