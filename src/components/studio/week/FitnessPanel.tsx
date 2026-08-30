import Link from "next/link";
import { HeimdallEmbed } from "@/components/studio/week/HeimdallEmbed";
import { Lane } from "@/components/studio/week/Lane";
import {
  extractYouTubeId,
  matchHeimdallForLift,
} from "@/lib/week-log/heimdall";
import { weekHref } from "@/lib/week-log/topics";
import type {
  FitnessKickoff,
  HeimdallVideo,
  WeekLane,
  FitnessWeek,
} from "@/lib/week-log/types";

function kickoffVideo(kickoff: FitnessKickoff): HeimdallVideo | null {
  if (!kickoff.motivateUrl) return null;
  const videoId = extractYouTubeId(kickoff.motivateUrl);
  return {
    id: kickoff.motivateSlug ?? kickoff.motivateUrl,
    domain: "fitness",
    slug: kickoff.motivateSlug ?? "",
    title: kickoff.motivateTitle ?? "Weekly motivation",
    stage: null,
    channel: kickoff.motivateChannel,
    duration: null,
    primaryUrl: kickoff.motivateUrl,
    embedUrl: videoId
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : null,
    why: null,
    cues: [],
    limits: [],
    related: [],
  };
}

function KickoffSection({ kickoff }: { kickoff: FitnessKickoff }) {
  const motivate = kickoffVideo(kickoff);
  const playlists = [
    kickoff.spotifyRunningUrl
      ? {
          label: "Run",
          name: kickoff.spotifyRunningName ?? "Running playlist",
          href: kickoff.spotifyRunningUrl,
        }
      : null,
    kickoff.spotifyStrengthUrl
      ? {
          label: "Lift",
          name: kickoff.spotifyStrengthName ?? "Strength playlist",
          href: kickoff.spotifyStrengthUrl,
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; name: string; href: string }>;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
        Week kickoff
      </p>
      {kickoff.quoteText ? (
        <blockquote className="mt-3 border-l-2 border-neon-cyan/40 pl-4">
          <p className="text-sm italic leading-relaxed text-slate-200">
            &ldquo;{kickoff.quoteText}&rdquo;
          </p>
          {kickoff.quoteAttribution ? (
            <footer className="mt-2 text-xs text-slate-500">
              — {kickoff.quoteAttribution}
            </footer>
          ) : null}
        </blockquote>
      ) : null}
      {motivate ? (
        <div className="mt-4">
          <HeimdallEmbed video={motivate} label="Motivation" />
        </div>
      ) : null}
      {playlists.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-3 text-sm">
          {playlists.map((playlist) => (
            <li key={playlist.href}>
              <a
                href={playlist.href}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-slate-300 transition-colors hover:border-white/30 hover:text-white"
                rel="noreferrer"
                target="_blank"
              >
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-slate-500">
                  {playlist.label}
                </span>
                {playlist.name}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function FitnessPanel({
  lane,
  heimdall,
  nextWeekReady,
}: {
  lane: WeekLane<FitnessWeek>;
  heimdall: HeimdallVideo[];
  nextWeekReady?: { weekId: string; theme: string } | null;
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
      {nextWeekReady ? (
        <div className="mb-6 rounded-2xl border border-neon-cyan/20 bg-neon-cyan/5 px-4 py-3 text-sm text-slate-200">
          Next week&apos;s plan is ready —{" "}
          <span className="text-white">{nextWeekReady.theme}</span>.{" "}
          <Link
            href={weekHref("fitness", nextWeekReady.weekId)}
            className="text-neon-cyan hover:underline"
          >
            Open {nextWeekReady.weekId}
          </Link>
        </div>
      ) : null}
      {fitness ? (
        <div className="space-y-6">
          {fitness.blockLabel ? (
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
              {fitness.blockLabel}
            </p>
          ) : null}
          {fitness.raceContext ? (
            <p className="text-sm leading-relaxed text-slate-300">
              {fitness.raceContext}
            </p>
          ) : null}
          {fitness.kickoff ? <KickoffSection kickoff={fitness.kickoff} /> : null}
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
          {fitness.coachNotes.length > 0 ? (
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                Coach notes
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-400">
                {fitness.coachNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </Lane>
  );
}
