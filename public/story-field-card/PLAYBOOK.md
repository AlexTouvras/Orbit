# Data & visual storytelling field card (hosted)

Orbit-only. No GitHub source repo. Do **not** add to `src/lib/field-card/registry.ts` (`FIELD_CARDS`). Do **not** run Apply review.

Live: `/story-field-card/` (this folder’s `index.html`). Hub competency: **Story**.

## Spine (do not break)

- H1: `Turn evidence into a decision`
- Hook: `Uncertainty belongs in the decision, not in a footnote.`
- Eyebrow: `One decision. Six moves.`
- Operating chain: Question → Evidence → Tension → Narrative → Experience → Decision
- Craft, always on: Dwell → Claim → Sketch → Lead → Open
- The opening picture is one decision. One cyan line runs through the six moves and ends at the decision. The doubt chip is that ending.
- The picture is a dark stage. Cyan is this card’s accent (the same cyan as the storytelling robot on this sheet). The sheet around that picture is the same stage. Print keeps the picture dark and sets the surrounding words in ink on white. Body type stays large enough to read on a phone without zooming.
- Do not redraw this picture as a loop, and do not put a second rail under the line. The AI card owns “loop”. The signature line is `The doubt stays beside the decision.`
- Each move names the handoff: decision → a question, question → a limit, limit → a reason for the next scene, reason → an order, order → a form, form → a decision with the doubt still visible.
- Essays stay prose. Grain stays on Analytics. Cutover stays on Delivery.
- Not a chart-library brochure. Not a gallery titled “story”.

## What the picture has to keep saying

- Name the decision someone has to make, before any mark.
- The chart can support the claim. It still stops at a limit.
- Show the case that challenges the claim. If nothing does, it is analysis.
- Put the evidence in an order a person can walk.
- Set the average beside the slow tail. The reader has to see both.
- Close on what changes. Show what the evidence cannot establish.

## Keep these three lines

These stay on the sheet, under Where judgement stays, unless that month’s check shows one of them is wrong. Do not drop them on a no-change month.

1. **Start with the decision, not the dataset.** Name the audience, the question, and what done means before any mark.
2. **The narrative can clarify evidence. It cannot make weak evidence stronger.** Source, structure, signal, and the limit. A correlation stays a correlation.
3. **Show what the evidence cannot establish, alongside what it can.** The miss and the window you refused belong on the page, beside the decision.

## Motion

The claim mark walks down the one line: Question, then Evidence, then Tension, then Narrative, then Experience, then Decision. The drawings move on that same loop. At question, the page is written. At evidence, the bars stop under the limit. At tension, the challenging case runs past the expected line. At narrative, the scene marks light in order. At experience, the average sits beside a taller slow tail. At decision, the doubt chip appears and stays.

`prefers-reduced-motion` and print show the end state: the claim at the decision, the doubt chip visible, the bars under the limit, the challenge drawn, the scene marks lit, both bars of the tail comparison visible. Under 900px the same line stays, the walking mark hides except at the decision, and the sentences stay large. Under 640px the drawing sits above the sentence so the words keep a full measure. The words stay readable with the motion off. No scroll-jack. Do not add a stage picker.

The robot is already on this sheet. Its six lines live in `public/field-card-robot.mjs` and win over storytelling `field-cards.ts`. A press that moves drags the robot. A short tap tucks it.

## Leave off the card

- A problem / use / example table, a representation picker, or a ladder in front of the picture. Restoring that table is not an update.
- A second worked example. The one under The same evidence stays, and it stays labelled made up.
- Scroll-driven stages, or a control that reveals a different essay per move.
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
