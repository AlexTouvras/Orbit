import type { ArcGateView, ArcStatView } from "@/lib/week-log/types";
import {
  GATE_WORLD_SIGMAS,
  GATE_Z_MAX,
  GATE_Z_MIN,
  letterBands,
  normalPdf,
  rankForScore,
  scoreToZ,
} from "@/lib/week-log/gate-bell";

const STAT_ORDER = ["str", "agi", "spd", "end", "vit", "per"] as const;

const BAND_FILL: Record<string, string> = {
  E: "rgba(148, 163, 184, 0.16)",
  D: "rgba(148, 163, 184, 0.28)",
  C: "rgba(34, 211, 238, 0.16)",
  B: "rgba(167, 139, 250, 0.22)",
  A: "rgba(251, 191, 36, 0.2)",
  S: "rgba(52, 211, 153, 0.22)",
};

const W = 720;
const H = 248;
const PAD_L = 28;
const PAD_R = 16;
const PAD_T = 36;
const PAD_B = 44;

function xOf(z: number): number {
  const clamped = Math.min(GATE_Z_MAX, Math.max(GATE_Z_MIN, z));
  return PAD_L + ((clamped - GATE_Z_MIN) / (GATE_Z_MAX - GATE_Z_MIN)) * (W - PAD_L - PAD_R);
}

function yOf(pdf: number): number {
  const peak = normalPdf(0);
  const plotH = H - PAD_T - PAD_B;
  return PAD_T + (1 - pdf / peak) * plotH;
}

const BASELINE = yOf(0);

function areaPath(z0: number, z1: number): string {
  const left = Math.max(GATE_Z_MIN, z0);
  const right = Math.min(GATE_Z_MAX, z1);
  const steps = 40;
  const top: string[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const z = left + ((right - left) * i) / steps;
    top.push(`${xOf(z).toFixed(1)},${yOf(normalPdf(z)).toFixed(1)}`);
  }
  return `M ${xOf(left).toFixed(1)},${BASELINE.toFixed(1)} L ${top.join(" L ")} L ${xOf(right).toFixed(1)},${BASELINE.toFixed(1)} Z`;
}

function curvePath(): string {
  const steps = 120;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const z = GATE_Z_MIN + ((GATE_Z_MAX - GATE_Z_MIN) * i) / steps;
    pts.push(`${xOf(z).toFixed(1)},${yOf(normalPdf(z)).toFixed(1)}`);
  }
  return pts.join(" ");
}

export function GateBell({
  gate,
  stats,
}: {
  gate: ArcGateView | null;
  stats?: Record<string, ArcStatView> | null;
}) {
  const bands = letterBands();
  const youZ = gate ? scoreToZ(gate.score) : null;
  const youY = youZ == null ? null : yOf(normalPdf(youZ));
  const marks = STAT_ORDER.flatMap((key) => {
    const stat = stats?.[key];
    if (!stat) return [];
    const z = scoreToZ(stat.display);
    return [
      {
        key,
        label: key.toUpperCase(),
        display: stat.display,
        rank: rankForScore(stat.display),
        z,
        x: xOf(z),
        y: yOf(normalPdf(z)),
      },
    ];
  });

  const aria = gate
    ? `Bell curve of the gate. You are ${gate.rank} at score ${gate.score}. Average is the peak. World class is three standard deviations to the right.`
    : "Bell curve of the gate letters. Average is the peak. World class is three standard deviations to the right.";

  return (
    <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
        Gate curve
      </p>
      <p className="mt-1 text-sm text-slate-400">
        Average is the peak, score 50. Letters are bands on that curve. World class
        is the right edge, {GATE_WORLD_SIGMAS} standard deviations out, score 100.
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 h-auto w-full"
        role="img"
        aria-label={aria}
      >
        {bands.map((band) => (
          <path key={band.rank} d={areaPath(band.z0, band.z1)} fill={BAND_FILL[band.rank]} />
        ))}
        <polyline
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={curvePath()}
        />
        <line
          x1={xOf(0)}
          x2={xOf(0)}
          y1={PAD_T}
          y2={BASELINE}
          stroke="#22d3ee"
          strokeOpacity="0.45"
          strokeDasharray="3 4"
        />
        <text
          x={xOf(0)}
          y={BASELINE + 16}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="11"
        >
          avg
        </text>
        <text
          x={xOf(GATE_WORLD_SIGMAS)}
          y={BASELINE + 16}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="11"
        >
          100
        </text>
        {bands.map((band) => (
          <text
            key={`${band.rank}-label`}
            x={xOf(band.labelZ)}
            y={H - 8}
            textAnchor="middle"
            fill="#e2e8f0"
            fontSize="13"
            fontWeight="600"
          >
            {band.rank}
          </text>
        ))}
        {marks.map((mark) => (
          <circle
            key={mark.key}
            cx={mark.x}
            cy={mark.y}
            r="3.5"
            fill="#0f172a"
            stroke="#e2e8f0"
            strokeWidth="1.4"
          >
            <title>
              {mark.label} {mark.display} · {mark.rank}
            </title>
          </circle>
        ))}
        {youZ != null && youY != null && gate ? (
          <g>
            <line
              x1={xOf(youZ)}
              x2={xOf(youZ)}
              y1={youY}
              y2={BASELINE}
              stroke="#22d3ee"
              strokeWidth="2"
            />
            <circle cx={xOf(youZ)} cy={youY} r="6" fill="#22d3ee" />
            <text
              x={xOf(youZ) + (youZ > 2.2 ? -10 : 10)}
              y={Math.max(18, youY - 8)}
              textAnchor={youZ > 2.2 ? "end" : "start"}
              fill="#22d3ee"
              fontSize="12"
              fontWeight="700"
            >
              {`You ${gate.rank} ${gate.score}`}
            </text>
          </g>
        ) : null}
      </svg>
      {marks.length ? (
        <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
          {marks.map((mark) => (
            <li key={mark.key}>
              <span className="text-slate-200">{mark.label}</span> {mark.display}{" "}
              <span className="text-slate-500">{mark.rank}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
