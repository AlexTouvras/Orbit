# ML pipeline — agent recipe

Machine instructions. Humans read the handbook:

| Arc | Chapter |
|---|---|
| Operating model | `/handbooks/models-that-stay-in-the-decision/1` |
| Prepare | `/handbooks/models-that-stay-in-the-decision/2` |
| Features | `/handbooks/models-that-stay-in-the-decision/3` |
| Fit | `/handbooks/models-that-stay-in-the-decision/4` |
| Ship and watch | `/handbooks/models-that-stay-in-the-decision/5` |
| Governance / model card | `/handbooks/models-that-stay-in-the-decision/6` |

Method card: `/ml-pipeline-field-card/`.

Handbook illustration (synthetic): call-order for open overdue invoices at this morning’s cut; label = paid within fourteen days of the cut (call event is separate — ranking informs contact, the score does not claim the causal effect of a call); baseline / previous way = oldest past-due first. Do not invent amounts or treat the illustration as a measured result.

Do not skip stages. Do not fit, impute, scale, encode, or select features using validation or test rows. Do not retrain from a monitor alert without a new version id.

## Inputs required before stage 1

Create `task.json`:

| Field | Required | Meaning |
|---|---|---|
| `label_column` | yes | Outcome column |
| `entity_key` | yes | One row identity at decision time |
| `decision_time_column` | yes | Instant the decision is made |
| `event_time_column` | if present | When a feature value became known |
| `min_metric` | yes | Gate the candidate must beat |
| `metric` | yes | `average_precision` \| `roc_auc` \| `mae` \| named decision cost |
| `baseline` | yes | `majority_class` \| `train_mean` \| named rule |
| `segment_columns` | optional | Slices that must clear a floor |
| `segment_floor` | optional | Minimum metric per required segment |
| `domains` | optional | Allowed values per column |
| `label_delay_days` | optional | Override; else compute in stage 2 |
| `monitor_margin` | optional | Default `0.05` absolute on the decision metric |
| `quarantine_rate_max` | optional | Default `0.05`. This recipe’s operating threshold, not a universal law. Owner must justify overrides. |

Stop if `label_column` or `decision_time_column` is missing.

## Artifact chain

```text
raw table
  → profile.json
  → quality.json + quarantine.parquet
  → outlier_policy.json
  → feature_spec.json
  → split_ids.parquet          # test ids frozen
  → preprocess.joblib + model.joblib + val_metrics.json
  → test_report.json + model_card.json
  → bundle/<version>/
  → monitor/<date>.json
```

## Stage 1 — Profile

**Do**

1. For every column write: dtype, null_count, null_rate, nunique, five example values.
2. Numeric: min, p01, p50, p99, max, mean, std, skew.
3. Label: positive_rate (or value distribution).
4. Decision time: min, max.
5. Assign role: `id` | `time` | `decision_time` | `label` | `feature` | `drop`.
6. Role rules: constant → `drop`. `nunique / nrows > 0.95` → `id`, not `feature`.

**Pass**

- `profile.json` exists.
- Label and decision time roles are set.
- Every column has exactly one role.

**Fail → stop.** Do not invent a label.

## Stage 2 — Quality

**Do** (no imputation yet)

| Check | Action |
|---|---|
| Completeness | null_rate > 0.40 → mark column `drop`, or keep with `missing_indicator: true` written on the column |
| Validity | value outside `task.json.domains`, or illegal label → quarantine row (label) or null the cell and count (feature) |
| Uniqueness | duplicate on `entity_key` + decision time → keep latest by event time; quarantine others |
| Clock | feature event_time ≥ decision_time → drop column or rebuild with `event_time < decision_time` |
| Label maturity | A row is **mature** only when (1) the outcome window has closed (illustration: fourteen days after `decision_time`) **and** (2) the outcome label is available. Window still open, or label missing/unknown → exclude from labeled train/validation/test. Median label delay is **not** proof of maturity. |
| Label delay | on matured rows only: median(`label_time - decision_time`) in days → write `label_delay_days` (unless `task.json` overrides). Used later only as the Fit **embargo** size. |

Record planned train-only imputation: numeric median, categorical mode, missing indicator when train null_rate > 0.01.

Recompute profile on kept matured rows. Write before/after counts and matured/immature counts in `quality.json`.

**Pass**

- Label validity = 100% on kept matured rows.
- Entity key unique at decision time.
- No remaining feature uses post-decision values.
- Quarantine rate ≤ `quarantine_rate_max` (default `0.05`).
- Immature rows (window open **or** outcome unavailable) are recorded and excluded from labeled evaluation sets.

**Fail → stop** if quarantine rate > `quarantine_rate_max` or clock failures remain.

**Note.** Label maturity and the Fit embargo are different controls. Maturity is window closed + outcome available. The embargo is temporal separation between partitions sized by `label_delay_days`. A median-delay embargo alone does not prove every label has matured.

## Stage 3 — Outliers

**Do**

