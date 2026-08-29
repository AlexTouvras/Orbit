import "server-only";

import type { FieldCardConfig } from "@/lib/field-card/registry";

export type FieldCardReviewOutcome = "published" | "kept_previous" | "blocked";

export interface FieldCardUpdateFyi {
  card: FieldCardConfig;
  /** published | kept_previous | blocked */
  outcome: FieldCardReviewOutcome;
  /** One short line: what entered / what changed (or why nothing did). */
  changed: string;
  /** One short line: what was considered for entry (candidates). Optional. */
  considered?: string;
  /** Whether the newest reviewed version is the live site card. */
  online: boolean;
  /** Extra status under Online (e.g. redeploy queued, previous still live). */
  onlineDetail?: string;
  /** Button target — live card by default; PR URL when blocked. */
  buttonUrl?: string;
  /** Button label — "Check card" or "Open PR". */
  buttonLabel?: string;
}

function trimLine(s: string, max = 160): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/** Pull 1–2 short lines from a PR ## Summary (bullets or Decision:). */
export function laconicChangeFromPrBody(body: string): {
  changed: string;
  considered: string;
} {
  const text = String(body || "").replace(/^\uFEFF/, "");
  const match = text.match(/(?:^|\n)##\s+Summary\b[^\n]*\n([\s\S]*?)(?=\n#{1,3}\s+|$)/i);
  const section = (match?.[1] || "").trim();
  if (!section) return { changed: "", considered: "" };

  const lines = section
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-*•]\s+/, "").replace(/^\s*\d+\.\s+/, "").trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith("```") && !/^Full report/i.test(l));

  const decision =
    lines.find((l) => /^Decision\s*:/i.test(l)) ||
    lines.find((l) => /no[- ]change|no HTML|published|update/i.test(l)) ||
    lines[0] ||
    "";
  const considered =
    lines.find((l) => /consider|candidate|deferred|review(ed)?\b/i.test(l) && l !== decision) ||
    "";

  return {
    changed: trimLine(decision, 180),
    considered: trimLine(considered, 180),
  };
}

function outcomeLabel(outcome: FieldCardReviewOutcome): string {
  switch (outcome) {
    case "published":
      return "published";
    case "kept_previous":
      return "kept previous";
    case "blocked":
      return "blocked";
  }
}

/**
 * One laconic #orbit post per card after weekly review.
 * Same shape for Agentic AI / Analytics / Delivery.
 */
export function buildFieldCardUpdateBlocks(fyi: FieldCardUpdateFyi): {
  text: string;
  blocks: Record<string, unknown>[];
} {
  const { card, outcome } = fyi;
  const changed = trimLine(fyi.changed || "—", 200);
  const considered = trimLine(fyi.considered || "", 200);
  const onlineLine = fyi.online
    ? `yes${fyi.onlineDetail ? ` · ${trimLine(fyi.onlineDetail, 80)}` : ""}`
    : `no${fyi.onlineDetail ? ` · ${trimLine(fyi.onlineDetail, 80)}` : " · previous still live"}`;

  const buttonUrl =
    fyi.buttonUrl ||
    `${(process.env.NEXT_PUBLIC_SITE_URL || "https://alextouvras.com").replace(/\/$/, "")}${card.sitePath}`;
  const buttonLabel = fyi.buttonLabel || "Check card";

  const text = `${card.label} — ${outcomeLabel(outcome)}`;
  // Same fields every time (all three cards) so posts scan identically.
  const bodyLines = [
    `*${card.label}*`,
    `Review: ${outcomeLabel(outcome)}`,
    `Considered: ${considered || "none earned entry"}`,
    `Changed: ${changed}`,
    `Online: ${onlineLine}`,
  ];

  const button = {
    type: "button",
    text: { type: "plain_text", text: buttonLabel, emoji: true },
    url: buttonUrl,
    action_id: `field_card_check_${card.id}`,
    ...(outcome === "published" ? { style: "primary" as const } : {}),
  };

  const blocks: Record<string, unknown>[] = [
    {
      type: "section",
      text: { type: "mrkdwn", text: bodyLines.join("\n") },
    },
    {
      type: "actions",
      block_id: `field_card_fyi_${card.id}`,
      elements: [button],
    },
  ];

  return { text, blocks };
}

export async function notifyFieldCardUpdateFyi(
  fyi: FieldCardUpdateFyi,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const url =
    process.env.SLACK_ORBIT_WEBHOOK_URL?.trim() ||
    process.env.SLACK_WEBHOOK_URL?.trim();
  if (!url) return { ok: false, reason: "webhook_missing" };

  const { text, blocks } = buildFieldCardUpdateBlocks(fyi);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, blocks }),
  });

  if (!res.ok) {
    return { ok: false, reason: `slack_${res.status}` };
  }
  return { ok: true };
}
