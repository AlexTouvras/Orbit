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
    question: "Which Nordic large-caps moved today?",
    cadence: "Weekday gold · delayed quotes",
    status: "live",
    kind: "board",
    source: "Yahoo delayed · heatmap-web",
  },
  {
    slug: "eu-spot",
    title: "EU Spot",
    question: "Where is Europe expensive tonight?",
    cadence: "Day-ahead · after ~14:00 Helsinki",
    status: "live",
    kind: "native",
    source: "ENTSO-E Transparency · all domains",
  },
  {
    slug: "housing",
    title: "Helsinki Housing",
    question: "Are Helsinki €/m² still rising?",
    cadence: "Monthly · ~1 month lag",
    status: "live",
    kind: "native",
    source: "Statistics Finland · ashi · CC BY 4.0",
  },
  {
    slug: "power-mix",
    title: "Europe Power Mix",
    question: "What is Europe generating from today?",
    cadence: "Last 24h · daily refresh",
    status: "live",
    kind: "native",
    source: "Energy-Charts · ENTSO-E / TSO",
  },
];

export function getLiveDesk(slug: string): LiveDesk | undefined {
  return liveDesks.find((d) => d.slug === slug);
}

export function liveDeskSlugs(): string[] {
  return liveDesks.filter((d) => d.status === "live").map((d) => d.slug);
}