1. Impossible values already quarantined in stage 2.
2. Per numeric feature, modified z: `0.6745 * (x - median) / MAD`. Flag `|z| > 3.5`. If MAD = 0, use Tukey fences `Q1 - 1.5 IQR`, `Q3 + 1.5 IQR`.
3. Flags measure the tail. They do not delete rows by default.
4. Write one policy per numeric column: `keep` | `log1p` | `cap` | `quarantine`.
5. `log1p` only if skew > 1 and min ≥ 0. `cap` bounds learned later on train at p01/p99.
6. Rare categories are not outlier rows. Stage 6 maps train count < 30 → `OTHER`.

**Pass**

- Every numeric feature has a policy and a touch-rate.
- New quarantine → re-enter stage 2.

## Stage 4 — Features

**Do**

Write `feature_spec.json` with one row per candidate. Every transform must score one new row from decision-time inputs only.

Allowed: raw column, `log1p`, missing indicator, `days_since(source, decision_time)`, ratio of two decision-time columns, categorical consolidation fit on train, out-of-fold target encoding on train only (smoothing `m = 20` toward train base rate).

**Drop** when any is true:

- Not available at decision time.
- nunique = 1, or one level > 99.5% of rows.
- Duplicate of another column, or `|corr| > 0.999` (keep fewer nulls).
- Identifier role.
- Spec requires a full-sample target mean, scaler, or any fit that included validation/test.

High label correlation → flag only. Clock test decides.

**Pass**

- Every kept feature has `fit_on: "train"` and clock pass.
- Dropped features remain listed with reason.

## Stage 5 — Split (freeze test)

**Do**

1. Start from matured rows only (outcome window closed **and** outcome available). Immature rows never enter train, validation, or test.
2. Sort by decision time.
3. Last 10% → test. Previous 10% → validation. Rest → train.
4. Embargo = `label_delay_days` between train|validation **and** between validation|test (same rule both boundaries). Gap rows enter neither adjacent set. This is temporal separation — not a substitute for maturity, and not proof that a gap row is mature.
5. Enforce entity leakage control: each `entity_key` appears in at most one of train, validation, test. If a key would cross, keep it in the earliest partition that claimed it and drop later copies from evaluation.
6. No decision time → stratified random split, fixed seed, same sizes; still require maturity and disjoint entity keys (embargo N/A without a clock).
7. Persist row ids. Hash test ids into `split_ids.parquet`.
8. Training code loads train + validation only. Test ids stay unloaded until stage 7.

**Pass**

- Every row in train, validation, and test is matured (window closed + outcome available).
- Entity id sets disjoint across partitions.
- `max(train.decision_time) + embargo ≤ min(validation.decision_time)`.
- `max(validation.decision_time) + embargo ≤ min(test.decision_time)`.
- Test hash stored.

**Fail → stop** if maturity, embargo, or entity disjointness fails.

## Stage 6 — Train and tune

**Do**

1. Fit every preprocessor on train only; apply transforms to validation without scoring for selection. Save `preprocess.joblib`.
2. Inner slice = last 10% of train. All candidate selection happens here.
3. Score baseline on inner slice with `task.json.metric`.
4. Train one regularized linear model and one tree model.
5. Rank features by permutation importance on inner slice. Drop importance ≤ 0. Record drops. Refit.
6. If inner score < `min_metric` **or** not beating baseline → **Loop A** (then **Loop B** if still short). Stay on the inner slice for every revision.
7. When Loops A and B are finished (inner cleared, or budgets exhausted with no clear) and one candidate remains that cleared the inner bar: score official validation **once**. Write `val_reads = 1`. On that same read, if a hard threshold is required, choose it here and freeze it for stage 7. If no inner candidate cleared → do not read validation; go to Loop C or **STOP `blocked`**.

**Validation contract (same frozen split)**

- At most one scored validation read per frozen `split_ids.parquet`.
- Never score validation between Loop A trials or Loop B feature revisions.
- Never select a successive candidate using a previous validation score on the same validation ids.
- A failed validation candidate does not return to A/B on these validation ids — that would be an informal repeated selection loop.
- Validation fail on this split → **STOP `blocked`** (or Loop C only for a named data defect that forces a **new** split).

**Loop A — tune (inner only)**

- Max 20 random trials on declared search space.
- Stop early if 5 consecutive trials improve best by < 0.005.
- Never read validation or test.
- Clears when inner metric ≥ `min_metric` and beats baseline.
- Else → Loop B.

**Loop B — features (max 3 revisions, inner only)**

- One change to `feature_spec.json` per pass, driven by inner-slice error segments.
- Refit; Loop A with 10 trials on the inner slice.
- Do not read validation between revisions.
- Stop after 3 revisions or improvement < 0.005. Then take the single best inner-cleared candidate to the one validation read, or enter Loop C / blocked if none cleared.

**Loop C — data (once)**

