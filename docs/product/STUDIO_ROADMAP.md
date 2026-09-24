# Studio — Career & Website Roadmap

## Purpose

Studio is the private operational layer for **WHERE IS ALEX GOING?**

It tracks two connected trajectories:

1. Career
2. Website / public evidence

Connect: **Capability → Evidence → Public Proof → Opportunity**

## Privacy

- Owner-only (`/studio`, existing auth)
- `noindex`
- Never auto-publish notes or confidential employer detail
- `focusNow` is Studio trajectory copy only (not shown on `/card`)

## Milestone statuses

| Status | Means |
|--------|--------|
| **PLANNED** | I intend to do this. |
| **ACTIVE** | I am currently doing this. |
| **EVIDENCE** | I have produced something demonstrating this capability. |
| **PROVEN** | I have demonstrated this capability in a meaningful real-world context. |

Examples:

- “Learn AI agents” → ACTIVE ≠ proven capability
- “Built an evaluated multi-agent workflow” → EVIDENCE
- “Used an AI workflow to solve a real organizational problem” → PROVEN

Do not mark something PROVEN because a course or certification finished.

## Foundation (shipped)

Website infrastructure milestones are **EVIDENCE** (docs, positioning, Studio roadmap). That does **not** make the career archetype PROVEN.

HUd shows STATEMENT only. `focusNow` stays in Studio.

## Evidence Layer (active)

Goal: demonstrate that “AI & Data Systems Lead” is supported by visible work, not only a title.

Sequence:

1. **Evidence audit** — re-done 2026-09-24 in `EVIDENCE_AUDIT.md`
2. **Chain gap** — question, data, and delivery of a reading system are public. Intelligent system and measured outcome stay thin.
3. **Flagship** — the storytelling system (owner 2026-09-24). One grammar: Hub, Portfolio, live desks. Spec: `.cursor/skills/visual-storytelling`.
4. **First story** — Hub Open (`LiveProofStream` under the thesis). Almost ready: browser pass, then the width call (wide atmosphere vs the shared column).
5. **Next stories** — the same grammar, one decision at a time. A Decision Intelligence Lab can be one of those stories later. It is not the flagship.
6. **Archetype PROVEN** — when visitors conclude it themselves. Hub Open shipping does not do that.

Do not start another architecture/foundation phase while the first story is unfinished.

## Review cadence

At each review:

1. What was completed?
2. What became evidence?
3. What is active?
4. What is blocked?
5. What is no longer relevant?
6. What is the next highest-leverage milestone?

## Persistence

Use existing Studio `persistDataJson` / profile-store pattern. Do not invent a second persistence architecture.

## Logical shape

```text
Roadmap {
  focusNow: string          // Studio only; not on /card
  updatedAt: ISO string
  milestones: [{
    id, title, track: career|website|evidence,
    status: planned|active|evidence|proven,
    notes?: string          // never auto-published
    links?: { href, label }[]
  }]
}
```
