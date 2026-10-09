# Credit risk field card (hosted)

Orbit-only. No GitHub source repo. Do **not** add to `src/lib/field-card/registry.ts` (`FIELD_CARDS`).

Live: `/credit-risk-field-card/` (this folder’s `index.html`). Hub competency: **Credit**.

## Spine (do not break)

- H1: `Credit risk is for a lifetime. Act early.`
- Spine: ORIGINATE → MONITOR → STAGE → PROVISION
- The opening picture is one account. The solid file moves. The faded file stops at the cutoff. A return arc sends the outcome back into the watch.
- The hook under the H1 is `The cutoff is not the system.`
- Do not put a problem / use / example table, a tool picker, or a ladder back in front of that picture.
- Do not add unpublished employer rates, coverage, or loss figures.
- Grain and gold stay on the Analytics card. This card owns the decision and the stage.
- Not a vendor or scorecard brochure. IFRS 9 is the fence around the allowance.

## What the picture has to keep saying

- The terms come from the customer, the product, and the first risk, and an override has a name.
- Still paying is not the same risk that was booked.
- Name the increase since origination, then leave stage 1.
- Stage 1 recognises 12-month ECL. Lifetime ECL replaces that allowance only in stage 2. Stage 3 is credit-impaired and also lifetime ECL. An extra amount has an owner and a date to come off.
- If the stage, the parameters, and the overlay owner cannot be named, do not book the number.

## Motion

The file walks originate, then monitor, then stage, then provision. The watched row turns while it still says paid. The plaque turns from 1 to 2. While the plaque says 1, the 12-month stack is the allowance and the lifetime stack stays down. After the plaque says 2, the 12-month stack releases and the lifetime stack fills. The arc labeled “next decision” draws back toward monitor: observed performance changes the next cutoff and the next control.

Beside the headline, accounts stream toward the life of the book. The caption says stage 1 recognises 12-month ECL, and that a credit-impaired stage 3 stays on lifetime ECL. Under the hook, Score → Policy → Decision → Action → Outcome → Evidence runs inside that life and lights in that order, and a hovered step stays lit. The three judgement lines are cards. Always on fades in once, together. Do not hide those words until scroll, and do not scroll-jack.

`prefers-reduced-motion` and print show the end state: streams drawn, hold lit, every path step lit, the faded file and the arc still visible. The words stay readable with the motion off. On a narrow screen the arc hides and the sentence carries the return. The stream and the path stay.

Storytelling `household` and `grid` pictures stay on their own stories. The robot is already on this sheet. Its six lines live in `public/field-card-robot.mjs` and win over storytelling `field-cards.ts`. They say the cutoff, that stage 1 is 12-month ECL, that a score is not the call, that standards are the fence, and that the result changes the next decision. A press that moves drags the robot. A short tap tucks it.

## Sources

Keep real standard links under “Inside the fence”. Do not invent docs URLs. Swap a link only when a better public source for the same move exists.

## Monthly judgment

Read this file and the live picture. The month is relevant when it can say whether the four moves still match how the book should be run, and whether the links under Inside the fence still support those moves.

Open those links. A dead URL, or a sentence that teaches the wrong allowance, is an update. Stage 1 stays 12-month ECL. Lifetime ECL starts at stage 2, including a credit-impaired stage 3.

Changed line when the picture’s HTML did not change: `Monthly review — the account picture unchanged`. When it did, the line says what the picture now says.

Restoring a problem/use/example table, a tool picker, or a ladder is not an update. The pattern for the other Hub cards is `docs/architecture/field-card-review.md`, section “Scene pattern”. This file stays the credit contract.
