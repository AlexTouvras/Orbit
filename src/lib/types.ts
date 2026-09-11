export type NewsCategory = "AI" | "Data" | "Delivery" | "Analytics";

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  category: NewsCategory;
  pubDate: string | null;
  contentSnippet: string;
}

export interface NewsCache {
  generatedAt: string;
  count: number;
  items: NewsItem[];
}

export interface ProjectFrontmatter {
  title: string;
  summary: string;
  year: number;
  role?: string;
  tags: string[];
  stack: string[];
  cover?: string;
  gallery?: string[];
  repo?: string;
  demo?: string;
  featured?: boolean;
  accent?: "cyan" | "violet" | "blue";
}

export interface Project extends ProjectFrontmatter {
  slug: string;
  content: string;
}

export type WriteCategory =
  | "Career"
  | "Data"
  | "AI"
  | "Delivery"
  | "Learning";

export interface WriteFrontmatter {
  title: string;
  summary: string;
  date: string;
  /**
   * Optional last-substantive-edit date (`YYYY-MM-DD`).
   * When set, drives sitemap lastModified, OG modifiedTime, and JSON-LD dateModified.
   * Omit on first publish — `date` is enough. Set when you revise an existing essay.
   */
  updated?: string;
  tags: string[];
  category: WriteCategory;
  /** Prefer in the Home “From the blog” strip (article teasers). */
  featured?: boolean;
  /** Prefer in the Home “Selected work” strip (system / project showcases). */
  showcase?: boolean;
}

export interface Write extends WriteFrontmatter {
  slug: string;
  content: string;
  readingTime: number;
}
