export type EssayFeedbackRating = "yes" | "somewhat" | "no";

export interface EssayFeedbackEntry {
  rating: EssayFeedbackRating;
  note?: string;
  at: string;
}

export interface EssayFeedbackThread {
  title: string;
  entries: EssayFeedbackEntry[];
}

export type EssayFeedbackStore = Record<string, EssayFeedbackThread>;
