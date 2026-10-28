/**
 * Models that stay in the decision — handbook 05.
 * Product owner: docs/product/HANDBOOKS.md
 */
import type { Handbook, HandbookLink } from "@/content/handbooks";

const DATA_CARD = "/analytics-field-card/index.html";
const SDLC_CARD = "/sdlc-field-card/index.html";
const ML_CARD = "/ml-pipeline-field-card/";
const ML_AGENT = "/ml-pipeline-field-card/AGENT.md";

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

export const MODELS_THAT_STAY_IN_THE_DECISION: Handbook = {
  slug: "models-that-stay-in-the-decision",
  index: "05",
  title: "Models that stay in the decision",
  thesis:
    "A model earns its place when each stage leaves a file the next stage can refuse.",
  card: { href: ML_CARD, label: "ML pipeline field card" },
  contents: [
    { title: "What good looks like", page: 1 },
    { title: "Prepare the table", page: 2 },
    { title: "Features that hold", page: 3 },
    { title: "Fit without spending the holdout", page: 4 },
    { title: "Ship and watch", page: 5 },
  ],
  pages: [
    {
      number: 1,
      topic: "The practice",
      title: "What good looks like",
      lede: "A model that stays in a decision is not a notebook that once scored well. It is a pipeline the organization can refuse, promote, and return from, with a previous version still callable when live evidence fails.",
      rule: "My operating rule: freeze the test ids at the split, fit every transform on train only, clear the bar on an inner slice before validation is read, read the test set once, keep the previous version callable, and start a new version when live evidence fails.",
      illustration: "The file names and thresholds in this book are the operating contract. They are not a record of one client run.",
      reviewed: "28 Oct 2026",
      plate: "pipeline",
      sections: [
        {
          id: "when",
          title: "When this book applies",
          paragraphs: [
            "Data that drives decisions is the book for one number: Ask, Grain, Truth, and Use. Software that stays in use is the book for one software change. This book starts when the artifact is a model trained from a table, and that model will be used in a decision.",
            "The ML pipeline field card is the map. The agent recipe at the same path is the same pipeline written as machine instructions. These chapters are how a person reads the work, and how I refuse a green training run that skipped a stage.",
            "Before any profile runs, the decision brief already exists: who acts, what the score may change, and what a wrong score costs. If that brief is missing, the work returns to Name the decision. A notebook is not the start.",
          ],
          sources: [
            dataChapter(2, "Name the decision"),
            { href: DATA_CARD, label: "Data analytics field card" },
            { href: ML_CARD, label: "ML pipeline field card" },
            { href: ML_AGENT, label: "ML pipeline agent recipe" },
          ],
        },
        {
          id: "lifecycle",
          title: "Four arcs, one spine",
          paragraphs: [
            "Google’s Practitioners guide to MLOps, May 2021, describes an MLOps lifecycle as integrated processes: development, training operationalization, continuous training, deployment, prediction serving, continuous monitoring, and data and model management. I use that lifecycle as the map of the work. I do not copy Google’s product stack.",
            "On this card the same work is four arcs on one spine. Prepare is the table and the features. Fit is the freeze, the train, and the miss loops. Ship is the one test read and the named version. Watch is the live signal that starts a new version. Continuous training in Google’s sense is not a silent weight update. It is a new run of Fit and Ship when Watch says so.",
          ],
          figure: {
            kind: "pipeline",
            caption:
              "Four arcs. Watch returns to Prepare or Fit as a new version. It does not overwrite the live bundle in place.",
            note: "Google’s seven processes sit inside these four arcs. The spine is refusal: each arc leaves a file.",
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
          sources: [GOOGLE_MLOPS, GOOGLE_CT],
        },
        {
          id: "stages",
          title: "Nine stages on that spine",
          paragraphs: [
            "Inside the arcs the pipeline is nine stages. Each stage writes a file. The next stage starts only when that file passes. Nothing is cleaned, fit, or scored in place.",
          ],
          figure: {
            kind: "flow",
            caption:
              "Nine stages. A miss returns left. It does not jump to serve.",
            steps: [
              { term: "Profile", detail: "Roles, nulls, label rate. profile.json.", mark: "search" },
              { term: "Quality", detail: "Repair, quarantine, re-profile. quality.json.", mark: "check" },
              { term: "Outliers", detail: "A written policy per column. outlier_policy.json.", mark: "alert" },
              { term: "Features", detail: "Decision-time only. feature_spec.json.", mark: "wrench" },
              { term: "Split", detail: "Freeze test ids. split_ids.parquet.", mark: "flag" },
              { term: "Train", detail: "Fit on train. Tune inside train. val_metrics.json.", mark: "gear" },
              { term: "Test", detail: "One official read. test_report.json.", mark: "pulse" },
              { term: "Serve", detail: "Named version. Previous stays. bundle/<version>/.", mark: "play" },
              { term: "Monitor", detail: "Daily signals. New version if live fails.", mark: "refresh" },
            ],
          },
          closing: [
            "task.json names the label, the entity key, the decision-time column, the metric, the baseline, and the minimum score before stage 1 finishes. A missing label stops the run.",
          ],
        },
        {
          id: "chapters",
          title: "How the book runs the card",
          paragraphs: [
            "Prepare the table is profile, quality, and outliers. Features that hold is the keep-or-drop list and the clock test. Fit without spending the holdout is the freeze, the train, and the miss loops. Ship and watch is the one test read, the previous version, and the live return.",
            "Google’s guide separates experimentation from the automated training pipeline. The same cut is here: a look can explore. A model that will be served has to leave the files. The agent recipe is the checklist for that second path.",
          ],
          figure: {
            kind: "uses",
            caption: "Each chapter owns one refusal.",
            steps: [],
            head: ["Chapter", "It refuses"],
            rows: [
              {
                label: "Prepare the table",
                href: "/handbooks/models-that-stay-in-the-decision/2",
                cells: ["A table with no row sentence, or a quarantine rate above five percent."],
              },
              {
                label: "Features that hold",
                href: "/handbooks/models-that-stay-in-the-decision/3",
                cells: ["A column that cannot be built at decision time."],
              },
              {
                label: "Fit without spending the holdout",
                href: "/handbooks/models-that-stay-in-the-decision/4",
                cells: ["A tune that read validation or test, or a loop with no budget."],
              },
              {
                label: "Ship and watch",
                href: "/handbooks/models-that-stay-in-the-decision/5",
                cells: ["A silent retrain, or a promote with no previous version."],
              },
            ],
          },
          sources: [GOOGLE_MLOPS, { href: ML_AGENT, label: "ML pipeline agent recipe" }],
        },
        {
          id: "draft",
          title: "When a draft is cheap",
          paragraphs: [
            "A generated training script can look complete and still have spent the holdout, fit the imputer on the full table, or served a score that cannot be built at decision time. The four arcs still apply. The files, the freeze, and the miss loops are how I tell.",
            "This holds when a draft is cheap: a green fit is not done until the model card says passed, the signature tests pass, and the previous version remains callable.",
          ],
        },
      ],
      sources: [
        { href: ML_CARD, label: "ML pipeline field card" },
        { href: ML_AGENT, label: "ML pipeline agent recipe" },
        { href: DATA_CARD, label: "Data analytics field card" },
        GOOGLE_MLOPS,
        GOOGLE_CT,
      ],
    },
    {
      number: 2,
      topic: "Data",
      title: "Prepare the table",
      lede: "Descriptive work is not a sidebar before modeling. It is the first arc. After every repair, describe the table again. A fill, a drop, or a clip changes the distribution the next stage will trust.",
      rule: "My operating rule: assign every column a role, score quality before any impute, write an outlier policy instead of a silent delete, and stop when the quarantine rate is above five percent.",
      illustration: "The invoice and credit examples elsewhere in Orbit are illustrations. This chapter states no client result.",
      reviewed: "28 Oct 2026",
      sections: [
        {
          id: "describe",
          title: "Profile first",
          paragraphs: [
            "For every column write the type, the null count, the null rate, the number of distinct values, and five examples. For numeric columns add the min, the first percentile, the median, the ninety-ninth percentile, the max, the mean, the standard deviation, and the skew. For the label add the positive rate. For decision time add the min and the max.",
            "Then assign a role: id, time, decision time, label, feature, or drop. A constant column is drop. A column whose distinct values cover almost every row is an id, not a feature. Pass only when every column has one role and the label and decision time are set.",
          ],
          figure: {
            kind: "sheet",
            caption: "The profile sheet. A blank role stops the run.",
            steps: [
              { term: "Type and nulls", detail: "dtype, null_count, null_rate, nunique, five examples." },
              { term: "Numeric shape", detail: "min, p01, p50, p99, max, mean, std, skew." },
              { term: "Label", detail: "Positive rate, or the value distribution." },
              { term: "Decision time", detail: "min and max of the decision clock." },
              {
                term: "Role",
                detail: "id, time, decision_time, label, feature, or drop. One role per column.",
                gate: true,
              },
            ],
          },
          sources: [dataChapter(3, "Say what one row means")],
        },
        {
          id: "quality",
          title: "Quality before impute",
          paragraphs: [
            "Quality scores the feature table. It does not fill missing values yet. Completeness marks a column for drop, or for a missing indicator later, when the null rate is above forty percent. Validity quarantines an illegal label and nulls an out-of-domain feature cell. Uniqueness keeps the latest row on the entity key at decision time. The clock fails when a feature’s event time is at or after the decision time. That column is dropped, or rebuilt with values known before the decision.",
            "The median delay from decision time to label time is written down. The split uses it as the embargo. Imputation is recorded only as a later rule, learned on train: numeric median, categorical mode, and a missing indicator when the train null rate is above one percent.",
            "Recompute the profile on the rows that remain. Write the before and after counts. Pass when label validity is one hundred percent on kept rows, the key is unique, no remaining feature uses post-decision values, and the quarantine rate is at most five percent. Above that the run stops.",
          ],
          figure: {
            kind: "flow",
            caption: "Quality is a path. Impute waits for train.",
            steps: [
              { term: "Completeness", detail: "Null rate per column. High null → drop or later indicator.", mark: "search" },
              { term: "Validity", detail: "Domain and label rules. Illegal label → quarantine.", mark: "check" },
              { term: "Uniqueness", detail: "One row per entity at decision time.", mark: "flag" },
              { term: "Clock", detail: "Feature known before the decision.", mark: "clock" },
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
            "Each numeric column gets a policy: keep, log1p when skew is high and the minimum is non-negative, cap on train percentiles, or quarantine when quality missed an impossible value. A rare category is not an outlier row. It becomes OTHER later, from train counts only. Pass when every numeric feature has a policy and a touch-rate. Any new quarantine returns through quality.",
          ],
          figure: {
            kind: "uses",
            caption: "Pass lines for Prepare. A blank line stops the arc.",
            steps: [],
            head: ["Stage", "Must leave"],
            rows: [
              {
                label: "Profile",
                cells: ["Every column has one role. Label and decision time are set."],
              },
              {
                label: "Quality",
                cells: [
                  "Label validity 100% on kept rows. Key unique. No post-decision feature. Quarantine ≤ 5%.",
                ],
              },
              {
                label: "Outliers",
                cells: ["Every numeric feature has a policy and a touch-rate."],
              },
            ],
          },
          sources: [NIST_OUTLIER],
        },
        {
          id: "prepare-draft",
          title: "When a draft is cheap",
          paragraphs: [
            "A generated cleaning script can drop rows to raise a metric and still leave no quarantine file, no role list, and no clock test. Prepare still applies. The next chapter cannot choose features from a table nobody can describe.",
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
      reviewed: "28 Oct 2026",
      sections: [
        {
          id: "harm",
          title: "What harms the model",
          paragraphs: [
            "A new column goes through Prepare before it is a candidate. Then the feature list keeps or drops it. A feature harms the model when its value would not exist at the moment of the decision, when it was built with the label on the full sample, when it is an identifier or a copy of the label, when it repeats another column, when its definition will not hold on the days the model is served, or when it is a proxy the decision is not allowed to use.",
            "scikit-learn’s data-leakage note is the warning I use for train-time information reaching the model. Target means, scalers, and imputers fit on the whole table are that case. Out-of-fold target encoding on train, with smoothing toward the train base rate, is allowed. Validation, test, and live rows use the mapping fit on train. They never contribute their own labels.",
          ],
          figure: {
            kind: "matrix",
            caption: "Keep or drop. The reason stays on the row.",
            steps: [],
            head: ["Signal", "Action"],
            rows: [
              { label: "Not known at decision time", cells: ["Drop. Rebuild with a cutoff, or refuse."] },
              { label: "Fit used validation or test", cells: ["Drop. Refit on train only."] },
              { label: "Identifier or near-unique", cells: ["Drop. Role is id."] },
              { label: "|corr| > 0.999 with another", cells: ["Keep the one with fewer nulls."] },
              { label: "Constant or one level > 99.5%", cells: ["Drop."] },
              { label: "Allowed and clock-clean", cells: ["Keep. fit_on: train."] },
            ],
          },
          sources: [SKLEARN_LEAKAGE],
        },
        {
          id: "clock",
          title: "The clock test",
          paragraphs: [
            "High correlation with the label does not, by itself, drop a column. The clock test decides. For each candidate I ask whether a single new row, arriving at decision time, can produce that column from inputs already known. A transform that still needs the training table to score that row is removed.",
            "Allowed transforms stay short: the column itself, log1p, a missing indicator, days since a source timestamp, a ratio of two decision-time columns, categorical consolidation fit on train, and out-of-fold target encoding on train only. Pass when every kept feature has fit_on train and a pass on the clock test. Dropped features remain listed with the reason.",
          ],
          figure: {
            kind: "tree",
            caption: "The clock test before keep.",
            steps: [
              {
                term: "Can one new row build it?",
                detail: "Only from inputs known at decision time.",
                spine: "Yes → check the fit",
                branches: [
                  { term: "Drop", detail: "Needs future values, or the full training table." },
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
          sources: [SKLEARN_LEAKAGE],
        },
        {
          id: "features-draft",
          title: "When a draft is cheap",
          paragraphs: [
            "A generated feature list can rank columns by importance before the split and still pass a unit test. Features that hold still applies. Importance measured with the label in view is not a keep.",
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
      reviewed: "28 Oct 2026",
      sections: [
        {
          id: "freeze",
          title: "Freeze the split",
          paragraphs: [
            "Sort by decision time. The last tenth is test. The previous tenth is validation. The rest is train. Leave a gap of the median label delay between those sets. Rows inside the gap enter neither set. Persist the row ids and hash the test ids. Training code loads train and validation only.",
            "If there is no decision time, use a stratified random split with a fixed seed and the same sizes. That is the weaker case. Time order is the default when the decision has a clock.",
            "scikit-learn’s cross-validation guide is the practice I use for evaluating on held-out folds. The freeze is my rule: the test hash is written before any preprocessor is fit, and a second look at those rows to change the model is not evaluation.",
          ],
          figure: {
            kind: "panels",
            caption: "Time order, then an embargo. Test stays unread until Ship.",
            steps: [
              { term: "Train", detail: "Earliest rows. Preprocessors fit here." },
              { term: "Embargo", detail: "Label-delay gap. Belongs to neither set." },
              { term: "Validation", detail: "One official read after the inner bar clears." },
              { term: "Test", detail: "Frozen ids. Read once in Ship." },
            ],
          },
          sources: [SKLEARN_SPLIT],
        },
        {
          id: "train",
          title: "Train inside the freeze",
          paragraphs: [
            "Fit every preprocessor on train, then apply it: imputation, missing indicators, rare-level map, cap bounds, scaler, and any target-encoding map. Save them with the model.",
            "Cut an inner slice from train the same way, the last tenth of train. Score a baseline on that slice. Classification with a low positive rate uses average precision. Otherwise use ROC-AUC. When the served value is a probability, also record the Brier score. Regression uses mean absolute error against the train mean. The metric name was fixed in task.json before this score.",
            "Train a regularized linear model and a tree model. Rank features by permutation importance on the inner slice. Drop features whose importance is at or below zero, record the drop, and refit. Tuning stays on the inner slice. Validation is unread until the inner score clears the bar and beats the baseline.",
          ],
          figure: {
            kind: "loop",
            caption: "Fit loop inside train. Validation sits outside until the inner score clears.",
            steps: [
              { term: "Preprocess", detail: "Fit on train only.", mark: "gear" },
              { term: "Baseline", detail: "Inner slice score.", mark: "flag" },
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
            "The bar is the minimum metric in task.json, and the score must beat the baseline. An accuracy of 0.90 against a 0.95 base rate is a miss.",
            "Loop A retunes on the inner slice, at most twenty trials, and stops early when five trials in a row fail to improve the best score by at least 0.005. Validation and test stay unread. If the budget ends below the bar, go to Loop B. Do not add trials.",
            "Loop B changes the feature spec once per pass, from the inner-slice errors. Refit, then Loop A with ten trials. Spend a validation read only when the inner score clears. Stop after three revisions, or when a revision fails to raise the inner score by 0.005, then go to Loop C.",
            "Loop C is for a named data defect: wrong labels, duplicates, a clock failure, or wrong units. A weak score by itself is not a data defect. Repair through Prepare, build a new split, and discard the old test ids unread. Run Fit once. If validation is still below the bar, stop. Write blocked on the model card. Do not serve. Do not read the test set.",
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
            "A generated AutoML run can report a strong score after peeking at the test fold. Fit without spending the holdout still applies. The freeze is the check, not the leaderboard.",
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
      reviewed: "28 Oct 2026",
      sections: [
        {
          id: "test",
          title: "Test once",
          paragraphs: [
            "Load the test ids after validation has cleared. Transform with the train preprocessor. Score once. Report the decision metric, the baseline on those rows, a ten-bin calibration table, and the metric on each time bucket and on any segment named in task.json. If a hard decision needs a threshold, choose it on validation and apply it to test. Do not search it on test.",
            "A test miss writes rejected and closes the run. The next run needs a later time window, or a feature written down before anyone inspected those test rows. Inspecting the residuals and fitting again on the same test ids is not a loop.",
          ],
          figure: {
            kind: "sheet",
            caption: "The test report. Status is the gate.",
            steps: [
              { term: "Metric", detail: "Decision metric on the frozen test ids." },
              { term: "Baseline", detail: "Same rows, same metric." },
              { term: "Calibration", detail: "Ten bins when the score is a probability." },
              { term: "Segments", detail: "Time buckets and any required slices." },
              {
                term: "Status",
                detail: "passed, or rejected. Rejected closes the run.",
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
            "The previous version stays loaded. New traffic can be scored by both. The previous version still produces the decision until monitoring says the new version holds. That rule is the same shape as Run the version just verified, and the same idea Fowler names for a deployment pipeline: the path that produced the build is the path you trust, and the last good build stays available.",
            "Google’s deployment process describes progressive delivery into a serving environment. I take the progressive cutover. I do not take a requirement to use any one cloud service.",
          ],
          figure: {
            kind: "compare",
            caption: "Two versions during cutover. The decision still has an owner.",
            steps: [],
            columns: [
              {
                term: "Previous",
                detail: "Still produces the decision.",
                points: ["Loaded and callable", "Known test metric", "One action restores it alone"],
              },
              {
                term: "Candidate",
                detail: "Scores in parallel until Watch clears.",
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
            "Watch the required-feature missing rate, the population stability index of each feature, the stability of the score, and, when labels are older than the label delay, the decision metric on that cohort against the test metric. A missing required feature stops this version and returns to Features. A feature shift above 0.25 PSI keeps the current version and returns to Prepare with the live sample. A score shift with stable features keeps the current version and re-reads a mature labeled cohort. It does not refit first. A label metric worse than test by more than the margin in task.json starts a new run from the split.",
            "The 0.25 PSI line and the default 0.05 absolute margin are my operating thresholds. Monitor never updates weights in place. The next model is a new version id.",
          ],
          figure: {
            kind: "tree",
            caption: "Live signals name the arc to re-enter.",
            steps: [
              {
                term: "Required feature missing",
                detail: "Stop this version.",
                spine: "→ Features",
                branches: [{ term: "Error", detail: "Do not fill from memory." }],
              },
              {
                term: "Feature PSI > 0.25",
                detail: "Keep current version.",
                spine: "→ Prepare with live sample",
                branches: [{ term: "Investigate", detail: "Re-profile before a new fit." }],
              },
              {
                term: "Score PSI, features stable",
                detail: "Keep current version.",
                spine: "→ mature cohort read",
                branches: [{ term: "No refit first", detail: "Evidence before a new version." }],
              },
              {
                term: "Label metric below margin",
                detail: "New labeled window.",
                spine: "→ new split, Fit, Ship",
                branches: [{ term: "New version id", detail: "Previous stays until cutover." }],
              },
            ],
          },
          sources: [GOOGLE_MLOPS, GOOGLE_CT],
        },
        {
          id: "ship-draft",
          title: "When a draft is cheap",
          paragraphs: [
            "A generated serving stub can return a score for every request and still have no previous version, no signature test, and a silent retrain on a schedule. Ship and watch still applies. Continuous training without refusal is not this book.",
            "Done means the model card says passed, the signature tests pass, and the previous version remains callable. The agent recipe is the checklist. These chapters are the reason the checklist exists.",
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
  ],
};
