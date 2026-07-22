import Link from "next/link";
import { ArrowRight, Boxes } from "lucide-react";
import type { Write } from "@/lib/types";
import { architectureSlugForWrite } from "@/lib/architecture";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";

export function SelectedWorkCard({ write }: { write: Write }) {
  const architectureSlug = architectureSlugForWrite(write.slug);
  const essayHref = `/writes/${write.slug}`;

  return (
    <GlassCard hover className="group flex h-full flex-col border-l-[3px] border-l-neon-cyan/70 pl-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="cyan">Work</Badge>
        {write.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} tone="neutral">
            {tag}
          </Badge>
        ))}
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug text-white">
        <Link href={essayHref} className="focus-ring rounded-sm hover:text-neon-cyan">
          {write.title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-300">
        {write.summary}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/5 pt-4 text-sm">
        <Link
          href={essayHref}
          className="focus-ring inline-flex min-h-11 items-center gap-1.5 font-medium text-neon-cyan sm:min-h-0"
        >
          Case study
          <ArrowRight className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:translate-x-0.5" />
        </Link>
        {architectureSlug && (
          <Link
            href={`/architecture/${architectureSlug}`}
            className="focus-ring inline-flex min-h-11 items-center gap-1.5 text-slate-300 transition-colors hover:text-white sm:min-h-0"
          >
            <Boxes className="h-3.5 w-3.5" aria-hidden />
            Architecture
          </Link>
        )}
      </div>
    </GlassCard>
  );
}
