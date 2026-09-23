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
- Only `focusNow` may feed the public HUd

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

## Foundation vs career achievement

**Orbit 2.0 Foundation creates the tracking system.** It does not create new career evidence.

Foundation seed milestones (infrastructure / website track):

1. Product docs + agent hooks live
2. Public positioning aligned (Hub + HUD + About)
3. Studio roadmap v1 private
4. HUD NOW wired from Studio (`focusNow` only)

Career-track EVIDENCE/PROVEN items are owner-added **after** Foundation ships.

## Review cadence

At each review:

1. What was completed?
2. What became evidence?
3. What is active?
4. What is blocked?
5. What is no longer relevant?
6. What is the next highest-leverage milestone?

## Persistence

Inspect how Studio already persists JSON (`persistDataJson`, profile/projects pattern). Implement the smallest compatible roadmap model. Do not invent a second persistence architecture.

## Logical shape

```text
Roadmap {
  focusNow: string          // ONLY field allowed on /card
  updatedAt: ISO string
  milestones: [{
    id, title, track: career|website|evidence,
    status: planned|active|evidence|proven,
    notes?: string          // never auto-published
    links?: { href, label }[]
  }]
}
```
