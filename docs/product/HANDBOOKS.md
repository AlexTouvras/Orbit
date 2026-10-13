# Handbooks

Owner of the handbook layer. `WEBSITE_ARCHITECTURE.md` only points here.

Authorized 2026-10-13 from the owner’s brief: field cards are good enough to grow a method layer. Edition 1 is one handbook and three chapters. The prose in `src/content/handbooks.ts` is assembled from lines already public on this site (the chain, the field cards). A sentence tagged Hypothesis is a test, including the synthetic inbox. Owner edits judgments in that file.

## Role

| Layer | Question | Where |
|-------|----------|--------|
| Field card | What is this field, and what do I believe? | `/field-card/`, `/analytics-field-card/`, `/delivery-field-card/`, `/sdlc-field-card/`, `/credit-risk-field-card/`, `/story-field-card/` |
| Handbook | How do I approach the problem, and how do I work? | `/handbooks` |
| Story or essay | What happened when the method met a problem? | `/stories`, `/writes` |

The layers do not repeat each other. A handbook does not paste a card, and it does not become a story.

## Continuity

Edition 1 is the chain, not a field.

1. **Building intelligent systems** runs across the cards: business problem, data, intelligent system, delivery, measured outcome. It cites a card where a sentence comes from that card. The storytelling card is one citation. It is not the parent of this handbook.
2. A later handbook may go deep on one card. Those stay unwritten.
3. A story stays a published decision. A chapter may link one inside the section that is about that decision.

The public page language stays the shared column, the two-line title, and numbered rows.

## Series

1. **Building intelligent systems** — published. The chain. Three chapters: a principle, a method, a worked example. Route: `/handbooks/building-intelligent-systems`.
2. Engineering reliable delivery — named, not written. For the technology delivery field card.
3. Data that drives decisions — named, not written. For the data analytics field card.
4. Decision systems under uncertainty — named, not written. For the credit risk field card.

The AI card and the SDLC card stay cards. Do not open 2–4 until edition 1 has been read and the format still holds.

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
- Treating the chain handbook as an extension of one field card.
- A PDF, a second interactive platform, or a Hub redesign to advertise the layer.
- Employer-confidential scenes. Synthetic only, labeled.
- Publishing the later handbooks as empty routes.
