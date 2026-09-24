# Evidence audit — Orbit 2.0 Evidence Layer

**Date:** 2026-09-24  
**Status:** Re-audit. Owner selected the flagship.  
**Flagship:** The storytelling system  
**First story:** Hub Open — thesis, locked statement, contact, and the live system running underneath (`LiveProofStream`). On `main` as `250e3e3`. Almost ready.  
**Chain:** Business problem → Data → Intelligent system → Delivery → Measurable outcome  
**Archetype under test:** AI & Data Systems Lead

This replaces the 2026-09-23 draft, which stopped at “pick a flagship.” The Decision Intelligence Lab is a possible later story on this system. It is not the flagship.

## What this re-audit changes

- The flagship is the **storytelling system**: one reading grammar that makes a live system legible. Spec: `.cursor/skills/visual-storytelling`. Primitives: `src/components/story/`.
- The first story is **Hub Open**. `LiveProofStream` (`src/components/hub/LiveProofStream.tsx`) puts desk questions and a system pulse under the thesis. Reduced motion is a static list.
- The five live desks and Portfolio already use the same grammar. They are instances. They are not five flagships.
- Writes stay MDX prose. The system does not absorb essays.

## Flagship definition

A visitor meets a question, sees the system that can answer it, and can follow that question into proof.

| Surface | Reading order | Route |
|---------|---------------|-------|
| Hub | Open → Gravity → Craft → Proof → Live → Signals → Close | `/` |
| Portfolio | Open → workshop reel → live peek → Power BI picture → GitHub list | `/portfolio` |
| Live desk | Open → Cast → Picture → Move → Close | `/portfolio/live/[slug]` |

Open on the Hub is the first story: one thesis, the locked statement, one contact action, and the product visibly working (`LiveProofStream`). Desks keep the dataset **question** as the title. Interior tools stay tools (`/card`, `/studio`).

## First story — what is already true

| Piece | State |
|-------|--------|
| Thesis, statement, contact in `HubHero` | Shipped |
| `LiveProofStream` under the thesis | On `main` (`250e3e3`, 2026-09-24) |
| Desk questions link to `/portfolio/live/{slug}` | In the stream |
| Reduced motion → “Live now” list, no marquee | In the component |
| Skill + `reference.md` record the Pinloop steal/leave | Updated with the component |

## First story — what “ready” still requires

1. **Browser pass** on desktop and a phone-width viewport. The thesis, the locked statement, and “Get in touch about a role” stay readable. The stream does not cover them. Reduced motion shows the list. No pass is recorded yet.
2. **Width call.** The stream is `w-screen` (atmosphere wider than the page). The skill still keeps Home in the shared `max-w-5xl` column. Ready means one explicit choice: keep the wide stream, or bring it back into the column. Until that choice, Hub Open is almost ready, not evidence.
3. **Then mark it.** Studio milestone `first-story` moves from ACTIVE to EVIDENCE only after that pass and that choice. The archetype stays unproven.

## Chain coverage of the flagship

| Chain link | What the storytelling system shows | Density |
|------------|-------------------------------------|---------|
| Business problem | A named question (desk `question`, now also under the Hub thesis) | **Medium.** Public questions a stranger can ask. Still light on an owned organisational problem with constraints. |
| Data | Sourced desks: ENTSO-E, Stat.fi CC BY 4.0, Energy-Charts, Eurostat + ECB, Yahoo delayed quotes | **High** |
| Intelligent system | Mostly a reading interface. EU Spot carries a mix nowcast. The stream does not judge or recommend. | **Low–medium** |
| Delivery | Grammar shipped on Hub, Portfolio, and five desks, with a reduced-motion fallback | **High** |
| Measurable outcome | A stranger can answer the question before drilling. No public business KPI. | **Low–medium** (communication outcome) |

**Visitor can conclude:** Alex can take a live data system and make it readable — question, figures, picture, interaction, source, and limit — and is now putting that system on the front door.

**Visitor still cannot conclude:** Alex repeatedly takes an ambiguous business problem through an intelligent system to a measured outcome. Later stories on this same grammar can carry those two links. Shipping Hub Open does not close them, and does not make the archetype PROVEN.

## 1. Story instances (the flagship’s public proof)

| Instance | Grammar | Chain it actually shows | Finish |
|----------|---------|-------------------------|--------|
| **Hub Open** (first story) | Thesis + statement + `LiveProofStream` | Delivery of the system; questions as atmosphere | Almost ready. See above. |
| **Hub, rest of page** | Gravity, Craft, Proof reel, live peek, Signals, Close | How the work is organised, then links into proof | Shipped 2026-09-22. Craft lanes link to field cards. |
| **Portfolio** | Reels + GitHub list | Proof objects, with `status` and `caseStudyUrl` | Shipped. |
| **Nordic Equity** | Open → Cast → Picture → Move → Close | Data → picture of movers | Live. Outcome is “see who moved,” delayed quotes. |
| **EU Spot** | Same | Data → where power is expensive; mix nowcast on a zone | Live. Strongest desk. Energy domain. |
| **Helsinki Housing** | Same | Data → €/m², postal choropleth | Live. Official stats, ~1 month lag. |
| **Europe Power Mix** | Same | Data → generation share | Live. |
| **Europe Economy Pulse** | Same | Data → macro state + headlines | Live. Closest economy narrative. Still a pulse, not a decision. |

Rail punctuality (`/portfolio/live/rail`) is still queued. It is not part of this story.

## 2. Other public work (context, not the flagship)

| Artifact | What it proves beside the system |
|----------|-----------------------------------|
| **Orbit** (Studio, weekly Write, field-card Approve) | Delivery with a human gate. Case study: `building-orbit`. Weak as an external business problem. |
| **Nordic Equity Heatmap** + **Power BI — Nordic Boardroom** | Data craft. Case studies exist. Limited public “problem → measured outcome.” |
| **ProjectBrain** | Agent memory for the portfolio. IDE-only. |
| **Ledger** | Personal research loop. Prototype. |
| **mealplan / fitness-coach** | Personal ops. Non-featured. Wrong audience for this flagship. |
| **Field cards** (AI, Analytics, Delivery, SDLC, Credit Risk; Bayes is hosted and outside `FIELD_CARDS`) | Competency posters. Craft links land here. They are not stories. |
| **Essays** | How he thinks. They stay prose. They do not substitute for the first story. |
| **About / CV** | Credit risk, then Azure / middleware at Santander Nordics. High credibility, low public artifact. No employer detail belongs in a story. |

## What to do next

1. Finish the first story (browser pass + width call).  
2. Leave the grammar alone while that happens. No second motion language, no new palette, no new public route.  
3. The next story, after Hub Open is evidence, uses the same desk order to carry one decision: question, mechanism, evidence, interpretation, limit. Pick that subject then.  
4. Repeat. Archetype PROVEN only when a visitor can see the chain without being told the title.

## Studio

| Milestone | Status after this audit |
|-----------|-------------------------|
| `evidence-audit` | EVIDENCE |
| `flagship-gap` | ACTIVE — storytelling system is the flagship |
| `first-story` | ACTIVE — Hub Open, almost ready |
| `archetype-proven` | PLANNED |

---

*Sources: `src/content/live-desks.ts`, `src/components/story/*`, `src/components/hub/LiveProofStream.tsx`, `src/components/live/*Desk.tsx`, `data/published-projects.json`, `src/content/writes/*`, `src/lib/field-card/registry.ts`, `.cursor/skills/visual-storytelling`.*
