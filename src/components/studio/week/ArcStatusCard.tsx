"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";

import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";
import type {
  ArcHealthView,
  ArcNarrativeView,
  DailyQuestView,
  FitnessDay,
} from "@/lib/week-log/types";

const STAT_LABELS: Record<string, string> = {
  str: "STR",
  agi: "AGI",
  spd: "SPD",
  end: "END",
  vit: "VIT",
  per: "PER",
};

/** Peak velocity sits beside race-speed AGI; END stays the aerobic engine. */
const STAT_ORDER = ["str", "agi", "spd", "end", "vit", "per"] as const;

const GATE_SCORE_HINT_FALLBACK =
  "Unweighted mean of STR, AGI, SPD, END, VIT, and PER (~16.7% each) when all six have a sample; otherwise the present stats equally. Each tile is 50 at average and 100 at world class, linear between those anchors. Rounded 0–100 before rank bands.";

const GATE_RANK_HINTS: Record<string, string> = {
  E: "Entry gate — composite below 35. Build base fitness before rank-ups.",
  D: "Developing — composite 35–49.",
  C: "Capable — composite 50–62. Solid block execution.",
  B: "Strong — composite 63–74. Race-ready training load.",
  A: "Elite — composite 75–86. Peak sharpening.",
  S: "Legendary — composite 87+. Full gate clearance.",
};

type HintId = "gate-rank" | "gate-score" | "health" | `stat-${string}`;

function gateRankHint(gate: ArcNarrativeView["gate"]): string {
  if (gate.rankHint) return gate.rankHint;
  const base = GATE_RANK_HINTS[gate.rank] || "Gate rank from composite stat score.";
  const parts = [base];
  if (gate.readinessLock) parts.push(gate.readinessLock);
  if (gate.phaseCeiling && gate.rank !== gate.phaseCeiling) {
    parts.push(`Phase ceiling is ${gate.phaseCeiling}.`);
  }
  return parts.join(" ");
}

function HintPanel({ text }: { text: string }) {
  return (
    <div
      className="rounded-lg border border-violet-400/30 bg-violet-950/60 px-3 py-2.5 text-xs leading-relaxed text-slate-300"
      role="status"
    >
      {text}
    </div>
  );
}

function HintTrigger({
  hintId,
  hint,
  activeHint,
  onToggle,
  className,
  children,
}: {
  hintId: HintId;
  hint: string;
  activeHint: HintId | null;
  onToggle: (id: HintId) => void;
  className?: string;
  children: ReactNode;
}) {
  const active = activeHint === hintId;
  return (
    <button
      type="button"
      onClick={() => onToggle(hintId)}
      className={cn(
        "touch-manipulation rounded-md text-left transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400",
        active && "bg-violet-500/15 ring-1 ring-violet-400/40",
        className,
      )}
      aria-expanded={active}
      aria-label={`Show details: ${hint.slice(0, 80)}`}
      title={hint}
    >
      {children}
    </button>
  );
}

type TrendDir = "up" | "down" | "flat";

