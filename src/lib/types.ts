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
