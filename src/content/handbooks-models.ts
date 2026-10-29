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
      illustration: "The call-order path is a synthetic illustration, not a measured result. It states no amount.",
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
            "Google’s Practitioners guide to MLOps (May 2021) maps the work as integrated processes from development through monitoring and model management. I use that lifecycle as the map. I do not copy Google’s product stack.",
            "On this card the same work is four arcs. Prepare covers profile, quality, outliers, and features. Fit covers the freeze, train, tune, and validation. Ship covers the one official test read, versioning, and serving. Watch covers operational monitoring and a controlled return that starts a new version. Continuous training in Google’s sense is that return — not a silent overwrite of live weights.",
          ],
          figure: {
            kind: "pipeline",
            caption:
              "Four arcs on one spine. Watch returns as a new version id.",
            note: "Detail for each stage sits in the stage contracts below and in the agent recipe.",
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
      lede: "Descriptive work is not a sidebar before modeling. It is the first arc. After every repair, describe the table again. A fill, a drop, or a clip changes the distribution the next stage will trust.",
      rule: "My operating rule: assign every column a role, score quality before any impute, write an outlier policy instead of a silent delete, and stop when the quarantine rate exceeds the written quarantine_rate_max for this run.",
      illustration: "The call-order path is a synthetic illustration, not a measured result.",
      reviewed: "29 Oct 2026",
      sections: [
        {
          id: "describe",
          title: "Profile first",
          paragraphs: [
            "For every column write the type, the null count, the null rate, the number of distinct values, and five examples. For numeric columns add the min, the first percentile, the median, the ninety-ninth percentile, the max, the mean, the standard deviation, and the skew. For the label add the positive rate. For decision time add the min and the max.",
            "On the call-order illustration the entity key is the invoice id, the decision time is this morning’s list cut, and the label is whether that invoice is paid within fourteen days of the cut. The call is the action the ranking informs; it is not part of the label. Days past due, open amount, dispute flag, and customer segment are candidates. Invoice id is an id, not a feature. A column that is constant on every overdue row is drop.",
            "Then assign a role: id, time, decision time, label, feature, or drop. A constant column is drop. A column whose distinct values cover almost every row is an id, not a feature. Pass only when every column has one role and the label and decision time are set.",
          ],
          figure: {
            kind: "sheet",
            caption:
              "Profile sheet for the call-order illustration. A blank role stops the run. No amount is a collected result.",
            steps: [
              { term: "Entity key", detail: "Invoice id. Role: id." },
              { term: "Decision time", detail: "This morning’s list cut." },
              { term: "Label", detail: "Paid within fourteen days of the cut — arrives after the window closes." },
              { term: "Candidates", detail: "Days past due, open amount, dispute flag, customer segment." },
              {
                term: "Role",
                detail: "id, time, decision_time, label, feature, or drop. One role per column.",
                gate: true,
              },
            ],
          },
          sources: [dataChapter(3, "Say what one row means"), mlChapter(1, "What good looks like")],
        },
        {
          id: "quality",
          title: "Quality before impute",
          paragraphs: [
            "Quality scores the feature table. It does not fill missing values yet. Completeness marks a column for drop, or for a missing indicator later, when the null rate is above forty percent. Validity quarantines an illegal label and nulls an out-of-domain feature cell. Uniqueness keeps the latest row on the entity key at decision time. The clock fails when a feature’s event time is at or after the decision time. That column is dropped, or rebuilt with values known before the decision.",
            "On the call-order path a second extract of the same invoice on the same morning is a duplicate: keep the latest event time, quarantine the other. A payment timestamp after this morning’s cut fails the clock if it was offered as a feature. The median delay from the morning cut to the fourteen-day label is the embargo the split will use. I do not invent that median here. I write whatever the table shows.",
            "The median delay from decision time to label time is written down. The split uses it as the embargo. Imputation is recorded only as a later rule, learned on train: numeric median, categorical mode, and a missing indicator when the train null rate is above one percent.",
            "Recompute the profile on the rows that remain. Write the before and after counts. Pass when label validity is one hundred percent on kept rows, the key is unique, no remaining feature uses post-decision values, and the quarantine rate is at most quarantine_rate_max from task.json (this recipe’s default is 0.05 — an operating threshold, not a universal law). Above that the run stops.",
          ],
          figure: {
            kind: "flow",
            caption:
              "Quality on the call-order table. A post-cut payment as a feature fails the clock.",
            steps: [
              { term: "Completeness", detail: "Null rate per column. High null → drop or later indicator.", mark: "search" },
              { term: "Validity", detail: "Domain and label rules. Illegal label → quarantine.", mark: "check" },
              { term: "Uniqueness", detail: "One row per invoice at this morning’s cut.", mark: "flag" },
              { term: "Clock", detail: "No payment or call outcome after the cut.", mark: "clock" },
              { term: "Re-profile", detail: "Describe the table that remains.", mark: "refresh" },
            ],
          },
          sources: [dataChapter(8, "Keep trust in force")],
        },
        {
          id: "outliers",
          title: "Outliers as policy",
          paragraphs: [
            "Impossible values were quarantined in quality. Extremes are measured next. For each numeric feature I use the modified Z-score with the median absolute deviation, and a threshold of 3.5, from the NIST note on Iglewicz and Hoaglin. When the median absolute deviation is zero I use Tukey fences. The flag measures the tail. It does not delete rows by default.",
            "On the call-order illustration an open amount can be large and still real. The default policy is keep, or log1p when skew is high and the minimum is non-negative. A negative open amount is impossible and belongs in quarantine, not in a silent delete of the whole morning. Days past due stay as keep unless the value is impossible under the policy calendar.",
            "Each numeric column gets a policy: keep, log1p when skew is high and the minimum is non-negative, cap on train percentiles, or quarantine when quality missed an impossible value. A rare category is not an outlier row. It becomes OTHER later, from train counts only. Pass when every numeric feature has a policy and a touch-rate. Any new quarantine returns through quality.",
          ],
          figure: {
            kind: "uses",
            caption: "Pass lines for Prepare on the call-order path. A blank line stops the arc.",
            steps: [],
            head: ["Stage", "Must leave"],
            rows: [
              {
                label: "Profile",
                cells: ["Invoice id, morning cut, and label roles are set."],
              },
              {
                label: "Quality",
                cells: [
                  "One row per invoice that morning. No post-cut feature. Quarantine ≤ quarantine_rate_max.",
                ],
              },
              {
                label: "Outliers",
                cells: ["Open amount and days past due each have a policy."],
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
            "A generated cleaning script can drop the largest open amounts to raise a later metric and still leave no quarantine file, no role list, and no clock test. Prepare still applies. The next chapter cannot choose features from a morning list nobody can describe.",
          ],
        },
      ],
      sources: [
        NIST_OUTLIER,
        dataChapter(3, "Say what one row means"),
        dataChapter(8, "Keep trust in force"),
        { href: ML_CARD, label: "ML pipeline field card" },
      ],
    },
    {
      number: 3,
      topic: "Features",
      title: "Features that hold",
      lede: "A feature that looks strong in a notebook can still harm the model. The keep-or-drop list is written before any fit. Every kept transform has to score one new row from inputs known at decision time.",
      rule: "My operating rule: drop anything that fails the clock test, refuse a fit that used validation or test, keep dropped columns on the list with the reason, and never treat high label correlation as permission to keep a leak.",
      illustration: "The call-order path is a synthetic illustration, not a measured result.",
      reviewed: "29 Oct 2026",
      sections: [
        {
          id: "harm",
          title: "What harms the model",
          paragraphs: [
            "A new column goes through Prepare before it is a candidate. Then the feature list keeps or drops it. A feature harms the model when its value would not exist at the moment of the decision, when it was built with the label on the full sample, when it is an identifier or a copy of the label, when it repeats another column, when its definition will not hold on the days the model is served, or when it is a proxy the decision is not allowed to use.",
            "On the call-order illustration, days past due as of this morning holds. Open amount as of this morning holds. A dispute flag known before the cut holds. Invoice id is an identifier and drops. Whether the invoice was paid within fourteen days of the cut is the label, and it is not a feature. A running total of payments that includes days after the cut fails the clock. A target mean of the paid label fit on the whole history, including mornings held out for test, fails the fit rule. Whether a call was placed is the operational act after ranking — not a keep as a feature, and not AND-ed into the label.",
            "scikit-learn’s data-leakage note is the warning I use for train-time information reaching the model. Target means, scalers, and imputers fit on the whole table are that case. Out-of-fold target encoding on train, with smoothing toward the train base rate, is allowed. Validation, test, and live rows use the mapping fit on train. They never contribute their own labels.",
          ],
          figure: {
            kind: "matrix",
            caption:
              "Call-order keep or drop. The reason stays on the row. No amount is a collected result.",
            steps: [],
            head: ["Candidate", "Action"],
            rows: [
              { label: "Days past due at cut", cells: ["Keep. Known this morning."] },
              { label: "Open amount at cut", cells: ["Keep. Known this morning."] },
              { label: "Dispute flag at cut", cells: ["Keep if the flag’s event time is before the cut."] },
              { label: "Invoice id", cells: ["Drop. Role is id."] },
              { label: "Paid within fourteen days", cells: ["Drop. That is the label."] },
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
            "High correlation with the label does not, by itself, drop a column. The clock test decides. For each candidate I ask whether a single new row, arriving at decision time, can produce that column from inputs already known. A transform that still needs the training table to score that row is removed.",
            "For one new overdue invoice on tomorrow’s list, days past due and open amount must be computable from that morning’s ledger extract alone. A feature that needs every historical call outcome to score that one invoice is refused unless the mapping was fit on train and frozen.",
            "Allowed transforms stay short: the column itself, log1p, a missing indicator, days since a source timestamp, a ratio of two decision-time columns, categorical consolidation fit on train, and out-of-fold target encoding on train only. Pass when every kept feature has fit_on train and a pass on the clock test. Dropped features remain listed with the reason.",
          ],
          figure: {
            kind: "tree",
            caption: "Clock test on one new overdue invoice tomorrow morning.",
            steps: [
              {
                term: "Can one new invoice build it?",
                detail: "Only from this morning’s extract.",
                spine: "Yes → check the fit",
                branches: [
                  { term: "Drop", detail: "Needs post-cut payments, or the full call history table." },
                ],
              },
              {
                term: "Was the fit train-only?",
                detail: "Imputer, scaler, encoder, target mean.",
                spine: "Yes → keep with reason",
                branches: [
                  { term: "Drop", detail: "Any statistic that saw validation or test mornings." },
                ],
              },
            ],
          },
          picture: {
            src: `${ML_ART}/features.jpg`,
            alt: "An illustration. A clock, a sealed morning extract, and a torn post-cut slip left aside. No amount.",
          },
          sources: [SKLEARN_LEAKAGE],
        },
        {
          id: "features-draft",
          title: "When a draft is cheap",
          paragraphs: [
            "A generated feature list can rank the paid label as the strongest “feature” and still pass a unit test. Features that hold still applies. Importance measured with the label in view is not a keep on the call-order path.",
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
      lede: "The test set is frozen before any preprocessor is fit. Tuning lives inside train. Validation is read once. A miss returns through tune, features, or data, with a budget, or the run stops as blocked.",
      rule: "My operating rule: write the test hash before any fit, clear the bar on an inner slice before validation is read, and never open a tuning loop on the same holdout that already failed.",
      illustration: "The call-order path is a synthetic illustration, not a measured result.",
      reviewed: "29 Oct 2026",
      sections: [
        {
          id: "freeze",
          title: "Freeze the split",
          paragraphs: [
            "Sort by decision time. The last tenth is test. The previous tenth is validation. The rest is train. Leave a gap of the median label delay between those sets. Rows inside the gap enter neither set. Persist the row ids and hash the test ids. Training code loads train and validation only.",
            "On the call-order path the decision time is the morning cut. Later mornings are later. The embargo is the median days from cut to the fourteen-day paid label. Mornings inside that gap enter neither set, because their labels are not yet fair to score against. I do not invent the median. I use the one Prepare wrote.",
            "If there is no decision time, use a stratified random split with a fixed seed and the same sizes. That is the weaker case. Time order is the default when the decision has a clock.",
            "scikit-learn’s cross-validation guide is the practice I use for evaluating on held-out folds. The freeze is my rule: the test hash is written before any preprocessor is fit, and a second look at those rows to change the model is not evaluation.",
          ],
          figure: {
            kind: "panels",
            caption:
              "Call-order mornings in time order, then an embargo. Later mornings stay unread until Ship.",
            steps: [
              { term: "Train", detail: "Earlier mornings. Preprocessors fit here." },
              { term: "Embargo", detail: "Label-delay gap. Belongs to neither set." },
              { term: "Validation", detail: "One official read after the inner bar clears." },
              { term: "Test", detail: "Frozen morning ids. Read once in Ship." },
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
            "Fit every preprocessor on train, then apply it: imputation, missing indicators, rare-level map, cap bounds, scaler, and any target-encoding map. Save them with the model.",
            "Cut an inner slice from train the same way, the last tenth of train. Score a baseline on that slice. On the call-order illustration the baseline is oldest past-due first — the previous way to order the list. The decision metric is average precision for the paid-within-fourteen-days label when positives are rare, otherwise ROC-AUC, named in task.json before this score. When the served value is a probability, also record the Brier score.",
            "Train a regularized linear model and a tree model. Rank features by permutation importance on the inner slice. Drop features whose importance is at or below zero, record the drop, and refit. Tuning stays on the inner slice. Validation is unread until the inner score clears the bar and beats oldest-first.",
          ],
          figure: {
            kind: "loop",
            caption:
              "Fit loop on call-order mornings. Oldest-first is the baseline outside the model family.",
            steps: [
              { term: "Preprocess", detail: "Fit on train mornings only.", mark: "gear" },
              { term: "Baseline", detail: "Oldest past-due first.", mark: "flag" },
              { term: "Fit", detail: "Linear, then tree.", mark: "code" },
              { term: "Prune", detail: "Drop non-positive importance.", mark: "wrench" },
              { term: "Tune", detail: "Inner trials only.", mark: "pulse" },
              { term: "Validate", detail: "One official read.", mark: "check" },
            ],
          },
        },
        {
          id: "loops",
          title: "When train misses the bar",
          paragraphs: [
            "The bar is the minimum metric in task.json, and the score must beat the baseline. An accuracy of 0.90 against a 0.95 base rate is a miss. On the call-order path, beating oldest-first on the named ranking metric is the bar that matters, not a raw accuracy on a skewed paid label.",
            "Loop A retunes on the inner slice, at most twenty trials, and stops early when five trials in a row fail to improve the best score by at least 0.005. Validation and test stay unread. If the budget ends below the bar, go to Loop B. Do not add trials.",
            "Loop B changes the feature spec once per pass, from the inner-slice errors. On this illustration that might mean dropping a segment that never appears at serve time, or rebuilding days past due with a clearer calendar. Refit, then Loop A with ten trials. Spend a validation read only when the inner score clears. Stop after three revisions, or when a revision fails to raise the inner score by 0.005, then go to Loop C.",
            "Loop C is for a named data defect: wrong labels, duplicates, a clock failure, or wrong units. A weak score by itself is not a data defect. A payment column that slipped past the clock test is. Repair through Prepare, build a new split, and discard the old test morning ids unread. Run Fit once. If validation is still below the bar, stop. Write blocked on the model card. Do not serve. Do not read the test set.",
          ],
          figure: {
            kind: "tree",
            caption: "Miss loops. A green training run that skipped a loop is not a pass.",
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
            "These budgets and the 0.005 improvement line are my operating rule. They are not a published standard. The point is a finite return, not an endless search on the same holdout.",
          ],
        },
        {
          id: "fit-draft",
          title: "When a draft is cheap",
          paragraphs: [
            "A generated AutoML run can report a strong score after peeking at later call-order mornings. Fit without spending the holdout still applies. The freeze is the check, not the leaderboard.",
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
      lede: "Test is read once. Serve keeps the previous version callable. Monitor names the stage to re-enter. Continuous training, in Google’s sense, is a new version — not a silent rewrite of the live weights.",
      rule: "My operating rule: never retune on test residuals, never promote without a previous version that still answers, and never update weights in place from a monitor alert.",
      illustration: "The call-order path is an illustration, not a record.",
      reviewed: "28 Oct 2026",
      sections: [
        {
          id: "test",
          title: "Test once",
          paragraphs: [
            "Load the test ids after validation has cleared. Transform with the train preprocessor. Score once. Report the decision metric, the baseline on those rows, a ten-bin calibration table, and the metric on each time bucket and on any segment named in task.json. If a hard decision needs a threshold, choose it on validation and apply it to test. Do not search it on test.",
            "On the call-order path the baseline on those frozen mornings is still oldest past-due first. The report compares the candidate ranking to that rule on the same invoices. I do not invent a lift number here. The gate is whether the named metric clears the bar and beats that baseline. A test miss writes rejected and closes the run. Inspecting which invoices were mis-ordered and fitting again on those same mornings is not a loop.",
          ],
          figure: {
            kind: "sheet",
            caption:
              "Test report for the call-order illustration. Status is the gate. No lift is stated as a collected result.",
            steps: [
              { term: "Metric", detail: "Named ranking metric on frozen mornings." },
              { term: "Baseline", detail: "Oldest past-due first on the same invoices." },
              { term: "Calibration", detail: "Ten bins when the score is a probability." },
              { term: "Segments", detail: "Customer segment and time buckets if named in task.json." },
              {
                term: "Status",
                detail: "passed, or rejected. Rejected leaves oldest-first in charge.",
                gate: true,
              },
            ],
          },
        },
        {
          id: "serve",
          title: "Serve with a previous version",
          paragraphs: [
            "Serve packs the preprocessor, the model, the feature spec, and the version id. A signature row must match name for name and type for type. A request missing a required feature returns an error. It does not fill the value from memory.",
            "On the call-order path the previous version is oldest past-due first. During cutover both orders can be scored. The supervisor’s list still follows oldest-first until Watch clears the candidate. One action restores oldest-first alone. That rule is the same shape as Run the version just verified, and the same idea Fowler names for a deployment pipeline: the path that produced the build is the path you trust, and the last good build stays available.",
            "Google’s deployment process describes progressive delivery into a serving environment. I take the progressive cutover. I do not take a requirement to use any one cloud service.",
          ],
          figure: {
            kind: "compare",
            caption:
              "Call-order cutover. The supervisor still owns who is called first.",
            steps: [],
            columns: [
              {
                term: "Oldest-first",
                detail: "Still produces the list order.",
                points: ["Loaded and callable", "No model required", "One action restores it alone"],
              },
              {
                term: "Candidate score",
                detail: "Ranks in parallel until Watch clears.",
                points: ["Signature test passed", "Missing feature errors", "No silent fill"],
              },
            ],
          },
          sources: [
            { href: "/handbooks/software-that-stays-in-use/4", label: "Run the version just verified" },
            FOWLER_PIPE,
            GOOGLE_MLOPS,
            { href: SDLC_CARD, label: "SDLC field card" },
          ],
        },
        {
          id: "monitor",
          title: "Watch returns as a new version",
          paragraphs: [
            "Google’s continuous monitoring watches for data and prediction skew that should trigger investigation or a new training run. Continuous training is the repeated execution of the training pipeline when new data or code arrives. On this card those two processes meet as Watch: a daily compare against the training distribution saved in the bundle.",
            "On the call-order path, watch the missing rate for days past due and open amount, the PSI of those features against training mornings, the PSI of the score, and, once fourteen days have passed, the ranking metric against the test bar. A missing open amount stops this version and returns the list to oldest-first while Features is repaired. A shift in days past due above 0.25 PSI keeps oldest-first in charge and returns to Prepare with the live morning sample. A score shift with stable inputs keeps the current cutover state and re-reads a mature labeled cohort before any refit. A label metric worse than test by more than the margin starts a new run from the split on newer mornings.",
            "The 0.25 PSI line and the default 0.05 absolute margin are my operating thresholds. Monitor never updates weights in place. The next model is a new version id.",
          ],
          figure: {
            kind: "tree",
            caption: "Live signals on the call-order list. Oldest-first stays until a new version clears.",
            steps: [
              {
                term: "Required feature missing",
                detail: "Stop this version. List falls back to oldest-first.",
                spine: "→ Features",
                branches: [{ term: "Error", detail: "Do not fill open amount from memory." }],
              },
              {
                term: "Feature PSI > 0.25",
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
                branches: [{ term: "New version id", detail: "Oldest-first stays until cutover." }],
              },
            ],
          },
          picture: {
            src: `${ML_ART}/watch.jpg`,
            alt: "An illustration. Amber previous light and cyan candidate light meet a dark monitor. No amount.",
          },
          sources: [GOOGLE_MLOPS, GOOGLE_CT],
        },
        {
          id: "ship-draft",
          title: "When a draft is cheap",
          paragraphs: [
            "A generated serving stub can reorder every morning’s list and still have no oldest-first fallback, no signature test, and a silent retrain on a schedule. Ship and watch still applies. Continuous training without refusal is not this book.",
            "Done means the model card says passed, the signature tests pass, and oldest-first remains callable. The agent recipe is the checklist. These chapters are the reason the checklist exists.",
          ],
          sources: [{ href: ML_AGENT, label: "ML pipeline agent recipe" }],
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
      lede: "A passed test is not permission. Before a version owns any part of a decision, someone names the intended use, the owner, the forbidden uses, and the evidence the card already holds. Without that sheet, Ship stops at candidate.",
      rule: "My operating rule: do not let a version order a decision until the model card names intended use, out-of-scope uses, the decision owner, the technical owner, the metrics and slices already measured, and how to fall back to the previous way.",
      illustration: "The call-order path is an illustration, not a record.",
      reviewed: "28 Oct 2026",
      sections: [
        {
          id: "why-gov",
          title: "Why Ship is not enough",
          paragraphs: [
            "Ship and watch proved the candidate can be served and watched. Governance asks a different question: what is this version allowed to do in the workflow? Google’s Practitioners guide places model management and model governance across the lifecycle: discovery, quality of production models, and accountability for how models are used. I use that placement. I do not copy a registry product.",
            "Mitchell et al., Model Cards for Model Reporting (FAT* 2019), ask for short documents with intended use, factors that affect performance, metrics, evaluation data, and ethical considerations. I take the duty to write intended use and limits before release. I do not paste their full template, and I do not invent demographic results this illustration does not have.",
          ],
          sources: [GOOGLE_MLOPS, MODEL_CARDS, mlChapter(5, "Ship and watch")],
        },
        {
          id: "card-sheet",
          title: "The sheet before promote",
          paragraphs: [
            "The operating sheet is one page. A blank line stops promote. Status is a gate after the lines, the same shape as Name the decision: filled for this use is not proof that the score should change the world.",
            "On the call-order illustration the intended use is ordering today’s overdue call list for the collections supervisor. Out of scope: offering more time to pay, refusing credit, changing the write-off, or auto-dialing without the supervisor. The decision owner is the supervisor. The technical owner is the person who can restore oldest-first. Metrics and slices are the ones already written in the test report. Ethical and operational limits name that the score ranks calls; it does not decide who is a bad customer.",
          ],
          figure: {
            kind: "sheet",
            caption:
              "Model card gate for the call-order illustration. A blank line keeps oldest-first in charge.",
            steps: [
              {
                term: "Intended use",
                detail: "Order today’s open overdue call list for the supervisor.",
              },
              {
                term: "Out of scope",
                detail: "Offer of more time, credit refusal, write-off, or auto-dial without a person.",
              },
              {
                term: "Decision owner",
                detail: "Collections supervisor who owns the list order.",
              },
              {
                term: "Technical owner",
                detail: "Person who can restore oldest-first in one action.",
              },
              {
                term: "Evidence",
                detail: "Test metric, baseline, slices, label delay, feature spec hash — from Ship.",
              },
              {
                term: "Fallback",
                detail: "Oldest past-due first stays callable.",
              },
              {
                term: "Status",
                detail: "Approved for this use, or held. Held is not a silent serve.",
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
            "Not every score needs the same ceremony. A look that never reaches a person can stay a notebook. A list order that changes who is called needs the sheet. A score that would refuse credit, set a price, or trigger a legal notice needs a heavier review than this illustration shows. The author’s rule: match the depth of the card to the harm of a wrong score, and never use a thin card to excuse a consequential use.",
            "Google’s governance discussion ties risk to how models are approved and monitored. On this card the minimum for a served ranking is the sheet above, a named review date, and Watch already running. A missing decision owner is investigate, not approve.",
          ],
          figure: {
            kind: "uses",
            caption: "Depth follows harm. The call-order path sits in the middle row.",
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
                cells: ["Heavier review than this book writes. Do not stretch this sheet."],
              },
            ],
          },
          sources: [GOOGLE_MLOPS],
        },
        {
          id: "review",
          title: "Review while it stays in use",
          paragraphs: [
            "The sheet is not a one-time stamp. When Watch returns a new version, the intended use and out-of-scope lines are read again. When the supervisor’s workflow changes — for example the list starts feeding auto-dial — the use has changed and the old approval does not carry.",
            "On the call-order path a quarterly read is enough while the score only reorders calls and Watch is green. An incident, a missing-feature stop, or a label-metric miss brings an early read. Continue, change, or stop for the analytics product still lives on Run the product and judge the value. This page only decides whether this model version may keep its named use.",
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
            "A generated model card can fill every heading and still leave intended use vague, out-of-scope empty, and the decision owner a mailing list. Name what the version may do still applies. A complete-looking card is not approval until a person accepts the lines and the fallback.",
            "This holds when a draft is cheap: Ship’s passed status is evidence on the sheet. It is not a substitute for the sheet.",
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
