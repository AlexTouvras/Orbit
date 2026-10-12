# Data & visual storytelling field card (hosted)

Orbit-only. No GitHub source repo. Do **not** add to `src/lib/field-card/registry.ts` (`FIELD_CARDS`). Do **not** run Apply review.

Live: `/story-field-card/` (this folder’s `index.html`). Hub competency: **Story**.

## Spine (do not break)

- H1: `Turn evidence into a decision`
- Hook: `Doubt in a footnote is not an open.`
- Operating chain: Question → Evidence → Tension → Narrative → Experience → Decision
- Craft, always on: Dwell → Claim → Sketch → Lead → Open
- The opening picture is one claim. The claim walks the six moves. The doubt stays visible at the decision.
- The picture is a dark stage with a cyan rail. Cyan is this card’s accent (the same cyan as the storytelling robot on this sheet). The sheet around that picture is the same stage. Print keeps the picture dark and sets the surrounding words in ink on white.
- Do not redraw this picture as a loop. The AI card owns “loop”. Do not draw a return to the question. The label under the track is `doubt stays`.
- Each move names the handoff: decision → a question, question → a limit, limit → a reason for the next scene, reason → an order, order → a form, form → a decision with the doubt still visible.
- Essays stay prose. Grain stays on Analytics. Cutover stays on Delivery.
- Not a chart-library brochure. Not a gallery titled “story”.

## What the picture has to keep saying

- Name the decision before any mark. No question, no story.
- Say what the data can support. The claim cannot cross that limit.
- Name the gap that needs the next scene. Otherwise it is analysis.
- Order the scenes a person can walk. Who leads, then who wanders.
- Give the form a job. A bar is honest when larger is the whole claim.
- Close on what changes. The doubt stays in the picture.

## Keep these three lines

These stay on the sheet, under Where judgement stays, unless that month’s check shows one of them is wrong. Do not drop them on a no-change month.

1. **Start with the decision, not the dataset.** Name the audience, the question, and what done means before any mark.
2. **The story never upgrades evidence into certainty.** Source, structure, signal, and the limit. A correlation stays a correlation.
3. **Doubt stays in the picture.** The miss and the window you refused belong on the page, beside the decision.

## Motion

The claim mark sits on Question, then Evidence, then Tension, then Narrative, then Experience, then Decision. The drawings move on that same loop. At question, the page is written. At evidence, the bars stop under the limit. At tension, the expected line and the actual line do not meet. At narrative, the scene marks light in order. At experience, the bar holds and the extra mark fades. At decision, the doubt chip appears and stays. The dashed rail labeled `doubt stays` draws under the track.

`prefers-reduced-motion` and print show the end state: the claim at the decision, the doubt chip visible, the bars under the limit, the gap drawn, the scene marks lit, the extra mark faded, the `doubt stays` rail drawn. Under 900px the moves stack, the claim mark hides, and the sentence plus the doubt chip carry the close. The words stay readable with the motion off. No scroll-jack.

The robot is already on this sheet. Its six lines live in `public/field-card-robot.mjs` and win over storytelling `field-cards.ts`. A press that moves drags the robot. A short tap tucks it.

## Leave off the card

- A problem / use / example table, a representation picker, or a ladder in front of the picture. Restoring that table is not an update.
- A fifth column, a proof strip, or a particle field. The warm sheet and the particle sphere belong to the credit picture. Lime belongs to the SDLC picture.
- Grain, definitions, and gold. Those stay on Analytics.
- Calendars, proof, and cutover. Those stay on Delivery.
- Essay prose. Writes stay prose. Live stories stay at `/stories`.

## Monthly judgment

Read this file and the live picture. The month is relevant when it can say whether the six moves still match how a story is built, and whether the five named-practice links still support the line under each one.

Open those five links. A dead URL, a sentence that hides the doubt, or a sentence that lets the story upgrade the evidence, is an update.

Changed line when the picture’s HTML did not change: `Monthly review — the claim picture unchanged`. When it did, the line says what the picture now says.

Restoring a problem/use/example table, a representation picker, or a ladder is not an update. The pattern for the other Hub cards is `docs/architecture/field-card-review.md`, section “Scene pattern”. This file stays the story contract.

In the PR `## Summary`, under Story, write:

- Research: the five named-practice URLs you opened
- Assessment: one or two sentences
- `Decision: update` or `Decision: no-change`

A no-change month still lists what was opened. Never invent a URL. Stamp `Reviewed <Month YYYY> · Next: <next month>`.
