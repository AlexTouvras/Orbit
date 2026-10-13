# Handbooks

Owner of the handbook layer. `WEBSITE_ARCHITECTURE.md` only points here.

Authorized 2026-10-13 from the owner’s brief: field cards are good enough to grow a method layer. Edition 1 is one handbook and three chapters. The prose in `src/content/handbooks.ts` is assembled from lines already public on this site (the chain, the field cards). A sentence tagged Hypothesis is a test, including the synthetic inbox. Owner edits judgments in that file.

## Role

| Layer | Question | Where |
|-------|----------|--------|
| Field card | What is this field, and what do I believe? | `/field-card/`, `/analytics-field-card/`, `/delivery-field-card/`, `/sdlc-field-card/`, `/credit-risk-field-card/`, `/story-field-card/` |
| Handbook | How do I approach the problem, and how do I work? | `/handbooks` |
| Story or essay | What happened when the method met a problem? | `/stories`, `/writes` |

The layers do not repeat each other. A handbook points at a card. It does not paste the card.

## Series

1. **Building intelligent systems** — flagship. Edition 1, three chapters: a principle, a method, a worked example. Route: `/handbooks/building-intelligent-systems`.
2. Engineering reliable delivery — named, not written. SDLC and technology delivery.
3. Data that drives decisions — named, not written.
4. Decision systems under uncertainty — named, not written. Credit and AI.
5. Leading through systems — named, not written.

Do not open 2–5 until edition 1 has been read and the format still holds.

## Chapter standard

Every chapter uses these sections, in order:

1. The problem
2. The principle
3. The decision framework
4. The operating method
5. The tools
6. The trade-offs
7. The evidence
8. The field application

A section may carry one mark:

- **Operating principle** — a rule used on a release.
- **Practice I treat as given** — ordinary in the work, with no paper cited that was not opened.
- **Hypothesis** — including any synthetic scene. The scene says it is synthetic in the first line of that section.

The chain on the page is the locked chain: business problem, data, intelligent system, delivery, measured outcome. Do not invent a second chain.

## Routes

- `/handbooks` — the library.
- `/handbooks/building-intelligent-systems` — the flagship.
- `/handbooks/building-intelligent-systems/[chapter]` — one chapter, with a jump list, previous and next, and the same useful/note form as an essay.

Source: `src/content/handbooks.ts`.

## Out of scope

- Mixing handbooks into `/writes` or `/stories`.
- One handbook per field card.
- A PDF, a second interactive platform, or a Hub redesign to advertise the layer.
- Employer-confidential scenes. Synthetic only, labeled.
- Publishing the later handbooks as empty routes.
