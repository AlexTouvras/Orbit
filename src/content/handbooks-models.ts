/**
 * Models that stay relevant — handbook 05.
 * Product owner: docs/product/HANDBOOKS.md
 */
import type { Handbook, HandbookLink } from "@/content/handbooks";

const DATA_CARD = "/analytics-field-card/index.html";
const SDLC_CARD = "/sdlc-field-card/index.html";
const ML_CARD = "/ml-pipeline-field-card/";
const ML_AGENT = "/ml-pipeline-field-card/AGENT.md";
const ML_ART = "/handbook-art/models-that-stay-in-the-decision";

function source(href: string, label: string): HandbookLink {
  return { href, label };
}

function dataChapter(page: number, label: string): HandbookLink {
  return { href: `/handbooks/data-that-drives-decisions/${page}`, label };
}

function mlChapter(page: number, label: string): HandbookLink {
  return { href: `/handbooks/models-that-stay-in-the-decision/${page}`, label };
}

const NIST_OUTLIER = source(
  "https://www.itl.nist.gov/div898/handbook/eda/section3/eda35h.htm",
  "NIST / Iglewicz and Hoaglin, modified Z-score",
);
const SKLEARN_LEAKAGE = source(
  "https://scikit-learn.org/stable/common_pitfalls.html#data-leakage",
  "scikit-learn, data leakage",
);
const SKLEARN_SPLIT = source(
  "https://scikit-learn.org/stable/modules/cross_validation.html#cross-validation",
  "scikit-learn, cross-validation",
);
const GOOGLE_MLOPS = source(
  "https://services.google.com/fh/files/misc/practitioners_guide_to_mlops_whitepaper.pdf",
  "Google, Practitioners guide to MLOps, May 2021",
);
const GOOGLE_CT = source(
  "https://docs.cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning",
  "Google Cloud, MLOps continuous delivery and automation pipelines",
);
const FOWLER_PIPE = source(
  "https://martinfowler.com/bliki/DeploymentPipeline.html",
  "Fowler, deployment pipeline",
);
const MODEL_CARDS = source(
  "https://dl.acm.org/doi/10.1145/3287560.3287596",
  "Mitchell et al., Model Cards for Model Reporting, FAT* 2019",
);

