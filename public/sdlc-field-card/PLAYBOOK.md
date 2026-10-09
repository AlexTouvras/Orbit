# SDLC field card (hosted)

Orbit-only. No GitHub source repo. Do **not** add to `src/lib/field-card/registry.ts` (`FIELD_CARDS`). Do **not** run Apply review.

Live: `/sdlc-field-card/` (this folder’s `index.html`). Hub competency: **SDLC**.

## Spine (do not break)

- H1: `Build software that stays in use`
- Hook: `A check that cannot fail is not a gate.`
- Pillars: Plan & design → Build & verify → Release & deploy → Maintain & improve
- The opening picture is one change on a pipeline. The change walks the four pillars. Three gates sit on the track: reviewed, can fail, deployed. Those gates are checks. They are not extra pillars.
- The return is labeled `next change`. It is violet and sits above the forward track. Do not redraw this picture as a loop. The AI card owns “loop”.
- Security is named in design (who can reach the data, how it can be abused). Verify includes those security checks: they have to fail the build, with the tests.
- A fix goes back through the same four pillars. The first release is not the end. The previous version stays one deploy away.
- Technology delivery — calendars, proof, and the cutover sequence — stays on the Delivery card. This card still owns release, deploy, maintain, and improve of the software.
- Not a SAFe / Scrum brochure. Not an AI-native SDLC brochure.

## What the picture has to keep saying

- The plan fits on a page a person will review, including who can reach the data.
- A person drops a test that fails for the wrong reason. The security checks have to fail the build.
- People run the version just verified. The previous version stays.
- A defect, or what you learn in use, comes back as the next change through the same four pillars.

## Keep these three lines

These stay on the sheet, under Where judgement stays, unless that month’s research shows one of them is wrong. Do not drop them on a no-change month.

1. **The plan fits on a page a person will review.** Goal, cost, and what “done” means. A file no one will read is not a plan.
2. **A spec file is not shared understanding.** Someone has to be able to walk the journey and the ways it can fail before build and verify. Meetings with nothing written down do not make the change safer. The writing is required, and it is not sufficient.
3. **A person drops tests that do not fail for the right reason.** Feedback in CI stays. Agent-written tests are drafts. Do not add “continuous evals” of tasks that are already in the tree.

## Motion

The change walks plan, then build, then release, then maintain. Each gate holds, then opens. At build, the test that fails for the wrong reason is struck through and the check that stops the build stays. At release, the previous version appears and stays while the change moves on. The return stroke then draws back to plan and design.

`prefers-reduced-motion` and print show the end state: the change at maintain, the last version still visible, the bad test struck, the gates open, the return drawn. Under 900px the return and the walking change hide, each pair of pillars is its own row, and under 640px each pillar is its own row. The caption carries the return. The words stay readable with the motion off. No scroll-jack.

The robot is already on this sheet. Its six lines live in `public/field-card-robot.mjs` and win over storytelling `field-cards.ts`. A press that moves drags the robot. A short tap tucks it.

## Leave off the card

- `intent.md`, `CLAUDE.md`, skills, worktrees, plugins, hooks, `REVIEW.md`
- Replacing design or review with an agent
- Production anomaly bots and background debt PRs
- An eighth named practice. The seven stay: NIST SSDF, Microsoft SDL, OWASP ASVS, trunk-based, pull requests, test pyramid, continuous integration.
- A problem / use / example table, a tool picker, or a ladder in front of the picture. Restoring that table is not an update.
- Delivery’s calendar match, blast-radius proof, and cutover sequence. Release on this card is a version people run, with the previous version still deployable.
- A fifth station, a proof strip, or a particle field. The warm sphere belongs to the credit picture.

## Monthly research

Required once a month, before any SDLC edit or no-change decision. Reading this file is not the research. The picture is the job.

1. Read this playbook and `index.html`.
2. Open the seven named-practice URLs. Check that each one still supports the line under it.
3. Search for practice changes since the card’s Reviewed month that would change plan and design, build and verify, release and deploy, or maintain and improve, including security in that order. Open every page you cite. Primary sources and named practitioners. Stop around 4–8 opened pages.
4. Assess the picture. Update HTML only when a station teaches the wrong move, a gate can no longer fail, the previous version disappears, the return is missing, or a docs URL is dead. Leave hype, vendor launches, generated-markdown playbooks, and an eighth link off the card.
5. In the PR `## Summary`, under SDLC, write:
   - Research: the URLs you opened
   - Assessment: one or two sentences
   - `Decision: update` or `Decision: no-change`

A no-change month still lists what was opened. “Did not look” is not a decision. If a page fails, say so and judge from the pages that opened. Never invent a URL or a finding. Stamp `Reviewed <Month YYYY> · Next: <next month>`.

Changed line when the picture’s HTML did not change: `Monthly review — the pipeline picture unchanged`. When it did, the line says what the picture now says.

The pattern for the other Hub cards is `docs/architecture/field-card-review.md`, section “Scene pattern”. This file stays the SDLC contract.
