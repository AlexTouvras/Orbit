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

export interface ArcNarrativeView {
  mode: string;
  arcPhase: string;
  gate: ArcGateView;
  stats: Record<string, ArcStatView>;
  deltas: Record<string, unknown>;
  boss: Record<string, unknown> | null;
  warriorQuote?: WarriorQuoteView | null;
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