export const MODELS_THAT_STAY_IN_THE_DECISION: Handbook = {
  slug: "models-that-stay-in-the-decision",
  index: "05",
  title: "Models that stay relevant",
  thesis:
    "A model stays relevant when the pipeline can refuse it, promote it, watch it, and roll it back without silent overwrite.",
  card: { href: ML_CARD, label: "ML pipeline field card" },
  contents: [
    { title: "What good looks like", page: 1 },
    { title: "Prepare the table", page: 2 },
    { title: "Features that hold", page: 3 },
    { title: "Fit without spending the holdout", page: 4 },
    { title: "Ship and watch", page: 5 },
    { title: "Name what the version may do", page: 6 },
  ],
  pages: [
    {
      number: 1,
      topic: "The practice",
      title: "What good looks like",
      lede: "Good looks like a model that can stay in a workflow: reproducible from files, rejectable at a gate, promotable as a named version, monitorable in production, and reversible to a previous version that still answers.",
      rule: "My operating rule: freeze the test ids before any fit, fit every transform on train only, clear an inner bar before validation is read, read the test set once for the official evaluation, keep the previous version callable, and start a new version id when live evidence fails — never overwrite the live weights in place.",
      illustration:
        "Scope and evidence: the call-order path is a synthetic illustration, not a measured result. It states no amount. Citations below were checked 29 Oct 2026 against their primary pages.",
      reviewed: "29 Oct 2026",
      plate: "pipeline",
      sections: [
        {
          id: "destination",
          title: "The destination",
          paragraphs: [
            "The end state is not a notebook that once scored well. It is a decision brief that names who acts and what the score may change, a pipeline that leaves files the next stage can refuse, a named bundle beside a previous version that still answers, and a monitor that starts a new run when live evidence fails.",
            "Pipeline correctness is model validity and operational validity. It does not, by itself, prove fairness, business value, or that the decision improved. Those need owners, intended use, and evidence beyond a green fit.",
          ],
          figure: {
            kind: "pipeline",
            caption:
              "Destination: brief in, controlled pipeline, named release, watch with rollback. A miss starts a new version; it does not rewrite the live bundle.",
            note: "Rollback restores the previous callable version. Continuous training is a new run, not a silent weight update.",
            steps: [
              { term: "Brief", detail: "Who acts; what may change" },
              { term: "Pipeline", detail: "Prepare → Fit → Ship" },
              { term: "Release", detail: "bundle/<version>/" },
              {
                term: "Watch",
                detail: "monitor/<date>.json",
                spine: "new version or rollback",
              },
            ],
          },
          sources: [GOOGLE_MLOPS, GOOGLE_CT],
        },
        {
          id: "arcs",
          title: "Four arcs",
          paragraphs: [
            "Google’s Practitioners guide to MLOps (May 2021) names seven integrated processes: ML development, training operationalization, continuous training, model deployment, prediction serving, continuous monitoring, and data and model management. I use that lifecycle as the map. I do not copy Google’s product stack.",
            "On this card the same work is four arcs. Prepare covers profile, quality, outliers, and features. Fit covers the freeze, train, tune, and validation. Ship covers the one official test read, versioning, and serving. Watch covers continuous monitoring and a controlled return. Continuous training, in Google’s sense, is repeatedly executing the training pipeline when data or code changes — on this card, that return starts a new version id. It is not a silent overwrite of live weights.",
          ],
          figure: {
            kind: "pipeline",
            caption:
              "Four arcs on one spine. Watch returns as a new version id.",
            note: "Google’s seven processes sit inside these arcs. Stage contracts below name the files.",
            steps: [
              { term: "Prepare", detail: "Profile → quality → outliers → features" },
              { term: "Fit", detail: "Split → train → tune → validate" },
              { term: "Ship", detail: "Test once → serve" },
              {
                term: "Watch",
                detail: "Monitor daily",
                spine: "new version",
              },
            ],
          },
          sources: [GOOGLE_MLOPS, GOOGLE_CT, { href: ML_AGENT, label: "ML pipeline agent recipe" }],
        },
        {
          id: "case",
          title: "One decision",
          paragraphs: [
            "One synthetic illustration runs through this book. A collections supervisor orders today’s call list for open invoices that are already past due. The score may change who is called first. It does not replace credit policy, auto-dial, or the controller’s offer of more time — that offer stays on Data that drives decisions.",
            "Decision timestamp: this morning’s list cut. Row: one open overdue invoice as of that cut. Action the ranking informs: placing a call (an operational event after the score; not a feature). Prediction target: whether that invoice is paid within fourteen days of the cut. The call event and the payment outcome are separate. The score ranks invoices; it does not estimate the causal effect of placing a call.",
            "Label availability: the fourteen-day window must close before a row can enter labeled evaluation. Invoices that have not matured stay out of train, validation, and test for that label; the split embargo uses the median label delay written in Prepare. Historical labels were produced under whatever contact policy was then in force, so offline ranking metrics gate order quality relative to oldest-past-due-first under that regime — they do not prove that calling caused payment. Oldest-past-due-first stays the baseline and the callable fallback.",
          ],
          figure: {
            kind: "sheet",
            caption:
              "Decision brief for the call-order illustration. Blank lines stop the work. No amount is a collected result.",
            steps: [
              { term: "Decision", detail: "Who is called first on today’s open overdue list." },
              { term: "Owner", detail: "Collections supervisor who owns the order." },
              { term: "Row / time", detail: "One open overdue invoice at this morning’s cut." },
              {
                term: "Target",
                detail: "Paid within fourteen days of the cut — not “called and paid.”",
              },
              {
                term: "Baseline",
                detail: "Oldest past-due first. Stays callable on refuse or rollback.",
                gate: true,
              },
            ],
          },
          picture: {
            src: `${ML_ART}/decision.jpg`,
            alt: "An illustration. A tray of blank slips, a glass measure, and an empty ranking tray. No amount.",
          },
          sources: [
            dataChapter(6, "Choose the work"),
            dataChapter(2, "Name the decision"),
            mlChapter(3, "Features that hold"),
            mlChapter(4, "Fit without spending the holdout"),
          ],
        },
        {
          id: "layers",
          title: "How to read this with the card",
          paragraphs: [
            "The ML pipeline field card is the map of the spine. The agent recipe at the same path is the same pipeline as machine-checkable stages and filenames. These chapters are how a person operates the work, and how I refuse a green training run that skipped a gate.",
            "Data that drives decisions owns one number (Ask, Grain, Truth, Use). Software that stays in use owns one software change. This book starts when the artifact is a model trained from a table and that model will be used in a decision. If the decision brief is missing, return to Name the decision before any profile runs.",
          ],
          sources: [
            { href: ML_CARD, label: "ML pipeline field card" },
            { href: ML_AGENT, label: "ML pipeline agent recipe" },
            dataChapter(2, "Name the decision"),
            { href: DATA_CARD, label: "Data analytics field card" },
          ],
        },
        {
          id: "contracts",
          title: "Stage contracts",
          paragraphs: [
            "Inside the arcs the agent recipe defines nine stages. Each stage consumes named inputs and writes named outputs. The next stage starts only when the pass line clears. Filenames below are the recipe’s contracts — not a claim that a live repo already holds them.",
            "task.json is required before stage 1: label column, entity key, decision-time column, metric, baseline, and min_metric. Optional quarantine_rate_max defaults to 0.05 in this recipe; that default is an operating threshold for this card, not a universal law. A different dataset needs its own written threshold and owner.",
            "Artifacts in order: profile.json → quality.json and quarantine.parquet → outlier_policy.json → feature_spec.json → split_ids.parquet → preprocess.joblib, model.joblib, and val_metrics.json → test_report.json and model_card.json → bundle/<version>/ → monitor/<date>.json. Validation metrics are written in Fit. The official test report and model card are written when test is read once in Ship. The bundle is the promotable package; the model card status is not a substitute for the governance sheet on Name what the version may do.",
          ],
          figure: {
            kind: "uses",
            caption:
              "Nine-stage reference. Pass and fail follow the agent recipe. Re-run notes say whether approved evidence stays valid.",
            steps: [],
            head: ["Stage", "Writes", "Pass / fail", "Re-run"],
            rows: [
              {
                label: "1 Profile",
                cells: [
                  "profile.json",
                  "Pass: every column has one role; label and decision time set. Fail → stop.",
                  "Safe to re-run; later stages must re-run after a role change.",
                ],
              },
              {
                label: "2 Quality",
                cells: [
                  "quality.json, quarantine.parquet",
                  "Pass: label valid, key unique, no post-decision features, quarantine ≤ quarantine_rate_max. Fail → stop.",
                  "Re-run invalidates downstream fits until they re-run.",
                ],
              },
              {
                label: "3 Outliers",
                cells: [
                  "outlier_policy.json",
                  "Pass: every numeric feature has a policy. New quarantine → return to Quality.",
                  "Policy change requires Feature and Fit again.",
                ],
              },
              {
                label: "4 Features",
                cells: [
                  "feature_spec.json",
                  "Pass: kept features are decision-time and fit_on train. Fail → stop or drop.",
                  "Spec change invalidates Fit evidence.",
                ],
              },
              {
                label: "5 Split",
                cells: [
                  "split_ids.parquet (test hash frozen)",
                  "Pass: disjoint ids; embargo held. Fail → stop.",
                  "New split discards unread old test ids; prior test reports do not transfer.",
                ],
              },
              {
                label: "6 Train",
                cells: [
                  "preprocess.joblib, model.joblib, val_metrics.json",
                  "Pass: validation ≥ min_metric and beats baseline; test never loaded. Fail after loops → blocked.",
                  "Reproducible run ≠ promotable release. Miss loops stay inside train until validation is read once.",
                ],
              },
              {
                label: "7 Test",
                cells: [
                  "test_report.json, model_card.json",
                  "Pass: one official read clears the bar. Fail → rejected. No tune on test residuals.",
                  "A second selection on the same test ids invalidates the holdout’s role.",
                ],
              },
              {
                label: "8 Serve",
                cells: [
                  "bundle/<version>/",
                  "Pass: signature match; missing feature errors; previous version recorded. Fail → do not promote.",
                  "New version id only. Does not own the decision until governance and Watch allow it.",
                ],
              },
              {
                label: "9 Monitor",
                cells: [
                  "monitor/<date>.json",
                  "Signals return to Features, Prepare, a mature test read, or a new split — never in-place weights.",
                  "Always a new version id when a model changes.",
                ],
              },
            ],
          },
          sources: [{ href: ML_AGENT, label: "ML pipeline agent recipe" }, SKLEARN_LEAKAGE, SKLEARN_SPLIT],
        },
        {
          id: "stage-example",
          title: "One stage, worked",
          paragraphs: [
            "Quality (stage 2) shows the contract shape. Inputs are the profiled table and task.json domains. Outputs are quality.json and quarantine.parquet. Transforms are not fitted here; imputation rules are only planned for train later.",
          ],
          figure: {
            kind: "sheet",
            caption:
              "Stage 2 contract on the call-order path. Quarantine_rate_max defaults to 0.05 in this recipe.",
            steps: [
              {
                term: "Inputs",
                detail: "profile.json roles; raw rows; task.json domains and quarantine_rate_max.",
              },
              {
                term: "Outputs",
                detail: "quality.json (before/after counts, label delay); quarantine.parquet.",
              },
              {
                term: "Pass",
                detail: "Label validity 100% on kept rows; unique key; no post-cut features; quarantine ≤ max.",
              },
              {
                term: "Fail",
                detail: "Above the quarantine max, or clock failures remain → stop. Do not impute past the gate.",
                gate: true,
              },
            ],
          },
          sources: [{ href: ML_AGENT, label: "ML pipeline agent recipe" }, mlChapter(2, "Prepare the table")],
        },
        {
          id: "validity",
          title: "Three kinds of validity",
          paragraphs: [
            "Model validity: the freeze held, transforms fitted on train only and applied without refitting, test read once, miss loops stayed inside their budgets. That is necessary for a trustworthy evaluation number.",
            "Operational validity: the bundle serves with a signature test, missing features error, previous version callable, monitor writes daily files, and Watch cannot silently retrain. A reproducible training run is not yet a promotable release.",
            "Decision value: whether the ranking improved the supervisor’s work under the named intended use. Pipeline gates do not prove that. Governance names intended use, prohibited use, owners, monitoring, and rollback before a version owns the list order.",
          ],
          sources: [
            MODEL_CARDS,
            mlChapter(5, "Ship and watch"),
            mlChapter(6, "Name what the version may do"),
            FOWLER_PIPE,
          ],
        },
        {
          id: "draft",
          title: "When a draft is cheap",
          paragraphs: [
            "A generated training script can look complete and still have spent the holdout, fitted the imputer on the full table, or treated “called and paid” as one label. The destination, the arcs, and the stage contracts still apply.",
            "This holds when a draft is cheap: a green fit is not done until test_report and model_card say passed, the bundle keeps a previous version callable, and the governance sheet is approved for the named use.",
          ],
        },
      ],
      sources: [
        { href: ML_CARD, label: "ML pipeline field card" },
        { href: ML_AGENT, label: "ML pipeline agent recipe" },
        { href: DATA_CARD, label: "Data analytics field card" },
        GOOGLE_MLOPS,
        GOOGLE_CT,
        MODEL_CARDS,
        SKLEARN_LEAKAGE,
        SKLEARN_SPLIT,
        FOWLER_PIPE,
      ],
    },
    {
      number: 2,
      topic: "Data",
      title: "Prepare the table",
      lede: "Prepare is the first arc. Profile, quality, and outlier policy leave files Fit can refuse. After every repair, describe the table again — a fill, drop, or clip changes the distribution the next stage will trust.",
      rule: "My operating rule: assign every column a role, score quality before any impute, write an outlier policy instead of a silent delete, and stop when the quarantine rate exceeds quarantine_rate_max for this run.",
      illustration: "Same call-order illustration as What good looks like. Synthetic; no amount.",
      reviewed: "29 Oct 2026",
      sections: [
        {
          id: "describe",
          title: "Profile first",
          paragraphs: [
            "Write profile.json before anything is cleaned. For every column: type, null count, null rate, distinct count, five examples. Numeric columns add min, p01, median, p99, max, mean, standard deviation, and skew. For the label add the positive rate on rows whose fourteen-day window has already closed. For decision time add min and max.",
            "On the call-order path: entity key = invoice id; decision time = this morning’s cut; label = paid within fourteen days of the cut (not whether a call was placed). Candidates include days past due, open amount, dispute flag, and customer segment. Invoice id is id, not a feature. A constant column is drop.",
            "Assign one role per column: id, time, decision_time, label, feature, or drop. Pass only when every column has a role and label and decision time are set. Fail → stop. Do not invent a label.",
          ],
          figure: {
            kind: "sheet",
            caption:
              "Profile contract. Writes profile.json. A blank role stops the run.",
            steps: [
              { term: "Inputs", detail: "Raw table; task.json label, entity key, decision time." },
              { term: "Output", detail: "profile.json with roles and distributions." },
              { term: "Label", detail: "Paid within fourteen days of the cut — only on matured rows." },
              {
                term: "Pass",
                detail: "Every column has one role; label and decision_time set.",
                gate: true,
              },
            ],
          },
          sources: [dataChapter(3, "Say what one row means"), mlChapter(1, "What good looks like"), { href: ML_AGENT, label: "ML pipeline agent recipe" }],
        },
        {
          id: "quality",
          title: "Quality before impute",
          paragraphs: [
            "Quality does not impute yet. Completeness marks high-null columns for drop or a later missing indicator (null rate above forty percent in this recipe). Validity quarantines illegal labels and nulls out-of-domain feature cells. Uniqueness keeps the latest row on entity key at decision time. The clock fails when a feature’s event time is at or after the decision time.",
            "Immature invoices — fourteen-day window still open — are not labeled training rows. Write label_delay_days as the median delay from cut to label time on matured rows; Fit uses that as the embargo. A post-cut payment offered as a feature fails the clock. Planned train-only imputation (median, mode, missing indicator) is recorded here and fitted only later on train.",
            "Recompute the profile on kept rows. Write quality.json and quarantine.parquet. Pass when label validity is 100% on kept matured rows, the key is unique, no remaining feature uses post-decision values, and quarantine rate ≤ quarantine_rate_max (task.json; this recipe’s default 0.05 is an operating threshold with an owner, not a universal law). Above that → stop.",
          ],
          figure: {
            kind: "flow",
            caption:
              "Quality path. Post-cut values as features fail the clock; immature labels stay out of Fit.",
            steps: [
              { term: "Completeness", detail: "High null → drop or later indicator.", mark: "search" },
              { term: "Validity", detail: "Illegal label → quarantine.", mark: "check" },
              { term: "Uniqueness", detail: "One row per invoice at the cut.", mark: "flag" },
              { term: "Clock", detail: "No feature event at or after the cut.", mark: "clock" },
              { term: "Re-profile", detail: "quality.json + quarantine.parquet.", mark: "refresh" },
            ],
          },
          sources: [dataChapter(8, "Keep trust in force"), { href: ML_AGENT, label: "ML pipeline agent recipe" }],
        },
        {
          id: "outliers",
          title: "Outliers as policy",
          paragraphs: [
            "Extremes are measured after impossibles were quarantined. Per numeric feature I use the modified Z-score with MAD and label |M| > 3.5 as a potential outlier, from the NIST note on Iglewicz and Hoaglin. That note is for labeling, not automatic deletion. If MAD is zero, my operating fallback is Tukey fences (Q1 − 1.5 IQR, Q3 + 1.5 IQR) — not a NIST rule.",
            "Write outlier_policy.json: keep, log1p (skew high and min ≥ 0), cap (bounds learned later on train), or quarantine. Rare categories become OTHER later from train counts only. New quarantine → return through Quality. Cap bounds and OTHER maps are not fitted here.",
          ],
          figure: {
            kind: "uses",
            caption: "Prepare arc pass lines. Each stage leaves a named file.",
            steps: [],
            head: ["Stage", "Must leave"],
            rows: [
              {
                label: "Profile",
                cells: ["profile.json — roles for invoice id, cut, and paid label."],
              },
              {
                label: "Quality",
                cells: [
                  "quality.json, quarantine.parquet — unique key, clock clean, quarantine ≤ quarantine_rate_max.",
                ],
              },
              {
                label: "Outliers",
                cells: ["outlier_policy.json — open amount and days past due each have a policy."],
              },
            ],
          },
          picture: {
            src: `${ML_ART}/prepare.jpg`,
            alt: "An illustration. An open ledger, one lit pane on a column, and a jar of quarantined scraps. No amount.",
          },
          sources: [NIST_OUTLIER],
        },
        {
          id: "prepare-draft",
          title: "When a draft is cheap",
          paragraphs: [
            "A generated cleaning script can drop large open amounts to raise a later metric and still leave no quarantine file, no role list, and no clock test. Prepare still applies. Features cannot be chosen from a morning list nobody can describe.",
          ],
        },
      ],
      sources: [
        NIST_OUTLIER,
        dataChapter(3, "Say what one row means"),
        dataChapter(8, "Keep trust in force"),
        { href: ML_CARD, label: "ML pipeline field card" },
        { href: ML_AGENT, label: "ML pipeline agent recipe" },
      ],
    },
    {
      number: 3,
      topic: "Features",
      title: "Features that hold",
      lede: "Write feature_spec.json before any fit. Every kept transform must score one new row from inputs known at decision time. Transforms are fitted on train only and applied to later partitions without refitting.",
      rule: "My operating rule: drop anything that fails the clock test, refuse a fit that used validation or test, keep dropped columns with the reason, and never treat high label correlation as permission to keep a leak.",
      illustration: "Same call-order illustration as What good looks like. Synthetic; no amount.",
      reviewed: "29 Oct 2026",
      sections: [
        {
          id: "harm",
          title: "What harms the model",
          paragraphs: [
            "A candidate harms the model when it is unavailable at decision time, was built with the label on the full sample, is an identifier or the label itself, duplicates another column, will not hold at serve time, or is a proxy the decision may not use.",
            "Keep: days past due, open amount, and dispute flag when each is known before the cut. Drop: invoice id; the paid-within-fourteen-days label; any payment after the cut; a full-history target mean that saw holdout mornings; whether a call was placed (operational act after ranking — not a feature, not part of the label).",
            "scikit-learn’s data-leakage note warns that transforms such as StandardScaler, SimpleImputer, and feature selection must be fit on the training subset only — fitting on the whole table leaks test information. A full-sample target mean is the same class of leak. Out-of-fold target encoding on train, with smoothing toward the train base rate, is my allowed form. Validation, test, and live rows use the train mapping only.",
          ],
          figure: {
            kind: "matrix",
            caption:
              "Keep or drop for the call-order path. Reason stays on the row.",
            steps: [],
            head: ["Candidate", "Action"],
            rows: [
              { label: "Days past due at cut", cells: ["Keep. Known this morning."] },
              { label: "Open amount at cut", cells: ["Keep. Known this morning."] },
              { label: "Dispute flag at cut", cells: ["Keep if event time is before the cut."] },
              { label: "Invoice id", cells: ["Drop. Role is id."] },
              { label: "Paid within fourteen days", cells: ["Drop. That is the label."] },
              { label: "Call placed (yes/no)", cells: ["Drop. Act after ranking; not the target."] },
              { label: "Payments after the cut", cells: ["Drop. Clock fail."] },
              { label: "Full-history target mean", cells: ["Drop. Fit saw holdout mornings."] },
            ],
          },
          sources: [SKLEARN_LEAKAGE, mlChapter(1, "What good looks like")],
        },
        {
          id: "clock",
          title: "The clock test",
          paragraphs: [
            "High correlation with the label does not, by itself, keep a column. For each candidate: can one new overdue invoice at tomorrow’s cut produce this column from that morning’s extract alone? A transform that still needs the training table to score that row is removed unless a train-only mapping was frozen.",
            "Allowed: raw column, log1p, missing indicator, days_since a source timestamp, ratio of two decision-time columns, categorical consolidation fit on train, out-of-fold target encoding on train only. Pass when every kept feature has fit_on: train and a clock pass. Dropped features stay listed with the reason in feature_spec.json.",
          ],
          figure: {
            kind: "tree",
            caption: "Clock test for one new invoice at decision time.",
            steps: [
              {
                term: "Can one new invoice build it?",
                detail: "Only from this morning’s extract.",
                spine: "Yes → check the fit",
                branches: [
                  { term: "Drop", detail: "Needs post-cut payments or unfrozen full history." },
                ],
              },
              {
                term: "Was the fit train-only?",
                detail: "Imputer, scaler, encoder, target mean.",
                spine: "Yes → keep with reason",
                branches: [
                  { term: "Drop", detail: "Any statistic that saw validation or test." },
                ],
              },
            ],
          },
          picture: {
            src: `${ML_ART}/features.jpg`,
            alt: "An illustration. A clock, a sealed morning extract, and a torn post-cut slip left aside. No amount.",
          },
          sources: [SKLEARN_LEAKAGE, { href: ML_AGENT, label: "ML pipeline agent recipe" }],
        },
        {
          id: "features-draft",
          title: "When a draft is cheap",
          paragraphs: [
            "A generated feature list can rank the paid label as the strongest column and still pass a unit test. Features that hold still applies. Importance with the label in view is not a keep.",
          ],
        },
      ],
      sources: [
        SKLEARN_LEAKAGE,
        mlChapter(2, "Prepare the table"),
        { href: ML_AGENT, label: "ML pipeline agent recipe" },
      ],
    },
    {
      number: 4,
      topic: "Fit",
      title: "Fit without spending the holdout",
      lede: "Freeze test ids before any preprocessor is fit. Tune inside train. Read validation once after the inner bar clears. A reproducible training run is not yet a promotable release.",
      rule: "My operating rule: write the test hash before any fit, clear the bar on an inner slice before validation is read, and never open a tuning loop on the same holdout that already failed.",
      illustration: "Same call-order illustration as What good looks like. Synthetic; no amount.",
      reviewed: "29 Oct 2026",
      sections: [
        {
          id: "freeze",
          title: "Freeze the split",
          paragraphs: [
            "Sort by decision time. Last tenth → test; previous tenth → validation; rest → train. Embargo = label_delay_days from Prepare between sets. Gap rows enter neither set — including mornings whose fourteen-day labels have not matured. Persist ids and hash test ids into split_ids.parquet. Training code loads train and validation only.",
            "Time order is the default when the decision has a clock. Without decision time, use a stratified random split with a fixed seed — the weaker case.",
            "scikit-learn’s cross-validation guide is the practice for held-out evaluation. The freeze is the rule: the test hash is written before any preprocessor is fit. Selecting again on those same rows invalidates the holdout’s role as an untouched evaluation.",
          ],
          figure: {
            kind: "panels",
            caption:
              "Time-ordered mornings, then an embargo. Test stays sealed until Ship.",
            steps: [
              { term: "Train", detail: "Earlier mornings. Preprocessors fit here only." },
              { term: "Embargo", detail: "Label-delay gap. Neither set." },
              { term: "Validation", detail: "One official read after the inner bar." },
              { term: "Test", detail: "Frozen ids. Read once in Ship." },
            ],
          },
          picture: {
            src: `${ML_ART}/holdout.jpg`,
            alt: "An illustration. Train cards open, an empty embargo tray, and a sealed holdout under frost glass. No amount.",
          },
          sources: [SKLEARN_SPLIT, mlChapter(2, "Prepare the table")],
        },
        {
          id: "train",
          title: "Train inside the freeze",
          paragraphs: [
            "Fit every preprocessor on train only — imputation, missing indicators, rare-level map, cap bounds, scaler, target-encoding map — then apply without refitting. Save preprocess.joblib with the model.",
            "Inner slice = last tenth of train. Score the baseline there. On this illustration the baseline is oldest past-due first. Metric is named in task.json (average precision when positives are rare, else ROC-AUC; Brier when the served value is a probability). Ranking quality under the historical contact policy is the gate — not a causal estimate of placing a call.",
            "Train a regularized linear model and a tree model. Prune non-positive permutation importance on the inner slice. Tune on the inner slice only. Validation stays unread until the inner score clears min_metric and beats oldest-first. Write model.joblib and val_metrics.json after the one validation read.",
          ],
          figure: {
            kind: "loop",
            caption:
              "Fit loop. Oldest-first is the baseline outside the model family.",
            steps: [
              { term: "Preprocess", detail: "Fit on train; apply later.", mark: "gear" },
              { term: "Baseline", detail: "Oldest past-due first.", mark: "flag" },
              { term: "Fit", detail: "Linear, then tree.", mark: "code" },
              { term: "Prune", detail: "Drop non-positive importance.", mark: "wrench" },
              { term: "Tune", detail: "Inner trials only.", mark: "pulse" },
              { term: "Validate", detail: "One official read → val_metrics.json.", mark: "check" },
            ],
          },
        },
        {
          id: "loops",
          title: "When train misses the bar",
          paragraphs: [
            "The bar is min_metric and beating the baseline. Raw accuracy against a skewed paid base rate is not the bar. Loop budgets and the 0.005 improvement line are this recipe’s operating rule — finite returns, not a published standard.",
            "Loop A: retune on the inner slice, max twenty trials; stop early after five trials that fail to improve by 0.005. Validation and test stay unread. Loop B: one feature_spec change per pass from inner errors, max three; then Loop A with ten trials; validation only after inner clears. Loop C: named data defect only (not a weak score alone); new split; discard old test ids unread; one Fit run. Still short → model_card status blocked. Do not read test. Do not serve.",
          ],
          figure: {
            kind: "tree",
            caption: "Miss loops. Skipping a loop is not a pass.",
            steps: [
              {
                term: "A · Tune",
                detail: "Inner slice only. Max 20 trials.",
                spine: "Clears → validation once",
                branches: [
                  { term: "Still short", detail: "Go to features. Do not add trials." },
                ],
              },
              {
                term: "B · Features",
                detail: "One spec change per pass. Max 3.",
                spine: "Inner clears → validation",
                branches: [
                  { term: "Still short", detail: "Go to data, or stop after three." },
                ],
              },
              {
                term: "C · Data",
                detail: "Named defect only. New split.",
                spine: "One train run",
                branches: [
                  { term: "Blocked", detail: "Do not read test. Do not serve." },
                ],
              },
            ],
          },
          closing: [
            "Clearing validation makes a reproducible candidate. It does not promote a release. Ship still owns the one test read, the bundle, and the previous version.",
          ],
        },
        {
          id: "fit-draft",
          title: "When a draft is cheap",
          paragraphs: [
            "A generated AutoML run can report a strong score after peeking at later mornings. Fit without spending the holdout still applies. The freeze is the check, not the leaderboard.",
          ],
        },
      ],
      sources: [
        SKLEARN_SPLIT,
        mlChapter(3, "Features that hold"),
        mlChapter(2, "Prepare the table"),
        { href: ML_AGENT, label: "ML pipeline agent recipe" },
      ],
    },
    {
      number: 5,
      topic: "Ship",
      title: "Ship and watch",
      lede: "Read test once for the official evaluation. Pack a named bundle beside a previous version that still answers. Watch writes daily files and starts a new version id — never a silent weight update.",
      rule: "My operating rule: never retune on test residuals, never promote without a previous version that still answers, and never update weights in place from a monitor alert.",
      illustration: "Same call-order illustration as What good looks like. Synthetic; no amount.",
      reviewed: "29 Oct 2026",
      sections: [
        {
          id: "test",
          title: "Test once",
          paragraphs: [
            "After validation clears, load the frozen test ids. Transform with the train preprocessor — no refit. Score once. Write test_report.json: decision metric, baseline on the same rows, ten-bin calibration when scores are probabilities, time buckets and any segment_columns. Choose a hard threshold on validation only; apply it to test. Do not search on test.",
            "Baseline on this path is oldest past-due first. The gate is clearing min_metric and beating that baseline on ranking quality. That is not a measured lift, and it is not evidence that calling caused payment. A miss writes model_card status rejected and stops. Re-fitting on the same test residuals is not a loop — it spends the holdout.",
          ],
          figure: {
            kind: "sheet",
            caption:
              "Official test contract. Writes test_report.json and model_card.json. No invented lift.",
            steps: [
              { term: "Inputs", detail: "Frozen test ids; train preprocessor; val-cleared model." },
              { term: "Metric", detail: "Named ranking metric vs oldest-first on the same invoices." },
              { term: "Slices", detail: "Time buckets and segment_columns if named in task.json." },
              {
                term: "Status",
                detail: "passed → continue to Serve; rejected → oldest-first stays in charge.",
                gate: true,
              },
            ],
          },
          sources: [{ href: ML_AGENT, label: "ML pipeline agent recipe" }, SKLEARN_SPLIT],
        },
        {
          id: "serve",
          title: "Serve with a previous version",
          paragraphs: [
            "Pack preprocess.joblib, model.joblib, feature_spec.json, and the version id into bundle/<version>/. Signature test: one known training row matches name-for-name and type-for-type. Missing required feature → hard error, no silent fill.",
            "Previous version on this path is oldest-past-due-first. During cutover both orders can be scored; the supervisor’s list follows oldest-first until Watch and governance allow the candidate to own the order. One action restores oldest-first alone — the same shape as Run the version just verified. Keeping the previous way callable is my operating rule.",
            "Fowler’s deployment pipeline builds confidence through staged checks before production. Google’s Practitioners guide mentions progressive delivery into a serving environment; I take the staged cutover. I do not require any one cloud product.",
            "A passed test and a packed bundle are operational validity. The version still does not own the decision until the governance sheet on Name what the version may do is approved.",
          ],
          figure: {
            kind: "compare",
            caption:
              "Cutover. Supervisor still owns who is called first.",
            steps: [],
            columns: [
              {
                term: "Oldest-first",
                detail: "Still produces the list order.",
                points: ["Loaded and callable", "No model required", "One action restores it alone"],
              },
              {
                term: "Candidate bundle",
                detail: "Ranks in parallel until Watch and governance clear.",
                points: ["Signature test passed", "Missing feature errors", "New version id only"],
              },
            ],
          },
          sources: [
            { href: "/handbooks/software-that-stays-in-use/4", label: "Run the version just verified" },
            FOWLER_PIPE,
            GOOGLE_MLOPS,
            mlChapter(6, "Name what the version may do"),
            { href: SDLC_CARD, label: "SDLC field card" },
          ],
        },
        {
          id: "monitor",
          title: "Watch returns as a new version",
          paragraphs: [
            "Google’s Practitioners guide describes continuous monitoring as watching the effectiveness and efficiency of a deployed model, including decay such as data and concept drift. Continuous training is repeatedly executing the training pipeline when new data or code arrives. On this card those meet as Watch: write monitor/<date>.json and name the stage to re-enter.",
            "Signals and actions follow the agent recipe: required-feature missing → stop this version, fall back to oldest-first, re-enter Features; feature PSI above the written line → keep current owner, re-enter Prepare with a live sample; score PSI with stable features → mature labeled cohort read before any refit; label metric worse than test by more than monitor_margin → new split on newer mornings. PSI and monitor_margin defaults in this recipe (0.25 and 0.05) are operating thresholds with owners and review actions — not universal laws.",
            "Monitor never updates weights in place. The next model is always a new version id.",
          ],
          figure: {
            kind: "tree",
            caption: "Live signals. Oldest-first stays until a new version clears.",
            steps: [
              {
                term: "Required feature missing",
                detail: "Stop this version. Fall back to oldest-first.",
                spine: "→ Features",
                branches: [{ term: "Error", detail: "Do not fill from memory." }],
              },
              {
                term: "Feature PSI above line",
                detail: "Keep current list owner.",
                spine: "→ Prepare with live morning",
                branches: [{ term: "Investigate", detail: "Re-profile before a new fit." }],
              },
              {
                term: "Score PSI, features stable",
                detail: "Keep current list owner.",
                spine: "→ mature cohort read",
                branches: [{ term: "No refit first", detail: "Fourteen-day labels before a new version." }],
              },
              {
                term: "Label metric below margin",
                detail: "Newer mornings.",
                spine: "→ new split, Fit, Ship",
                branches: [{ term: "New version id", detail: "Oldest-first until cutover." }],
              },
            ],
          },
          picture: {
            src: `${ML_ART}/watch.jpg`,
            alt: "An illustration. Amber previous light and cyan candidate light meet a dark monitor. No amount.",
          },
          sources: [GOOGLE_MLOPS, GOOGLE_CT, { href: ML_AGENT, label: "ML pipeline agent recipe" }],
        },
        {
          id: "ship-draft",
          title: "When a draft is cheap",
          paragraphs: [
            "A generated serving stub can reorder every morning’s list with no oldest-first fallback, no signature test, and a silent retrain on a schedule. Ship and watch still applies.",
            "Done for operations means test_report and model_card say passed, signature tests pass, and the previous version remains callable. Done for the decision also needs the governance sheet approved.",
          ],
          sources: [{ href: ML_AGENT, label: "ML pipeline agent recipe" }, mlChapter(6, "Name what the version may do")],
        },
      ],
      sources: [
        GOOGLE_MLOPS,
        GOOGLE_CT,
        FOWLER_PIPE,
        { href: SDLC_CARD, label: "SDLC field card" },
        { href: ML_CARD, label: "ML pipeline field card" },
        { href: ML_AGENT, label: "ML pipeline agent recipe" },
      ],
    },
    {
      number: 6,
      topic: "Governance",
      title: "Name what the version may do",
      lede: "A passed test is operational evidence, not permission. Before a version owns any part of a decision, name intended use, prohibited uses, owners, monitoring, and rollback. Without that sheet, Ship stops at candidate.",
      rule: "My operating rule: do not let a version order a decision until intended use, out-of-scope uses, decision owner, technical owner, measured evidence, and fallback are written and approved.",
      illustration: "Same call-order illustration as What good looks like. Synthetic; no amount.",
      reviewed: "29 Oct 2026",
      sections: [
        {
          id: "why-gov",
          title: "Why Ship is not enough",
          paragraphs: [
            "Ship proved the candidate can be served and watched. Governance asks what the version may do in the workflow. Google’s Practitioners guide places model governance across the lifecycle — accountability for how models are used. I use that placement. I do not copy a registry product.",
            "Mitchell et al., Model Cards for Model Reporting (FAT* 2019), ask for short documents with intended use (including out-of-scope uses), evaluation procedures and metrics, factors that affect performance, and ethical considerations. I take the duty to write intended use and limits before release. I do not paste their full template, and I do not invent demographic or intersectional results this illustration does not have. Pipeline correctness still does not prove fairness, business value, or that the decision improved.",
          ],
          sources: [GOOGLE_MLOPS, MODEL_CARDS, mlChapter(5, "Ship and watch"), mlChapter(1, "What good looks like")],
        },
        {
          id: "card-sheet",
          title: "The sheet before promote",
          paragraphs: [
            "One page. A blank line stops promote. Status is a gate after the lines — filled for this use is not proof the score should change the world.",
            "Call-order sheet: intended use = order today’s open overdue list for the supervisor; out of scope = offer of more time, credit refusal, write-off, auto-dial without a person, or claiming the score estimates the causal effect of a call; decision owner = supervisor; technical owner = person who restores oldest-first; evidence = test_report slices and feature_spec hash; fallback = oldest-past-due-first.",
          ],
          figure: {
            kind: "sheet",
            caption:
              "Promote gate. Blank line keeps oldest-first in charge.",
            steps: [
              {
                term: "Intended use",
                detail: "Order today’s open overdue call list for the supervisor.",
              },
              {
                term: "Out of scope",
                detail: "More time, credit refuse, write-off, auto-dial, or causal claim for calling.",
              },
              {
                term: "Decision owner",
                detail: "Collections supervisor who owns the list order.",
              },
              {
                term: "Technical owner",
                detail: "Person who restores oldest-first in one action.",
              },
              {
                term: "Evidence",
                detail: "test_report.json, baseline, slices, label delay, feature_spec hash.",
              },
              {
                term: "Fallback",
                detail: "Oldest past-due first stays callable.",
              },
              {
                term: "Status",
                detail: "approved for this use, or held. Held is not a silent serve.",
                gate: true,
              },
            ],
          },
          picture: {
            src: `${ML_ART}/card.jpg`,
            alt: "An illustration. A blank framed sheet and a brass seal before a closed door. No amount.",
          },
          sources: [MODEL_CARDS, dataChapter(2, "Name the decision")],
        },
        {
          id: "risk",
          title: "Risk matched to the decision",
          paragraphs: [
            "Match ceremony to harm. A private look stays a notebook. A list order that changes who is called needs this sheet. A score that would refuse credit, set a price, or trigger a legal notice needs a heavier review than this illustration writes — do not stretch this sheet to cover it.",
            "Minimum for a served ranking on this card: filled sheet, Ship passed, oldest-first fallback, Watch on, named review date. Missing decision owner → investigate, not approve.",
          ],
          figure: {
            kind: "uses",
            caption: "Depth follows harm. Call-order ranking sits in the middle row.",
            steps: [],
            head: ["Use", "Minimum before promote"],
            rows: [
              {
                label: "Private look",
                cells: ["No promote. Notebook evidence only."],
              },
              {
                label: "Call-order ranking",
                cells: ["Filled sheet, Ship passed, oldest-first fallback, Watch on."],
              },
              {
                label: "Consequential refuse or price",
                cells: ["Heavier review than this book writes."],
              },
            ],
          },
          sources: [GOOGLE_MLOPS],
        },
        {
          id: "review",
          title: "Review while it stays in use",
          paragraphs: [
            "When Watch returns a new version, re-read intended use and out-of-scope. If the list starts feeding auto-dial, the use changed and the old approval does not carry.",
            "While the score only reorders calls and Watch is green, a dated review is enough. An incident, missing-feature stop, or label-metric miss brings an early read. Continue, change, or stop for the analytics product still lives on Run the product and judge the value. This page only decides whether this model version may keep its named use.",
          ],
          figure: {
            kind: "flow",
            caption: "Governance continues after promote. A new use reopens the sheet.",
            steps: [
              { term: "Promote", detail: "Sheet filled. Ship passed. Fallback named.", mark: "check" },
              { term: "Watch", detail: "Daily signals. New version if live fails.", mark: "pulse" },
              { term: "Review", detail: "On date, incident, or workflow change.", mark: "search" },
              { term: "Hold or renew", detail: "Same use, or return to oldest-first.", mark: "flag" },
            ],
          },
          sources: [mlChapter(5, "Ship and watch"), dataChapter(9, "Run the product and judge the value")],
        },
        {
          id: "gov-draft",
          title: "When a draft is cheap",
          paragraphs: [
            "A generated card can fill every heading and still leave intended use vague, out-of-scope empty, and the decision owner a mailing list. Approval needs a person who accepts the lines and the fallback.",
            "Ship’s passed status is evidence on the sheet. It is not a substitute for the sheet.",
          ],
          sources: [MODEL_CARDS, { href: ML_AGENT, label: "ML pipeline agent recipe" }],
        },
      ],
      sources: [
        MODEL_CARDS,
        GOOGLE_MLOPS,
        mlChapter(5, "Ship and watch"),
        dataChapter(2, "Name the decision"),
        dataChapter(9, "Run the product and judge the value"),
        { href: ML_CARD, label: "ML pipeline field card" },
        { href: ML_AGENT, label: "ML pipeline agent recipe" },
      ],
    },
  ],
};
