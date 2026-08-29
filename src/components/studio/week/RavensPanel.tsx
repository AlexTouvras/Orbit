import { HeimdallEmbed } from "@/components/studio/week/HeimdallEmbed";
import { Lane } from "@/components/studio/week/Lane";
import { groupRavensByDomain } from "@/lib/newsletter/ravens";
import type { NewsletterRavenItem } from "@/lib/newsletter/types";
import type { HeimdallVideo, WeekLane } from "@/lib/week-log/types";

export function RavensPanel({
  lane,
  heimdall,
}: {
  lane: WeekLane<NewsletterRavenItem[]>;
  heimdall: HeimdallVideo[];
}) {
  const ravens = lane.data ?? [];
  const ravenGroups = groupRavensByDomain(ravens);
  const parentingClips = heimdall.filter((video) => video.domain === "parenting");

  return (
    <div className="space-y-14">
      <Lane
        eyebrow="Ravens"
        title="Findings this week"
        status={lane.status}
        detail={lane.detail}
        source={lane.source}
      >
        <div className="space-y-6">
          {ravenGroups.map((group) => (
            <div key={group.domain}>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                {group.label}
              </p>
              <ul className="mt-2 space-y-3">
                {group.items.map((item) => (
                  <li key={`${item.kind}-${item.domain}-${item.title}`}>
                    <p className="text-sm font-medium text-white">
                      {item.href ? (
                        <a
                          href={item.href}
                          className="hover:underline"
                          rel="noreferrer"
                          target="_blank"
                        >
                          {item.title}
                        </a>
                      ) : (
                        item.title
                      )}
                    </p>
                    {item.summary ? (
                      <p className="mt-1 text-sm leading-relaxed text-slate-300">
                        {item.summary}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Lane>

      {parentingClips.length > 0 ? (
        <Lane
          eyebrow="Watch"
          title="Parenting clips"
          status="ok"
          detail={undefined}
          source="ravens/watch/parenting"
        >
          <div className="space-y-4">
            {parentingClips.map((video) => (
              <HeimdallEmbed key={video.id} video={video} label="Watch" />
            ))}
          </div>
        </Lane>
      ) : null}
    </div>
  );
}
