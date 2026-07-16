import type { WriteCategory } from "@/lib/types";
import type {
  WeeklyIntake,
  WeeklyIntakeProject,
  WeeklyIntakeSignal,
} from "@/lib/weekly-write/types";

/** One essay thesis — not a weekly digest. */
export interface EssayThesis {
  angle: string;
  question: string;
  primary: WeeklyIntakeSignal;
  supporting: WeeklyIntakeSignal[];
  bridgeProject: WeeklyIntakeProject | null;
  category: WriteCategory;
  tags: string[];
  whyInteresting: string;
}

const INTEREST_PATTERNS: { re: RegExp; weight: number; tag?: string }[] = [
  { re: /\bpower\s*bi\b|\bpbir\b|\bfabric\b|\bdax\b|\bsemantic model\b/i, weight: 12, tag: "Power BI" },
  { re: /\banalytics\b|\bdashboard\b|\breport(ing)?\b|\bkpi\b/i, weight: 8, tag: "Analytics" },
  { re: /\bagentic\b|\bagent(s)?\b|\bmulti-?agent\b/i, weight: 10, tag: "Agents" },
  { re: /\bllm\b|\bgpt\b|\bclaude\b|\bgemini\b|\bmodel\b|\bai\b/i, weight: 7, tag: "AI" },
  { re: /\bsafety\b|\balignment\b|\beval\b|\bred\s*team/i, weight: 9, tag: "AI Safety" },
  { re: /\bdata\s*engineer|\bpipeline\b|\betl\b|\bwarehouse\b/i, weight: 7, tag: "Data" },
  { re: /\bazure\b|\bdevops\b|\bdelivery\b|\bplatform\b/i, weight: 6, tag: "Delivery" },
  { re: /\bautomation\b|\borchestr/i, weight: 6, tag: "Automation" },
];

function scoreSignal(s: WeeklyIntakeSignal): number {
  const hay = `${s.title} ${s.snippet} ${s.source} ${s.category}`;
  let score = 1;
  for (const p of INTEREST_PATTERNS) {
    if (p.re.test(hay)) score += p.weight;
  }
  if (s.category === "AI") score += 3;
  if (s.category === "Data" || s.category === "Analytics") score += 4;
  if (s.category === "Delivery") score += 2;
  // Prefer pieces with a real claim in the snippet.
  if ((s.snippet?.length ?? 0) > 80) score += 2;
  return score;
}

function categoryForSignal(s: WeeklyIntakeSignal): WriteCategory {
  const hay = `${s.title} ${s.snippet}`.toLowerCase();
  if (/power\s*bi|fabric|dax|dashboard|analytics|credit risk/.test(hay))
    return "Data";
  if (s.category === "Data" || s.category === "Analytics") return "Data";
  if (s.category === "Delivery" || /azure|devops|delivery|platform/.test(hay))
    return "Delivery";
  if (s.category === "AI" || /ai|llm|agent|model/.test(hay)) return "AI";
  return "Learning";
}

function tagsFor(primary: WeeklyIntakeSignal, project: WeeklyIntakeProject | null): string[] {
  const tags = new Set<string>();
  for (const p of INTEREST_PATTERNS) {
    if (p.tag && p.re.test(`${primary.title} ${primary.snippet}`)) tags.add(p.tag);
  }
  if (primary.category === "AI") tags.add("AI");
  if (primary.category === "Data" || primary.category === "Analytics") tags.add("Analytics");
  if (project) {
    for (const t of project.tags.slice(0, 2)) tags.add(t);
  }
  return Array.from(tags).slice(0, 6);
}

function pickBridgeProject(
  intake: WeeklyIntake,
  primary: WeeklyIntakeSignal,
): WeeklyIntakeProject | null {
  if (intake.projects.length === 0) return null;
  const hay = `${primary.title} ${primary.snippet}`.toLowerCase();
  const scored = intake.projects.map((p) => {
    const ph = `${p.name} ${p.description} ${p.tags.join(" ")}`.toLowerCase();
    let s = 0;
    // Prefer real operating-system projects for agent / AI-ops essays.
    if (
      /agent|orchestr|investment|operating model|governance|eval/.test(hay) &&
      /jarvis|helm|orbit|orchestr|mcp|agent|studio|portfolio/.test(ph)
    ) {
      s += 8;
    }
    if (
      /power\s*bi|fabric|dashboard|analytics|report|dax|semantic/.test(hay) &&
      /data|bi|analytics|dashboard|fabric|power/.test(ph)
    ) {
      s += 8;
    }
    if (
      /career|cv|job|hiring/.test(hay) &&
      /career|cv|job|digest/.test(ph)
    ) {
      s += 8;
    }
    // Weak generic "AI" tag matches are not enough on their own.
    if (s === 0 && /llm|mcp|orchestr|semantic model/.test(ph) && /llm|mcp|model/.test(hay)) {
      s += 3;
    }
    return { p, s };
  });
  scored.sort((a, b) => b.s - a.s);
  // Only bridge when the project actually relates — never force a random WIP.
  return scored[0]!.s >= 3 ? scored[0]!.p : null;
}

function inventQuestion(primary: WeeklyIntakeSignal): string {
  const t = primary.title.replace(/\s+/g, " ").trim();
  // Prefer a decision-shaped question over "what happened in the news".
  if (/power\s*bi|fabric|dashboard|report/i.test(t)) {
    return `What actually changes in how we build analytics when ${t.toLowerCase().includes("hierarchy") ? "formatting and hierarchy rules get serious" : "the reporting stack keeps moving"}?`;
  }
  if (/agent/i.test(t)) {
    return `If agentic systems are becoming the unit of work, what should a delivery or analytics lead actually change first?`;
  }
  if (/safety|alignment|governance/i.test(t)) {
    return `When AI capability jumps again, what does responsible adoption look like outside a research lab?`;
  }
  return `What is worth taking seriously about "${t}" — and what should we ignore?`;
}

/**
 * Choose one essay thesis from Signals (+ optional project bridge).
 * Rejects digest framing: one primary inspiration, not a week-in-review.
 */
export function pickEssayThesis(intake: WeeklyIntake): EssayThesis | null {
  if (intake.signals.length === 0) return null;

  const ranked = [...intake.signals]
    .map((s) => ({ s, score: scoreSignal(s) }))
    .sort((a, b) => b.score - a.score);

  const primary = ranked[0]!.s;
  const supporting = ranked
    .slice(1)
    .filter((r) => r.score >= ranked[0]!.score * 0.45)
    .slice(0, 2)
    .map((r) => r.s);

  const bridgeProject = pickBridgeProject(intake, primary);
  const category = categoryForSignal(primary);

  return {
    angle: primary.title,
    question: inventQuestion(primary),
    primary,
    supporting,
    bridgeProject,
    category,
    tags: tagsFor(primary, bridgeProject),
    whyInteresting: primary.snippet || primary.title,
  };
}
