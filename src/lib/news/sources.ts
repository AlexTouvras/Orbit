import type { NewsCategory } from "@/lib/types";

export interface FeedSource {
  /** Human-readable publication name shown on the card. */
  name: string;
  /** RSS/Atom feed URL. */
  url: string;
  /** Which Related articles lane this feed belongs to. */
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
    // Replaces AI News (artificialintelligence-news.com) — that host returns 403 to feed clients.
    name: "Simon Willison",
    url: "https://simonwillison.net/atom/everything/",
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
  // InfoQ topic feeds for Continuous Delivery / Agile barely update (often years stale).
  // Prefer Martin Fowler + InfoQ DevOps for fresher Delivery coverage.
  {
    name: "Martin Fowler",
    url: "https://martinfowler.com/feed.atom",
    category: "Delivery",
  },
  {
    name: "InfoQ — DevOps",
    url: "https://www.infoq.com/feed/DevOps/",
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
