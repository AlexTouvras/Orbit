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

export interface FitnessWeek {
  weekId: string;
  generatedAt: string | null;
  theme: string;
  blockLabel: string | null;
  raceContext: string | null;
  kickoff: FitnessKickoff | null;
  coachNotes: string[];
  days: FitnessDay[];
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
