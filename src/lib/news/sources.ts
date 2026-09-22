import type { NewsCategory } from "@/lib/types";

export interface FeedSource {
  /** Human-readable publication name shown on the card. */
  name: string;
  /** RSS/Atom feed URL. */
  url: string;
  /** Which Related articles lane this feed belongs to. */
  category: NewsCategory;
  /**
   * Cap items retained from this feed (default 20).
   * Use a lower cap for high-frequency publishers so they do not drown quieter lanes.
   */
  maxItems?: number;
}

/**
 * Add a new feed by dropping one entry here — no UI changes required.
 * Each feed is fetched independently; a single broken feed never breaks the rest.
 *
 * Balance notes:
 * - AI publishes daily; other lanes are often weekly — keep AI sources few
 *   and prefer posts over link-dumps (Simon `entries` vs `everything`).
 * - Lab research (DeepMind, Google Research, Anthropic) stays in AI with a
 *   low cap. Anthropic publishes no RSS; the Turing Institute mirror is
 *   oldest-first, so the fetcher sorts by date before applying maxItems.
 * - Economics and Credit are research and supervision, not newswires.
 */
export const FEED_SOURCES: FeedSource[] = [
  // --- AI (keep lean — high publish rate) ---
  {
    name: "OpenAI Blog",
    url: "https://openai.com/blog/rss.xml",
    category: "AI",
    maxItems: 8,
  },
  {
    // Blog posts only — `/atom/everything/` also includes quotes/link-dumps and floods "All".
    name: "Simon Willison",
    url: "https://simonwillison.net/atom/entries/",
    category: "AI",
    maxItems: 8,
  },
  {
    name: "Google DeepMind",
    url: "https://deepmind.google/blog/rss.xml",
    category: "AI",
    maxItems: 5,
  },
  {
    name: "Google Research",
    url: "https://research.google/blog/rss/",
    category: "AI",
    maxItems: 6,
  },
  {
    // anthropic.com/research has no RSS link. Alan Turing Institute mirror.
    name: "Anthropic Research",
    url: "https://raw.githubusercontent.com/alan-turing-institute/ai-rss-feeds/refs/heads/main/feeds/anthropic-research.xml",
    category: "AI",
    maxItems: 6,
  },

  // --- Data (engineering / platforms) ---
  {
    name: "Data Engineering Weekly",
    url: "https://www.dataengineeringweekly.com/feed",
    category: "Data",
  },
  {
    name: "Databricks Blog",
    url: "https://www.databricks.com/feed",
    category: "Data",
  },
  {
    name: "DuckDB",
    url: "https://duckdb.org/feed.xml",
    category: "Data",
  },
  {
    name: "MotherDuck",
    url: "https://motherduck.com/rss.xml",
    category: "Data",
  },
  {
    name: "Dagster",
    url: "https://dagster.io/blog/rss.xml",
    category: "Data",
  },

  // --- Delivery (Agile / Scrum / CD) ---
  {
    name: "Martin Fowler",
    url: "https://martinfowler.com/feed.atom",
    category: "Delivery",
  },
  {
    name: "Mountain Goat Software",
    url: "https://www.mountaingoatsoftware.com/blog/rss",
    category: "Delivery",
  },
  {
    name: "Crisp Blog",
    url: "https://blog.crisp.se/feed",
    category: "Delivery",
  },
  {
    name: "Scrum.org",
    url: "https://www.scrum.org/resources/blog/rss.xml",
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
  {
    name: "RADACAD",
    url: "https://radacad.com/feed",
    category: "Analytics",
  },
  {
    name: "Data Mozart",
    url: "https://data-mozart.com/feed/",
    category: "Analytics",
  },

  // --- Economics (columns and working papers, not market wires) ---
  {
    name: "VoxEU",
    url: "https://cepr.org/rss/vox-content",
    category: "Economics",
    maxItems: 8,
  },
  {
    name: "BIS Research",
    url: "https://www.bis.org/doclist/reshub_papers.rss",
    category: "Economics",
    maxItems: 8,
  },

  // --- Credit (banking supervision and financial stability) ---
  {
    name: "BIS Financial Stability",
    url: "https://www.bis.org/doclist/bis_fsi_publs.rss",
    category: "Credit",
    maxItems: 8,
  },
  {
    name: "Bank of England PRA",
    url: "https://www.bankofengland.co.uk/rss/prudential-regulation-publications",
    category: "Credit",
    maxItems: 6,
  },
];

export const NEWS_CATEGORIES: NewsCategory[] = [
  "AI",
  "Data",
  "Delivery",
  "Analytics",
  "Economics",
  "Credit",
];
