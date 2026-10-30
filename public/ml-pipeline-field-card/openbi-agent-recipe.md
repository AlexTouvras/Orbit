# OpenBI ML pipeline — agent recipe

Machine instructions for durable models in OpenBI. Humans read the handbook:

| Arc | Chapter |
|---|---|
| Operating model | `/handbooks/models-that-stay-in-the-decision/1` |
| Prepare | `/handbooks/models-that-stay-in-the-decision/2` |
| Features | `/handbooks/models-that-stay-in-the-decision/3` |
| Fit | `/handbooks/models-that-stay-in-the-decision/4` |
| Ship and watch | `/handbooks/models-that-stay-in-the-decision/5` |
| Governance | `/handbooks/models-that-stay-in-the-decision/6` |

Generic stage filenames (platform-neutral): `/ml-pipeline-field-card/AGENT.md`  
Method card: `/ml-pipeline-field-card/`

**Thesis:** a model stays relevant when the pipeline can refuse it, promote it, watch it, and roll it back without silent overwrite.

Do not skip arcs. Do not fit transforms on validation or test. Do not retune on the official holdout. Do not update live weights in place. Do not approve a version yourself — a person approves in the Versions tab; you only draft evidence.

## OpenBI nouns (map once, then follow stages)

| Handbook / AGENT.md | OpenBI Studio |
|---|---|
| Decision brief + `task.json` | Business question + prediction definition (`prediction_suggest` / `prediction_create`) |
| Prepare artifacts | Source table / query preview + notebook checks that write counts, quarantine, maturity |
| `feature_spec.json` | Feature DAX / `Features.At(d)` (decision-time only) |
| Freeze + `split_ids` | Time-ordered split or `LightGbm.TimeFolds`; test cohort sealed before fit |
| `preprocess` + `model.joblib` | Train step → `Models.Save(...)` **draft** version |
| `val_metrics` / one validation read | Inner selection, then one scored validation (or fold summary that does not re-open selection) |
| `test_report` + `model_card` | Held-out `Verdict.*` + `Metrics.*` + `Checks.Leakage`; written evidence on the version |
| `bundle/<version>/` | Named model / prediction version id |
| `approved` / `held` | Person Accept / Not approved in Versions |
| `promoted` / live | `model_use` / `prediction_use` after approval |
| `monitor/<date>.json` | Live score table + dated review; miss → **new** version id, never in-place retrain |
| Previous live way | Callable baseline rule or prior version that still scores |

Speak in the user's business question. Do not design a model for its own sake. Prefer `prediction_patterns` → pick the pattern that answers the question → `prediction_suggest` → ask only what only the user knows → create → check → train draft → stop for human approval.

## Inputs required before Prepare

Stop until these are written (blank line = stop):

| Field | Required | Meaning |
|---|---|---|
| Decision | yes | Who acts, and what the score may change |
| Owner | yes | Decision owner (person, not a mailing list) |
| Row / time | yes | One entity at decision time |
| Label / outcome | yes | Window closed + outcome available before a row enters train/val/test |
| Baseline | yes | Previous way that stays callable on refuse or rollback |
| Metric | yes | Named gate (`average_precision`, `roc_auc`, ranking metric, amount error, concordance, …) |
| `min_metric` | yes | Bar the candidate must clear |
| Out of scope | yes | Uses the score must not claim (causal effect, auto-refuse, auto-dial, …) |
| Technical owner | yes | Who restores the previous live way in one action |

If the decision brief is missing, return to Name the decision (data handbook) before any profile or prediction runs.

## Four arcs on one spine

```text
Prepare  →  Fit  →  Ship  →  Watch
profile     freeze   test once   monitor
quality     train    pack        → new version id
outliers    tune     serve       never in-place weights
features    validate promote?
```

Google’s MLOps lifecycle is the map. OpenBI’s prediction notebook is the execution surface. Do not invent a second lifecycle.

## Evaluation boundary (four gates — none substitutes for another)

1. **Maturity** — outcome window closed **and** label available. Median delay is not maturity.
2. **Embargo** — temporal gap sized by label delay between train|val and val|test when a clock exists.
3. **Entity** — one entity key in at most one partition.
4. **Baseline** — beat the named previous way on the named metric on the same frozen rows.

## Stage contracts (OpenBI)

Each stage consumes named inputs, writes named evidence, and clears a pass line. Filenames below are the contract shape; in Studio they may live as notebook step outputs, version evidence, or project files — but the **pass lines stay**.

