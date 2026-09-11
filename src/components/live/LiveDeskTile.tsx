import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LiveDesk } from "@/content/live-desks";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";

export function LiveDeskTile({ desk }: { desk: LiveDesk }) {
  return (
    <Link
      href={`/portfolio/live/${desk.slug}`}
      className="focus-ring block h-full rounded-2xl"
    >
      <GlassCard hover className="group relative h-full overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-neon-cyan/20 to-transparent blur-2xl" />
        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between gap-3">
            <Badge tone="cyan">{desk.cadence}</Badge>
            <ArrowUpRight className="h-5 w-5 text-slate-500 transition-[transform,color] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neon-cyan" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-white">{desk.title}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-300">
            {desk.question}
          </p>
          <p className="mt-5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
            {desk.source}
          </p>
        </div>
      </GlassCard>
    </Link>
  );
}
