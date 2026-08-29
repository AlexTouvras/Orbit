import type { ReactNode } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { WeekLaneStatus } from "@/lib/week-log/types";

export function Lane({
  eyebrow,
  title,
  status,
  detail,
  stale,
  source,
  href,
  children,
}: {
  eyebrow: string;
  title: string;
  status: WeekLaneStatus;
  detail?: string;
  stale?: string;
  source?: string;
  href?: string;
  children?: ReactNode;
}) {
  return (
    <section className="scroll-mt-24">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="orbit-accent font-mono text-xs uppercase tracking-[0.3em]">
            {eyebrow}
          </p>
          <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-white">
            {title}
          </h2>
        </div>
        {href ? (
          <a
            href={href}
            className="focus-ring text-xs text-slate-400 hover:text-white"
            rel="noreferrer"
            target="_blank"
          >
            Open source
          </a>
        ) : source ? (
          <p className="font-mono text-[0.65rem] text-slate-500">{source}</p>
        ) : null}
      </div>
      <GlassCard>
        {status === "ok" ? (
          <>
            {stale ? (
              <p className="mb-4 text-sm leading-relaxed text-amber-200/90">{stale}</p>
            ) : null}
            {children}
          </>
        ) : (
          <p className="text-sm leading-relaxed text-slate-300">
            {detail ??
              (status === "empty"
                ? "Nothing committed for this week yet."
                : "This lane could not be read.")}
          </p>
        )}
      </GlassCard>
    </section>
  );
}
