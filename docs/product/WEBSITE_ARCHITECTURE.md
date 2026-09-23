# Website Architecture

## Conceptual layers → routes

| Layer | Question | Routes |
|-------|----------|--------|
| HUd | WHO | `/card`, `/qr-code` |
| Hub / evidence | WHAT / HOW HE THINKS | `/`, `/portfolio`, `/portfolio/live/*`, `/writes`, `/radar`, `/about`, `/contact`, `/newsletter` |
| Studio | WHERE | `/studio`, `/studio/week`, `/studio/projects`, `/studio/roadmap` |
| Timeline | HOW HE GOT HERE | About experience (no separate Foundation page) |

## Relationship

```text
HUd        → identity
Main site  → evidence
Studio     → trajectory
Timeline   → history
```

## Data relationship

Studio is source of truth for:

- `focusNow` (public-safe)
- roadmap milestone status (private)

Public pages consume only information explicitly marked public. Do not automatically expose Studio notes.

## Existing product grammar (do not reinvent in Foundation)

- Hub / Portfolio / live desks: chaptered visual storytelling (see `.cursor/skills/visual-storytelling`)
- Writes: MDX prose; stranger-first (`docs/essay-voice.md`); no cast/scenario blocks on essays
- Studio and `/card`: interior tools — not cinematic chapter restyles
- JARVIS / ProjectHelm: retired; historical architecture only

## Constraint

Do not introduce additional public sections merely because they are possible. Every new page needs a clear role in the four questions.
