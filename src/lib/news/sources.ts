import type { NewsCategory } from "@/lib/types";

export interface FeedSource {
  /** Human-readable publication name shown on the card. */
  name: string;
  /** RSS/Atom feed URL. */
  url: string;
  /** Which radar lane this feed belongs to. */
  category: NewsCategory;
}

/**
 * Add a new feed by dropping one entry here — no UI changes required.
 * Each feed is fetched independently; a single broken feed never breaks the rest.
 */
export const FEED_SOURCES: FeedSource[] = [
  // --- AI ---
  {
    name: "OpenAI Blog",
    url: "https://openai.com/blog/rss.xml",
    category: "AI",
  },
  {
    name: "AI News",
    url: "https://artificialintelligence-news.com/feed/",
    category: "AI",
  },

  // --- Data ---
  {
    name: "Data Engineering Weekly",
    url: "https://www.dataengineeringweekly.com/feed",
    category: "Data",
  },
  {
    name: "Towards Data Science",
    url: "https://medium.com/feed/towards-data-science",
    category: "Data",
  },

  // --- Delivery (Agile / Scrum / Kanban / CD) ---
  {
    name: "InfoQ — Continuous Delivery",
    url: "https://www.infoq.com/feed/continuous_delivery/",
    category: "Delivery",
  },
  {
    name: "InfoQ — Agile",
    url: "https://www.infoq.com/feed/agile/",
    category: "Delivery",
  },
  {
    name: "Mountain Goat Software",
    url: "https://www.mountaingoatsoftware.com/blog/rss",
    category: "Delivery",
  },
  {
    name: "Personal Kanban",
    url: "https://www.personalkanban.com/feed/",
    category: "Delivery",
  },
  {
    name: "Crisp Blog",
    url: "https://blog.crisp.se/feed",
    category: "Delivery",
  },

  // --- Analytics (Power BI / Fabric) ---
  {
    name: "Microsoft Fabric Blog",
    url: "https://www.microsoft.com/en-us/microsoft-fabric/blog/feed/",
    category: "Analytics",
  },
  {
    name: "SQLBI",
    url: "https://www.sqlbi.com/feed/",
    category: "Analytics",
  },
  {
    name: "Chris Webb's BI Blog",
    url: "https://blog.crossjoin.co.uk/feed/",
    category: "Analytics",
  },
];

export const NEWS_CATEGORIES: NewsCategory[] = [
  "AI",
  "Data",
  "Delivery",
  "Analytics",
];
