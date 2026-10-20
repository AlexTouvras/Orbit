# Website Architecture

## Conceptual layers → routes

| Layer | Question | Routes |
|-------|----------|--------|
| HUd | WHO | `/card`, `/qr-code` |
| Hub / evidence | WHAT / HOW HE THINKS | `/`, `/products`, `/portfolio`, `/portfolio/live/*`, `/writes`, `/handbooks`, `/radar`, `/about`, `/contact`, `/newsletter` |
| Studio | WHERE | `/studio`, `/studio/week`, `/studio/projects`, `/studio/roadmap`, `/studio/directives` |
| Timeline | HOW HE GOT HERE | About experience and education. Titles open each institution’s site. |

## Relationship

```text
HUd        → identity
Main site  → evidence
Studio     → trajectory
Timeline   → history
```

## Data relationship

Studio is source of truth for:

- `focusNow` (Studio trajectory; not on `/card`)
- roadmap milestone status (private)

Public pages consume only information explicitly marked public. Do not automatically expose Studio notes.

## Existing product grammar (do not reinvent in Foundation)

- Hub / Portfolio / live desks: chaptered visual storytelling (see `.cursor/skills/visual-storytelling`)
- Products: `/products` (`src/content/products.ts`). A product is a page or a command a stranger can open. The gravity satellite and the nav both go there. Workshop projects stay on `/portfolio`. Delivery Signal’s page, sample, and `extract.py` are not copied into Orbit: `/delivery-signal/` reads that repo’s `docs/` on `main` and keeps it for a minute. `engine/pipeline.py` is the checker in this repo (`src/delivery-signal/pipeline.py`), so the brief opens with the week: one conclusion a section, with the field list left as the audit.
- Writes: MDX prose; stranger-first (`docs/essay-voice.md`); no cast/scenario blocks on essays
- Handbooks: `/handbooks` (`docs/product/HANDBOOKS.md`). Method, between a field card and a story. A library title opens the book. Public prose is finished-book text. Later titles stay out of the library until a page exists.
- Studio and `/card`: interior tools — not cinematic chapter restyles
- JARVIS / ProjectHelm: retired; historical architecture only

## Constraint

Do not introduce additional public sections merely because they are possible. Every new page needs a clear role in the four questions.
