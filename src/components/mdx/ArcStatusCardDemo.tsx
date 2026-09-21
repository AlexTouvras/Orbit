import { ArcStatusCard } from "@/components/studio/week/ArcStatusCard";
import type { ArcNarrativeView, DailyQuestView } from "@/lib/week-log/types";

/** Frozen snapshot from fitness-coach `data/plans/2026-W36.json` (sharpen week), plus SPD. */
const DEMO_NARRATIVE: ArcNarrativeView = {
  mode: "arc",
  arcPhase: "sharpen",
  gate: {
    rank: "C",
    score: 50,
    phaseCeiling: "B",
    readinessLock: null,
    rankHint:
      "Capable — composite 50–62. Solid block execution. Sharpen phase caps rank at B until race week.",
    scoreHint:
      "Unweighted mean of STR, AGI, SPD, END, VIT, and PER (~16.7% each) for every block. Rounded 0–100 before rank bands.",
  },
  stats: {
    str: {
      display: 48,
      valueLabel: "CTL 0.7",
      hint: "Strength from session-RPE logs (7-day EWMA). Higher = more consistent heavy lifting this block.",
      source: "strength_ctl",
      raw: { strength_ctl: 0.71, lift_week: 8, sessions_7d: 1 },
      trend: null,
    },
    agi: {
      display: 43,
      valueLabel: "race 22:34 5K",
      hint: "Race-speed estimate: Daniels VDOT from 5K PB / race, updated from hard 1k or ≥3 min splits. Predicted 5K on the label. Not Garmin VO2.",
      source: "vdot_est",
      raw: { vdot_est: 43.23, vdot_race: 43.23, predicted_5k: "22:34" },
      trend: "flat",
    },
    spd: {
      display: 46,
      valueLabel: "25.8 km/h",
      hint: "Peak velocity: rolling 30-day best max speed from Intervals stride/sprint efforts (GPS outliers dropped). Not race pace — that is AGI (VDOT).",
      source: "max_speed",
      raw: { max_speed_kmh: 25.8, max_speed_delta_30d: 0.4 },
      trend: "up",
    },
    end: {
      display: 50,
      valueLabel: "VO₂ 50.0 · 5:13/km",
      hint: "Cardiorespiratory engine: Garmin VO2max 1:1 (ml·kg⁻¹·min⁻¹).",
      source: "wellness",
      raw: { vo2max: 50.0, vo2max_delta_30d: 0.4 },
      trend: "up",
    },
    vit: {
      display: 68,
      valueLabel: "TSB +11",
      hint: "Vitality from TSB, HRV vs your baseline, sleep, and form zone. Drops when fatigued or under-recovered.",
      source: "composite",
      raw: { tsb: 11.36, hrv: null, form_zone: "fresh", resting_hr_delta_7d: -3 },
      trend: "up",
    },
    per: {
      display: 42,
      valueLabel: "24.1% BF",
      hint: "Persistence from body-fat % (Garmin scale via Intervals) and recent trend. Lower BF raises PER; not a 'perfect body' score.",
      source: "bodycomp",
      raw: { body_fat_pct: 24.1, weight_delta_14d_kg: -1.04, body_fat_delta_7d: 0.4 },
      trend: "down",
    },
  },
  deltas: {
    vo2max_30d: 0.0,
    max_speed_30d_kmh: 0.4,
    weight_14d_kg: -1.04,
  },
  boss: null,
  warriorQuote: {
    text: "Perceive that which cannot be seen with the eye.",
    source: "Miyamoto Musashi",
  },
  health: {
    current: 109,
    max: 168,
    asOf: "2026-09-08",
    lagDays: 1,
    source: "BodyBatteryMax",
    vit: 68,
    fillPct: 65,
    label: "HP 109/168 · as of 2026-09-08",
  },
};

const DEMO_QUEST: DailyQuestView = {
  enabled: true,
  cadence: "weekly",
  title: "Grease-the-groove weekly quest",
  deadline: "2026-09-06",
  deadlineLabel: "Sunday 06 Sep, end of day",
  logHint: "Slack: log: quest push-ups 20 (repeat any day; counts toward this week)",
  targets: {
    push_ups: { limit: 108, label: "Push-ups" },
    sit_ups: { limit: 108, label: "Sit-ups" },
    pull_ups: { limit: 27, label: "Pull-ups" },
    bar_hang_sec: { limit: 324, label: "Bar hang (sec)" },
  },
  progress: {
    push_ups: 50,
    sit_ups: 0,
    pull_ups: 34,
    bar_hang_sec: 110,
  },
  rules:
    "Sub-max reps spread Mon–Sun. Bank progress in Slack; deadline is end of Sunday.",
};

export function ArcStatusCardDemo() {
  return (
    <figure className="my-8 not-prose">
      <ArcStatusCard narrative={DEMO_NARRATIVE} dailyQuest={DEMO_QUEST} />
      <figcaption className="mt-3 text-center text-xs text-slate-500">
        Live component — snapshot from{" "}
        <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-slate-400">
          data/plans/2026-W36.json
        </code>{" "}
        (sharpen week), plus SPD as the sixth tile from max speed. Same card Studio
        renders at{" "}
        <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-slate-400">
          /studio/week/fitness
        </code>
        .
      </figcaption>
    </figure>
  );
}