### 1 — Profile

**Do:** describe every column (type, nulls, distinct, examples; numerics: min/p01/median/p99/max/mean/std/skew). Assign one role: `id` | `time` | `decision_time` | `label` | `feature` | `drop`. Constant → drop. Near-unique → id, not feature.

**Pass:** every column has one role; label and decision time set.  
**Fail → stop.** Do not invent a label.

### 2 — Quality (no impute yet)

**Do:** completeness, validity, uniqueness on entity+decision time, clock (feature known before decision). Exclude immature rows from labeled sets. On matured rows only, record `label_delay_days` (median) to size Fit’s embargo. Plan train-only imputation; fit later on train.

**Pass:** label validity 100% on kept matured rows; unique key; no post-decision features; quarantine ≤ written max (default operating line `0.05` needs an owner — not a universal law).  
**Fail → stop.** Do not impute past the gate.

### 3 — Outliers as policy

**Do:** measure tails after impossibles are quarantined. Prefer modified Z (`|M| > 3.5`); if MAD = 0, Tukey fences. Write keep / log1p / cap / quarantine per numeric feature. Cap bounds and rare→OTHER maps are **learned on train later**.

**Pass:** every numeric feature has a policy. New quarantine → return to Quality.

### 4 — Features that hold

**Do:** every kept transform must score **one new row** from decision-time inputs alone. Fit scalers, imputers, encoders, target means on **train only**. Allowed: raw, log1p, missing indicator, days_since, ratio of decision-time columns, train-only categorical consolidation, out-of-fold target encoding on train (validation/test/live use the frozen train map).

**Drop:** post-decision values; id; label; operational act after ranking treated as a feature; full-sample target mean; anything that fails the clock test. High label correlation is a flag, not a keep.

In OpenBI: build features in DAX/`Features.At(d)` so as-of time cannot see the future. Run `Checks.Leakage` before treating a draft as credible.

**Pass:** every kept feature is decision-time and `fit_on: train`; dropped columns stay listed with reason.

### 5 — Freeze the split

**Do:** matured rows only. Prefer time order: last ~10% test, previous ~10% validation, rest train; same embargo at both boundaries; entity keys disjoint. Persist the test cohort identity (hash / id list / sealed fold). **No preprocessor fit before the freeze.**

Without a clock: stratified random with fixed seed — weaker; still require maturity and disjoint entities.

**Pass:** maturity + embargo + entity disjointness + test sealed.  
Training code must not load sealed test rows until Ship.

### 6 — Train inside the freeze

**Do:**

1. Fit every preprocessor on train only; save with the model.
2. Inner slice = last tenth of train (or inner CV folds that never touch validation/test). All candidate selection happens here.
3. Score baseline on the inner slice with the named metric.
4. Train a small set of candidates (e.g. regularized linear + tree / `LightGbm.Train`). Prune and tune on the inner slice only.
5. After inner work finishes, score validation **once** for the single remaining candidate (`val_reads = 1`). Freeze any hard threshold on that read.
6. Write draft via `Models.Save` / `prediction_train` with metrics and evidence. Status remains **draft**.

**Miss loops (finite; stay off validation/test):**

| Loop | Where | Budget |
|---|---|---|
| A Tune | Inner only | Max ~20 trials; early stop after ~5 flat trials (< 0.005) |
| B Features | Inner only | Max ~3 spec changes, then A again; no validation between revisions |
| C Data | Named defect only | New freeze; discard old test unread; `val_reads` resets; one Fit; still short → **blocked** |

Weak score alone is not Loop C. Do not reopen A/B on the same validation ids after a failed validation read.

**Pass:** validation clears bar + beats baseline; `val_reads = 1`; test never loaded.  
**Fail → blocked.** Do not read test. Do not serve.

OpenBI: prefer `LightGbm.CrossValidate` over `LightGbm.TimeFolds` for tuning. Hold out the sealed test for Ship. Explain with `Verdict.*` against the simple rule; never call a weak or “no better” result useful.

### 7 — Test once (official evaluation)

**Do:** load sealed test only after validation cleared. Apply train preprocessor — no refit. Score once. Report metric vs baseline on the same rows; calibration / slices when relevant. Apply the threshold frozen on validation. Do not search features or thresholds on test.

**Pass:** write test evidence; draft version shows **passed** operationally (still not live).  
**Fail → rejected.** Stop. No tune on test residuals.

### 8 — Pack / serve as candidate

