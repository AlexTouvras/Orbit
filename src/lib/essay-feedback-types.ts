export type EssayFeedbackRating = "yes" | "somewhat" | "no";

export interface EssayFeedbackEntry {
  /** Legacy useful / somewhat / not useful vote. New hearts and notes omit this. */
  rating?: EssayFeedbackRating;
  /** A heart on the essay or handbook page. */
  heart?: boolean;
  note?: string;
  at: string;
}

export interface EssayFeedbackThread {
  title: string;
  entries: EssayFeedbackEntry[];
}

export type EssayFeedbackStore = Record<string, EssayFeedbackThread>;
