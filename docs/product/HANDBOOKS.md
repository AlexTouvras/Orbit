# Handbooks

Owner of the handbook layer. `WEBSITE_ARCHITECTURE.md` only points here.

Authorized 2026-10-13. On 2026-10-14 the owner set the first book on the SDLC field card, rejected short restatements, and set two writing rules: public prose contains only sentences that stay in the finished book, and the library title opens the book. The same day the owner shared an editorial standard for every later page. Source of the prose: `src/content/handbooks.ts`. Owner edits judgments there.

## Role

| Layer | Question | Where |
|-------|----------|--------|
| Field card | What is this field, and what do I believe? | `/field-card/`, `/analytics-field-card/`, `/delivery-field-card/`, `/sdlc-field-card/`, `/credit-risk-field-card/`, `/story-field-card/` |
| Handbook | How do I approach the problem, and how do I work? | `/handbooks` |
| Story or essay | What happened when the method met a problem? | `/stories`, `/writes` |

The layers do not repeat each other. A handbook does not paste a card, and it does not become a story.

## What the public page may say

Write the finished book. Do not narrate the draft. No sentence about how much is written, what the next page is waiting on, or that a source list was opened for the draft. A reference belongs next to the claim it supports. A personal rule is labeled as the author's rule. An established practice is attributed to the source.

The library lists books that can be read. A title opens the first page of that book. There is no cover in front of the page.

## Editorial contract

Every page:

1. Starts from the decision or failure the reader has, then the subject.
2. Says why the practice works, what it assumes, and when another approach fits.
3. Gives a procedure, a decision, a check, or another artifact the reader can use.
4. Separates established guidance, the author's rule, and a hypothesis. A synthetic scene says so in its first line.
5. Adds something the other pages do not already say.

One thesis per page. Headings follow the subject. They are not a fixed list of eight. A page is as long as the argument: a principle can be short, a method needs the day and the limit, a deep dive needs the mechanism. Do not add length to look finished.

Voice: direct, operational, first person for the author's judgment. Define a term a stranger may not know. No corporate filler. A memorable sentence is rare, and it has to clarify the rule.

Evidence: cite the primary source, with its date or version, and only for a claim that source makes. A short link sits beside the claim and opens the section when the source has one. The page ends with one list of the works. Do not invent a metric, a client, or a result. A number you did not open does not go on the page. Say how you would tell the practice is working. That is a measure to track, not a result you do not have. Put the date you last checked the claims on the page.

A figure is allowed when it carries the procedure: a loop, a decision, a shape. The words still work if the figure does not. No motion required to understand the page. The standard is the contract above. The diagrams, the section count, and the length change with the subject.

## Series

1. **Software that stays in use** — extends the SDLC field card. Opens on `/handbooks/software-that-stays-in-use/1`, Keep main releasable. The library title goes there.
2. Engineering reliable delivery — not in the library yet. For the technology delivery field card.
3. Data that drives decisions — not in the library yet. For the data analytics field card.
4. Decision systems under uncertainty — not in the library yet. For the credit risk field card.

Calendars, blast-radius proof, and the cutover sequence stay on the delivery card. Do not add an eighth named practice to the SDLC card.

## Routes

- `/handbooks` — the library. One row per book a reader can open.
- `/handbooks/software-that-stays-in-use` — redirects to the first page.
- `/handbooks/software-that-stays-in-use/1` — Keep main releasable.

## Out of scope

- Mixing handbooks into `/writes` or `/stories`.
- A chain handbook that treats every card as one parent.
- Pasting the SDLC picture.
- A cover, a status line, or a contents page in front of the book.
- A PDF, a page-flip animation, or a Hub redesign.
- Employer-confidential scenes. Synthetic only, labeled.
- Publishing an empty route for a book that has no page yet.
