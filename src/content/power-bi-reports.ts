export interface PowerBiReportPage {
  id: string;
  label: string;
  caption: string;
  src: string;
}

export interface PowerBiReport {
  id: string;
  title: string;
  summary: string;
  repoUrl?: string;
  pages: PowerBiReportPage[];
}

/**
 * Portfolio Power BI showcase catalog.
 * To add a report: copy page PNGs under public/portfolio/power-bi/{slug}/,
 * then append an entry here — the side list updates automatically.
 */
export const powerBiReports: PowerBiReport[] = [
  {
    id: "churn",
    title: "E-commerce Churn Retention",
    summary:
      "Nordic Boardroom retention report: churn rate and propensity, driver analysis, and an at-risk intervention queue.",
    repoUrl: "https://github.com/AlexTouvras/powerbi-portfolio",
    pages: [
      {
        id: "retention-pulse",
        label: "Retention Pulse",
        caption: "KPI strip and churn rate by tenure band — status in seconds.",
        src: "/portfolio/power-bi/churn/retention-pulse.png",
      },
      {
        id: "churn-drivers",
        label: "Churn Drivers",
        caption:
          "Key Influencers, decomposition, and payment × city-tier matrix.",
        src: "/portfolio/power-bi/churn/churn-drivers.png",
      },
      {
        id: "at-risk-queue",
        label: "At-Risk Queue",
        caption:
          "Customers ranked by churn probability with risk, city, and satisfaction slicers.",
        src: "/portfolio/power-bi/churn/at-risk-queue.png",
      },
    ],
  },
  {
    id: "sales",
    title: "Sales Executive",
    summary:
      "C-level portfolio health: revenue status, then self-serve into product drivers and customer/market concentration.",
    repoUrl: "https://github.com/AlexTouvras/powerbi-portfolio",
    pages: [
      {
        id: "portfolio-pulse",
        label: "Portfolio Pulse",
        caption:
          "KPI strip with YoY, monthly revenue trend, and category mix.",
        src: "/portfolio/power-bi/sales/portfolio-pulse.png",
      },
      {
        id: "performance-drivers",
        label: "Performance Drivers",
        caption:
          "Category and product line filters with top products, margin, and YoY callouts.",
        src: "/portfolio/power-bi/sales/performance-drivers.png",
      },
      {
        id: "customer-market",
        label: "Customer & Market",
        caption:
          "Country revenue and YoY, top customers, and concentration KPIs.",
        src: "/portfolio/power-bi/sales/customer-market.png",
      },
    ],
  },
];
