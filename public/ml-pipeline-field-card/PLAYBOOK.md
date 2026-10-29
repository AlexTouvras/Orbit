# ML pipeline field card (hosted)

Orbit-only method card. No GitHub source repo. Do **not** add to `src/lib/field-card/registry.ts` (`FIELD_CARDS`). Do **not** run Apply review.

Live: `/ml-pipeline-field-card/` (this folder’s `index.html`).

Human book: `/handbooks/models-that-stay-in-the-decision/1`.
Agent recipe: `/ml-pipeline-field-card/AGENT.md`.

## Spine (do not break)

- H1: `A model earns its place one stage at a time`
- Arcs: Prepare → Fit → Ship → Watch (hero diagram shows nine stages on that spine)
- Stages: PROFILE → QUALITY → OUTLIERS → FEATURES → SPLIT → TRAIN → TEST → SERVE → MONITOR
- Miss loops drawn under Fit: A tune → B features → C data → stop. Watch return is a new version.
- Always-on strip: Freeze test ids · Fit on train only · One test read · Previous version stays
- The test set is frozen at SPLIT and read once at TEST. Split requires matured labels, a temporal embargo, and disjoint entity ids — the median delay alone is not enough.
- Validation is scored at most once per frozen split. Loops A and B select on the inner slice only; they do not spend validation between revisions.
- Maturity = outcome window closed and outcome available. `label_delay_days` sizes the embargo only.
- Status words: candidate, blocked, rejected, passed, held, approved, live (promoted). See AGENT.md vocabulary.
- Not a Hub competency. Home stays Delivery / Data / AI.
- Not an AutoML brochure. Tools are lanes, not the spine.
- Ask, Grain, Truth, and Use stay on Analytics for one number. This card starts when the artifact is a model.
- Handbook chapters: `/1` what good looks like, `/2` prepare, `/3` features, `/4` fit, `/5` ship and watch, `/6` name what the version may do.
- Handbook title: Models that stay relevant (slug unchanged).
- One handbook illustration: call-order for open overdue invoices; label = paid within fourteen days of the cut (call separate); oldest-first is the previous way. Do not invent amounts or client results on the card.
- Quality gate uses `quarantine_rate_max` (default 0.05) — recipe threshold, not a universal law.
- Decision value is not ranking alone; governance still owns intended use before the score owns the list.
- Governance: intended use + out of scope + owners + fallback before the score owns the decision.

## Monthly judgment

Stamp-only until the owner asks for a judgment pass. Do not invent picker rows. Keep the nine stages and the miss loops.

## Cross-links

Points at Analytics, SDLC, and Delivery. Bayes stays the scarce-trial loop. Do not add a seventh Core competencies tile.
