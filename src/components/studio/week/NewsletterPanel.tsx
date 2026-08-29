import { Lane } from "@/components/studio/week/Lane";
import type { NewsletterDigest } from "@/lib/newsletter/types";
import type { WeekLane } from "@/lib/week-log/types";

export function NewsletterPanel({ lane }: { lane: WeekLane<NewsletterDigest> }) {
  const digest = lane.data;

  return (
    <Lane
      eyebrow="Newsletter"
      title={digest?.subject ?? "Weekly digest"}
      status={lane.status}
      detail={lane.detail}
      source={lane.source}
    >
      {digest ? (
        <div className="space-y-4 text-sm">
          <p className="text-slate-300">
            {digest.status}
            {digest.sendMode ? ` · ${digest.sendMode}` : ""}
            {digest.sentAt ? ` · sent ${digest.sentAt.slice(0, 10)}` : ""}
          </p>
          {digest.lede ? (
            <p className="leading-relaxed text-slate-300">{digest.lede}</p>
          ) : null}
          {digest.writes.length > 0 ? (
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                Writes
              </p>
              <ul className="mt-2 space-y-1 text-white">
                {digest.writes.map((write) => (
                  <li key={write.slug}>{write.title}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {digest.signals.length > 0 ? (
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                Related articles
              </p>
              <ul className="mt-2 space-y-1 text-white">
                {digest.signals.map((signal) => (
                  <li key={signal.link}>
                    {signal.title}
                    <span className="text-slate-400"> · {signal.source}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="text-slate-400">
            {digest.ravens.length} Ravens item
            {digest.ravens.length === 1 ? "" : "s"} in the mailed digest
          </p>
        </div>
      ) : null}
    </Lane>
  );
}
