import type { NewsletterDigest, NewsletterRavenItem } from "@/lib/newsletter/types";

export type WeekLaneStatus = "ok" | "empty" | "unavailable";

export interface WeekLane<T> {
  status: WeekLaneStatus;
  detail?: string;
  /** Shown when we fell back to an older artifact than the selected ISO week. */
  stale?: string;
  source?: string;
  href?: string;
  data: T | null;
}

export interface FitnessLift {
  exercise: string;
  sets: string;
  reps: string;
  rpe: string | null;
  notes: string | null;
}

export interface FitnessSession {
  sport: string;
  focus: string;
  title: string;
  prescription: string;
  durationMin: number | null;
  lifts: FitnessLift[];
  arcTitle?: string | null;
  arcFlavor?: string | null;
  arcIcon?: string | null;
}

export interface FitnessDay {
  date: string;
  weekday: string;
  notes: string | null;
  sessions: FitnessSession[];
}

export interface FitnessKickoff {
  quoteText: string | null;
  quoteAttribution: string | null;
  motivateSlug: string | null;
  motivateTitle: string | null;
  motivateUrl: string | null;
  motivateChannel: string | null;
  spotifyRunningName: string | null;
  spotifyRunningUrl: string | null;
  spotifyStrengthName: string | null;
  spotifyStrengthUrl: string | null;
}

export interface ArcStatView {
  display: number;
  valueLabel?: string;
  hint?: string;
  source: string;
  raw: Record<string, unknown>;
  /** Direction the underlying signal is heading. Null → no sample. */
  trend?: "up" | "down" | "flat" | null;
}

export interface WarriorQuoteView {
  text: string;
  source: string;
}

export interface ArcGateView {
  rank: string;
  score: number;
  phaseCeiling: string;
  readinessLock: string | null;
  rankHint?: string;
  scoreHint?: string;
}

export interface ArcHealthView {
  current: number;
  max: number;
  asOf: string | null;
  lagDays: number;
  source: string;
  label: string;
  vit?: number | null;
  fillPct?: number | null;
}

export interface ArcNarrativeView {
  mode: string;
  arcPhase: string;
  gate: ArcGateView;
  stats: Record<string, ArcStatView>;
  deltas: Record<string, unknown>;
  boss: Record<string, unknown> | null;
  warriorQuote?: WarriorQuoteView | null;
  /** Remaining HP from Body Battery. Null/omitted → hide the bar; never invent from VIT. */
  health?: ArcHealthView | null;
}

export interface DailyQuestTarget {
  limit?: number;
  label?: string;
  /** @deprecated legacy daily floor/ceiling */
  floor?: number;
  ceiling?: number;
}

export interface DailyQuestView {
  enabled: boolean;
  cadence?: string;
  title?: string;
  deadline?: string;
  deadlineLabel?: string;
  logHint?: string;
  targets: Record<string, DailyQuestTarget>;
  progress?: Record<string, number>;
  rules: string;
}

export interface FitnessWeek {
  weekId: string;
  generatedAt: string | null;
  theme: string;
  blockLabel: string | null;
  raceContext: string | null;
  kickoff: FitnessKickoff | null;
  coachNotes: string[];
  days: FitnessDay[];
  narrative: ArcNarrativeView | null;
  dailyQuest: DailyQuestView | null;
  course: FitnessCourseView | null;
}

export interface CodexPoint {
  date: string;
  weekId: string;
  vdotEst: number | null;
  predicted5k: string | null;
  vdotRace: number | null;
  /** Rolling best max speed (km/h) from stride/sprint efforts. */
  maxSpeedKmh: number | null;
  vo2: number | null;
  vo2AbsLMin: number | null;
  ctl: number | null;
  atl: number | null;
  tsb: number | null;
  sleepScore: number | null;
  hrv: number | null;
  weightKg: number | null;
  bodyFatPct: number | null;
  fatMassKg: number | null;
  leanMassKg: number | null;
  strengthCtl: number | null;
  strengthAtl: number | null;
}

export interface CodexSeries {
  updatedAt: string | null;
  points: CodexPoint[];
}

export type LiftIntent = "maintenance" | "strength" | "hypertrophy";
export type LiftStyle = "full" | "standard" | "simplified";
export type RaceEffort = "peak" | "test" | "skip";
export type CoursePhase = "build" | "sharpen" | "taper" | "open";

export interface FitnessCourseView {
  timeEfficient: boolean;
  raceEffort: RaceEffort;
  liftIntent: LiftIntent;
  liftStyle: LiftStyle;
  gtgOptional: boolean;
  raceDate: string | null;
  eventName: string;
  phase: CoursePhase;
  daysToEvent: number | null;
  eventExpired: boolean;
}

export interface MealDay {
  heading: string;
  meals: Array<{ meal: string; dish: string; notes: string }>;
}

export interface MealWeek {
  title: string;
  goals: string | null;
  days: MealDay[];
}

export interface CareerOffer {
  score: string;
  band: string;
  company: string;
  role: string;
  href?: string;
}

export interface CareerWeek {
  title: string;
  scanDate: string | null;
  newOffers: string | null;
  headline: string | null;
  metrics: Array<{ label: string; value: string }>;
  applyNow: CareerOffer[];
  stillOpen: CareerOffer[];
  newThisWeek: CareerOffer[];
}

export interface HeimdallVideo {
  id: string;
  domain: string;
  slug: string;
  title: string;
  stage: string | null;
  channel: string | null;
  duration: string | null;
  primaryUrl: string;
  embedUrl: string | null;
  why: string | null;
  cues: string[];
  limits: string[];
  related: string[];
}

export interface WeekLog {
  weekId: string;
  label: string;
  range: string;
  prevWeekId: string | null;
  nextWeekId: string | null;
  isCurrent: boolean;
  fitness: WeekLane<FitnessWeek>;
  meals: WeekLane<MealWeek>;
  ravens: WeekLane<NewsletterRavenItem[]>;
  heimdall: WeekLane<HeimdallVideo[]>;
  newsletter: WeekLane<NewsletterDigest>;
  careerops: WeekLane<CareerWeek>;
}
