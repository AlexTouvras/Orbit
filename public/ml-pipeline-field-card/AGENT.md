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

Handbook illustration (synthetic): call-order for open overdue invoices at this morning’s cut; label = called and paid within fourteen days; baseline / previous way = oldest past-due first. Do not invent amounts or treat the illustration as a measured result.

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
| Label delay | median(`label_time - decision_time`) in days → write `label_delay_days` |

Record planned train-only imputation: numeric median, categorical mode, missing indicator when train null_rate > 0.01.

Recompute profile on kept rows. Write before/after counts in `quality.json`.

**Pass**

- Label validity = 100% on kept rows.
- Entity key unique at decision time.
- No remaining feature uses post-decision values.
- Quarantine rate ≤ 0.05.

**Fail → stop** if quarantine rate > 0.05 or clock failures remain.

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

1. Sort by decision time.
2. Last 10% → test. Previous 10% → validation. Rest → train.
3. Embargo = `label_delay_days` between train|validation and validation|test. Gap rows enter neither set.
4. No decision time → stratified random split, fixed seed, same sizes.
5. Persist row ids. Hash test ids into `split_ids.parquet`.
6. Training code loads train + validation only.

**Pass**

- Id sets disjoint.
- `max(train.decision_time) + embargo ≤ min(validation.decision_time)`.
- Same for validation → test.
- Test hash stored.

## Stage 6 — Train and tune

**Do**

1. Fit every preprocessor on train only; apply to validation. Save `preprocess.joblib`.
2. Inner slice = last 10% of train. Official validation is not for tuning.
3. Score baseline on inner slice with `task.json.metric`.
4. Train one regularized linear model and one tree model.
5. Rank features by permutation importance on inner slice. Drop importance ≤ 0. Record drops. Refit.
6. If inner score < `min_metric` **or** not beating baseline → **Loop A**.
7. After Loop A clears (or budget ends still short → Loop B): score official validation **once**. Write `val_reads`.

**Loop A — tune (inner only)**

- Max 20 random trials on declared search space.
- Stop early if 5 consecutive trials improve best by < 0.005.
- Never read validation or test.
- Clears when inner metric ≥ `min_metric` and beats baseline.
- Else → Loop B.

**Loop B — features (max 3 revisions)**

- One change to `feature_spec.json` per pass, driven by inner-slice error segments.
- Refit; Loop A with 10 trials.
- Spend a validation read only after inner clears.
- Stop after 3 revisions or improvement < 0.005 → Loop C.

**Loop C — data (once)**

- Enter only for a named data defect (wrong labels, duplicates, clock failure, wrong units). A weak score alone is not a data defect.
- Repair via stage 2 or 3. New split. Discard old test ids unread.
- One stage-6 run. If validation still fails → **STOP `blocked`**. Do not read test. Do not serve.

**Pass**

- Validation metric ≥ `min_metric` and beats baseline.
- `val_reads` recorded.
- Test ids never loaded.
- Write `model.joblib`, `val_metrics.json`.

**Fail after Loop C → `model_card.status = "blocked"`.** Stop.

## Stage 7 — Test (once)

**Do**

1. Load test ids. Transform with train preprocessor. Score once.
2. Report decision metric, baseline on same rows, 10-bin calibration, per time bucket, per `segment_columns`.
3. If a hard decision needs a threshold: choose on validation, apply to test. Do not search on test.

**Pass**

- Test metric ≥ `min_metric` and beats baseline.
- Required segments ≥ `segment_floor`.
- Write `test_report.json` and `model_card.json` (data path, spec hash, metrics, `val_reads`, label delay, segments).

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
- Quarantine rate > 0.05 after stage 2.
- Feature not computable at decision time.
- Test hash present and training code loads those ids.
- `val_reads` would be used to tune hyperparameters.
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

## Done definition

A version may be called done only when `model_card.status = "passed"`, stage 8 signature tests pass, previous version remains callable, and the governance sheet status is `approved`.
