import type { ProjectStatus } from "@/lib/project-status";

/**
 * Public products on `/portfolio#products`.
 * A product is a page or a command a stranger can open.
 * Workshop projects stay in Studio (`data/published-projects.json`).
 *
 * `pageUrl` has to be a URL that already opens. Delivery Signal names
 * https://alextouvras.github.io/delivery-signal/ as its address, and that
 * host 404s until GitHub Pages is `main` / `docs`. Until then the page is
 * the preview URL in that repo's README.
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  tags: string[];
  repoUrl: string;
  pageUrl: string;
}

export const products: Product[] = [
  {
    id: "delivery-signal",
    name: "Delivery Signal",
    description:
      "A weekly delivery brief from a Jira, Azure DevOps, or other work-item export. The page says what changed, which work needs attention, and which decision is waiting. Every material claim cites a field. The export stays on the device.",
    status: "shipped",
    tags: ["Delivery", "Jira", "Azure DevOps"],
    repoUrl: "https://github.com/AlexTouvras/delivery-signal",
    pageUrl:
      "https://htmlpreview.github.io/?https://github.com/AlexTouvras/delivery-signal/blob/main/docs/index.html",
  },
];
