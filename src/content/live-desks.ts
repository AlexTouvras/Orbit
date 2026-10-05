export type LiveDeskStatus = "live" | "queued";
export type LiveDeskKind = "native" | "board";

export type LiveDesk = {
  slug: string;
  title: string;
  question: string;
  cadence: string;
  status: LiveDeskStatus;
  kind: LiveDeskKind;
  source: string;
};

export const HEATMAP_BOARD_URL = "https://heatmap-web-five.vercel.app";

export const liveDesks: LiveDesk[] = [
  {
    slug: "nordic-equity",
    title: "Nordic Equity",
    question: "Which big Nordic stocks moved today?",
    cadence: "Weekday gold · delayed quotes",
    status: "live",
    kind: "board",
    source: "Yahoo delayed · heatmap-web",
  },
  {
    slug: "eu-spot",
    title: "EU Spot",
    question: "Where is electricity expensive today?",
    cadence: "Day-ahead · after ~14:00 Helsinki",
    status: "live",
    kind: "native",
    source: "ENTSO-E Transparency · all domains",
  },
  {
    slug: "housing",
    title: "Helsinki Housing",
    question: "Are Helsinki flats still rising in price?",
    cadence: "Monthly · ~1 month lag",
    status: "live",
    kind: "native",
    source: "Statistics Finland · ashi · CC BY 4.0",
  },
  {
    slug: "power-mix",
    title: "Europe Power Mix",
    question: "What is Europe making its electricity from today?",
    cadence: "Last 24h · daily refresh",
    status: "live",
    kind: "native",
    source: "Energy-Charts · ENTSO-E / TSO",
  },
  {
    slug: "economy",
    title: "Europe Economy Pulse",
    question: "How is the euro area economy doing?",
    cadence: "Monthly · Eurostat + ECB",
    status: "live",
    kind: "native",
    source: "Eurostat · ECB Data Portal",
  },
  {
    slug: "which-model",
    title: "Which model?",
    question: "Which model should I use for this job?",
    cadence: "Monthly · OpenRouter catalog",
    status: "live",
    kind: "native",
    source: "OpenRouter · Artificial Analysis",
  },
];

export function getLiveDesk(slug: string): LiveDesk | undefined {
  return liveDesks.find((d) => d.slug === slug);
}

export function liveDeskSlugs(): string[] {
  return liveDesks.filter((d) => d.status === "live").map((d) => d.slug);
}
