import type { NewsItem, WriteCategory } from "@/lib/types";

export type WeeklyDraftStatus = "pending" | "published" | "skipped";

export interface WeeklyIntakeSignal {
  id: string;
  title: string;
  link: string;
  source: string;
  category: string;
  snippet: string;
}

export interface WeeklyIntakeProject {
  id: string;
  name: string;
  description: string;
  status: string;
  tags: string[];
  repoUrl: string;
  liveUrl: string;
}

export interface WeeklyIntake {
  weekOf: string;
  generatedAt: string;
  signals: WeeklyIntakeSignal[];
  projects: WeeklyIntakeProject[];
}

export interface WeeklyDraft {
  id: string;
  status: WeeklyDraftStatus;
  createdAt: string;
  weekOf: string;
  slug: string;
  title: string;
  summary: string;
  category: WriteCategory;
  tags: string[];
  /** Full MDX file body including frontmatter. */
  mdx: string;
  /** Short preview for Slack (plain text). */
  preview: string;
  intake: WeeklyIntake;
  source: "template" | "ollama" | "openai" | "ide";
  publishedAt?: string;
  publishedSlug?: string;
  skippedAt?: string;
}

export function newsToIntakeSignal(item: NewsItem): WeeklyIntakeSignal {
  return {
    id: item.id,
    title: item.title,
    link: item.link,
    source: item.source,
    category: item.category,
    snippet: item.contentSnippet,
  };
}