function asFinite(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function signedTrend(
  value: number | null,
  opts?: { invert?: boolean; dead?: number },
): TrendDir | null {
  if (value == null) return null;
  const n = opts?.invert ? -value : value;
  const dead = opts?.dead ?? 0;
  if (Math.abs(n) <= dead) return "flat";
  return n > 0 ? "up" : "down";
}

function deriveStatTrend(
  name: string,
  stat: { trend?: TrendDir | null; raw: Record<string, unknown> },
): TrendDir | null {
  if (stat.trend === "up" || stat.trend === "down" || stat.trend === "flat") {
    return stat.trend;
  }
  if (stat.trend === null) return null;
  const raw = stat.raw || {};
  if (name === "agi") {
    const est = asFinite(raw.vdot_est);
    const race = asFinite(raw.vdot_race);
    if (est == null || race == null) return null;
    return signedTrend(est - race, { dead: 0.15 });
  }
  if (name === "spd") {
    return signedTrend(
      asFinite(raw.max_speed_delta_30d) ?? asFinite(raw.max_speed_delta_kmh),
      { dead: 0.15 },
    );
  }
  if (name === "end") {
    return signedTrend(asFinite(raw.vo2max_delta_30d), { dead: 0.05 });
  }
  if (name === "per") {
    return signedTrend(asFinite(raw.body_fat_delta_7d), { invert: true, dead: 0.15 });
  }
  if (name === "vit") {
    const hrv = asFinite(raw.hrv_vs_baseline_pct);
    const fromHrv = signedTrend(hrv == null ? null : hrv - 100, { dead: 5 });
    if (fromHrv && fromHrv !== "flat") return fromHrv;
    const fromRhr = signedTrend(asFinite(raw.resting_hr_delta_7d), {
      invert: true,
      dead: 1,
    });
    return fromRhr ?? fromHrv;
  }
  return null;
}

function TrendMark({ trend }: { trend: TrendDir | null | undefined }) {
  const glyph = trend === "up" ? "▲" : trend === "down" ? "▼" : trend === "flat" ? "−" : "";
  const label =
    trend === "up"
      ? "trending up"
      : trend === "down"
        ? "trending down"
        : trend === "flat"
          ? "steady"
          : undefined;
  return (
    <span
      className={cn(
        "inline-block w-3 shrink-0 text-center text-[0.7rem] leading-none",
        trend === "up" && "text-neon-cyan",
        trend === "down" && "text-red-400",
        trend === "flat" && "text-slate-400",
      )}
      title={label}
      aria-label={label}
      aria-hidden={!label}
    >
      {glyph || "\u00a0"}
    </span>
  );
}

function StatAttribute({
  name,
  level,
  detail,
  hint,
  hintId,
  activeHint,
  onToggle,
  trend,
}: {
  name: string;
  level: number;
  detail: string;
  hint: string;
  hintId: HintId;
  activeHint: HintId | null;
  onToggle: (id: HintId) => void;
  trend?: TrendDir | null;
}) {
  const active = activeHint === hintId;
  return (
    <HintTrigger
      hintId={hintId}
      hint={hint}
      activeHint={activeHint}
      onToggle={onToggle}
      className={cn(
        "flex h-full w-full flex-col rounded-xl border border-white/10 bg-black/20 px-3 py-2.5",
        "hover:border-violet-400/30",
        active && "border-violet-400/40",
      )}
    >
      <p className="flex items-center justify-between gap-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-violet-300/70">
        <span>{STAT_LABELS[name] ?? name}</span>
        <TrendMark trend={trend} />
      </p>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums leading-none text-white">
        {level}
      </p>
      <p
        className="mt-1 h-4 truncate text-xs leading-4 text-slate-500"
        title={detail}
      >
        {detail || "\u00a0"}
      </p>
    </HintTrigger>
  );
}

function QuestProgressBar({
  label,
  current,
  limit,
}: {
  label: string;
  current: number;
  limit: number;
}) {
  const pct = limit > 0 ? Math.min(100, Math.round((current / limit) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="text-slate-300">{label}</span>
        <span className="font-mono tabular-nums text-slate-400">
          {current} / {limit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-600 to-neon-cyan transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function healthHint(health: ArcHealthView): string {
  const vit = health.vit ?? Math.max(0, Math.round(health.max) - 100);
  const base =
    `Remaining HP is Garmin Body Battery as a share of max HP (100 + VIT ${vit}). ` +
    "Fill is not scaled into the gate letter.";
  if (health.lagDays > 0 && health.asOf) {
    const lag = health.lagDays === 1 ? "1d" : `${health.lagDays}d`;
    return `${base} Latest closed day is ${health.asOf} (${lag} lag). Same-day reading posts overnight.`;
  }
  return `${base} Today's Body Battery is in.`;
}

function healthBarTone(pct: number): { fill: string; value: string } {
  if (pct < 30) {
    return { fill: "from-red-800 to-red-500", value: "text-red-300" };
  }
  if (pct < 50) {
    return { fill: "from-red-600 to-amber-500", value: "text-amber-200" };
  }
  if (pct < 75) {
    return { fill: "from-amber-500 to-neon-cyan", value: "text-slate-200" };
  }
  return { fill: "from-neon-cyan/70 to-neon-cyan", value: "text-neon-cyan" };
}

function HealthBar({ health }: { health: ArcHealthView }) {
  const pct =
    health.fillPct != null
      ? Math.min(100, Math.max(0, Math.round(health.fillPct)))
      : health.max > 0
        ? Math.min(100, Math.max(0, Math.round((health.current / health.max) * 100)))
        : 0;
  const tone = healthBarTone(pct);
  const lagLabel =
    health.lagDays > 0 && health.asOf ? `as of ${health.asOf}` : null;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
        <span className="text-slate-300">
          HP
          {lagLabel ? (
            <span className="ml-2 text-slate-500">{lagLabel}</span>
          ) : null}
        </span>
        <span className={cn("font-mono tabular-nums", tone.value)}>
          {Math.round(health.current)} / {Math.round(health.max)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all",
            tone.fill,
          )}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={health.current}
          aria-valuemin={0}
          aria-valuemax={health.max}
          aria-label={health.label}
        />
      </div>
    </div>
  );
}

function questLabel(key: string, target: { label?: string }): string {
  return target.label || key.replace(/_/g, " ");
}

function formatDelta(value: unknown, suffix = ""): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim()) return `${value}${suffix}`;
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return null;
  return `${value}${suffix}`;
}

const ARC_ICON_GLYPH: Record<string, string> = {
  gate: "◎",
  forge: "⚒",
  patrol: "→",
  boss: "⚔",
  quest: "★",
  scout: "◇",
};

export function GateWeekStrip({ days }: { days: FitnessDay[] }) {
  if (!days.length) return null;
  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
        Training arc
      </p>
      <ol className="mt-2 flex gap-1 overflow-x-auto pb-1">
        {days.map((day) => {
          const primary = day.sessions[0];
          const icon = primary?.arcIcon ?? null;
          const title = primary?.arcTitle ?? primary?.title ?? "Rest";
          return (
            <li
              key={day.date}
              title={`${day.weekday}: ${title}`}
              className="min-w-[2.75rem] flex-shrink-0 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-center"
            >
              <p className="font-mono text-[0.55rem] uppercase text-slate-500">
                {day.weekday.slice(0, 3)}
              </p>
              <p className="mt-0.5 text-sm text-slate-200">
                {icon ? ARC_ICON_GLYPH[icon] ?? "·" : "·"}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ArcStatusCard({
  narrative,
  dailyQuest,
  weekDays,
}: {
  narrative: ArcNarrativeView;
  dailyQuest: DailyQuestView | null;
  weekDays?: FitnessDay[];
}) {
  const { gate, stats, boss, deltas, warriorQuote, health } = narrative;
  const bossActive = boss?.active === true;
  const [activeHint, setActiveHint] = useState<HintId | null>(null);

  const hints = useMemo(() => {
    const map: Record<string, string> = {
      "gate-rank": gateRankHint(gate),
      "gate-score": gate.scoreHint || GATE_SCORE_HINT_FALLBACK,
    };
    if (health) map.health = healthHint(health);
    for (const key of STAT_ORDER) {
      const stat = stats[key];
      if (stat?.hint) map[`stat-${key}`] = stat.hint;
    }
    return map;
  }, [gate, stats, health]);

  const onToggleHint = useCallback((id: HintId) => {
    setActiveHint((prev) => (prev === id ? null : id));
  }, []);

  const activeHintText = activeHint ? hints[activeHint] : null;

  const visibleStatKeys = STAT_ORDER.filter((key) => stats[key]);
  const sixStats = visibleStatKeys.length >= 6;

  const vo2Delta = formatDelta(deltas.vo2max_30d);
  const weightDelta = formatDelta(deltas.weight_14d_kg, " kg");
  const hrvDelta = formatDelta(deltas.hrv_vs_baseline_pct, "% of baseline");
  const restingDelta = formatDelta(deltas.resting_hr_delta_7d, " bpm 7d");
  const paceLabel = formatDelta(deltas.threshold_pace_min_km);
  const sleepAvg = formatDelta(deltas.sleep_score_7d_avg, " sleep 7d avg");
  const maxSpeedDelta = formatDelta(deltas.max_speed_30d_kmh, " km/h");

  return (
    <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 to-slate-950/60 p-4 sm:p-5">
      {/* Compact header: avatar beside gate — no tall empty column on mobile */}
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <PixelAvatar
            src={profile.avatarUrl}
            alt={profile.name}
            className="h-14 w-14 sm:h-20 sm:w-20"
          />
          <p className="mt-1 hidden text-center font-mono text-[0.5rem] uppercase tracking-[0.15em] text-amber-200/80 sm:block">
            Warrior
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-violet-300/80">
            Arc Mode
          </p>
          <p className="mt-0.5 text-xl font-semibold text-white sm:text-2xl">
            Gate{" "}
            <HintTrigger
              hintId="gate-rank"
              hint={hints["gate-rank"]}
              activeHint={activeHint}
              onToggle={onToggleHint}
              className="inline px-1 py-0.5 font-semibold text-neon-cyan"
            >
              {gate.rank}
            </HintTrigger>
            <HintTrigger
              hintId="gate-score"
              hint={hints["gate-score"]}
              activeHint={activeHint}
              onToggle={onToggleHint}
              className="ml-1 inline px-1 py-0.5 text-sm font-normal text-slate-400 sm:ml-2"
            >
              score {gate.score}
            </HintTrigger>
          </p>
          {gate.readinessLock ? (
            <p className="mt-1.5 text-sm text-amber-300/90">⚠ {gate.readinessLock}</p>
          ) : null}
        </div>
      </div>

      {bossActive ? (
        <div className="mt-3 rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          ⚔ {String(boss.arc_name ?? "Red Gate Audit")}
          <span className="ml-2 font-mono text-[0.6rem] uppercase text-red-300/70">
            {String(boss.variant ?? "")}
          </span>
        </div>
      ) : boss?.phase === "foreshadow" ? (
        <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-sm text-amber-200">
          {String(boss.flavor ?? "Audit probable")}
        </div>
      ) : null}

      {warriorQuote ? (
        <blockquote className="mt-3 border-l-2 border-amber-500/40 pl-3 text-sm italic leading-snug text-slate-300 sm:mt-4">
          &ldquo;{warriorQuote.text}&rdquo;
          <footer className="mt-1 text-xs not-italic text-slate-500">
            — {warriorQuote.source}
          </footer>
        </blockquote>
      ) : null}

      {health ? (
        <div className="mt-3">
          <HintTrigger
            hintId="health"
            hint={hints.health ?? healthHint(health)}
            activeHint={activeHint}
            onToggle={onToggleHint}
            className="block w-full rounded-xl px-1 py-1.5 hover:bg-violet-500/10"
          >
            <HealthBar health={health} />
          </HintTrigger>
        </div>
      ) : null}

      {activeHintText ? (
        <div className="mt-3">
          <HintPanel text={activeHintText} />
        </div>
      ) : null}

      <div
        className={cn(
          "mt-3 grid items-stretch gap-2 sm:mt-4",
          sixStats ? "grid-cols-3 lg:grid-cols-6" : "grid-cols-2 sm:grid-cols-5",
        )}
      >
        {visibleStatKeys.map((key) => {
          const stat = stats[key];
          if (!stat) return null;
          const detail =
            stat.valueLabel && stat.valueLabel !== "—" ? stat.valueLabel : stat.source;
          const hint = stat.hint || STAT_LABELS[key] || key;
          return (
            <StatAttribute
              key={key}
              name={key}
              level={stat.display}
              detail={detail}
              hint={hint}
              hintId={`stat-${key}`}
              activeHint={activeHint}
              onToggle={onToggleHint}
              trend={deriveStatTrend(key, stat)}
            />
          );
        })}
      </div>

      <p className="mt-2 text-[0.65rem] text-slate-600">
        <span className="sm:hidden">Tap</span>
        <span className="hidden sm:inline">Hover or tap</span> HP, a stat, gate rank, or score
        for details.
      </p>

      {(vo2Delta ||
        weightDelta ||
        hrvDelta ||
        restingDelta ||
        paceLabel ||
        sleepAvg ||
        maxSpeedDelta) && (
        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 sm:mt-4">
          {vo2Delta ? <li>VO₂max 30d: {vo2Delta}</li> : null}
          {maxSpeedDelta ? <li>Max speed 30d: {maxSpeedDelta}</li> : null}
          {paceLabel ? <li>Threshold: {paceLabel}</li> : null}
          {hrvDelta ? <li>HRV: {hrvDelta}</li> : null}
          {restingDelta ? <li>Resting HR: {restingDelta}</li> : null}
          {sleepAvg ? <li>{sleepAvg}</li> : null}
          {weightDelta ? <li>Weight 14d: {weightDelta}</li> : null}
        </ul>
      )}

      {weekDays?.length ? <GateWeekStrip days={weekDays} /> : null}

      {dailyQuest?.enabled ? (
        <div className="mt-4 border-t border-white/10 pt-4 sm:mt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
              {dailyQuest.title || "Weekly quest"}
            </p>
            {dailyQuest.deadlineLabel ? (
              <p className="text-xs text-amber-200/80">Deadline: {dailyQuest.deadlineLabel}</p>
            ) : null}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {Object.entries(dailyQuest.targets).map(([key, t]) => {
              const limit = t.limit ?? t.ceiling ?? 0;
              if (!limit) return null;
              const current = dailyQuest.progress?.[key] ?? 0;
              return (
                <QuestProgressBar
                  key={key}
                  label={questLabel(key, t)}
                  current={current}
                  limit={limit}
                />
              );
            })}
          </div>
          {dailyQuest.logHint ? (
            <p className="mt-3 font-mono text-xs text-slate-500">{dailyQuest.logHint}</p>
          ) : null}
          {dailyQuest.rules ? (
            <p className="mt-2 text-xs text-slate-500">{dailyQuest.rules}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
