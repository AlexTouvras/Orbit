import type { ProjectStatus } from "@/lib/project-status";

/**
 * Public products on `/products`.
 * A product is a page or a command a stranger can open.
 * Workshop projects stay in Studio (`data/published-projects.json`).
 *
 * Delivery Signal's page is not copied into this repo. `/delivery-signal`
 * reads `docs/` from `AlexTouvras/delivery-signal` `main` and caches it for
 * a minute, so a push there is the version on this site. The checker
 * `engine/pipeline.py` is `src/delivery-signal/pipeline.py` in this repo,
 * so the brief opens with the week. The open URL is `index.html` so the
 * page's own files resolve next to it.
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
    pageUrl: "/delivery-signal/index.html",
  },
];
