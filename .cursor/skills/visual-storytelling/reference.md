# Visual storytelling — reference

Distilled from a review of the inspiration set plus Orbit’s current Hub. Use with `SKILL.md`; do not copy these sites’ tone.

## What each reference actually does

### [AI Takes Over](https://aitakesover.co/)

Scroll **chapters** as jokes → definitions → timeline → stats → myths → close. Full-viewport scenes, conversational narrator, stats as punchlines (70%, 85 million). Motion is the medium.

**Steal:** chaptered scroll, stats as beats, a close that lands a decision.  
**Leave:** robot-dance theatre, joke-bot voice, vertical scroll-jacking. Orbit is a hiring-manager HQ.

### [Light Factory](https://light-factory-ca-2022.webflow.io/)

Work as a **reel**. Services as **01–05 process** (Understand → Design → Capture → Craft → Distribute), not a card grid. Full-bleed, numbered, boutique-but-warehouse.

**Steal:** numbered craft sequence; horizontal proof; process verbs as the story.  
**Leave:** video-production chrome and “creative babies” copy.

### [Amanda Lee Peers](https://www.amandaleepeers.com/)

Biography as **eras** (Beginning → Success → Reality TV → Sinner → Tour). Time is the chapter mark. Large type, dark, photographic.

**Steal:** About as timeline/eras, not stacked CV cards.  
**Leave:** tour-poster density; Orbit’s record is employers and theses, not dates on a marquee.

### [OSOS](https://osos.webflow.io/)

Typography as identity. Fragmented, kinetic, statement-driven. Whitespace as drama.

**Steal:** type at display scale as the “image”; one-word chapters.  
**Leave:** illegible overlap, decoration that fights a decision rule.

### [Haus of Words](https://www.hausofwords.com/)

Personality-first. Big numbers (6.3 million impressions). FAQ as voice. Close is a conversation.

**Steal:** oversized stats; close as a landing; questions as headlines.  
**Leave:** punchy agency humour that would fail `docs/essay-voice.md`.

## Orbit translation (already on Hub)

| Inspiration | Orbit chapter |
|-------------|----------------|
| Full-viewport open | `story-open` — “Prove what works.” |
| Brand made visible | `story-gravity` — `GravityField` |
| 01–05 process | `story-craft` — Delivery / Data / AI + `hudVerbs` |
| Work reel | `selected-work` — `ProofReel` |
| Questions as headlines | `story-live` — live desk questions |
| Editorial index | `story-signals` — writes as a list |
| Conversational close | `story-close` — About + contact |
| Era timeline | About `ExperienceTimeline` |
| Question-led desk | `DeskStoryHeader` on live desks |

## Tokens

- Display: Syne (`font-display`), body: IBM Plex Sans, index/kicker: JetBrains Mono
- `.text-story` — Hub thesis only (viewport open)
- `.text-display` — desk questions, interior heroes
- `.story-index` — ghost `01` behind a row
- `.story-rail` — horizontal snap; hide scrollbar
- Accents: unlayered `.orbit-accent` hex animation; never OKLCH channel `@property`
- `neon-cyan` is static; body links (Case study, Read) stay static cyan

## AppChrome

```text
/                  full-bleed story (no max-w)
/portfolio/live*   max-w-6xl
everything else    max-w-5xl
/card /qr-code     bare (no header/particles)
```

New story pages need an explicit `story` path in `AppChrome` — do not assume every route is full-bleed.

## Dashboard recipe (checklist)

When restyling or adding a live desk:

- [ ] `question` is the `h1` via `DeskStoryHeader`
- [ ] Cadence/source is the kicker, not a Badge soup
- [ ] Primary visual is full-column, not a 16:10 card
- [ ] 3–5 stats answer the question before any click
- [ ] Interaction changes the same scene
- [ ] Close names lag, license, and what it is not
- [ ] Hub `LiveQuestions` lists the question
- [ ] Reduced-motion: map/tape still readable

## Anti-patterns seen on the old Hub

- `space-y-24` + `SectionHeading` + `Stagger` of `GlassCard`
- Competencies as three equal tiles (hides the sequence)
- Selected work as three equal case-study cards (hides cinematic proof)
- Writes as blog cards on the Hub (archive cards belong on `/writes`)
- Live desks advertised as “Not Power BI” instead of their questions