- Enter only for a named data defect (wrong labels, duplicates, clock failure, wrong units). A weak score alone is not a data defect.
- Repair via stage 2 or 3. New split. Discard old test ids unread. `val_reads` resets with the new freeze.
- One stage-6 run on the new split (inner work, then one validation read). If validation still fails → **STOP `blocked`**. Do not read test. Do not serve.

**Pass**

- Validation metric ≥ `min_metric` and beats baseline.
- `val_reads = 1` for this split.
- Test ids never loaded.
- Write `model.joblib`, `val_metrics.json`.

**Fail after Loop C → `model_card.status = "blocked"`.** Stop.

## Stage 7 — Test (once)

**Do**

1. Load frozen test ids only after stage 6 left a validation-cleared candidate (`val_reads = 1` and validation cleared). Transform with train preprocessor. Score once.
2. Report decision metric, baseline on same rows, 10-bin calibration, per time bucket, per `segment_columns`.
3. If a hard decision needs a threshold: the threshold was chosen on the single validation read in stage 6; apply that frozen threshold to test. Do not search thresholds on test. Do not reopen feature or hyperparameter selection from test residuals.

**Pass**

- Test metric ≥ `min_metric` and beats baseline.
- Required segments ≥ `segment_floor`.
- Write `test_report.json` and `model_card.json` with `status = "passed"` (data path, spec hash, metrics, `val_reads`, label delay, segments).

**Fail → `model_card.status = "rejected"`.** Stop. Do not open a tuning loop on test residuals.

## Stage 8 — Serve

**Do**

1. Pack `preprocess.joblib`, `model.joblib`, `feature_spec.json`, version id into `bundle/<version>/`.
2. Signature test: one known training row → feature vector name-for-name and dtype-for-dtype match.
3. Missing required feature → hard error (no silent fill).
4. Keep previous version loaded. New version does not own the decision until monitor holds.

**Pass**

- Signature match.
- Missing-feature request errors.
- Previous version id recorded.

**Fail → do not promote.**

## Stage 9 — Monitor

Daily, against training distribution in the bundle:

| Signal | Threshold | Action |
|---|---|---|
| Required feature missing rate | > 0 | Stop this version; error responses; re-enter stage 4 |
| Feature PSI | > 0.25 | Keep current; re-enter stage 2 with live sample |
| Score PSI (features OK) | > 0.25 | Keep current; re-enter stage 7 on mature labeled cohort; do not refit first |
| Label metric vs test | worse by > `monitor_margin` | New version: re-enter stage 5 on new labeled window |
| All clear | — | Write `monitor/<date>.json`; stay |

PSI uses train decile edges: `Σ (p_live - p_train) * ln(p_live / p_train)`.

Monitor never updates weights in place. Next model = new version id.

## Hard stops

- No `task.json` label or decision time.
- Quarantine rate > `quarantine_rate_max` after stage 2.
- Feature not computable at decision time.
- Test hash present and training code loads those ids.
- `val_reads` would be used to tune hyperparameters or to choose among successive candidates on the same validation ids.
- A second scored validation read on the same frozen split (except a fresh split after Loop C).
- Test residuals used to change the model on the same test ids.
- Silent retrain from a monitor alert.

## Stage 10 — Governance gate (before the version owns the decision)

After stage 8 passes and before the candidate replaces the previous way in the workflow, fill the promote sheet (handbook `/6`):

| Field | Required |
|---|---|
| `intended_use` | yes |
| `out_of_scope` | yes |
| `decision_owner` | yes |
| `technical_owner` | yes |
| `evidence` | link to test report, baseline, slices, spec hash |
| `fallback` | previous version id / rule |
| `status` | `approved` \| `held` |

**Pass:** every field filled; `status = approved`; fallback callable.  
**Fail → `held`.** Candidate may stay in parallel score only. It does not own the decision.

On the call-order illustration: intended use = order today’s overdue list; out of scope includes offer of more time and auto-dial without a person; fallback = oldest-first.

## Status vocabulary (use these words only)

| Term | Meaning |
|---|---|
| **candidate** | Named `bundle/<version>/` that may score in parallel. Does **not** own the decision until promoted. |
| **blocked** | Fit stop. Validation unread or validation failed on this freeze (after loops). Test never loaded. `model_card.status = "blocked"`. |
| **rejected** | Test fail. `model_card.status = "rejected"`. No serve of this version as a release. |
| **passed** | Test cleared. `model_card.status = "passed"`. Operational evidence only — not permission to own the decision. |
| **held** | Governance sheet refuses ownership. Candidate may stay parallel-only. |
| **approved** | Governance sheet filled and accepted for the named use. Still not live until cutover. |
| **promoted / live** | Version (or oldest-first fallback) that **owns** the decision in the workflow. Rollback restores the previous live way. |

## Done definition

A version may be called done only when `model_card.status = "passed"`, stage 8 signature tests pass, previous version remains callable, and the governance sheet status is `approved`. Ownership of the decision requires promote/cutover to **live**; `passed` alone is not live.
