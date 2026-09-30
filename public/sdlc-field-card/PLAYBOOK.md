# SDLC field card (hosted)

Orbit-only. No GitHub source repo. Do **not** add to `src/lib/field-card/registry.ts` (`FIELD_CARDS`). Do **not** run Apply review.

Live: `/sdlc-field-card/` (this folder’s `index.html`). Hub competency: **SDLC**.

## Spine (do not break)

- H1: `Write the plan before the code`
- Opening: PLAN → SPEC → DESIGN → BUILD → TEST
- Security is named in design (who can reach the data, how it can be abused) and checked in test.
- Job table still judges a written plan, threat-in-design, smallest build, and tests before merge.
- Cutover, release window, and recovery stay on the Delivery card.
- Not a SAFe / Scrum brochure. Not an AI-native SDLC brochure.

## Keep these three lines

The monthly pass does not read essays. These constraints are the judgment. Do not drop them on a stamp-only month.

1. **The plan fits on a page a person will review.** Goal, cost, and what “done” means. A file no one will read is not a plan.
2. **A spec file is not shared understanding.** Someone has to be able to walk the journey and the ways it can fail before BUILD. Meetings with nothing written down do not make the change safer. The writing is required, and it is not sufficient.
3. **A person drops tests that do not fail for the right reason.** Feedback in CI stays. Agent-written tests are drafts. Do not add “continuous evals” of tasks that are already in the tree.

## Leave off the card

- `intent.md`, `CLAUDE.md`, skills, worktrees, plugins, hooks, `REVIEW.md`
- Replacing design or review with an agent
- Production anomaly bots and background debt PRs (Delivery / maintenance)
- A picker row for an AI-native playbook. Picker stays ≤7: NIST SSDF, Microsoft SDL, OWASP ASVS, trunk-based, pull requests, test pyramid, continuous integration.

## Monthly judgment

Not stamp-only. Read this file, then judge picker rows and job-table examples against the spine. Swap by constraint. Never invent docs URLs. Stamp `Reviewed <Month YYYY> · Next: <next month>`.

If picker and jobs need no further change, leave the three lines above in place and say so in `## Summary`.
