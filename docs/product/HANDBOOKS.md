# Handbooks

Owner of the handbook layer. `WEBSITE_ARCHITECTURE.md` only points here.

Authorized 2026-10-13 from the owner’s brief: field cards are good enough to grow a method layer. On 2026-10-14 the owner set the first book on the SDLC field card, and set the reading unit to a page. The same day the owner rejected a book of short restatements: a page has to be a useful deep dive, researched, and written one at a time. Source of the prose: `src/content/handbooks.ts`. Owner edits judgments there.

## Role

| Layer | Question | Where |
|-------|----------|--------|
| Field card | What is this field, and what do I believe? | `/field-card/`, `/analytics-field-card/`, `/delivery-field-card/`, `/sdlc-field-card/`, `/credit-risk-field-card/`, `/story-field-card/` |
| Handbook | How do I approach the problem, and how do I work? | `/handbooks` |
| Story or essay | What happened when the method met a problem? | `/stories`, `/writes` |

The layers do not repeat each other. A handbook does not paste a card, and it does not become a story.

## How a page gets written

One page at a time. Research the practice before the prose. Name the sources that were opened, on the page. Do not fill later pages in the same change. A page that restates the field card is not a page.

A page may carry one mark:

- **Operating principle** — a rule used on a change.
- **Practice I treat as given** — ordinary in the work. The source was opened.
- **Hypothesis** — including any synthetic scene. The scene says it is synthetic in the first line of that page.

The note form sits on the last written page.

## Series

1. **Software that stays in use** — in progress. Extends the SDLC field card. Page 1, “Keep main releasable”, is the continuous-integration practice: daily merge to main, a self-testing commit build, and why rare integration is how a codebase decays. Sources opened 2026-10-14: Fowler’s Continuous Integration (18 Jan 2024), Hammant’s trunk-based development, Vocke’s Practical Test Pyramid, NIST SP 800-218 (PW.1). Microsoft SDL and OWASP ASVS were opened the same day and are not used on this page. Route: `/handbooks/software-that-stays-in-use`. Page: `/handbooks/software-that-stays-in-use/1`.
2. Engineering reliable delivery — named, not written. For the technology delivery field card.
3. Data that drives decisions — named, not written. For the data analytics field card.
4. Decision systems under uncertainty — named, not written. For the credit risk field card.

Calendars, blast-radius proof, and the cutover sequence stay on the delivery card. Do not write page 2 until page 1 has been read.

## Routes

- `/handbooks` — the library. One row per handbook.
- `/handbooks/software-that-stays-in-use` — the cover. Contents lists written pages only.
- `/handbooks/software-that-stays-in-use/[page]` — one page.

## Out of scope

- Mixing handbooks into `/writes` or `/stories`.
- A chain handbook that treats every card as one parent.
- Pasting the SDLC picture, or adding an eighth named practice.
- Writing the rest of the book in advance of reading the page that exists.
- A PDF, a page-flip animation, or a Hub redesign to advertise the layer.
- Employer-confidential scenes. Synthetic only, labeled.
- Publishing the later handbooks as empty routes.
