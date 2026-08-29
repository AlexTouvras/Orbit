import { HeimdallEmbed } from "@/components/studio/week/HeimdallEmbed";
import { Lane } from "@/components/studio/week/Lane";
import { matchHeimdallForLift } from "@/lib/week-log/heimdall";
import type { HeimdallVideo, WeekLane, FitnessWeek } from "@/lib/week-log/types";

export function FitnessPanel({
  lane,
  heimdall,
}: {
  lane: WeekLane<FitnessWeek>;
  heimdall: HeimdallVideo[];
}) {
  const fitness = lane.data;

  return (
    <Lane
      eyebrow="Fitness"
      title={fitness?.theme ?? "Weekly plan"}
      status={lane.status}
      detail={lane.detail}
      stale={lane.stale}
      source={lane.source}
      href={lane.href}
    >
      {fitness ? (
        <div className="space-y-6">
          {fitness.raceContext ? (
            <p className="text-sm leading-relaxed text-slate-300">
              {fitness.raceContext}
            </p>
          ) : null}
          <ol className="space-y-5">
            {fitness.days.map((day) => (
              <li key={day.date}>
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                  {day.weekday} {day.date.slice(8)}
                </p>
                {day.sessions.length === 0 ? (
                  <p className="mt-1 text-sm text-slate-400">Rest / unplanned</p>
                ) : (
                  <ul className="mt-2 space-y-3">
                    {day.sessions.map((session) => (
                      <li key={`${day.date}-${session.title}`}>
                        <p className="text-sm font-medium text-white">
                          {session.title}
                        </p>
                        {session.prescription ? (
                          <p className="mt-1 text-sm leading-relaxed text-slate-300">
                            {session.prescription}
                          </p>
                        ) : null}
                        {session.lifts.length > 0 ? (
                          <ul className="mt-2 space-y-2 text-sm text-slate-400">
                            {session.lifts.map((lift) => {
                              const technique = matchHeimdallForLift(
                                lift.exercise,
                                heimdall,
                              );
                              return (
                                <li key={`${session.title}-${lift.exercise}`}>
                                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    <span>
                                      <span className="text-slate-300">
                                        {lift.exercise}
                                      </span>
                                      {lift.sets || lift.reps ? (
                                        <span>
                                          {" "}
                                          · {lift.sets}×{lift.reps}
                                        </span>
                                      ) : null}
                                      {lift.rpe ? (
                                        <span> @ RPE {lift.rpe}</span>
                                      ) : null}
                                    </span>
                                    {technique ? (
                                      <HeimdallEmbed
                                        video={technique}
                                        label="Technique"
                                      />
                                    ) : null}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
                {day.notes ? (
                  <p className="mt-2 text-xs text-slate-500">{day.notes}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </Lane>
  );
}
