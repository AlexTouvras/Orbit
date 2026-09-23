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

## Evidence Layer (next)

Goal: demonstrate that “AI & Data Systems Lead” is supported by visible work, not only a title.

Sequence:

1. **Evidence audit** — inventory projects, desks, essays, AI / data / delivery / FS work; classify by what each proves
2. **Find the chain gap** — Business problem → Data → Intelligent system → Delivery → Measurable outcome
3. **One flagship** — only after the audit (Decision Intelligence Lab is a candidate, not automatic)
4. **Case study + interactive proof** — then repeat 2–3 times
5. **Archetype PROVEN** — when visitors conclude it themselves (6–12 months)

Do not start another architecture/foundation phase. Do not build the Lab before the audit.

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
