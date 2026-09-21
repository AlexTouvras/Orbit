/**
 * Registry of field cards that Orbit can preview / Approve / sync from a
 * source repo. Token payloads already carry `repo`; this maps each repo to
 * site paths + labels.
 *
 * Orbit-hosted cards (SDLC, Credit Risk, Bayesian optimisation) are reviewed
 * **monthly** on this repo. Do not add them here until a GitHub source repo
 * exists — monthly Apply review iterates this list. Bayes is a method card
 * and should not get a source repo or a Hub competency tile.
 */
export type FieldCardId = "agentic-ai" | "data-analytics" | "technology-delivery";

export interface FieldCardConfig {
  id: FieldCardId;
  /** GitHub owner/repo that owns the canonical index.html */
  repo: string;
  /** Path inside Orbit after Approve sync */
  orbitPath: string;
  /** Soft URL on alextouvras.com */
  sitePath: string;
  /** GitHub Pages URL after merge to main */
  pagesUrl: string;
  /** Short label for confirm pages / Slack follow-ups */
  label: string;
}

export const FIELD_CARDS: readonly FieldCardConfig[] = [
  {
    id: "agentic-ai",
    repo: "AlexTouvras/agentic-ai-field-card",
    orbitPath: "public/field-card/index.html",
    sitePath: "/field-card/index.html",
    pagesUrl: "https://alextouvras.github.io/agentic-ai-field-card/",
    label: "Agentic AI Field Card",
  },
  {
    id: "data-analytics",
    repo: "AlexTouvras/data-analytics-field-card",
    orbitPath: "public/analytics-field-card/index.html",
    sitePath: "/analytics-field-card/index.html",
    pagesUrl: "https://alextouvras.github.io/data-analytics-field-card/",
    label: "Data Analytics Field Card",
  },
  {
    id: "technology-delivery",
    repo: "AlexTouvras/technology-delivery-field-card",
    orbitPath: "public/delivery-field-card/index.html",
    sitePath: "/delivery-field-card/index.html",
    pagesUrl: "https://alextouvras.github.io/technology-delivery-field-card/",
    label: "Technology Delivery Field Card",
  },
] as const;

const byRepo = new Map(FIELD_CARDS.map((c) => [c.repo.toLowerCase(), c]));

export function getFieldCardConfig(repoSlug: string): FieldCardConfig | null {
  return byRepo.get(repoSlug.trim().toLowerCase()) ?? null;
}

export function requireFieldCardConfig(repoSlug: string): FieldCardConfig {
  const cfg = getFieldCardConfig(repoSlug);
  if (!cfg) {
    throw new Error(
      `Unknown field-card repo: ${repoSlug}. Register it in src/lib/field-card/registry.ts`,
    );
  }
  return cfg;
}
