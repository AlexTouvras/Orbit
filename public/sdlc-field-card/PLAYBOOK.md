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

These stay unless that month’s research shows one of them is wrong. Do not drop them on a no-change month.

1. **The plan fits on a page a person will review.** Goal, cost, and what “done” means. A file no one will read is not a plan.
2. **A spec file is not shared understanding.** Someone has to be able to walk the journey and the ways it can fail before BUILD. Meetings with nothing written down do not make the change safer. The writing is required, and it is not sufficient.
3. **A person drops tests that do not fail for the right reason.** Feedback in CI stays. Agent-written tests are drafts. Do not add “continuous evals” of tasks that are already in the tree.

## Leave off the card

- `intent.md`, `CLAUDE.md`, skills, worktrees, plugins, hooks, `REVIEW.md`
- Replacing design or review with an agent
- Production anomaly bots and background debt PRs (Delivery / maintenance)
- A picker row for an AI-native playbook. Picker stays ≤7: NIST SSDF, Microsoft SDL, OWASP ASVS, trunk-based, pull requests, test pyramid, continuous integration.

## Monthly research

Required once a month, before any SDLC edit or no-change decision. Reading this file is not the research.

1. Read this playbook and `index.html`.
2. Open the docs URLs already on the card. Check that each one still supports the row that cites it.
3. Search for practice changes since the card’s Reviewed month that would change PLAN, SPEC, DESIGN, BUILD, or TEST, including security in that order. Open every page you cite. Primary sources and named practitioners. Stop around 4–8 opened pages.
4. Assess the card. Update HTML only when a constraint makes a current row wrong, a docs URL is dead, or a job example now teaches the wrong move. Leave hype, vendor launches, generated-markdown playbooks, and extra picker rows off the card.
5. In the PR `## Summary`, under SDLC, write:
   - Research: the URLs you opened
   - Assessment: one or two sentences
   - `Decision: update` or `Decision: no-change`

A no-change month still lists what was opened. “Did not look” is not a decision. If a page fails, say so and judge from the pages that opened. Never invent a URL or a finding. Stamp `Reviewed <Month YYYY> · Next: <next month>`.
