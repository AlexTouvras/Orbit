import type { CodexPoint, CodexSeries, WeekLane } from "@/lib/week-log/types";
import { Lane } from "@/components/studio/week/Lane";

function Sparkline({
  series,
  invert = false,
}: {
  series: Array<{ values: Array<number | null>; stroke: string }>;
  invert?: boolean;
}) {
  const length = Math.max(0, ...series.map((row) => row.values.length));
  const nums = series.flatMap((row) =>
    row.values.filter((value): value is number => value != null),
  );
  if (length < 2 || nums.length < 2) {
    return <p className="text-sm text-slate-500">Need two samples to draw a line.</p>;
  }
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min || 1;
  const lastIndex = length - 1 || 1;
  return (
    <svg viewBox="0 0 100 40" className="mt-3 h-24 w-full" aria-hidden="true">
      {series.map((row) => {
        const pairs = row.values
          .map((value, index) => (value == null ? null : { value, index }))
          .filter((item): item is { value: number; index: number } => Boolean(item));
        if (pairs.length < 2) return null;
        const points = pairs
          .map((item) => {
            const x = (item.index / lastIndex) * 100;
            const ratio = (item.value - min) / span;
            const y = invert ? 4 + ratio * 28 : 36 - ratio * 28;
            return `${x.toFixed(2)},${y.toFixed(2)}`;
          })
          .join(" ");
        return (
          <polyline
            key={row.stroke}
            fill="none"
            stroke={row.stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points}
          />
        );
      })}
    </svg>
  );
}

function fmt(value: number | null, digits = 1, suffix = ""): string {
  if (value == null) return "—";
  return `${value.toFixed(digits)}${suffix}`;
}

function latestDefined(points: CodexPoint[], key: keyof CodexPoint): string {
  for (let i = points.length - 1; i >= 0; i -= 1) {
    const value = points[i][key];
    if (value == null || value === "") continue;
    if (typeof value === "number") return String(value);
    return String(value);
  }
  return "—";
}

function CodexPane({
  title,
  unit,
  latest,
  series,
  invert = false,
  note,
}: {
  title: string;
  unit: string;
  latest: string;
  series: Array<{ values: Array<number | null>; stroke: string }>;
  invert?: boolean;
  note?: string;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums text-white">
        {latest}
        <span className="ml-2 text-sm font-normal text-slate-500">{unit}</span>
      </p>
      <Sparkline series={series} invert={invert} />
      {note ? <p className="mt-2 text-xs text-slate-500">{note}</p> : null}
    </section>
  );
}

export function FitnessCodexPanel({ lane }: { lane: WeekLane<CodexSeries> }) {
  const series = lane.data;
  const points = series?.points ?? [];

  return (
    <Lane
      eyebrow="Codex"
      title="Native-unit history"
      status={lane.status}
      detail={lane.detail}
      source={lane.source}
      href={lane.href}
    >
      <p className="mb-6 text-sm text-slate-400">
        Long-term series in the units they were measured in — not HUD integers.
        About one year of weekly points. AGI is VDOT with predicted 5K on the
        label — same series, one graph. Load is kilograms: weight, fat, lean.
        STR only appears once lift logs exist. Week previous/next does not
        rewind the series.
      </p>
      {points.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <CodexPane
            title="AGI · estimated VDOT"
            unit={
              latestDefined(points, "predicted5k") !== "—"
                ? `→ ${latestDefined(points, "predicted5k")} 5K`
                : ""
            }
            latest={fmt(points.at(-1)?.vdotEst ?? null, 2)}
            series={[{ values: points.map((point) => point.vdotEst), stroke: "#a78bfa" }]}
            note="One series. Predicted 5K is the inverse of this line, not a second plot. Race floor holds after slower probes."
          />
          <CodexPane
            title="Effort · run CTL / ATL"
            unit={`ATL ${fmt(points.at(-1)?.atl ?? null, 1)}`}
            latest={`CTL ${fmt(points.at(-1)?.ctl ?? null, 1)}`}
            series={[
              { values: points.map((point) => point.ctl), stroke: "#fbbf24" },
              { values: points.map((point) => point.atl), stroke: "#fb7185" },
            ]}
            note="Yellow CTL = chronic load. Pink ATL = last-week load. Effort can rebuild while AGI stays put."
          />
          <CodexPane
            title="END · Garmin VO₂"
            unit="ml·kg⁻¹·min⁻¹"
            latest={fmt(points.at(-1)?.vo2 ?? null, 1)}
            series={[{ values: points.map((point) => point.vo2), stroke: "#22d3ee" }]}
            note={`Absolute ${fmt(
              [...points].reverse().find((point) => point.vo2AbsLMin != null)?.vo2AbsLMin ?? null,
              3,
              " L/min",
            )} — litres can hold while the mass-specific number drops.`}
          />
          <CodexPane
            title="VIT · TSB"
            unit="form"
            latest={fmt(points.at(-1)?.tsb ?? null, 1)}
            series={[{ values: points.map((point) => point.tsb), stroke: "#34d399" }]}
            note={`Sleep score latest ${latestDefined(points, "sleepScore")}. CTL and ATL have their own effort pane.`}
          />
          <CodexPane
            title="Load · weight / fat / lean"
            unit={`${fmt(
              [...points].reverse().find((point) => point.bodyFatPct != null)?.bodyFatPct ?? null,
              1,
              "% BF",
            )}`}
            latest={`${fmt(
              [...points].reverse().find((point) => point.weightKg != null)?.weightKg ?? null,
              2,
            )} kg`}
            series={[
              { values: points.map((point) => point.weightKg), stroke: "#94a3b8" },
              { values: points.map((point) => point.fatMassKg), stroke: "#fbbf24" },
              { values: points.map((point) => point.leanMassKg), stroke: "#7dd3fc" },
            ]}
            note="Grey total · amber fat (backpack) · cyan lean. Same axis, kilograms. BF% is the label, not a second scale."
          />
          <CodexPane
            title="STR · session-RPE CTL"
            unit="EWMA"
            latest={fmt(points.at(-1)?.strengthCtl ?? null, 2)}
            series={[{ values: points.map((point) => point.strengthCtl), stroke: "#fb7185" }]}
            note="Sparse on purpose — only weeks with Slack lift logs. Not a missing Intervals field."
          />
        </div>
      ) : null}
    </Lane>
  );
}
