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
    slug: "power",
    title: "Finland Power Pulse",
    question: "Is Finland importing because the wind dropped?",
    cadence: "15-minute snapshot",
    status: "live",
    kind: "native",
    source: "Energy-Charts public power (FI)",
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
];

export function getLiveDesk(slug: string): LiveDesk | undefined {
  return liveDesks.find((d) => d.slug === slug);
}

export function liveDeskSlugs(): string[] {
  return liveDesks.filter((d) => d.status === "live").map((d) => d.slug);
}
