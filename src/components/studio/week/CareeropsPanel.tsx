import { Lane } from "@/components/studio/week/Lane";
import type { CareerWeek, WeekLane } from "@/lib/week-log/types";

function OfferTable({
  rows,
}: {
  rows: Array<{ score: string; company: string; role: string; href?: string }>;
}) {
  if (rows.length === 0) return null;
  return (
    <ul className="divide-y divide-white/5">
      {rows.map((row) => (
        <li
          key={`${row.company}-${row.role}-${row.score}`}
          className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5 first:pt-0 last:pb-0"
        >
          <span className="w-10 shrink-0 font-mono text-xs text-neon-cyan">
            {row.score}
          </span>
          <span className="min-w-0 flex-1 text-sm text-white">
            {row.href ? (
              <a
                href={row.href}
                className="hover:underline"
                rel="noreferrer"
                target="_blank"
              >
                {row.company}
              </a>
            ) : (
              row.company
            )}
            <span className="text-slate-400"> — {row.role}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function CareeropsPanel({ lane }: { lane: WeekLane<CareerWeek> }) {
  const career = lane.data;

  return (
    <Lane
      eyebrow="CareerOps"
      title={career?.title ?? "Weekly scan"}
      status={lane.status}
      detail={lane.detail}
      stale={lane.stale}
      source={lane.source}
      href={lane.href}
    >
      {career ? (
        <div className="space-y-5">
          {career.headline ? (
            <p className="text-sm leading-relaxed text-slate-300">
              {career.headline}
            </p>
          ) : null}
          <p className="text-sm text-slate-400">
            {career.scanDate ? `Scan ${career.scanDate}` : null}
            {career.scanDate && career.newOffers ? " · " : null}
            {career.newOffers ? `${career.newOffers} new offers` : null}
          </p>
          {career.metrics.length > 0 ? (
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {career.metrics.slice(0, 6).map((metric) => (
                <div key={metric.label}>
                  <dt className="text-slate-400">{metric.label}</dt>
                  <dd className="mt-0.5 font-medium text-white">{metric.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {career.applyNow.length > 0 ? (
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                Ready to submit
              </p>
              <div className="mt-2">
                <OfferTable rows={career.applyNow} />
              </div>
            </div>
          ) : null}
          {career.stillOpen.length > 0 ? (
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                Still worth applying
              </p>
              <div className="mt-2">
                <OfferTable rows={career.stillOpen} />
              </div>
            </div>
          ) : null}
          {career.newThisWeek.length > 0 ? (
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                New apply / review
              </p>
              <div className="mt-2">
                <OfferTable rows={career.newThisWeek} />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </Lane>
  );
}
