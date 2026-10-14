# Handbooks

Owner of the handbook layer. `WEBSITE_ARCHITECTURE.md` only points here.

Authorized 2026-10-13 from the owner’s brief: field cards are good enough to grow a method layer. On 2026-10-14 the owner set the first book on the SDLC field card, and set the reading unit to a page. The prose in `src/content/handbooks.ts` stays inside lines already public on the SDLC card and the delivery card. A page tagged Hypothesis is a test, including the synthetic scoring rule. Owner edits judgments in that file.

## Role

| Layer | Question | Where |
|-------|----------|--------|
| Field card | What is this field, and what do I believe? | `/field-card/`, `/analytics-field-card/`, `/delivery-field-card/`, `/sdlc-field-card/`, `/credit-risk-field-card/`, `/story-field-card/` |
| Handbook | How do I approach the problem, and how do I work? | `/handbooks` |
| Story or essay | What happened when the method met a problem? | `/stories`, `/writes` |

The layers do not repeat each other. A handbook does not paste a card, and it does not become a story.

## A handbook is a book

The library lists each handbook as one row. The cover holds the contents. The reading unit is a numbered page, with a previous page and a next page. A chapter is a run of pages in the contents. It is not a long scrolling article.

A page may carry one mark:

- **Operating principle** — a rule used on a change.
- **Practice I treat as given** — ordinary in the work, with no paper cited that was not opened.
- **Hypothesis** — including any synthetic scene. The scene says it is synthetic in the first line of that page.

The note form sits on the last page.

## Series

1. **Software that stays in use** — published. Extends the SDLC field card. Sixteen pages: the change, plan and design, build and verify, release and deploy, maintain and improve, then a Monday page. Route: `/handbooks/software-that-stays-in-use`. Pages: `/handbooks/software-that-stays-in-use/1` through `/16`.
2. Engineering reliable delivery — named, not written. For the technology delivery field card.
3. Data that drives decisions — named, not written. For the data analytics field card.
4. Decision systems under uncertainty — named, not written. For the credit risk field card.

Calendars, blast-radius proof, and the cutover sequence stay on the delivery card. Do not open 2–4 until this book has been read and the page still holds.

## Routes

- `/handbooks` — the library. One row per handbook.
- `/handbooks/software-that-stays-in-use` — the cover and contents.
- `/handbooks/software-that-stays-in-use/[page]` — one page.

Source: `src/content/handbooks.ts`.

## Out of scope

- Mixing handbooks into `/writes` or `/stories`.
- A chain handbook that treats every card as one parent.
- Pasting the SDLC picture, or adding an eighth named practice.
- A PDF, a page-flip animation, or a Hub redesign to advertise the layer.
- Employer-confidential scenes. Synthetic only, labeled.
- Publishing the later handbooks as empty routes.
