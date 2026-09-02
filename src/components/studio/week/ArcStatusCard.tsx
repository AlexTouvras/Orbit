import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { profile } from "@/content/profile";
import type { ArcNarrativeView, DailyQuestView } from "@/lib/week-log/types";

const STAT_LABELS: Record<string, string> = {
  str: "STR",
  agi: "AGI",
  vit: "VIT",
  per: "PER",
};

const STAT_ORDER = ["str", "agi", "vit", "per"] as const;

const GATE_SCORE_HINT_FALLBACK =
  "Weighted blend of STR, AGI, VIT, and PER for this 5K block: AGI 45%, VIT 25%, STR 20%, PER 10%. Rounded 0–100 before rank bands.";

const GATE_RANK_HINTS: Record<string, string> = {
  E: "Entry gate — composite below 35. Build base fitness before rank-ups.",
  D: "Developing — composite 35–49. Recovery locks may cap you here.",
  C: "Capable — composite 50–62. Solid block execution.",
  B: "Strong — composite 63–74. Race-ready training load.",
  A: "Elite — composite 75–86. Peak sharpening.",
  S: "Legendary — composite 87+. Full gate clearance.",
};

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

function StatAttribute({
  name,
  level,
  detail,
  hint,
}: {
  name: string;
  level: number;
  detail: string;
  hint?: string;
}) {
  return (
    <div
      className="cursor-help rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 transition-colors hover:border-violet-400/30"
      title={hint || undefined}
    >
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-violet-300/70">
        {STAT_LABELS[name] ?? name}
      </p>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums text-white">{level}</p>
      <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
    </div>
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

function questLabel(key: string, target: { label?: string }): string {
  return target.label || key.replace(/_/g, " ");
}

function formatDelta(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return null;
  return String(value);
}

export function ArcStatusCard({
  narrative,
  dailyQuest,
}: {
  narrative: ArcNarrativeView;
  dailyQuest: DailyQuestView | null;
}) {
  const { gate, stats, boss, deltas, warriorQuote } = narrative;
  const bossActive = boss?.active === true;
  const vo2Delta = formatDelta(deltas.vo2max_30d);
  const weightDelta = formatDelta(deltas.weight_14d_kg);

  return (
    <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 to-slate-950/60 p-5">
      <div className="flex flex-wrap items-start gap-5">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <PixelAvatar
            src={profile.avatarUrl}
            alt={profile.name}
            className="h-20 w-20 sm:h-24 sm:w-24"
          />
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.15em] text-amber-200/80">
            Warrior
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-violet-300/80">
            Arc Mode
          </p>
          <p className="mt-1 text-2xl font-semibold text-white">
            Gate{" "}
            <span
              className="cursor-help text-neon-cyan"
              title={gateRankHint(gate)}
            >
              {gate.rank}
            </span>
            <span
              className="ml-2 cursor-help text-sm font-normal text-slate-400"
              title={gate.scoreHint || GATE_SCORE_HINT_FALLBACK}
            >
              score {gate.score}
            </span>
          </p>
          {gate.readinessLock ? (
            <p className="mt-2 text-sm text-amber-300/90">⚠ {gate.readinessLock}</p>
          ) : null}

          {warriorQuote ? (
            <blockquote className="mt-3 border-l-2 border-amber-500/40 pl-3 text-sm italic text-slate-300">
              &ldquo;{warriorQuote.text}&rdquo;
              <footer className="mt-1 text-xs not-italic text-slate-500">
                — {warriorQuote.source}
              </footer>
            </blockquote>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STAT_ORDER.map((key) => {
              const stat = stats[key];
              if (!stat) return null;
              const detail =
                stat.valueLabel && stat.valueLabel !== "—"
                  ? stat.valueLabel
                  : stat.source;
              return (
                <StatAttribute
                  key={key}
                  name={key}
                  level={stat.display}
                  detail={detail}
                  hint={stat.hint}
                />
              );
            })}
          </div>
          <p className="mt-2 text-[0.65rem] text-slate-600">
            Hover a stat, gate rank, or score for details.
          </p>
        </div>

        {bossActive ? (
          <div className="rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
            ⚔ {String(boss.arc_name ?? "Red Gate Audit")}
            <span className="ml-2 font-mono text-[0.6rem] uppercase text-red-300/70">
              {String(boss.variant ?? "")}
            </span>
          </div>
        ) : boss?.phase === "foreshadow" ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-sm text-amber-200">
            {String(boss.flavor ?? "Audit probable")}
          </div>
        ) : null}
      </div>

      {(vo2Delta || weightDelta) && (
        <ul className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
          {vo2Delta ? <li>VO₂max 30d: {vo2Delta}</li> : null}
          {weightDelta ? <li>Weight 14d: {weightDelta} kg</li> : null}
        </ul>
      )}

      {dailyQuest?.enabled ? (
        <div className="mt-5 border-t border-white/10 pt-4">
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

export function arcDayAccent(icon: string | null | undefined): string {
  switch (icon) {
    case "boss":
      return "border-l-red-500/60";
    case "gate":
      return "border-l-neon-cyan/50";
    case "forge":
      return "border-l-violet-500/50";
    case "quest":
      return "border-l-amber-500/40";
    case "patrol":
      return "border-l-slate-500/40";
    case "scout":
      return "border-l-blue-500/35";
    default:
      return "border-l-white/10";
  }
}