**Do:** named version with preprocessor + model + feature contract + signature (known row name-for-name). Missing required feature → hard error, no silent fill. Previous live way remains callable.

**Pass:** signature OK; previous id recorded. Candidate may score in parallel.  
**Not live** until governance + cutover.

### 9 — Watch

**Do:** dated monitor evidence. Typical signals (thresholds need owners):

| Signal | Action |
|---|---|
| Required feature missing | Stop this version; fall back to previous way; re-enter Features |
| Feature drift (e.g. PSI above written line) | Keep current owner; re-enter Prepare with live sample |
| Score drift, features stable | Mature labeled cohort read before any refit |
| Label metric worse than test by > margin | New split on newer periods → new version id |

Monitor **never** updates weights in place. Continuous training = new version id.

### 10 — Governance gate (before ownership)

Fill the promote sheet (handbook `/6`). Blank line → **held**.

| Field | Required |
|---|---|
| Intended use | yes |
| Out of scope | yes |
| Decision owner | yes |
| Technical owner | yes |
| Evidence | test report, baseline, slices, feature/spec hash, label delay |
| Fallback | previous version / rule |
| Status | `approved` \| `held` |

**You never set approved.** Present the sheet and evidence; a person Accepts in Versions. Then `model_use` / `prediction_use` may promote to live.

Match ceremony to harm: private look stays a notebook; ranking that changes work needs this sheet; refuse / price / legal notice needs heavier review than this recipe writes.

## Three kinds of validity

| Gate | Question | Cleared by |
|---|---|---|
| Model validity | Is the evaluation trustworthy? | Maturity, embargo, entity, train-only fits, one validation read, one test read |
| Operational validity | Can it run and reverse? | Signature, missing-feature error, previous way callable, monitor writes, no silent retrain |
| Decision value | Should it own the workflow? | Not ranking alone; capacity, outcomes, unwanted actions, order risk; **approved** sheet |

Clearing one does not clear the others.

## Status vocabulary (use these words only)

| Term | Meaning |
|---|---|
| **candidate** | Named version that may score in parallel; does not own the decision |
| **blocked** | Fit stop; test never loaded |
| **rejected** | Test fail; do not serve as release |
| **passed** | Test cleared — operational evidence only |
| **held** | Governance refuses ownership; parallel-only |
| **approved** | Person accepted the sheet for the named use; still not live until cutover |
| **live** | Owns the decision; rollback restores previous live way |
| **draft** (OpenBI) | `Models.Save` / train output awaiting human Accept |

## Hard stops

- No decision, owner, label, decision time, metric, baseline, or min bar.
- Quarantine above the written max after Quality.
- Feature not computable at decision time / leakage check fail treated as pass.
- Training code loads sealed test ids.
- Validation used to tune or to pick among successive candidates on the same ids.
- Second scored validation read on the same freeze (except new freeze after Loop C).
- Test residuals used to change the model on the same test ids.
- Silent retrain or in-place weight update from a monitor alert.
- Agent marks a version approved or puts it live without the person’s Accept.
- Invented lift, fairness results, or demographic slices the run does not have.

## OpenBI tool order (default)

1. `prediction_patterns` — pick the pattern that answers the question.
2. `prediction_suggest` — fill from the model; ask only unknowns (churn definition, horizon, outcome).
3. Say the question back in plain words; then `prediction_create` / notebook steps.
4. `prediction_check` — fix what it shows; settle missing with `prediction_set` when needed.
5. `prediction_train` — draft version + evidence.
6. Stop. Person Approves (or not) in Versions.
7. Only after Accept: `prediction_use` / `model_use`.
8. Watch; on miss, new version from stage 5 or earlier — never overwrite live.

For hand-authored notebooks: same gates. Last train step saves with `Models.Save` (or `Models.SaveForecast` / `Results.Save` for OR/quant/network). `Checks.Leakage` and a simple-rule `Verdict` stay on the evidence. Do not tune LightGBM knobs unless the user asks.

## Done definition

A version may be called done for **operations** only when test evidence says passed, signature / serve checks pass, and the previous way remains callable.

A version may own the **decision** only when the governance sheet is **approved** by a person and cutover has made it **live**.

`passed` alone is not live. A green fit that skipped the freeze is not done.

## When a draft is cheap

A generated notebook can look complete and still have spent the holdout, fitted on the full table, treated an after-the-fact act as a feature, or used median delay while immature rows sat in test. The destination, the arcs, the evaluation boundary, and these stage contracts still apply.
