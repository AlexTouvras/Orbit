// Shared, dependency-free types + display metadata for local projects.
// Safe to import from both server (scanner) and client (Studio UI, cards).

export type ProjectStatus =
  | "live"
  | "shipped"
  | "wip"
  | "prototype"
  | "idea"
  | "archived";

export type ProjectActivity = "active" | "recent" | "stale" | "unknown";

export type BadgeTone =
  | "cyan"
  | "violet"
  | "blue"
  | "neutral"
  | "green"
  | "amber"
  | "red";

export interface PublishedProject {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  tags: string[];
  repoUrl: string;
  liveUrl: string;
  featured: boolean;
  /** Local filesystem path — used to re-match on rescan. Never rendered publicly. */
  sourcePath: string;
  order: number;
}

/** Public-facing shape (no local path). */
export type PublicProject = Omit<PublishedProject, "sourcePath">;

export interface ScannedProject {
  id: string;
  name: string;
  description: string;
  detectedLanguage: string;
  detectedTags: string[];
  repoUrl: string;
  lastActivity: string | null;
  activity: ProjectActivity;
  sourcePath: string;
  /** Whether this project is already in the published set. */
  published: boolean;
  /** Existing published record, if any (carries the user's prior edits). */
  current?: PublishedProject;
}

export const STATUS_ORDER: ProjectStatus[] = [
  "live",
  "shipped",
  "wip",
  "prototype",
  "idea",
  "archived",
];

export const STATUS_META: Record<
  ProjectStatus,
  { label: string; tone: BadgeTone }
> = {
  live: { label: "Live", tone: "green" },
  shipped: { label: "Shipped", tone: "cyan" },
  wip: { label: "In progress", tone: "amber" },
  prototype: { label: "Prototype", tone: "violet" },
  idea: { label: "Idea", tone: "neutral" },
  archived: { label: "Archived", tone: "neutral" },
};

export const ACTIVITY_META: Record<
  ProjectActivity,
  { label: string; tone: BadgeTone }
> = {
  active: { label: "Active", tone: "green" },
  recent: { label: "Recent", tone: "blue" },
  stale: { label: "Dormant", tone: "neutral" },
  unknown: { label: "Unknown", tone: "neutral" },
};
