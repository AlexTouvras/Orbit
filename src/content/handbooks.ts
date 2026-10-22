/**
 * Field handbooks — the method layer.
 * Product owner: docs/product/HANDBOOKS.md
 * Public prose is final-book text. Draft status stays in the product doc.
 */

export type ClaimKind = "principle" | "practice" | "hypothesis";

export interface HandbookLink {
  href: string;
  label: string;
}

export interface HandbookFigureBranch {
  term: string;
  detail: string;
}

export interface HandbookFigureStep {
  term: string;
  detail: string;
  /** Icon in the diagram. The words still name the step. */
  mark?: HandbookMark;
  /** Drawn apart from the other lines, as the stop. */
  gate?: boolean;
  /** Exits from this stage of a decision tree. */
  branches?: HandbookFigureBranch[];
  /** The condition that continues to the next stage. */
  spine?: string;
}

export type HandbookMark =
  | "code"
  | "gear"
  | "check"
  | "merge"
  | "pulse"
  | "refresh"
  | "alert"
  | "cross"
  | "pause"
  | "search"
  | "wrench"
  | "play"
  | "clock"
  | "bolt"
  | "shield"
  | "flag";

export interface HandbookFigureColumn {
  term: string;
  detail: string;
  points: string[];
}

export interface HandbookFigureRow {
  label: string;
  cells: string[];
  /** Opens the chapter that owns this row. */
  href?: string;
}

export interface HandbookFigure {
  kind: "flow" | "pyramid" | "loop" | "recovery" | "signals" | "scene" | "compare" | "curve" | "sheet" | "reading" | "uses" | "tree";
  caption: string;
  steps: HandbookFigureStep[];
  columns?: HandbookFigureColumn[];
  /** Axis names for a sketch. The figure states no amount. */
  axes?: { y: string; x: string };
  /** Worksheet sequence, without the plate. */
  plain?: boolean;
  /** Assumptions that stay on the figure. */
  note?: string;
  head?: string[];
  rows?: HandbookFigureRow[];
}

/** A photograph that follows a section, or opens the page. It states no amount the prose does not. */
export interface HandbookPicture {
  src: string;
  alt: string;
}

export interface HandbookSection {
  id: string;
  title: string;
  paragraphs?: string[];
  steps?: string[];
  /** A meeting worksheet. Each line is one field. A blank field is the check. */
  lines?: { term: string; detail: string }[];
  figure?: HandbookFigure;
  /** Prose that follows the figure. The paragraphs above it stay first. */
  closing?: string[];
  /** This book's picture of the section. It is its own leaf after the words. */
  picture?: HandbookPicture;
  sources?: HandbookLink[];
}

export interface HandbookPage {
  /** 1-based, stable. The public URL uses this number. */
  number: number;
  /** What kind of page this is, in the book's own words. */
  topic: string;
  title: string;
  lede: string;
  /** The author's rule, stated apart from the sourced practice. */
  rule?: string;
  /** Date the claims on this page were last checked against the sources. */
  reviewed: string;
  /** An illustration on this chapter. It is not a record of experience. */
  illustration?: string;
  /** A story of how a decision unfolded. Only when one exists. */
  story?: HandbookLink;
  /** Delivered work. Only when a portfolio piece is that work. */
  work?: HandbookLink;
  /** Opening plate. The first leaf of the book, not a route in front of the page. */
  plate?: "horizon" | "ledger";
  /** A design picture behind the words. It does not name a step, and the words stay readable. */
  ground?: HandbookPicture;
  sections: HandbookSection[];
  sources: HandbookLink[];
}

/** A section inside a chapter. It opens on `page`. */
export interface HandbookContentsSection {
  title: string;
  page: number;
}

/** A contents entry. It opens on `page`. Sections are the pages already written inside that chapter. */
export interface HandbookContentsEntry {
  title: string;
  page: number;
  sections?: HandbookContentsSection[];
}

export interface Handbook {
  slug: string;
  index: string;
  title: string;
  thesis: string;
  /** The field card this book extends. */
  card: HandbookLink;
  contents: HandbookContentsEntry[];
  pages: HandbookPage[];
}

export interface LaterHandbook {
  index: string;
  title: string;
  card: HandbookLink;
}

export const CLAIM_LABEL: Record<ClaimKind, string> = {
  principle: "Operating principle",
  practice: "Practice I treat as given",
  hypothesis: "Hypothesis",
};

const SDLC_CARD = "/sdlc-field-card/index.html";
const DELIVERY_CARD = "/delivery-field-card/index.html";
const DATA_CARD = "/analytics-field-card/index.html";
const CREDIT_CARD = "/credit-risk-field-card/index.html";
const BAYES_CARD = "/bayes-field-card/index.html";
const DATA_ART = "/handbook-art/data-that-drives-decisions";

function dataChapter(page: number, label: string): HandbookLink {
  return { href: `/handbooks/data-that-drives-decisions/${page}`, label };
}

const FOWLER_CI = "https://martinfowler.com/articles/continuousIntegration.html";
const TRUNK = "https://trunkbaseddevelopment.com/";
const PYRAMID = "https://martinfowler.com/articles/practical-test-pyramid.html";
const NIST_PDF =
  "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-218.pdf";

function source(href: string, label: string): HandbookLink {
  return { href, label };
}

const FOWLER_DAILY = source(
  `${FOWLER_CI}#EveryonePushesCommitsToTheMainlineEveryDay`,
  "Fowler, daily merge",
);
const FOWLER_SEMI = source(`${FOWLER_CI}#semi-integration`, "Fowler, semi-integration");
const FOWLER_FIX = source(
  `${FOWLER_CI}#FixBrokenBuildsImmediately`,
  "Fowler, fix the build",
);
const FOWLER_FAST = source(`${FOWLER_CI}#build-fast`, "Fowler, the commit build");
const FOWLER_REFACTOR = source(
  `${FOWLER_CI}#EnablesRefactoringForSustainedProductivity`,
  "Fowler, refactoring",
);
const FOWLER_LIMIT = source(
  `${FOWLER_CI}#WhenWeShouldNotUseContinuousIntegration`,
  "Fowler, where CI does not fit",
);
const FOWLER_RELEASE = source(
  `${FOWLER_CI}#ReleaseToProductionIsABusinessDecision`,
  "Fowler, release is a business decision",
);
const FOWLER_TRUNK = source(
  `${FOWLER_CI}#trunk-based`,
  "Fowler, CI and trunk-based development",
);
const HAMMANT = source(TRUNK, "Hammant, trunk-based development");
const VOCKE_PYRAMID = source(`${PYRAMID}#TheTestPyramid`, "Vocke, the test pyramid");
const VOCKE_BEHAVIOUR = source(`${PYRAMID}#WhatToTest`, "Vocke, test behaviour");
const NIST_PW1 = source(`${NIST_PDF}#page=20`, "NIST SP 800-218, PW.1");
const FOWLER_SELF = source(
  "https://martinfowler.com/bliki/SelfTestingCode.html",
  "Fowler, self-testing code",
);
const FOWLER_TDD = source(
  "https://martinfowler.com/bliki/TestDrivenDevelopment.html",
  "Fowler, red, green, refactor",
);
const FOWLER_COMMIT = source(`${FOWLER_CI}#commit-build`, "Fowler, the later stage");
const BECK_TESTS = source(
  "https://kentbeck.github.io/TestDesiderata/#test-desiderata",
  "Beck, test desiderata",
);
const EAGLE = source(
  "https://testing.googleblog.com/2015/01/testing-on-toilet-change-detector-tests.html",
  "Eagle, change-detector tests",
);
const MESZAROS = source(
  "http://xunitpatterns.com/Fragile%20Test.html",
  "Meszaros, fragile test",
);
const JEFFRIES = source(
  "https://ronjeffries.com/xprog/articles/expcardconversationconfirmation/",
  "Jeffries, card, conversation, confirmation",
);
const FOWLER_STORIES = source(
  "https://martinfowler.com/bliki/ConversationalStories.html",
  "Fowler, conversational stories",
);
const WAKE = source(
  "https://xp123.com/articles/invest-in-good-stories-and-smart-tasks/",
  "Wake, negotiable",
);
const MANIFESTO = source("https://agilemanifesto.org/", "Agile manifesto, 2001");
const MANIFESTO_TALK = source(
  "https://agilemanifesto.org/principles.html",
  "Agile manifesto, face-to-face",
);
const PATTON = source(
  "https://www.jpattonassociates.com/wp-content/uploads/2015/03/story_mapping.pdf",
  "Patton, story mapping",
);
const SHOSTACK = source(
  "https://shostack.org/resources/threat-modeling",
  "Shostack, four questions",
);
const MS_THREAT = source(
  "https://www.microsoft.com/en-us/securityengineering/sdl/threatmodeling",
  "Microsoft SDL, threat modeling",
);
const FOWLER_PIPE = source(
  "https://martinfowler.com/bliki/DeploymentPipeline.html",
  "Fowler, deployment pipeline",
);
const FOWLER_CD = source(
  "https://martinfowler.com/bliki/ContinuousDelivery.html",
  "Fowler, continuous delivery",
);
const FOWLER_BLUE = source(
  "https://martinfowler.com/bliki/BlueGreenDeployment.html",
  "Fowler, blue-green deployment",
);
const SATO = source(
  "https://martinfowler.com/bliki/ParallelChange.html",
  "Sato, parallel change",
);
const HUMBLE = source(
  "https://continuousdelivery.com/principles/",
  "Humble, small batches",
);
const FOWLER_FREQ = source(
  "https://martinfowler.com/bliki/FrequencyReducesDifficulty.html",
  "Fowler, if it hurts",
);
const FOWLER_DEBT = source(
  "https://martinfowler.com/bliki/TechnicalDebt.html",
  "Fowler, technical debt",
);
const NIST_RV = source(`${NIST_PDF}#page=27`, "NIST SP 800-218, RV.2 and RV.3");
const FOWLER_REVIEW = source(
  `${FOWLER_CI}#HowDoWeDoPullRequestsAndCodeReviews`,
  "Fowler, code review",
);

export const SOFTWARE_THAT_STAYS_IN_USE: Handbook = {
  slug: "software-that-stays-in-use",
  index: "01",
  title: "Software that stays in use",
  thesis:
    "Software stays in use when a team can still change it. This book is how I keep that change cheap.",
  card: { href: SDLC_CARD, label: "SDLC field card" },
  contents: [
    { title: "Keep main releasable", page: 1 },
    { title: "Fail for the right reason", page: 2 },
    { title: "The plan fits on a page", page: 3 },
    { title: "Run the version just verified", page: 4 },
    { title: "Use is the next change", page: 5 },
  ],
  pages: [
    {
      number: 1,
      topic: "Continuous integration",
      title: "Keep main releasable",
      lede: "Software stays in use when a team can still change it. Continuous integration keeps that change cheap: people merge to main at least daily, a build tests the merge, and a broken main is the team's work.",
      rule: "My operating rule: keep main releasable, make the failure visible immediately, and do not let a red main become normal.",
      illustration: "The renamed field is an illustration, not a record of a team.",
      reviewed: "18 Oct 2026",
      plate: "horizon",
      sections: [
        {
          id: "decay",
          title: "Why the code stops lasting",
          paragraphs: [
            "Code does not become difficult to change all at once. Changes accumulate, branches drift apart, and a small improvement becomes a risky integration. The team responds by changing less. The structure that needed the improvement stays.",
            "Fowler describes that decay as a cost, not a mood. A structure that was reasonable at the start is in the way six months later. Improving it means a deep edit. On a long-lived branch that edit collides with everyone else's work. The reversal he names is refactoring: small, behaviour-preserving changes to the structure, done often, on a build that can tell you the behaviour held.",
            "A refactor that sits on a branch for two weeks can improve the code and still be too expensive to merge, because everyone else spent those two weeks building on the old structure. Integrate often enough and the same change is a few hours of adjustment. A clash shows up while the two people can still talk.",
            "That is how I use the phrase software that stays in use. The code lasts because the team can still restructure it. Rare integration is what makes the restructuring too expensive to start.",
          ],
          sources: [FOWLER_REFACTOR],
        },
        {
          id: "practice",
          title: "The practice, and my rule",
          paragraphs: [
            "The principle is Fowler's. Each person merges their work into the shared codebase, together with their colleagues' changes, at least daily. Each merge is verified by an automated build that includes tests, so a fault shows up while the change is small. A build server that only compiles feature branches does not meet that definition. He calls it semi-integration. You have pulled main into your branch. You have not combined your work with the other branches still open. The collisions wait until someone finally merges.",
            "My operating rule on that practice: main stays releasable, and a failed integration build takes priority over the next feature. The invariant is frequent integration and a result you can trust.",
            "The implementation choice is narrower than the principle. Hammant describes trunk-based development as one trunk, resistance to long-lived branches, and a main you can release. On that page he also describes a full build on the workstation before anyone else depends on the change. I use that workstation build as a safeguard. I do not treat it as the definition of every trunk-based team. Fowler argues the two names are one practice, and that a build server on feature branches is not it. A team can keep one trunk and still miss the daily merge, or miss a build that tests it. The tool sequence can vary. The work still has to land on main today, and the build still has to check that landing.",
          ],
          sources: [FOWLER_DAILY, FOWLER_SEMI, FOWLER_TRUNK, HAMMANT],
        },
        {
          id: "day",
          title: "The day",
          paragraphs: [
            "This is the order I use on a full-time team. The pull, the local build, and the push follow Fowler's walk. The second pull, the one before the push, is my sequence. It is not a step every continuous-integration setup requires. The local build is a safeguard on the machine that made the change. The integration build is the result that counts.",
            "A pull request can carry the review when the branch is short-lived and lands the same day. Fowler's warning is the other case: a review that waits for hours or days adds enough friction to break the daily merge.",
          ],
          figure: {
            kind: "loop",
            caption: "The commit loop. A red main leaves the loop for repair, then comes back to pull.",
            steps: [
              { term: "Pull", detail: "Take main. If it is red, repair before a feature.", mark: "refresh" },
              { term: "Change", detail: "A slice a person can read and merge today.", mark: "code" },
              { term: "Test", detail: "Local build. Not the gate.", mark: "gear" },
              { term: "Integrate", detail: "Pull again, combine, push.", mark: "merge" },
              { term: "Verify", detail: "The integration machine.", mark: "pulse" },
              { term: "Repair", detail: "Repair first, then return to pull.", mark: "wrench" },
            ],
          },
          steps: [
            "Pull. Take main and run the build before you change anything. If main is red, repair it before a feature. A new edit on a red build hides which change failed. Done when that build is green, or the red build is the work in front of you.",
            "Change. Keep the slice small enough that a person can read the diff and merge it the same day. If it will not fit, split it. An agent may draft the slice. The read is a person's. When the behaviour has to stay off while the code lands, Hammant uses a feature flag or a branch by abstraction. Those keep unfinished behaviour off the path a person uses. They do not make an untested change safe to release. Done when a person can read the diff and the slice can land today.",
            "Test. Run the build on your machine before anyone else can depend on the result. That result is not the gate. Done when the local build is green.",
            "Integrate. Pull again, combine with what landed while you were working, run the build again, and push. Done when the change is on main.",
            "Verify. Wait for the build on the integration machine. A green result on the laptop is not that result. Done when the shared pipeline has finished the required checks on the integrated change.",
          ],
          sources: [FOWLER_DAILY, FOWLER_REVIEW, HAMMANT],
        },
        {
          id: "broken",
          title: "A broken main",
          paragraphs: [
            "A red main is the team's work, not a badge someone notices tomorrow. Fowler's rule, which he takes from Kent Beck, is that nobody has a higher priority than fixing the build. I stop further feature integration. The change that repairs the break, or reverts it, still lands. The team does not leave the failure in place. Normal integration resumes when main is green.",
            "My rule when the cause is not obvious: if it cannot be isolated quickly, revert the suspected change and restore a main you already trusted. Investigate after that main is green. Bring the change back only with a passing integration build.",
          ],
          figure: {
            kind: "recovery",
            caption: "Feature work waits. The fix or the revert still lands.",
            steps: [
              { term: "Red build", detail: "The integration build goes red.", mark: "cross" },
              { term: "Stop", detail: "No further feature work lands on main.", mark: "pause" },
              { term: "Identify or revert", detail: "Name the change. If you cannot, revert the suspected one.", mark: "search" },
              { term: "Green main", detail: "The fix or the revert has landed.", mark: "check" },
              { term: "Resume", detail: "Feature integration starts again.", mark: "play" },
            ],
          },
          sources: [FOWLER_FIX, { href: SDLC_CARD, label: "SDLC field card" }],
        },
        {
          id: "scenario",
          title: "An illustrative break",
          paragraphs: [
            "This is an illustrative scenario. It is not a record of a team I worked with, and it states no measured result.",
            "A shared field is renamed. A downstream consumer still reads the old name. The integration build on main fails on that consumer's test. The red build names the change. Feature integration stops. The revert lands, the old name is back, and the same test passes. Integration resumes.",
          ],
          figure: {
            kind: "scene",
            caption: "Illustrative. A renamed field, a failed downstream test, a revert. No measured time.",
            steps: [
              { term: "Field", detail: "A shared field is renamed.", mark: "code" },
              { term: "Test", detail: "A downstream test fails on main.", mark: "cross" },
              { term: "Named", detail: "The red build names the change.", mark: "search" },
              { term: "Revert", detail: "The revert lands. The known-good name is back.", mark: "refresh" },
              { term: "Resume", detail: "Main is green. Integration resumes.", mark: "check" },
            ],
          },
        },
        {
          id: "tests",
          title: "The tests that make the day possible",
          paragraphs: [
            "Daily merging dies if the build is too slow to run, or if red has stopped meaning anything. Fowler's ten minutes is a guideline for the commit build, the one that runs on every push to main. It is not a limit on every later stage. He splits what will not fit. The first stage compiles and runs the localized tests, with slow collaborators replaced by a double. A later stage may hit a real database and take a couple of hours. The first stage is the stop. The second stage is still fixed quickly. It is not the build you wait on before every push.",
            "Vocke, using Mike Cohn's pyramid, is the shape inside those ten minutes. Many small fast tests. Some coarser tests. Very few that drive the whole application. He warns against a test ice-cream cone: a nightmare to maintain, and too slow to run. Test observable behaviour. A test tied to the internal structure breaks when you refactor, the safety net becomes noise, and people stop refactoring.",
            "If the behaviour held and the test went red because a name or a collaborator moved, delete the test or rewrite it against the behaviour. A generated test stays unverified until a person has checked the assertion, the failure it is meant to catch, and the behaviour it claims to protect.",
            "A control I rely on to stop a bad merge has to be able to fail the build. A review, a policy call, or a check on another cadence is a different control, and I do not describe it as that gate. NIST SP 800-218 says to integrate secure-development practices into the life cycle you already run. Practice PW.1 says you identify the security requirements and the risks the software will face, threat modeling being one form of risk modeling it names, and you track the requirements, the risks, and the design decisions. I use that record to decide which checks are gates. Some of those checks fail the commit build. Others run later, or sit in a separate control. I do not put every later check inside the commit build's time.",
          ],
          figure: {
            kind: "pyramid",
            caption:
              "The wide base is the commit build. The narrow top can wait. Ten minutes is Fowler's guideline for that build, not a target I have set.",
            steps: [
              { term: "Fast", detail: "Many tests of observable behaviour, close to the change." },
              { term: "Coarser", detail: "Fewer tests across a boundary, still in the commit build when they stay fast." },
              { term: "End to end", detail: "Very few. They can run in a later stage." },
            ],
            columns: [
              {
                term: "Commit build",
                detail: "The stop before the next push. Fast tests, and coarser tests that still finish inside Fowler's guideline.",
                points: [],
              },
              {
                term: "Later checks",
                detail: "End-to-end tests and other slow checks. Fixed quickly. Not the build you wait on before every push.",
                points: [],
              },
            ],
          },
          sources: [
            FOWLER_FAST,
            VOCKE_PYRAMID,
            VOCKE_BEHAVIOUR,
            source("https://csrc.nist.gov/projects/ssdf", "NIST SSDF"),
            NIST_PW1,
          ],
        },
        {
          id: "inspect",
          title: "What I inspect",
          paragraphs: [
            "These are the questions I ask of a team. They are my check, not a claim that Fowler or Hammant published this list.",
          ],
          steps: [
            "Can a developer get a meaningful result from the commit build while the change is still small? Look at how long that build takes, and whether people are waiting on it.",
            "How long does a change typically sit before it is on main, and can a person read the diff? Look at the merge history.",
            "When main is red, who stops, and who restores it? Look at the build log for that red main.",
            "Do the tests fail because the behaviour changed, or because the structure moved? Look at a red test and the diff that turned it.",
            "Can the team say what would make this change safe to release, separately from the fact that it merged? Look at the release criteria, not the green badge.",
          ],
        },
        {
          id: "measure",
          title: "How I would know",
          paragraphs: [
            "I track four signals. I have no target times, and these definitions are not results I have collected. A faster loop only counts if the main you restore is still one you can release. A green badge with rare merges, or a fast loop that leaves main broken, is not the practice.",
          ],
          figure: {
            kind: "signals",
            caption: "Four signals. Definitions, not target times.",
            steps: [
              { term: "Integration frequency", detail: "Merges to main per working day, or per week.", mark: "clock" },
              {
                term: "Feedback latency",
                detail: "From the push or the merge until the required build result is back.",
                mark: "bolt",
              },
              { term: "Recovery time", detail: "From a failed main build until main is green again.", mark: "alert" },
              {
                term: "Release readiness",
                detail: "Whether the release criteria are met. A passing commit build is not that answer.",
                mark: "shield",
              },
            ],
          },
        },
        {
          id: "limits",
          title: "Where I do not use it",
          paragraphs: [
            "Fowler's limit, which I use: a project with one or two part-time maintainers and contributors they do not work beside. Daily integration is not plausible there. The pull-request workflow came from that setting. Raise the frequency you can. A build badge is not the practice.",
            "The practice fails without the skill under it. No self-testing build, and main goes red for reasons nobody can see. No automation, and the integration itself takes too long to do daily. A team that pushes red and walks away trains everyone else to work on a broken trunk. I do not install the daily merge until the commit build exists and someone will stop for it.",
            "I keep three decisions apart. Integration: the change has passed the required checks on main. Delivery: the software is in a state you could deploy. Release: whether people should run this version now. Fowler separates that last decision from the build. Once main is releasable, putting that build in production is a business decision. Continuous delivery, as I use the term, is the second decision. It is not an automatic production deploy, and it is not a reason to squeeze every later check into the commit build. Calendars, blast-radius proof, and the cutover sequence stay on the technology delivery field card. Keeping main releasable does not pick the window.",
          ],
          figure: {
            kind: "compare",
            caption: "Integration, delivery, and release are three decisions.",
            steps: [],
            columns: [
              {
                term: "Integration",
                detail: "Has the change passed the required checks on main?",
                points: ["Daily merge", "A build that tests it", "A red main stops feature work"],
              },
              {
                term: "Delivery",
                detail: "Is the software in a state you could deploy?",
                points: ["Main stays releasable", "Able to deploy", "A green build need not ship"],
              },
              {
                term: "Release",
                detail: "Should people run this version now?",
                points: ["A business decision", "The delivery card's window", "Separate from the build"],
              },
            ],
          },
          sources: [
            FOWLER_LIMIT,
            FOWLER_RELEASE,
            { href: DELIVERY_CARD, label: "Technology delivery field card" },
          ],
        },
        {
          id: "draft",
          title: "A faster first draft",
          paragraphs: [
            "An agent can draft more change than a team can merge in a day. The cost on this page is the collision between people, and a red main is the team's work. I keep the slice small enough that a person can read the diff and land it today, because that is what keeps the collision cheap. A later drafting tool leaves that cost where it is.",
          ],
        },
      ],
      sources: [
        source(FOWLER_CI, "Martin Fowler, Continuous Integration (18 Jan 2024)"),
        source(TRUNK, "Paul Hammant, trunk-based development"),
        source(PYRAMID, "Ham Vocke, The Practical Test Pyramid (26 Feb 2018)"),
        source("https://csrc.nist.gov/projects/ssdf", "NIST SSDF"),
        NIST_PW1,
        { href: SDLC_CARD, label: "SDLC field card" },
        { href: DELIVERY_CARD, label: "Technology delivery field card" },
      ],
    },
    {
      number: 2,
      topic: "Tests",
      title: "Fail for the right reason",
      lede: "A suite keeps a change cheap only when a red test means the behaviour changed. A test that goes red because the structure moved, or that stays green when the behaviour is wrong, trains the team to stop trusting red.",
      rule: "My operating rule: if the behaviour held, delete the test or rewrite it against the behaviour. An agent-written test stays a draft until a person has seen it fail for a behaviour they can name.",
      reviewed: "18 Oct 2026",
      sections: [
        {
          id: "cost",
          title: "Why red stops meaning a fault",
          paragraphs: [
            "Fowler's self-testing code is a bug detector you can run in one command. He says you are not doing continuous integration without it. The benefit he names is the confidence to change the system. Without that detector, a fix can create more faults than it removes, and people stop touching the code that needs the change.",
            "That confidence depends on red meaning a fault. Alex Eagle names the failure mode a change-detector test. It breaks when the production code changes, and it does not check the behaviour of either version. He says these tests provide negative value. They catch no defects, and keeping them slows the work. Rewrite them, or delete them.",
            "I treat a red that nobody can tie to a behaviour as that detector. People learn to edit the test and move on. The next real fault looks the same, and the suite no longer protects the change.",
          ],
          sources: [FOWLER_SELF, EAGLE],
        },
        {
          id: "sensitive",
          title: "Sensitive to the behaviour",
          paragraphs: [
            "Beck names the pair I use. Behavioural: if the behaviour changes, the test result should change. Structure-insensitive: the test should not change its result if the structure of the code changes. The behaviour moved, so the test moved. The structure moved and the behaviour held, so the test stayed green.",
            "Meszaros, on the xUnit Patterns site, defines a fragile test as one that fails when the system changes in a way that does not affect the part the test is exercising. He separates the case that looks similar and is not fragility. If the functionality the test verifies was modified, that failure is the reason for the regression test. He calls a further case overspecified software: the test says how the software should do the work, not what it should achieve, and it passes only for one implementation.",
          ],
          sources: [BECK_TESTS, MESZAROS],
        },
        {
          id: "day",
          title: "When a test goes red",
          paragraphs: [
            "This is the order I use when a test in the commit build goes red, and when someone adds a test.",
          ],
          figure: {
            kind: "flow",
            caption: "A red test stays when it names a behaviour change. Otherwise it goes.",
            steps: [
              { term: "Name", detail: "The behaviour, in the words a caller would use." },
              { term: "Ask", detail: "Did that behaviour change?" },
              { term: "Keep", detail: "If it changed, fix the code or accept the new behaviour on purpose." },
              { term: "Drop", detail: "If it held, delete the test or rewrite it against the behaviour." },
              { term: "Prove", detail: "If you have not seen it fail, break the behaviour and watch the red." },
            ],
          },
          steps: [
            "Name the behaviour the way a caller or a user would. If the only description is a method name, a private collaborator, or the order of calls, the test is already tied to the structure.",
            "If that behaviour changed, the red is the point. I fix the code, or I accept the new behaviour and change the assertion on purpose. Meszaros is explicit that a failure of the functionality the test verifies is the regression, not the fragile case.",
            "If the behaviour held, I do not edit the assertion to match the new structure and call the suite healthy. Eagle's remedy is rewrite or delete. I rewrite the test against the behaviour, or I delete it.",
            "Fowler's cycle for a new behaviour is red, green, refactor. You write the test before that behaviour exists, so the test starts red, and then you write the code until it passes. An agent that writes the test against code that already works skips that red. I break the behaviour on purpose, watch the test go red, restore the behaviour, and watch it go green. Until a person has done that, the test is a draft, and I do not count it as a gate.",
            "The security checks stay while I delete change-detectors. The SDLC field card's hook is the line I use: a check that cannot fail is not a gate. A check I rely on still has to fail the build when the requirement is broken. If the requirement still holds and the check went red because a tool's output changed shape, I rewrite it against the requirement or I delete it.",
          ],
          sources: [MESZAROS, EAGLE, FOWLER_TDD, { href: SDLC_CARD, label: "SDLC field card" }],
        },
        {
          id: "inspect",
          title: "What I inspect",
          paragraphs: [
            "These are the questions I ask of a suite. They are my check, not a list Beck, Eagle, or Meszaros published.",
          ],
          steps: [
            "When this test last went red, what behaviour changed?",
            "If I break that behaviour on purpose, does this test go red?",
            "Does the test name a result someone can observe, or a call order and a private collaborator?",
            "Which tests did an agent add, and which of those has a person seen fail?",
            "Which security checks can fail the build, and which cannot?",
          ],
        },
        {
          id: "measure",
          title: "How I would know",
          paragraphs: [
            "I keep two counts. Among tests that went red, how many failed because the behaviour changed, and how many failed because the structure moved or the setup around the test changed. Among tests an agent added, how many a person has seen go red for a behaviour they can name. The practice is a suite that stays green when the structure moves and goes red when the behaviour changes. A larger suite, or a green badge, is not the count.",
          ],
        },
        {
          id: "limits",
          title: "Where I do not use it",
          paragraphs: [
            "I do not delete a test because the red was inconvenient. If the behaviour it verifies actually changed, that failure is the regression Meszaros says the test is for. I change the assertion only when I am accepting a new behaviour on purpose.",
            "I do not use the delete rule on a test whose job is to notice behaviour I cannot name yet. When I can name it, I rewrite the test against that name, or I drop the test.",
            "A test that fails for the right reason and takes too long is a different problem. Fowler puts that check in a later stage of the build, not in the commit build. I do not delete it to buy the ten minutes.",
            "I do not install the rule where there is no self-testing build. Fowler's detector is a command you can run. A test that never runs cannot fail for any reason.",
          ],
          sources: [MESZAROS, FOWLER_COMMIT, FOWLER_SELF],
        },
        {
          id: "arrives",
          title: "Tests that arrive green",
          paragraphs: [
            "Beck's pair holds for a test a person typed and for a test an agent typed. More of them will arrive already green. The count I trust is how many a person has seen fail for a behaviour they can name.",
          ],
        },
      ],
      sources: [
        source(
          "https://kentbeck.github.io/TestDesiderata/#test-desiderata",
          "Kent Beck, Test Desiderata",
        ),
        source(
          "https://testing.googleblog.com/2015/01/testing-on-toilet-change-detector-tests.html",
          "Alex Eagle, Change-Detector Tests Considered Harmful (27 Jan 2015)",
        ),
        source(
          "http://xunitpatterns.com/Fragile%20Test.html",
          "Gerard Meszaros, Fragile Test (xUnit Patterns)",
        ),
        source(
          "https://martinfowler.com/bliki/SelfTestingCode.html",
          "Martin Fowler, Self-Testing Code (1 May 2014)",
        ),
        source(
          "https://martinfowler.com/bliki/TestDrivenDevelopment.html",
          "Martin Fowler, Test-Driven Development (11 Dec 2023)",
        ),
        source(
          `${FOWLER_CI}#commit-build`,
          "Martin Fowler, Continuous Integration, the commit build (18 Jan 2024)",
        ),
        { href: SDLC_CARD, label: "SDLC field card" },
      ],
    },
    {
      number: 3,
      topic: "Plan and design",
      title: "The plan fits on a page",
      lede: "A change stays reviewable when the plan is a page a person will actually read. The page names the goal, the cost, what done means, who can reach the data, and how that can be abused. The page is not the understanding. Someone has to walk the journey, and a way it fails, before the build.",
      rule: "My operating rule: if a person will not review the page, it is not the plan. If nobody has walked how the journey fails, the build has not started.",
      reviewed: "18 Oct 2026",
      sections: [
        {
          id: "page",
          title: "What has to fit on the page",
          paragraphs: [
            "Jeffries's card does not hold the whole requirement. It has just enough text to identify the story and remind people what it is. The card is a token for planning. Notes on it record priority and cost. He has almost never found a multi-page specification ideal, and he says that kind of document is more likely to slow you down.",
            "Patton's frame, before a story map, is a short brief that constrains what you map. He also asks for the benefit, and for what the user does. I hold that brief to one page. Goal, cost, and what done means. Who can reach the data, and how that can be abused. A file no one will review is not the plan. That limit is mine. Neither of them published a one-page rule.",
          ],
          sources: [JEFFRIES, PATTON, { href: SDLC_CARD, label: "SDLC field card" }],
        },
        {
          id: "understanding",
          title: "The page is not the understanding",
          paragraphs: [
            "Jeffries puts the requirement in the conversation, an exchange between the customer and the programmers, not in the card. However much documentation you produce, he says you still cannot be certain enough about what is to be done. Certainty is the third part: the customer says how she will confirm the story, and that confirmation is the acceptance test. The best supplements are examples. The best examples are executable.",
            "The manifesto puts working software ahead of comprehensive documentation, and it says the documentation still has value. The principle I use from it is face-to-face conversation as the way a team conveys information. Beside that, my rule: the page still has to exist, and a meeting with nothing written down does not make the change safer. The writing is required, and it is not sufficient.",
            "Fowler calls a story handed to developers to implement a decreed story, and a misunderstanding. The story is refined in conversation. Developers help find the gaps, the cheaper alternative, and the split. Wake's word for that is negotiable. The story is not a contract for features. It captures the essence, and the details are created by the customer and the programmer during the work.",
          ],
          sources: [JEFFRIES, MANIFESTO, MANIFESTO_TALK, FOWLER_STORIES, WAKE],
        },
        {
          id: "abuse",
          title: "Who can reach the data",
          paragraphs: [
            "Shostack's site states four questions: what are we working on, what can go wrong, what are we going to do about it, and did we do a good job. I put the first two on the plan page.",
            "Microsoft's Security Development Lifecycle names threat modeling as a core element, in five steps: security requirements, an application diagram, the threats, the mitigations, and a check that the mitigations happened. The tool's notation draws components, data flows, and security boundaries. I do not treat the tool as the plan. The page still has to name who can reach the data, and how that reach can be abused. When a model can call a tool that reads the data, that model is one of the callers. NIST SP 800-218 practice PW.1 asks for that identification in design. I write it on this page, where a person will review it.",
          ],
          sources: [SHOSTACK, MS_THREAT, NIST_PW1],
        },
        {
          id: "walk",
          title: "The walk",
          paragraphs: [
            "This is the order I use before a change is built.",
          ],
          figure: {
            kind: "flow",
            caption: "The page is the token. The walk is the understanding.",
            steps: [
              { term: "Write", detail: "Goal, cost, done, who can reach the data, how it can be abused." },
              { term: "Cut", detail: "If a person will not review it, it is not the plan yet." },
              { term: "Walk", detail: "Tell the journey in order, including a way it fails." },
              { term: "Change", detail: "The conversation splits it, cheapens it, or names an abuse." },
              { term: "Confirm", detail: "What done means becomes an example someone can run." },
            ],
          },
          steps: [
            "Write the page first. If it will not fit, the change is more than one change. Split it until a person can review what remains.",
            "Patton's map runs left to right in the order you would tell the story. Conversation carries the variations. In the explore pass he asks what could go wrong, and what the user does to recover. I do not start the build until someone has walked one of those failures out loud and the page names it.",
            "Fowler's conversation is allowed to change the page. A cheaper path, a split, or a gap is a result, and it gets written down. When the page reaches the build unchanged, I treat the walk as not done, and I walk it again.",
            "Jeffries's confirmation is how the customer will know the story is done. I want that as an example someone can run. A confirmation that cannot fail is not a check.",
          ],
          sources: [PATTON, FOWLER_STORIES, JEFFRIES, { href: SDLC_CARD, label: "SDLC field card" }],
        },
        {
          id: "inspect",
          title: "What I inspect",
          paragraphs: [
            "These are the questions I ask of a plan. They are my check, not a list Jeffries or Patton published.",
          ],
          steps: [
            "Can a person review this plan in one sitting?",
            "Does it name the goal, the cost, and what done means?",
            "Who can reach the data, and how can that be abused?",
            "Has someone walked the journey, including a failure, and what did that change on the page?",
            "What example will show the story is done, and can that example fail?",
          ],
        },
        {
          id: "measure",
          title: "How I would know",
          paragraphs: [
            "I keep two counts. How often the plan is still one page when the build starts. How often the walk changes that page before the build: a split, a cheaper path, or a named abuse. When a plan reaches the build unchanged, I do not count the walk. When it outgrows a review, it has stopped being the plan. I do not have a target number for either count.",
          ],
        },
        {
          id: "limits",
          title: "Where I do not use it",
          paragraphs: [
            "Patton's limit, which I use: if you need the precision of a workflow, a flow chart, or a UML model, a story map is the wrong tool. I use the page to decide the change. I do not use it in place of a design that has to be exact.",
            "Wake's negotiable story is not a contract. I do not freeze the page against the conversation that is supposed to change it.",
            "An agent may draft the page. It is not the plan until a person has reviewed it and walked a failure.",
            "Release calendars, blast-radius proof, and the cutover sequence stay on the technology delivery field card. This page decides the change. It does not pick the window.",
          ],
          sources: [
            PATTON,
            WAKE,
            { href: DELIVERY_CARD, label: "Technology delivery field card" },
          ],
        },
        {
          id: "unread",
          title: "A page that looks finished",
          paragraphs: [
            "A draft can sound as if someone already walked the failure. The walk is a person telling that failure and writing down what it changed on the page. I keep the page short enough to review because a fluent draft is easier to leave unread. A smoother draft leaves the walk with that person.",
          ],
        },
      ],
      sources: [
        source(
          "https://ronjeffries.com/xprog/articles/expcardconversationconfirmation/",
          "Ron Jeffries, Card, Conversation, Confirmation (30 Aug 2001)",
        ),
        source(
          "https://martinfowler.com/bliki/ConversationalStories.html",
          "Martin Fowler, Conversational Stories (4 Feb 2010)",
        ),
        source(
          "https://xp123.com/articles/invest-in-good-stories-and-smart-tasks/",
          "Bill Wake, INVEST in Good Stories (17 Aug 2003)",
        ),
        source("https://agilemanifesto.org/", "Manifesto for Agile Software Development (2001)"),
        source(
          "https://agilemanifesto.org/principles.html",
          "Principles behind the Agile Manifesto (2001)",
        ),
        source(
          "https://www.jpattonassociates.com/wp-content/uploads/2015/03/story_mapping.pdf",
          "Jeff Patton, Story Mapping (8 Sep 2013)",
        ),
        source(
          "https://shostack.org/resources/threat-modeling",
          "Adam Shostack, four-question threat modeling",
        ),
        source(
          "https://www.microsoft.com/en-us/securityengineering/sdl/threatmodeling",
          "Microsoft SDL, threat modeling",
        ),
        NIST_PW1,
        { href: SDLC_CARD, label: "SDLC field card" },
        { href: DELIVERY_CARD, label: "Technology delivery field card" },
      ],
    },
    {
      number: 4,
      topic: "Release and deploy",
      title: "Run the version just verified",
      lede: "People run the version the pipeline just verified. The previous version stays deployable, and returning to it is one deploy, not a repair project.",
      rule: "My operating rule: do not put a build in front of people unless the pipeline produced it, and do not retire the previous build until one deploy can bring it back.",
      reviewed: "18 Oct 2026",
      sections: [
        {
          id: "artifact",
          title: "The version people run",
          paragraphs: [
            "Fowler's deployment pipeline breaks the build into stages. The first stage compiles and provides the binaries later stages use. Deploying to production is usually the final stage. The pipeline's job is to detect changes that would cause problems in production, including performance, security, and usability, before that final stage.",
            "People therefore run those binaries, not a fresh build assembled on release day. A rebuild can compile different code, pick up a different dependency, or skip a test the pipeline already ran. An agent that generates a fresh build on release day is that rebuild. I do not put that rebuild in front of people. The version just verified is the artifact the later stage already holds.",
          ],
          sources: [FOWLER_PIPE],
        },
        {
          id: "choice",
          title: "Able to deploy, and choosing to",
          paragraphs: [
            "Fowler separates two decisions. Continuous delivery means you can deploy the current version on demand, and a business sponsor could ask for that without anyone panicking. Continuous deployment means every change goes to production automatically. Delivery is the ability. Deployment on every commit is a choice. His continuous-integration article makes the same cut: once main is releasable, whether to put that build in production is a business decision.",
            "He names the benefit of the smaller change: less to go wrong, and easier to fix when a problem appears. Humble's principle is the same pressure from the other side. Work in small batches, because a large handoff is what makes a release expensive. The day, the audience, and the proof you require before that choice stay on the technology delivery field card. This page is the version, and the way back.",
          ],
          sources: [FOWLER_CD, FOWLER_RELEASE, HUMBLE, { href: DELIVERY_CARD, label: "Technology delivery field card" }],
        },
        {
          id: "return",
          title: "The way back",
          paragraphs: [
            "Fowler's blue-green deployment keeps two production environments, as identical as possible. One is live. You test the new release in the other, then switch the router so requests go to the new one. If something goes wrong, you switch the router back. The previous version is still running. He is explicit about what the switch does not undo: transactions that arrived while the new environment was live. Depending on the design you may feed both environments, or you may have a residue to deal with. The switch is not a time machine.",
            "The SDLC field card's line is stricter about the mechanism and looser about the shape. The previous version stays one deploy away. I count Fowler's router switch as that return when the old environment is still up. When the old environment is gone, the return is one deploy of the binaries you kept, through the same pipeline stage that deployed the current version. A return that needs a new build, a reconstructed branch, or a repair project means the previous version did not stay.",
          ],
          sources: [FOWLER_BLUE, { href: SDLC_CARD, label: "SDLC field card" }],
        },
        {
          id: "day",
          title: "The release",
          paragraphs: [
            "This is the order I use when a version goes in front of people.",
          ],
          figure: {
            kind: "flow",
            caption: "People run the verified artifact. The previous artifact stays returnable.",
            steps: [
              { term: "Verify", detail: "The pipeline's binaries, not a new build." },
              { term: "Deploy", detail: "That same artifact, to the place people will use." },
              { term: "Run", detail: "People are on the version just verified." },
              { term: "Keep", detail: "The previous artifact is still deployable." },
              { term: "Return", detail: "One switch, or one deploy, puts it back." },
            ],
          },
          steps: [
            "Deploy the binaries the pipeline already tested. If the release process compiles again, stop and make the final stage use the binaries.",
            "Leave the previous artifact in a place the same stage can deploy. If you use two environments, leave the previous one running until you are willing to lose it as the fast return.",
            "A flag that hides the new behaviour is not the previous version. The previous version is the previous artifact. Hiding a path does not put people back on the build you already verified.",
            "Before you deploy, name what happens to transactions that arrive on the new version if you return. Fowler's residue is part of the release, not a surprise after it.",
          ],
          sources: [FOWLER_PIPE, FOWLER_BLUE],
        },
        {
          id: "inspect",
          title: "What I inspect",
          paragraphs: [
            "These are the questions I ask of a release. They are my check, not a list Fowler published.",
          ],
          steps: [
            "Is the artifact people are running the one the pipeline's later stage produced?",
            "Where is the previous artifact, and can the same stage deploy it once?",
            "Can the previous version start against the data store as it is now?",
            "What arrived after the new version went live, and what happens to it on a return?",
            "If the answer to going back is a project, which step retired the previous version?",
          ],
        },
        {
          id: "measure",
          title: "How I would know",
          paragraphs: [
            "I keep two checks. How long from deciding the version is bad until people are on the previous version. Whether that return used an artifact the pipeline had already produced, or required a new build. The practice is a return in one deploy, or one switch back to an environment that is still running. A green pipeline with no previous artifact is not the practice. I do not have a target time.",
          ],
        },
        {
          id: "limits",
          title: "Where I do not use it",
          paragraphs: [
            "Sato's parallel change, also called expand and contract, is how I keep a return possible when the interface has to change. Expand so the old and the new both work. Migrate callers. Contract only when the previous version no longer has to run. I do not contract while that version is the way back.",
            "Fowler describes a retailer who deployed first to employees, then to invited customers, then to everyone. Who goes first, the proof you require, and the watch after release stay on the technology delivery field card. This page does not pick the window.",
            "Blue-green needs two environments as identical as you can make them. Where I cannot keep both, I still keep the previous binaries and a pipeline stage that can deploy them once. I do not describe a diagram of two colours as the return if the old environment is already gone.",
          ],
          sources: [SATO, FOWLER_CD, FOWLER_BLUE, { href: DELIVERY_CARD, label: "Technology delivery field card" }],
        },
        {
          id: "fresh",
          title: "A fresh build on release day",
          paragraphs: [
            "People run the binaries the pipeline already holds. A fresh build on release day is a different version. The previous artifact stays one deploy away. The next patch is a new change on this path. The way back is the artifact you kept, including when the patch was cheap to ask for.",
          ],
        },
      ],
      sources: [
        source(
          "https://martinfowler.com/bliki/DeploymentPipeline.html",
          "Martin Fowler, Deployment Pipeline (30 May 2013)",
        ),
        source(
          "https://martinfowler.com/bliki/ContinuousDelivery.html",
          "Martin Fowler, Continuous Delivery (30 May 2013)",
        ),
        source(
          "https://martinfowler.com/bliki/BlueGreenDeployment.html",
          "Martin Fowler, Blue Green Deployment (1 Mar 2010)",
        ),
        source(
          `${FOWLER_CI}#ReleaseToProductionIsABusinessDecision`,
          "Martin Fowler, Continuous Integration, release is a business decision (18 Jan 2024)",
        ),
        source(
          "https://continuousdelivery.com/principles/",
          "Jez Humble, Principles of Continuous Delivery",
        ),
        source(
          "https://martinfowler.com/bliki/ParallelChange.html",
          "Danilo Sato, Parallel Change (13 May 2014)",
        ),
        { href: SDLC_CARD, label: "SDLC field card" },
        { href: DELIVERY_CARD, label: "Technology delivery field card" },
      ],
    },
    {
      number: 5,
      topic: "Maintain and improve",
      title: "Use is the next change",
      lede: "What you learn after people are using the software is the next change. A defect, and a lesson about whether it is useful, both go back through plan, build, release, and maintain.",
      rule: "My operating rule: the first release is not the end. The lesson walks the same path as any other change. It does not skip the page, the check, or the pipeline.",
      reviewed: "18 Oct 2026",
      sections: [
        {
          id: "feedback",
          title: "What use is for",
          paragraphs: [
            "Fowler lists user feedback among the principal benefits of continuous delivery. The biggest risk, he writes, is building something that is not useful. The earlier and more frequently working software is in front of real users, the sooner you learn whether it is. He is explicit that this feedback requires continuous deployment. If you do not want the new software in front of every user, you deploy it to a subset.",
            "Who is in that subset, the proof you require, and the watch after release stay on the technology delivery field card. This page is what happens to the lesson once you have it.",
          ],
          sources: [FOWLER_CD, { href: DELIVERY_CARD, label: "Technology delivery field card" }],
        },
        {
          id: "often",
          title: "Do the painful return more often",
          paragraphs: [
            "Fowler's line, from 28 July 2011, is that if an activity hurts, do it more often. People put off integration because it is painful, and the pain grows with the wait. He names the same pressure in testing, refactoring, database migration, conversations with customers, planning, and releasing. A large job gets harder as the amount grows, while small pieces compose: a migration across many tables is error-prone, and a sequence of small migrations is not. Feedback is the second reason, so you can correct course in a complex process. Practice is the third. Doing the thing often is also what shows you how to automate it.",
            "I treat a production fix on a special path as that postponed integration. The fix stays on the path the team already runs, because that is the path they practice. He describes the pain against the time between integrations as an exponential curve you would see if you plotted it. I do not treat the sketch as a measurement.",
          ],
          figure: {
            kind: "curve",
            caption: "Pain rises with the wait between integrations. The curve is a sketch, not a measurement.",
            axes: { y: "Pain", x: "Time between integrations" },
            steps: [],
          },
          sources: [FOWLER_FREQ],
        },
        {
          id: "interest",
          title: "A skipped path adds interest",
          paragraphs: [
            "Fowler uses the metaphor Ward Cunningham coined. Cruft is a deficiency in internal quality that makes the software harder to modify than it should be. The extra effort on the next change is the interest on that debt. The metaphor breaks in one place he names: you pay the interest when you work in that part of the code, not because time passed. A mess you never have to change can be left alone. A part people change often cannot, because cruft accumulates where changes land without attention to internal quality. His illustration is a feature that would take four days in a clear structure and six with the cruft. He also says those costs are estimates, and that they are not objectively measurable. The days are his illustration. I do not adopt them as a result.",
            "A side door is my name for a production change that skips the page, a check that can fail, or the pipeline. It lands in code the next lesson will touch, which is the high-activity area. I treat the skipped check and the unreviewed page as how the interest gets into the next fix. That is my rule, not a claim Fowler made.",
          ],
          sources: [FOWLER_DEBT],
        },
        {
          id: "class",
          title: "Remediate, then change the class",
          paragraphs: [
            "NIST SP 800-218, SSDF version 1.1, puts the response to a known vulnerability under Respond to Vulnerabilities. Practice RV.2 says to assess, prioritize, and remediate to reduce the window of opportunity for attackers. You analyze the risk, then plan and implement the response. If a permanent mitigation is not ready, a temporary one goes in the plan until it is. You update the records of design decisions, risk responses, and approved exceptions as needed. Practice RV.3 is how later vulnerabilities become less frequent. You record the root cause, look for the pattern, review the software for the same class and fix that class rather than waiting for external reports, and review the life cycle. RV.3.4 says to update that process, when it is appropriate, so the cause is less likely to recur in an update or in new software.",
            "NIST's examples separate the notice from the fix. A security advisory tells acquirers what the vulnerability is and how to address it. Delivering the remediation is a different example. A wiki of lessons is an example of recording the analysis. Planning and implementing a change to the life-cycle practices is the other example under RV.3.4. My rule: the wiki note and the advisory are not the fix. The vulnerability ships as a change on this path. When the cause is in how we build, the life cycle changes too, as a check that can fail or as a line on the page.",
          ],
          sources: [NIST_RV],
        },
        {
          id: "return",
          title: "The next change",
          paragraphs: [
            "This is the order I use when use produces the next change. The page, the check, and the artifact are the path the earlier pages already set. This one is the rule that a lesson does not get a quieter path.",
          ],
          figure: {
            kind: "flow",
            caption: "A lesson from use walks the same path as any other change.",
            steps: [
              { term: "Learn", detail: "A defect, or what use taught you." },
              { term: "Page", detail: "One page a person reviews." },
              { term: "Check", detail: "A test or a security check that can fail for this cause." },
              { term: "Ship", detail: "The pipeline's artifact. The previous version stays returnable." },
              { term: "Again", detail: "The next lesson takes this path." },
            ],
          },
          steps: [
            "Write what is wrong, who is affected, and what done means, on one page a person will review. If the failure is who can reach the data, or how that reach is abused, that is on the page.",
            "Put a check in the pipeline that fails for this behaviour before the fix, and passes for the right reason after it. A security check stays only when it can fail the build.",
            "Ship the binaries the pipeline produced. A rebuild beside the pipeline is a side door.",
            "A temporary mitigation may run while the permanent change is on this path. Record it as temporary, and remove it when the change has shipped. It is not a second version with no page behind it.",
            "Leave the previous artifact one deploy away while people are on this change. Returning is still that deploy, not a repair project.",
          ],
          sources: [NIST_RV, { href: SDLC_CARD, label: "SDLC field card" }],
        },
        {
          id: "inspect",
          title: "What I inspect",
          paragraphs: [
            "These are the questions I ask of a lesson from use. They are my check. NIST and Fowler did not publish this list.",
          ],
          steps: [
            "Is there a page a person reviewed for this defect or this lesson?",
            "Did a check fail for this behaviour before the fix?",
            "Did the fix reach people as a pipeline artifact, with the previous artifact still one deploy away?",
            "If this is a vulnerability, is the risk response recorded, and did a practice or a check change so the class is less likely?",
            "Did any production fix in this period skip the page, the check, or the pipeline?",
          ],
        },
        {
          id: "measure",
          title: "How I would know",
          paragraphs: [
            "I keep two counts. How many defects or lessons from use became a change on main that used a reviewed page, a check that can fail, and the pipeline's artifact. How many production fixes shipped by a path that skipped one of those. The practice is the first count. A fast side door does not count as the practice. I do not have a target number.",
          ],
        },
        {
          id: "limits",
          title: "Where I do not use it",
          paragraphs: [
            "The watch window, the blast radius, and the cutover sequence stay on the technology delivery field card. This page starts when the lesson is known. It does not run the incident.",
            "Fowler says a crufty area you do not have to modify can be left alone, because the interest is paid only when you work there. I do not open a cleanup this lesson does not touch.",
            "Doing the painful thing more often is not a promise that every lesson ships today. Whether this build goes in front of people stays the business decision on the release page. Whenever it does ship, it ships on this path. Contracting an interface while the previous version is the way back stays on that page too. I do not retire the return in order to land the lesson.",
          ],
          sources: [FOWLER_DEBT, { href: DELIVERY_CARD, label: "Technology delivery field card" }],
        },
        {
          id: "ask",
          title: "A cheaper ask",
          paragraphs: [
            "Asking for a fix got cheaper. The curve is the wait between integrations, and that wait is the same. A lesson goes through the page, the check, and the pipeline, whoever typed the draft. I keep that path because a fast draft makes a side door tempting, and the side door is the interest on the next change.",
          ],
        },
      ],
      sources: [
        source(
          "https://martinfowler.com/bliki/ContinuousDelivery.html",
          "Martin Fowler, Continuous Delivery (30 May 2013; user feedback added 12 Aug 2014)",
        ),
        source(
          "https://martinfowler.com/bliki/FrequencyReducesDifficulty.html",
          "Martin Fowler, Frequency Reduces Difficulty (28 July 2011)",
        ),
        source(
          "https://martinfowler.com/bliki/TechnicalDebt.html",
          "Martin Fowler, Technical Debt (21 May 2019)",
        ),
        NIST_RV,
        { href: SDLC_CARD, label: "SDLC field card" },
        { href: DELIVERY_CARD, label: "Technology delivery field card" },
      ],
    },
  ],
};

const KIMBALL_GRAIN = source(
  "https://www.kimballgroup.com/2003/03/declaring-the-grain/",
  "Kimball, declaring the grain",
);
const KIMBALL_TECHNIQUES = source(
  "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/grain/",
  "Kimball Group, grain",
);
const KIMBALL_STEPS = source(
  "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/four-4-step-design-process/",
  "Kimball Group, four-step design",
);
const KIMBALL_PROCESS = source(
  "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/business-process/",
  "Kimball Group, business process",
);
const KIMBALL_PDF = source(
  "https://www.kimballgroup.com/wp-content/uploads/2013/08/2013.09-Kimball-Dimensional-Modeling-Techniques11.pdf",
  "Kimball Group techniques PDF",
);
const GAO_RESULTS = source(
  "https://www.gao.gov/assets/ggd-10.1.20.pdf",
  "GAO Results Act guide, April 1998",
);
const GAO_RECONCILE = source(
  "https://www.gao.gov/assets/gao-25-107721.pdf",
  "GAO Green Book, May 2025",
);
const DBT_BUILD = source(
  "https://docs.getdbt.com/reference/commands/build",
  "dbt, build skips downstream",
);
const DBT_SEVERITY = source(
  "https://docs.getdbt.com/reference/resource-configs/severity",
  "dbt, test severity",
);
const DBT_CONTRACT = source(
  "https://docs.getdbt.com/docs/collaborate/govern/model-contracts",
  "dbt, model contracts",
);
const DBT_VERSIONS = source(
  "https://docs.getdbt.com/docs/mesh/govern/model-versions",
  "dbt, model versions",
);
const NYGARD_ADR = source(
  "https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions",
  "Nygard, architecture decision records",
);
const DUCKDB_HOME = source("https://duckdb.org/", "DuckDB, in-process analytical database");
const SPARK_OVERVIEW = source("https://spark.apache.org/docs/latest/", "Spark 4.2.0 overview");
const AIRFLOW_RUN = source(
  "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html#running-dags",
  "Airflow, running Dags",
);
const AWS_SHARED = source(
  "https://aws.amazon.com/compliance/shared-responsibility-model/",
  "AWS, shared responsibility",
);
const GAO_P3 = source(
  "https://guides.gaoinnovations.gov/greenbook/2025/principle-3-establish-structure-responsibility-and-authority/",
  "GAO Green Book, principle 3",
);
const GAO_P6 = source(
  "https://guides.gaoinnovations.gov/greenbook/2025/principle-6-define-objectives-and-risk-tolerances/",
  "GAO Green Book, principle 6",
);
const GAO_P10 = source(
  "https://guides.gaoinnovations.gov/greenbook/2025/principle-10-design-control-activities/",
  "GAO Green Book, principle 10",
);
const GAO_P16 = source(
  "https://guides.gaoinnovations.gov/greenbook/2025/principle-16-perform-monitoring-activities/",
  "GAO Green Book, principle 16",
);
const GAO_P17 = source(
  "https://guides.gaoinnovations.gov/greenbook/2025/principle-17-evaluate-issues-and-remediate-deficiencies/",
  "GAO Green Book, principle 17",
);
const DQ_DIMENSIONS = source(
  "https://www.gov.uk/government/news/meet-the-data-quality-dimensions",
  "Government Data Quality Hub, dimensions",
);
const DQ_FRAMEWORK = source(
  "https://www.gov.uk/government/publications/the-government-data-quality-framework/the-government-data-quality-framework",
  "Government Data Quality Framework",
);
const OPENLINEAGE_MODEL = source(
  "https://openlineage.io/docs/spec/object-model",
  "OpenLineage, object model",
);

export const DATA_THAT_DRIVES_DECISIONS: Handbook = {
  slug: "data-that-drives-decisions",
  index: "03",
  title: "Data that drives decisions",
  thesis:
    "A number is ready when you can say Ask, Grain, Truth, and Use.",
  card: { href: DATA_CARD, label: "Data analytics field card" },
  contents: [
    { title: "What good looks like", page: 1 },
    { title: "Choose the work", page: 6 },
    {
      title: "Make the number fit to use",
      page: 2,
      sections: [
        { title: "Name the decision", page: 2 },
        { title: "Say what one row means", page: 3 },
        { title: "When two reports don't match", page: 4 },
        { title: "Keep the definition", page: 5 },
      ],
    },
    { title: "Choose the stack", page: 7 },
    { title: "Keep trust in force", page: 8 },
    { title: "Run the product and judge the value", page: 9 },
  ],
  pages: [
    {
      number: 1,
      topic: "The practice",
      title: "What good looks like",
      lede: "Asking for a screen is not yet a piece of work. Good analytics is a capability the organization can run: a named decision, a number that can be trusted, technology it can keep, and a later check on whether the decision got better.",
      rule: "My operating rule: name the decision and the person who will act, decide whether the work is worth the cost of keeping it, define the number so it answers that decision, choose technology I can operate, later ask whether the decision got better, and change the work or stop it when it did not.",
      illustration: "The invoice path is an illustration, not a record.",
      reviewed: "19 Oct 2026",
      plate: "ledger",
      ground: {
        src: `${DATA_ART}/path.jpg`,
        alt: "",
      },
      sections: [
        {
          id: "path",
          title: "The capability",
          paragraphs: [
            "Good analytics connects a business question to a decision a named person will make. The number has to be one that person can trust. Someone has to be able to run the work after it is built. Later, I look at whether the decision got better. A report, a model, or a platform is not that capability. Technology supports the practice. It does not define it.",
            "The analytics field card is the map I drew for this book. It is my companion, not an independent source. Ask, Grain, Truth, and Use are the path one number walks. Ask names the decision and the person. Grain says what one row means. Truth is the check that the number can be trusted, including an explanation when two reports disagree. Use is the action, and a later look at what happened.",
            "Those four steps are not the lifecycle of the capability. The lifecycle is choosing what to build, choosing the tools, setting the controls, naming an owner, watching the work, and improving it or stopping it.",
            "This operating model is my synthesis. From the GAO guide for agency performance plans, April 1998, I take one link. When a goal does not measure itself, the measures are how you see what happened, decide, and say who is accountable. The guide is about a plan. I use that link. I do not apply the rest of the guide, and the guide does not establish this model.",
          ],
          figure: {
            kind: "flow",
            caption:
              "The operating model. The decision, the path a number walks, the work of running it, and the later check. Technology supports the practice.",
            steps: [
              {
                term: "Decision",
                detail: "A named person and a named choice. A requested screen is not yet that choice.",
              },
              {
                term: "Path",
                detail: "Ask, Grain, Truth, and Use. One number, defined and checked before anyone acts on it.",
              },
              {
                term: "Practice",
                detail: "What to build, the tools, the controls, and an owner. Watch the work. Improve it, or stop it.",
              },
              {
                term: "Check",
                detail:
                  "Whether people use it, whether it can still be kept, and what happened in the business. An outcome does not, by itself, prove the cause.",
              },
            ],
          },
          sources: [GAO_RESULTS, { href: DATA_CARD, label: "Data analytics field card" }],
        },
        {
          id: "path-case",
          title: "One decision",
          paragraphs: [
            "The invoice path is an illustration. I have not measured it, and it states no amount. A credit controller decides whether to offer an open invoice more time to pay, or to refuse that time, before the account is written off. The list supports that choice inside an agreed credit policy. It does not replace the policy, and it does not replace the controller.",
            "An overdue invoice can mean the customer is paying on agreed terms, the invoice is a billing error, or the debt is unlikely to be paid. The list should show what distinguishes those cases: the agreed terms, whether the invoice has been disputed, and what has already been paid. I do not write the policy that says which case gets more time. Refusing time to a customer who is paying on agreed terms can lose the account. Offering time on a debt that will not be paid leads to a write-off.",
            "The population is open invoices, as of yesterday. Invoices already written off are left out. Yesterday is fresh enough because the offer is made before write-off, not while the customer is on the phone. A partial payment, an open dispute, or a write-off after that snapshot changes what the row includes. Those rules belong in the sentence on Say what one row means.",
            "A second report, one row per customer at month-end, can disagree without either total being miscalculated. The cause can be the grain, the date, what is included, the status rules, how the rows are added, or how the amount is calculated. I do not publish a number between the two. When two reports don't match is where that difference is explained, or the number stays unpublished.",
            "For this decision I would build yesterday's list for that one controller. A live screen for every collector answers whom to call now. That is a different decision, and keeping it means a number that moves all day. A simpler build is not automatically better. This offer does not improve because the number is newer than yesterday. A calling prediction waits until the list is in use.",
            "The tools follow that choice. This illustration takes one report, dbt, DuckDB, and the invoice ledger. One person refreshes yesterday's list. Choose the stack places that design beside a shared daily workflow and an operational service. Each one is hypothetical, and the reason is written down there.",
            "Once the list is published, the controller can see it, the owner can change the row, and a list older than yesterday does not go out.",
          ],
        },
        {
          id: "path-number",
          title: "One number",
          paragraphs: [
            "The same decision, read as the four steps. Each line is the test for the number.",
          ],
          lines: [
            {
              term: "Ask",
              detail:
                "Will this controller offer more time, inside the agreed policy, before write-off? The person is the controller.",
            },
            {
              term: "Grain",
              detail:
                "One open invoice as of yesterday. Written-off invoices are out. A partial payment, a dispute, and a later write-off belong in that sentence.",
            },
            {
              term: "Truth",
              detail:
                "One person owns the row. A second report stays unpublished until the difference is explained. The grain is one cause. The date, the scope, the status rules, the aggregation, and the calculation are others.",
            },
            {
              term: "Use",
              detail:
                "The controller uses the list to offer time or to refuse it. What happens to the account afterwards is a separate question.",
            },
          ],
          sources: [{ href: DATA_CARD, label: "Data analytics field card" }],
        },
        {
          id: "path-rung",
          title: "The organization",
          paragraphs: [
            "The card names four rungs: Ad hoc, Defined, Managed, and Optimized. I use them as guidance for how much of this practice the organization already keeps. I do not use them to rank a technique by its name. Descriptive, diagnostic, predictive, and prescriptive name the kind of question. A prediction is not the top rung merely because that is what it is called.",
            "Maturity, as I use the word, means the work is owned, repeatable, checked for quality, governed, monitored, used, and able to show its value. Prediction, a number that changes through the day, and self-service are capabilities. The card's words for Optimized are predictive, real-time, and self-service. Those words do not define a mature practice. An organization can have all three and still decide badly, carry more operating cost than the decision needs, or have no one accountable.",
          ],
          lines: [
            {
              term: "Ad hoc",
              detail:
                "The card says manual, inconsistent, and low trust. People do the work by hand, and not in the same way twice.",
            },
            {
              term: "Defined",
              detail:
                "The card says standards and basic governance. There is a written standard, and someone owns it. The invoice list in this illustration sits here: one owner, and nobody monitoring it yet.",
            },
            {
              term: "Managed",
              detail:
                "The card says automated, monitored, and reconciled. The work runs without someone starting it each time. Someone watches it, and a disagreement gets an explanation.",
            },
            {
              term: "Optimized",
              detail:
                "I add a prediction, a live number, or self-service only when this decision needs them and someone can keep them. I do not add them in order to move up the ladder. A model can be kept where someone already watches the number and can explain a disagreement.",
            },
          ],
          sources: [{ href: DATA_CARD, label: "Data analytics field card" }],
        },
        {
          id: "path-know",
          title: "How I would know",
          paragraphs: [
            "A decision written down before anyone builds shows that the practice was followed. It does not show that anyone used the result, and it does not show that the business got better. If the controller cannot say what one row means, the list does not go out. That checks the number. It is not a business result.",
            "After the list is in use, I separate three questions. I have not collected an answer to any of them, and I set no target. Adoption is whether the controller uses the list for the offer. Operating performance is whether yesterday's list still arrives in time, and whether keeping it still takes only the effort we accepted. Business impact is what happens to the account after an offer, in the period until it is current or written off. That outcome does not, by itself, prove the offer caused it. The customer's circumstances, the terms, and which invoices were selected can all change the result.",
            "Run the product and judge the value decides whether to continue, change, or stop. The decision has to remain necessary, the product has to stay fit for that use, and the cost of keeping it has to stay justified. Missing evidence is an investigation. It does not score a return. Name the decision is where a hypothesis is written so it can be checked. The method for separating the offer's effect from everything else is not on this page.",
          ],
          lines: [
            {
              term: "Adoption",
              detail: "Does the controller use the list when deciding whether to offer time?",
            },
            {
              term: "Operations",
              detail:
                "Does the list still arrive in time for an offer made before write-off, and is the effort to keep it still the one person's time we accepted?",
            },
            {
              term: "Impact",
              detail:
                "After the offer, did the account become current, or was the invoice written off? That is what I would look at. It is not a cause.",
            },
          ],
        },
        {
          id: "path-limits",
          title: "The rest of the book",
          paragraphs: [
            "Choose the work compares the investment: the outcome, a way that is sufficient, the cost of keeping it, and what to defer. Make the number fit to use is Name the decision, Say what one row means, When two reports don't match, and Keep the definition. Choose the stack names the tools. Keep trust in force keeps the number fit to use. Run the product and judge the value is continue, change, or stop.",
            "Calendars, blast radius, and cutover stay on the technology delivery field card. A slow backtest of probability of default or expected credit loss stays on the Bayesian optimisation card.",
          ],
          sources: [
            { href: DATA_CARD, label: "Data analytics field card" },
            { href: DELIVERY_CARD, label: "Technology delivery field card" },
            { href: BAYES_CARD, label: "Bayesian optimisation field card" },
          ],
        },
        {
          id: "path-draft",
          title: "When AI drafts the work",
          paragraphs: [
            "This still holds when a model drafts the page. The draft has to name that decision and its cost.",
          ],
        },
      ],
      sources: [
        source(
          "https://www.gao.gov/assets/ggd-10.1.20.pdf",
          "GAO, An Evaluator's Guide to Assessing Agency Annual Performance Plans, GAO/GGD-10.1.20 (April 1998)",
        ),
        { href: DATA_CARD, label: "Data analytics field card" },
        { href: DELIVERY_CARD, label: "Technology delivery field card" },
        { href: BAYES_CARD, label: "Bayesian optimisation field card" },
      ],
    },
    {
      number: 6,
      topic: "Choose the work",
      title: "Choose the work",
      lede: "The first page named the decision. This page decides whether to build, by comparing the outcome, the simplest way to reach it, the cost of keeping it, and what the organization can actually run.",
      rule: "My operating rule: I start when the outcome is named, a simpler way has been considered, and the people and the ongoing cost are ones the organization can keep. The field card's ladder guides that judgment. It does not classify a technique by its name. If one of those is missing, I write down which one, and I do not start.",
      illustration: "The invoice case is an illustration, not a record.",
      reviewed: "19 Oct 2026",
      ground: {
        src: `${DATA_ART}/path.jpg`,
        alt: "",
      },
      sections: [
        {
          id: "case",
          title: "The comparison",
          paragraphs: [
            "This is the same example as the first page. I have not measured it, and it states no amount. The decision is whether one credit controller offers more time on an open invoice before it is written off. The invoice may be overdue because the customer is on agreed terms, because of a billing error, or because it will not be paid. The card warns against a dashboard with no decision behind it.",
            "The outcome this work could improve is that offer. The controller needs the open invoices together, with written-off accounts left out, in time to tell those three reasons apart.",
            "The live screen is a different outcome.",
            "A live screen for every collector, refreshed through the day, plus a prediction of whom to call, would help choose which customer to call now. I have not measured whether that screen would change the calls. I do not have that result, so I do not use it as a reason to build the screen or as a reason to refuse the list.",
            "The simplest thing that could serve the offer is a list of open invoices as of yesterday, for that one controller. Reading the ledger one invoice at a time does not show them together. A number that changes through the day is not required, because the offer is made before a write-off, not while a customer is on the phone. A simpler list is not automatically the better investment. This decision does not get better from a fresher number, and the organization would still pay to keep that number moving.",
            "The reason to start is that the write-off is already being decided, and the open invoices are not together for the person who can offer time. That is a reason to build the list. It is not evidence that the list will pay for itself.",
            "Keeping the list takes the invoice ledger, the controller's time to refresh yesterday's list, whatever publishes that one list, and the written standard one person already owns. The ongoing cost is that person's time. The live screen would add daily time from people who are not this controller, a watch on a number that moves all day, and the care of a model. On the card, predictive, real-time, and self-service sit on Optimized. I use that as guidance. A model can be kept where someone already watches the number and can explain it. This organization has a written standard and one owner. It is not watching a product. I would not add the model in order to climb the ladder. A calling prediction would be a new case, after this list is in use and the controller can say what followed the offers.",
            "For this case I build the list. I defer the calling prediction. I do not build the live screen.",
            "I would reconsider if the controller stopped using the list. I would also reconsider if yesterday were no longer fresh enough, or if the cost of the list grew into the live system. That reconsideration is Run the product and judge the value. This page names it. It does not make the call.",
          ],
          figure: {
            kind: "flow",
            caption: "The same example. The live screen is a different outcome. The list matches this one. No amount is shown.",
            steps: [
              {
                term: "Not this case",
                detail:
                  "A live screen for every collector, and a prediction of whom to call. The outcome is a different decision. The cost is a number that moves all day. Deferred until the list is in use, or refused for this offer.",
              },
              {
                term: "This case",
                detail:
                  "One list, as of yesterday, for the controller who can offer time. Fresh enough for an offer made before write-off. The cost is that person's time.",
              },
            ],
          },
          sources: [{ href: DATA_CARD, label: "Data analytics field card" }],
        },
        {
          id: "case-sheet",
          title: "The case",
          paragraphs: [
            "The lines are the record of the comparison above. The reasoning stays in that comparison. Before anyone builds, I also write what I would look at later. I have not collected it.",
          ],
          lines: [
            {
              term: "Decision",
              detail: "Will this controller offer more time on one open invoice before it is written off?",
            },
            {
              term: "Actor",
              detail: "The credit controller who can offer that time.",
            },
            {
              term: "Organization",
              detail:
                "A written standard and one owner. On the card, that is Defined. The ladder guides the burden we can keep. It does not ban a model by its name.",
            },
            {
              term: "Need",
              detail: "The open invoices together, as of yesterday. Not a live number for every collector.",
            },
            {
              term: "Scale",
              detail: "One person. Fresh enough for an offer made before write-off, not for choosing a call in the moment.",
            },
            {
              term: "Benefit",
              detail: "The controller can tell why the invoice is overdue before a write-off.",
            },
            {
              term: "Cost",
              detail:
                "That person's time to keep the list. The live screen would add daily time, a moving number, and a model. No currency amount.",
            },
            {
              term: "Alternative",
              detail:
                "Reading the ledger one invoice at a time does not show them together. The live screen answers whom to call, which is a different outcome.",
            },
            {
              term: "What would count",
              detail:
                "The controller uses the list. An offer can be followed to an account that stayed current, or to a write-off. Keeping it is still one person's time. No target. None of this has been collected.",
            },
            {
              term: "Build or stop",
              detail:
                "Build the list. Defer the calling prediction until the list is in use. Do not build the live screen for this decision.",
            },
          ],
        },
        {
          id: "case-know",
          title: "How I would know",
          paragraphs: [
            "I ask two different questions. One is whether the case was written properly on the day. The other is whether the decision got better later. I have no target times, and I have not collected a result for either.",
          ],
          lines: [
            {
              term: "On the day",
              detail:
                "The outcome, the simpler way, the cost of keeping it, and what we defer or reject are written down. If one is missing, the written reason says which. Starting with none of that is the failure. This checks the practice.",
            },
            {
              term: "Later",
              detail:
                "What would count, on the lines above, is how I would tell whether the decision got better. If the controller stops using the list, if yesterday is no longer fresh enough, or if the cost grows into the screen we refused, that is a reason to reconsider. This page does not report that any of it has happened.",
            },
          ],
        },
        {
          id: "case-limits",
          title: "Where I do not use it",
          paragraphs: [
            "This page only decides whether to start. After that, Name the decision fills in the brief.",
            "Choose the stack names the tools. Run the product and judge the value later decides whether to continue, change, or stop.",
            "The calendar, the blast radius, and the cutover stay on the technology delivery field card. A slow backtest of probability of default or expected credit loss stays on the Bayesian optimisation card.",
          ],
          sources: [
            { href: DATA_CARD, label: "Data analytics field card" },
            { href: DELIVERY_CARD, label: "Technology delivery field card" },
            { href: BAYES_CARD, label: "Bayesian optimisation field card" },
          ],
        },
        {
          id: "case-draft",
          title: "When AI drafts the case",
          paragraphs: [
            "This still holds when a model drafts the case. The controller has to accept the cost of the offer: refusing time to a customer on agreed terms, or offering time on a debt that will not be paid. A draft that names a tool, treats the top rung as the aim, and skips the outcome or the cost of keeping the work, is not a decision to build.",
          ],
        },
      ],
      sources: [
        { href: DATA_CARD, label: "Data analytics field card" },
        { href: DELIVERY_CARD, label: "Technology delivery field card" },
        { href: BAYES_CARD, label: "Bayesian optimisation field card" },
      ],
    },
    {
      number: 2,
      topic: "Make the number fit",
      title: "Name the decision",
      lede: "The previous chapter established which problem is worth solving. This chapter explains what a metric must establish before it can support a decision. A chart you are still exploring can go out before the brief is filled. A number offered as the answer cannot. A report title is not the decision.",
      rule: "My operating rule: when a number is offered as the answer, I name the decision, the outcome, the person the number is for, the constraint, and the one activity. A rise and a fall are hypotheses to check. They are not orders, and they are not causes. I do not present the number as that answer until those are named.",
      illustration: "The invoice case is an illustration, not a record.",
      reviewed: "20 Oct 2026",
      sections: [
        {
          id: "brief",
          title: "The brief",
          paragraphs: [
            "The previous chapter chose the list. This sheet is filled for the controller's offer of more time. A call list would be a second brief. The figures are an illustration, not a measured result.",
          ],
          figure: {
            kind: "sheet",
            caption: "",
            steps: [
              {
                term: "Decision",
                detail: "Whether this credit controller offers more time before write-off.",
              },
              {
                term: "Outcome",
                detail: "The offer is made in time. Later: current, or written off.",
              },
              {
                term: "Owner",
                detail: "The credit controller who uses the number. Not a mailing list, and not the definition owner.",
              },
              {
                term: "Constraint",
                detail: "The agreed policy sets the cutoff. If there is no limit, write that. A blank line is not the same as no limit. The list does not replace the controller.",
              },
              {
                term: "If it rises",
                detail: "More issues that month, slower payment within 30 days, or a changed count.",
              },
              {
                term: "If it falls",
                detail: "Fewer issues that month, faster payment within 30 days, or a changed count.",
              },
              {
                term: "Activity",
                detail: "Invoices issued, counted 30 days after issue.",
              },
              {
                term: "Status",
                detail: "Filled for this decision. These figures are not evidence to change the offer.",
                gate: true,
              },
            ],
          },
        },
        {
          id: "why-lines",
          title: "Why the lines are separate",
          paragraphs: [
            "Kimball's four-step design puts the business first. Before the model is drawn, the team sits with the people who use the numbers and learns their goals, the problems, how decisions get made, the analysis they need, and what the source data can support. The design starts on the business process: a real activity, such as taking an order, handling a claim, or recording every account at month-end. Most fact tables cover one activity. Choosing it is what lets you say what one row means. The people from the business agree the names and the rules. The brief is the sheet for that metric. A report title is not the activity. My rule: if the use needs two processes, they are two numbers.",
            "The GAO guide is about a plan, not a dashboard. A measure has to represent the performance it is supposed to assess, or be clearly related to it. The guide's own example is the average time to process a tax return, set against a goal of more accurate processing. The time can be collected carefully and still be the wrong number. It can be a trustworthy measure of speed, and unfit as the answer to a question about accuracy. Use that link for the outcome. The guide does not set the credit-policy limit, and it does not turn a rise into an order.",
            "The usual failure is the wrong question, the wrong person, or a decision nobody can repeat. If you cannot say what a move in the number would mean for the use you named, the hypothesis is still blank.",
          ],
          sources: [KIMBALL_STEPS, KIMBALL_PROCESS, KIMBALL_PDF, GAO_RESULTS, { href: DATA_CARD, label: "Data analytics field card" }],
        },
        {
          id: "question-figures",
          title: "Count, share, and exposure",
          paragraphs: [
            "These figures are hypothetical. I have not measured them, and they do not establish what happened to any account. The eligible population is the invoices issued in one calendar month. March is one population. April is the next. Each invoice is counted 30 days after its issue date. Overdue means still open and past due on that day, under the agreed policy. The share is that overdue count divided by the invoices issued in that same month. An invoice issued in an earlier month is not in the count. Exposure is the amount still unpaid on those same overdue invoices, on that same day. The rise line on the brief is this comparison. If overdue meant something different in the two months, that question belongs with row-level meaning.",
          ],
          figure: {
            kind: "reading",
            caption:
              "Day 30, that month's issues only: 100 of 500, then 112 of 600. Issues rose 20 percent, so the share fell from 20 percent to 18.7 percent while the count rose 12 percent and exposure rose 40 percent. Hypothetical. The figures do not establish a cause, and the lower share does not show that collections improved.",
            steps: [],
            head: ["Comparison", "March", "April", "Change"],
            rows: [
              { label: "Overdue count", cells: ["100", "112", "+12%"] },
              { label: "Overdue share", cells: ["20%", "18.7%", "fell"] },
              { label: "Unpaid exposure", cells: ["€1.0m", "€1.4m", "+40%"] },
            ],
          },
          closing: [
            "A snapshot of every invoice overdue on one date, divided by that month's issues, is not this share. It includes invoices issued in earlier months.",
            "Next I would ask whether a few invoices account for most of the extra €0.4 million, whether they were past due earlier in the 30 days than the March group, and whether disputed amounts are a larger part of the €1.4 million. The policy cutoff stays where it is. The higher exposure fits a few larger balances, or balances that stayed open longer within the 30 days. I cannot yet conclude slower payment, better or worse collections, or that more time should be refused. The figures do not say which, and they do not say why any one invoice is unpaid.",
          ],
        },
        {
          id: "question-order",
          title: "The order",
          figure: {
            kind: "flow",
            plain: true,
            caption:
              "Exploration and monitoring can stop earlier. A consequential decision needs more evidence.",
            steps: [
              { term: "Intended use", detail: "The use the number is for." },
              { term: "Comparability", detail: "One population, one window." },
              { term: "Interpretation", detail: "What the figures leave open." },
              { term: "Decision within policy", detail: "Inside the constraint." },
              { term: "Outcome evaluation", detail: "What happened afterward." },
            ],
          },
        },
        {
          id: "question-uses",
          title: "Four uses",
          paragraphs: [
            "The checks are questions. I have not collected them, and the hypothetical figures are not these results.",
          ],
          figure: {
            kind: "uses",
            caption: "Fit the brief to the use. Relevance to that use matters more than an action taken today.",
            steps: [],
            head: ["Use", "When it can go out", "What I would check"],
            rows: [
              {
                label: "Exploration",
                cells: ["Before the brief is filled. The work is still looking.", "No action to score."],
              },
              {
                label: "Monitoring",
                cells: [
                  "With a lighter brief. The figure is watched over time.",
                  "It stayed comparable, and someone looked when it moved.",
                ],
              },
              {
                label: "Forecasting",
                cells: ["With a lighter brief. It says what might happen next.", "It stayed tied to that use. No action to score."],
              },
              {
                label: "Consequential decision",
                cells: [
                  "Only when the brief is filled, including a regulated decision. It is offered as the answer.",
                  "Someone who missed the meeting can say the decision, the limit, and the owner. The controller used it under the policy. A blank line keeps the number back.",
                ],
              },
            ],
          },
          closing: [
            "For a consequential decision I would also ask whether the outcome improved compared with what would otherwise have happened. That needs a baseline, a period to watch, and room for other explanations. An improvement afterward does not, by itself, show that the list caused it. I have not collected that comparison.",
            "Row-level meaning, comparisons between reports, and ownership follow. Whether to continue, change, or stop is a later review.",
          ],
        },
      ],
      sources: [
        source(
          "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/four-4-step-design-process/",
          "Kimball Group, Four-Step Dimensional Design Process (read 16 Oct 2026)",
        ),
        source(
          "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/business-process/",
          "Kimball Group, Business Processes (read 16 Oct 2026)",
        ),
        source(
          "https://www.kimballgroup.com/wp-content/uploads/2013/08/2013.09-Kimball-Dimensional-Modeling-Techniques11.pdf",
          "Kimball Group, Dimensional Modeling Techniques PDF (Sep 2013)",
        ),
        source(
          "https://www.gao.gov/assets/ggd-10.1.20.pdf",
          "GAO, An Evaluator's Guide to Assessing Agency Annual Performance Plans, GAO/GGD-10.1.20 (April 1998)",
        ),
        { href: DATA_CARD, label: "Data analytics field card" },
      ],
    },
    {
      number: 3,
      topic: "Make the number fit",
      title: "Say what one row means",
      lede: "The brief is already filled. This page says what one row of that number means, before anyone compares two reports. Kimball calls that the grain: exactly what one record represents, in business words. A report title is not that sentence. A list of columns is not that sentence.",
      rule: "My operating rule: name the thing, the time, what is included, and what is left out, including a partial payment, a dispute, and a write-off. I do not offer the number as the answer until the person who will use it can say that row back.",
      illustration: "The one list is an illustration, not a record.",
      reviewed: "19 Oct 2026",
      sections: [
        {
          id: "row-why",
          title: "Why a column list is not enough",
          paragraphs: [
            "The short path is to name the columns and call that the definition. Kimball says that is the most common mistake in his students' designs. The grain ends up the same thing as the primary key, and it is still a mistake to list the dimensions and treat that list as the declaration. He says to anchor the grain first to a clear business object and a set of business rules. The dimensions that carry it then become obvious.",
            "If the grain is not clearly defined at the start, he says the whole design rests on quicksand. Talk about which dimensions to include goes in circles, and facts that do not belong on that row sneak in. A fact has to be true to the grain. In his doctor-bill example, a row is one line on a bill.",
            "The amount of that line belongs there. The amount billed to that patient for the whole year does not. Add the lines up and that year-to-date figure becomes nonsense. It is dangerous because it looks trustworthy. He says to leave it off the row and calculate the total in the application.",
            "The 2013 techniques note calls the grain declaration a binding contract. It has to be declared before the dimensions and the facts are chosen, because every candidate has to fit it. Different grains must not be mixed in the same fact table. Each grain is its own table.",
          ],
          sources: [KIMBALL_GRAIN, KIMBALL_TECHNIQUES],
        },
        {
          id: "row-rule",
          title: "What I follow",
          paragraphs: [
            "The declaration is Kimball's. He also says to start with the most detailed row the activity captures, because that row can answer questions you did not plan. A summary assumes the questions people already share. A summary can be useful. It is a different row.",
            "The analytics field card names the failure this page is about: mismatched grain, inconsistent definitions, or incomplete scope. I read a mismatched grain as two meanings of a row treated as one. I read an inconsistent definition as a sentence two people would not say the same way. I read an incomplete scope as a missing line for what is included, or for what is left out.",
            "The operating rule at the top of this page is the stop. A design meeting can list the columns and still leave the row unsaid. The decision can be named, and the row can still be blank.",
            "The opening page left three rules for this sentence. Say how a partial payment is treated. Say whether an open dispute stays on the row. A write-off after the snapshot is not this row. A blank on any of those is an incomplete scope.",
            "A rise is not read until this sentence is the same in both periods. If overdue means something new, or the invoices included have changed, or recent payments are missing, the count is not the same count.",
          ],
          sources: [KIMBALL_GRAIN, KIMBALL_TECHNIQUES, { href: DATA_CARD, label: "Data analytics field card" }],
        },
        {
          id: "row-sheet",
          title: "The row",
          paragraphs: [
            "This is the sheet I fill in after Name the decision, and before I compare two reports. A blank line means the number does not go out. The declaration is Kimball's. The stop, when the person who will use the number cannot say the row back, is my rule. Two reports that disagree are handled on When two reports don't match, not here.",
          ],
          lines: [
            {
              term: "Thing",
              detail:
                "What one row is, in business words. An invoice, an account, a customer, or a line on a bill. A report title does not finish the line.",
            },
            {
              term: "Time",
              detail:
                "When the row is counted. As of a day, or at month-end. The word current, with no moment named, does not finish the line.",
            },
            {
              term: "In",
              detail:
                "What is included. For this list, open invoices, a partial payment for the amount still unpaid, and an invoice with an open dispute. The dispute stays visible, because the controller needs it to tell a billing error from the other cases.",
            },
            {
              term: "Out",
              detail:
                "What is left out. Invoices already written off. A write-off after yesterday is not in this snapshot. If nothing is left out, write that. A blank line is not the same as everything.",
            },
            {
              term: "Say it back",
              detail:
                "Filled when the person who will use the number can say the four lines above without the sheet in front of them. Otherwise the number does not go out.",
            },
            {
              term: "One sentence",
              detail:
                "The four lines in one sentence. Kimball calls this the grain. Later pages copy this sentence. They do not write a new one.",
            },
          ],
          sources: [KIMBALL_GRAIN, KIMBALL_TECHNIQUES],
        },
        {
          id: "row-scene",
          title: "An example",
          paragraphs: [
            "This is an illustration. I have not measured it, and it states no amount.",
            "The decision, from the brief, is whether the controller offers more time on an open invoice before write-off. The list is titled overdue balance. The title is not the row.",
            "While any of those four lines is blank, the list stays dark.",
            "Once the sheet is filled, a row is one open invoice as of yesterday. A partial payment stays, for the amount still unpaid. An open dispute stays, so the controller can see it. Invoices already written off are left out. A write-off after yesterday is a later row, not this one. The controller can say that sentence back. That sentence is what one row means. There is no second report on this page.",
            "If a second list with the same title arrives, and a row on it is a customer at month-end, that disagreement is When two reports don't match. This page does not pick a number between them.",
          ],
        },
        {
          id: "row-know",
          title: "How I would know",
          paragraphs: [
            "I would look at four things. I have not collected them, and I set no target. A column list offered as the definition is not the practice.",
          ],
          lines: [
            {
              term: "Unstated",
              detail: "Did a number go out whose user cannot say what one row is, including a partial payment, a dispute, and a write-off?",
            },
            {
              term: "Columns",
              detail: "Is the definition only the names of the columns?",
            },
            {
              term: "Mixed",
              detail:
                "Does a published total add a fact the row does not support? A year-to-date amount on a single invoice line is that shape. I am defining the signal. I am not reporting a case.",
            },
            {
              term: "Parked",
              detail:
                "Did the number stay unpublished because the thing, the time, what is included, or what is left out was blank?",
            },
          ],
        },
        {
          id: "row-limits",
          title: "Where I do not use it",
          paragraphs: [
            "Kimball says to start with the most detailed row the activity captures, because it can answer questions you did not plan. A summary assumes the questions people already share. A customer total is a different row, and it gets its own table. I do not treat it as the invoice.",
            "A search that is not being offered as the answer can look at the rows before this sentence is written. This page stops the number that is being given to someone as the answer.",
            "Calendars, blast radius, and cutover stay on the technology delivery field card. A slow backtest of probability of default or expected credit loss stays on the Bayesian optimisation card.",
          ],
          sources: [
            KIMBALL_TECHNIQUES,
            { href: DELIVERY_CARD, label: "Technology delivery field card" },
            { href: BAYES_CARD, label: "Bayesian optimisation field card" },
          ],
        },
      ],
      sources: [
        source(
          "https://www.kimballgroup.com/2003/03/declaring-the-grain/",
          "Ralph Kimball, Declaring the Grain (1 Mar 2003, read 17 Oct 2026)",
        ),
        source(
          "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/grain/",
          "Kimball Group, Grain (read 17 Oct 2026)",
        ),
        { href: DATA_CARD, label: "Data analytics field card" },
        { href: DELIVERY_CARD, label: "Technology delivery field card" },
        { href: BAYES_CARD, label: "Bayesian optimisation field card" },
      ],
    },
    {
      number: 4,
      topic: "Make the number fit",
      title: "When two reports don't match",
      lede: "The row sentence is already written. This page is what I do when a second report disagrees with it. The two reports can share a title and still not match. Sending one of them out, or a third number in between, before the difference has a cause, gives the controller a figure they cannot defend.",
      rule: "My operating rule: compare the second report to the row sentence, name the cause or do not publish, and do not publish a number between the two. The cause can be the grain, the date, the scope, the status rules, how the rows are added, or how the amount is calculated.",
      illustration: "The two extracts are an illustration, not a record.",
      reviewed: "19 Oct 2026",
      sections: [
        {
          id: "disagreement",
          title: "Why the middle number gets published",
          paragraphs: [
            "The decision needs a number today. Two systems already show it, and the two figures differ. The short path is to read out the figure someone recognizes, or to place a third figure between them so the meeting has one number. That third figure becomes the baseline the next report is judged against. The difference goes out under a published name, and it is still unexplained.",
            "The row sentence is already written. Kimball calls that the grain, and a fact has to be true to it. Different grains are different tables. Grain is one cause of a disagreement.",
            "The date, what is included, the status rules, how the rows are added, and how the amount is calculated are other causes. A missing record is a cause. A record that is wrong is a cause. If the second report will not sit on the named row, it is a different measure. A number placed between the two reports is not that row.",
          ],
          picture: {
            src: `${DATA_ART}/gate.jpg`,
            alt: "Two reports meet a shut gate. Nothing is published on the far side.",
          },
          sources: [KIMBALL_GRAIN, KIMBALL_TECHNIQUES],
        },
        {
          id: "practice",
          title: "What I follow",
          paragraphs: [
            "The control is the Green Book, the GAO's standards for internal control, May 2025. A reconciliation there means taking transactions from two sets of records and comparing them. You work out which were recorded properly, which are not recorded yet, and which were recorded wrong and need a correction, and you explain the differences. The two sets can both be inside the organization, or one can be outside, as when you reconcile to the bank. Paragraph 10.04 includes comparing different sets of data so management can see the relationship and act, and comparing file totals with control accounts. Paragraph 16.05 includes comparisons and reconciliations in ongoing monitoring.",
            "Paragraph 10.10 says a detective control finds an unintended result and corrects it, and that the control is useful only if the correction is timely. I use that as the reason the explanation happens before the number goes out. The standard does not describe a dashboard. The block is my rule.",
            "The tool that can stop the next build is narrower. It is dbt, the tool that builds the tables. A test returns the rows it was written to catch. Unless you set it otherwise, any rows mean an error. On the build command I checked, a test that fails skips the models that come after it. Set the test to warn, and the later models still run. A uniqueness test can pass on both reports while the reports still disagree. The test is how a check I have already named can stop the next model. The reconciliation is the comparison of the two reports.",
            "The operating rule at the top of this page is that stop. The owner of the definition approves the grain. A green pipeline is not that approval. The analytics field card draws the same stop. Its picture of 4.8%, 6.2%, and 5.1% is a picture of a disagreement, not a result.",
            "The published figure in that picture is one explained grain. It is not the middle of the two reports.",
          ],
          sources: [
            GAO_RECONCILE,
            DBT_BUILD,
            DBT_SEVERITY,
            { href: DATA_CARD, label: "Data analytics field card" },
          ],
        },
        {
          id: "record",
          title: "The record",
          paragraphs: [
            "This is the sheet I fill in when a number is about to go out as an answer and two reports disagree. A blank field stops it. What one row means is the sentence from Say what one row means. The comparison and the explanation are the Green Book's reconciliation. When a named check should stop the build, I set that dbt test to error so the later model is skipped. Warn lets it run, so I do not use warn for this stop. The block, when the cause cannot be named, is my rule. A tolerance counts only when the owner wrote it down before the comparison.",
          ],
          lines: [
            {
              term: "One row",
              detail:
                "The sentence from Say what one row means: the thing, the time, what is included, and what is left out. If that sentence is blank, stop and fill that page. This field is filled when the sentence is here, and the person who will use the number can still say it back.",
            },
            {
              term: "Other report",
              detail:
                "The second report, brought to that same grain. If it will not sit there, set it aside as a different measure. Different grains are different tables. The field is filled when the second report matches the declared grain, or it has been set aside.",
            },
            {
              term: "Differences",
              detail:
                "Each difference between the two sets of records: recorded properly, not yet recorded, or recorded wrong. It sits inside a tolerance the owner wrote down before the comparison, or it is on the list. A blank list with a gap you can see is not filled.",
            },
            {
              term: "Cause",
              detail:
                "For each difference: the grain, the date, the scope, the status rules, how the rows are added, how the amount is calculated, a missing record, or a record that is wrong. The explanation is part of the reconciliation. A difference with no cause is the one that blocks the number.",
            },
            {
              term: "What we do",
              detail:
                "The cause is fixed, or the owner accepts it in writing against the declared grain. A number placed between the two reports is not a fix. A fact the grain does not support invites the reader to trust it. One grain is the candidate. The other report is explained, or it is out.",
            },
            {
              term: "Send or stop",
              detail:
                "If a cause cannot be named, do not publish. The previous figure stays, or the measure stays dark. When the check that encodes this gate is a dbt test, set it to error so the later model is skipped. Warn lets that model run, so I do not use warn here. The number that goes out carries the one approved grain, or it does not go out.",
            },
          ],
          picture: {
            src: `${DATA_ART}/day.jpg`,
            alt: "A grain, the two statements brought together, the crack between them, then one lit sheet or a stopped one.",
          },
          sources: [KIMBALL_GRAIN, KIMBALL_TECHNIQUES, GAO_RECONCILE, DBT_BUILD, DBT_SEVERITY],
        },
        {
          id: "illustration",
          title: "An example",
          paragraphs: [
            "This is an illustration. I have not measured it, and it states no amount.",
            "The brief is whether the controller offers more time before write-off. The row sentence is one open invoice as of yesterday. A partial payment and an open dispute stay on that row. Invoices already written off are left out. A second list then arrives with the same title. On that list, a row is one customer at month-end. While the cause is blank, both lists stay dark. A figure placed between the two totals would be true to neither row.",
            "The customer list will not sit on the invoice row. The grain is different, the date is different, and adding invoices up to a customer is a different total. Any one of those is enough to set the second list aside. The owner accepts the invoice row in writing. That row goes out. The other list stays dark. Nothing is placed between them. The controller can use the invoice row for the offer.",
          ],
          picture: {
            src: `${DATA_ART}/extracts.jpg`,
            alt: "An illustration. One ledger and a scatter of slips. No amount.",
          },
        },
        {
          id: "know",
          title: "How I would know",
          paragraphs: [
            "I would look at four things. I have not collected them, and I set no target. A green build that leaves two meanings of the same measure in use is not the practice.",
          ],
          lines: [
            {
              term: "Open",
              detail:
                "Did a measure go out while a second report still differs, and the difference is not yet named?",
            },
            {
              term: "Time open",
              detail:
                "How long did the difference sit before it was explained or the number was blocked? I set no target for that wait.",
            },
            {
              term: "Blocked",
              detail: "Did the gate stop a number that would otherwise have gone out?",
            },
            {
              term: "Owned",
              detail: "Does the row sentence have a named owner who accepted it in writing?",
            },
          ],
          picture: {
            src: `${DATA_ART}/signals.jpg`,
            alt: "A broken piece, a clock, a closed shutter, and a blank seal. Definitions, not results.",
          },
        },
        {
          id: "elsewhere",
          title: "Where I do not use it",
          paragraphs: [
            "A search that is not being offered as the answer can hold two versions. This page blocks the number that is being given to someone as the answer.",
            "The Green Book's reconciliation compares two sets of records. One report, with no second set, is a different check. A uniqueness test on that one report can still be an error that skips the next model. That is the dbt check on a single report.",
            "A summary and the detailed rows it came from are two grains. Say what one row means keeps them in separate tables. This page does not fold them into one cell so a chart has a single figure.",
            "The calendar, the blast radius, and the cutover stay on the technology delivery field card. A slow backtest of probability of default or expected credit loss stays on the Bayesian optimisation card. This page stops the number.",
            "The Green Book ties a detective control to a correction that happens in time. I place that correction before the number is published. A comparison that starts after someone has already acted on the number is a review of a figure that already went out.",
            "This page stops a number whose two reports disagree. Keeping that meaning in force after it goes out is Keep the definition.",
          ],
          sources: [KIMBALL_GRAIN, GAO_RECONCILE, DBT_BUILD],
        },
      ],
      sources: [
        source(
          "https://www.kimballgroup.com/2003/03/declaring-the-grain/",
          "Ralph Kimball, Declaring the Grain (1 Mar 2003)",
        ),
        source(
          "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/grain/",
          "Kimball Group, Grain, Dimensional Modeling Techniques (Sep 2013)",
        ),
        source(
          "https://www.kimballgroup.com/wp-content/uploads/2013/08/2013.09-Kimball-Dimensional-Modeling-Techniques11.pdf",
          "Kimball Group, Dimensional Modeling Techniques PDF (Sep 2013)",
        ),
        source(
          "https://www.gao.gov/assets/gao-25-107721.pdf",
          "GAO, Standards for Internal Control in the Federal Government, GAO-25-107721 (May 2025)",
        ),
        source(
          "https://docs.getdbt.com/reference/commands/build",
          "dbt Developer Hub, dbt build, skipping on failures (read 16 Oct 2026)",
        ),
        source(
          "https://docs.getdbt.com/reference/resource-configs/severity",
          "dbt Developer Hub, test severity (read 16 Oct 2026)",
        ),
        { href: DATA_CARD, label: "Data analytics field card" },
        { href: DELIVERY_CARD, label: "Technology delivery field card" },
        { href: BAYES_CARD, label: "Bayesian optimisation field card" },
      ],
    },
    {
      number: 5,
      topic: "Make the number fit",
      title: "Keep the definition",
      lede: "The brief, the row, and the comparison can be filled, and the next query can still change what the number means. This page is what I leave in place: who owns the definition, the columns the number promises, and the stop when those columns break.",
      rule: "My operating rule: name the owner of the published definition, check its columns before the next build, and stop the old number when those columns break. A green contract is not the row sentence.",
      illustration: "The three sheets are an illustration, not a record.",
      reviewed: "19 Oct 2026",
      sections: [
        {
          id: "keep",
          title: "What I leave in place",
          paragraphs: [
            "This is the sheet I leave after Name the decision and When two reports don't match are filled. A blank field means the number is not being kept. The columns are dbt's model contract: the list of columns the published table promises, each with a name and a data type. dbt is the tool that builds the tables. When that list breaks, the build raises a contract error, and that error is the stop. The owner is my rule, and it is the approval the analytics field card requires. A change to the sentence of what one row means goes back to Say what one row means. A second report that will not sit on that row goes back to When two reports don't match.",
          ],
          lines: [
            {
              term: "Owner",
              detail:
                "The role that approves a change to the published definition. One person, or one role. A mailing list is not the owner. The field is filled when that role can say what one row means. Otherwise the number is not being kept.",
            },
            {
              term: "Columns",
              detail:
                "Every column the number promises, by name and data type, with the contract turned on. The build checks that the query returns that shape. If it does not, the table does not build. What one row means stays on the other sheet. This field is the columns.",
            },
            {
              term: "Break",
              detail:
                "A removed column, a changed data type, or a removed or changed constraint on a column the number already promised. That is a breaking change, and the build raises a contract error. The old number stops. Adding a column is not a break.",
            },
            {
              term: "Version",
              detail:
                "When other people or systems depend on the table, the breaking change is a new version, and the previous version stays for a while so they can move. When nothing outside this team depends on it, the break can land at once. The field is filled when one of those two is named.",
            },
            {
              term: "Reopen",
              detail:
                "A change to the sentence of what one row means goes back to Say what one row means. A second report that will not sit on that row, with the column names and types left alone, goes back to When two reports don't match. A change to the decision goes back to Name the decision. A green contract does not close any of those.",
            },
          ],
          sources: [DBT_CONTRACT, DBT_VERSIONS, { href: DATA_CARD, label: "Data analytics field card" }],
        },
        {
          id: "shape",
          title: "What the columns do not catch",
          paragraphs: [
            "dbt's contract is a promise about the shape of a table that other people and processes query. When it is turned on, the build checks that the query returns every promised column, with the promised data type. The check does not care about column order. dbt recommends a contract for a public table that reports and other systems rely on. A data test is a different check. It runs on the rows after the table has built, and it can be set to warn. The contract fails the build when the shape does not match. I do not use a warning as a substitute for that failure.",
            "A breaking change, in that contract, is removing a column, changing its data type, removing or changing a constraint on it, or removing the contracted table. dbt then shows a contract error. Versions are how the person who owns a table that other teams use can introduce that break: a new version, the latest pointer moved, and a window in which the old version can still be used. dbt says making every consumer take the break at once is reasonable while the table is still changing quickly, or when the group that depends on it is small. Versions do not remove the cost of keeping two shapes. They put a limit on it.",
            "The contract does not know the grain. Kimball's declaration is what one row means, in business words. A query can keep every column name and type and still change which rows are included. dbt says fixing a bug in how a column is calculated is not a breaking change, and it does not need a new version. That fix can still change the definition. When it does, I send it back to Say what one row means. If a second report then disagrees, that comparison is When two reports don't match. A green contract is not that sheet.",
            "The Green Book includes comparisons and reconciliations in ongoing monitoring, and it ties a detective control to a correction that happens in time. I use that as the reason a break stops the next number, rather than waiting for someone to notice that the figure changed. The standard does not describe a model contract. The stop on a broken shape is the contract's. The owner is my rule.",
          ],
          sources: [DBT_CONTRACT, DBT_VERSIONS, KIMBALL_GRAIN, GAO_RECONCILE],
        },
        {
          id: "keep-scene",
          title: "An example",
          paragraphs: [
            "This is an illustration. I have not measured it, and it states no amount.",
            "The number is the invoice row from the filled comparison: one open invoice as of yesterday, with a partial payment and an open dispute still on the row, and invoices already written off left out. The owner is the role that approved that sentence. The contract includes the column that marks written-off invoices. The decision is still the offer of time.",
            "A change removes that column. The shape breaks. The build stops. The lit sheet is the number that was kept. The cracked sheet is the shape that no longer matches.",
            "The sheet in the tray is the next version. It is not the number until the owner accepts it.",
            "A second change leaves every column name and type in place, and starts treating written-off invoices as included. The contract can stay green. That change goes back to When two reports don't match. This page does not pick a number between the two meanings. If the meeting changes the decision from the offer of time to a call list, that change goes back to the brief.",
          ],
          picture: {
            src: `${DATA_ART}/keep.jpg`,
            alt: "An illustration. One lit sheet, a cracked sheet, and a sheet waiting in a tray. No amount.",
          },
        },
        {
          id: "keep-know",
          title: "How I would know",
          paragraphs: [
            "I would look at four things. I have not collected them, and I set no target. A green contract that hides a changed row is not the practice.",
          ],
          lines: [
            {
              term: "Unowned",
              detail: "Did a measure go out whose definition has no named owner?",
            },
            {
              term: "Shape break",
              detail: "Did a build stop because a promised column was removed, or its type changed?",
            },
            {
              term: "Quiet change",
              detail:
                "Did the contract stay green while what the row includes changed, and the comparison was not reopened?",
            },
            {
              term: "Kept version",
              detail:
                "When a breaking change lands for people who depend on the table, does the previous version stay while they move?",
            },
          ],
        },
        {
          id: "keep-limits",
          title: "Where I do not use it",
          paragraphs: [
            "A table that is still changing, and a search that is not being offered as an answer, do not get a contract. dbt says turning this on while tables are still changing makes later changes harder.",
            "Comparing two reports stays on When two reports don't match.",
            "This page does not publish a midpoint.",
            "The decision, the person who will act, and the moves stay on Name the decision.",
            "A contract does not apply to a seed, a snapshot, a source, or a Python model. A data test can still run on those.",
            "Adding a column is not a breaking change. I do not open a new version for it.",
            "The calendar, the blast radius, and the cutover stay on the technology delivery field card. A slow backtest of probability of default or expected credit loss stays on the Bayesian optimisation card.",
          ],
          sources: [
            DBT_CONTRACT,
            DBT_VERSIONS,
            { href: DELIVERY_CARD, label: "Technology delivery field card" },
            { href: BAYES_CARD, label: "Bayesian optimisation field card" },
          ],
        },
        {
          id: "keep-draft",
          title: "When AI drafts the number",
          paragraphs: [
            "This still holds when a model drafts the page. The controller has to be able to say the decision, the row, and the cause of a disagreement. A generated explanation is not that cause until they accept it. A green contract in the draft is not the row sentence.",
          ],
        },
      ],
      sources: [
        source(
          "https://docs.getdbt.com/docs/collaborate/govern/model-contracts",
          "dbt Developer Hub, model contracts (read 16 Oct 2026)",
        ),
        source(
          "https://docs.getdbt.com/docs/mesh/govern/model-versions",
          "dbt Developer Hub, model versions (read 16 Oct 2026)",
        ),
        source(
          "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/grain/",
          "Kimball Group, Grain (read 16 Oct 2026)",
        ),
        source(
          "https://www.gao.gov/assets/gao-25-107721.pdf",
          "GAO, Standards for Internal Control in the Federal Government, GAO-25-107721 (May 2025)",
        ),
        { href: DATA_CARD, label: "Data analytics field card" },
        { href: DELIVERY_CARD, label: "Technology delivery field card" },
        { href: BAYES_CARD, label: "Bayesian optimisation field card" },
      ],
    },
    {
      number: 7,
      topic: "Choose the stack",
      title: "Choose the stack",
      lede: "The previous chapters established the business decision, the workload, the definition of one row, and who owns that definition. This chapter decides which architecture should deliver the result.",
      rule: "My operating rule: I name the workload before I name a tool. A choice is unfinished until the alternatives, and the reasons they lost, are written down. The simplest design is the least complex one that meets the requirements in front of me.",
      illustration: "The three architectures are hypothetical. They are not a record of delivered work.",
      reviewed: "21 Oct 2026",
      ground: {
        src: `${DATA_ART}/path.jpg`,
        alt: "",
      },
      sections: [
        {
          id: "stack",
          title: "The workload",
          paragraphs: [
            "The sheet is the workload specification. I fill it before I name a tool. Users and freshness are already known for this offer: one credit controller, and open invoices as of yesterday. The remaining lines are performance, reliability, failure, security, privacy, budget, platforms, the team's skills, and the owners. A blank line is a guess. A larger volume stays an assumption until this decision needs it.",
          ],
          figure: {
            kind: "sheet",
            caption: "Fill every line before naming a tool. A blank line is a guess. A larger volume stays an assumption.",
            steps: [
              { term: "Users", detail: "Who decides, and who else reads or receives the result." },
              { term: "Volume", detail: "Sources, how much data, how it grows, and how tangled it is." },
              { term: "Freshness", detail: "How new the result must be, and how often it is produced." },
              { term: "Performance", detail: "How fast a refresh or a read must finish for the decision." },
              { term: "Reliability", detail: "How soon a failed run or a wrong result must be restored." },
              { term: "Failure", detail: "What the business does if the list is late, wrong, or missing, and who can see that failure." },
              { term: "Security", detail: "Who may see the list, who may change it, and how sensitive customer data is protected." },
              { term: "Privacy", detail: "Which rule limits that data, and what must stay off a shared copy." },
              { term: "Budget", detail: "What the organization will keep paying to run the design." },
              { term: "Platforms", detail: "What is already running, and what can be reused." },
              { term: "Team", detail: "The skills and the time to build the design and to operate it." },
              { term: "Owners", detail: "The technical owner and the business owner." },
            ],
          },
        },
        {
          id: "patterns",
          title: "Three patterns",
          paragraphs: [
            "The three patterns are alternatives. A larger volume does not select the next one. The card's maturity rungs guide how much practice the organization can keep. A pattern is not a rung.",
            "A personal or exploratory analysis fits when one person can produce, rerun, and check the list, and the credit controller can come back to that person. This book's illustration is that pattern. A second user does not, by itself, require a shared platform. Share one definition when several people must act on the same meaning and their copies would diverge, or when the list must appear without the person who built it.",
            "Shared, governed analytics is that arrangement: one validated list on a known rhythm, an owner, and a freshness check. A missed scheduled run does not, by itself, justify a production data product. That product is justified when an application, or the collections workflow, must receive the list and a failure changes that work the same day. It then needs an integration, a stated availability, a recovery path, and a person who acts on the failure. Anything further needs a requirement this pattern still misses.",
            "The figure is one business question under three hypothetical architectures: whether this credit controller offers an open invoice more time before write-off. Nothing here was measured or deployed, and no amount is stated. This book uses the individual design because the requirement is smaller, not because it costs less to start.",
          ],
          figure: {
            kind: "compare",
            caption:
              "One business question, three architectures. All three are hypothetical. The question is whether this credit controller offers an open invoice more time before write-off. Nothing here was measured or deployed, and no cost is stated.",
            steps: [],
            columns: [
              {
                term: "Individual analysis",
                detail: "Hypothetical: one person refreshes yesterday's list for this credit controller.",
                points: [
                  "Selected: the invoice ledger, an in-process query, a column contract, and one report",
                  "A shared warehouse, a scheduler, and an API are refused, because this design does not use them",
                  "A second user does not, by itself, change this choice",
                ],
              },
              {
                term: "Shared daily workflow",
                detail: "Hypothetical: several people must act on one validated list before the day starts.",
                points: [
                  "Selected: shared storage, a tested transform, the row sentence, one report, and a visible failure",
                  "A live screen and a feed into the collections workflow are refused, because no system is waiting",
                  "A missed scheduled run does not, by itself, require an operational service",
                ],
              },
              {
                term: "Operational service",
                detail: "Hypothetical: the collections workflow must receive the list, and a failure changes that day's work.",
                points: [
                  "Selected: the shared list, an integration, a stated availability, a retry, and a person on failure",
                  "The daily report is refused as the delivery path, because the workflow does not read that report",
                  "Further machinery needs a requirement this design still misses",
                ],
              },
            ],
          },
          sources: [{ href: DATA_CARD, label: "Data analytics field card" }],
        },
        {
          id: "responsibilities",
          title: "The responsibilities",
          paragraphs: [
            "One platform can carry several of these. I keep it when it answers the question on the row. A dedicated component is for a row it misses.",
          ],
          figure: {
            kind: "uses",
            caption: "",
            steps: [],
            head: ["Responsibility", "Question to answer", "When a dedicated component is justified"],
            rows: [
              {
                label: "Sources and ingestion",
                cells: ["Does the data arrive on time?", "When the platform misses that arrival."],
              },
              {
                label: "Storage and compute",
                cells: ["Does the query finish in time?", "When the platform misses a query that finishes in time."],
              },
              {
                label: "Transformation",
                cells: ["Is the result transformed?", "When the platform does not transform the result."],
              },
              {
                label: "Business definitions",
                cells: [
                  "Is there one definition across the reports?",
                  "When that definition would diverge. A semantic model can drift from the row sentence on Say what one row means.",
                ],
              },
              {
                label: "Consumption",
                cells: ["Who reads or receives the result?", "When a system must receive the result."],
              },
              {
                label: "Orchestration",
                cells: [
                  "Can a person meet the freshness?",
                  "When a person cannot, or the steps need an order, a retry, and a record. A schedule, or a miss the same person can repair, does not by itself require it. An orchestrator is another system to operate.",
                ],
              },
              {
                label: "Quality and lineage",
                cells: [
                  "Can a failure be seen, and where did the number come from?",
                  "A quality tool, when it catches a failure the platform misses. A second lineage catalogue, when the platform's own path does not show where the number came from.",
                ],
              },
              {
                label: "Security and operations",
                cells: [
                  "Is access limited as the sheet requires, and can a failure be restored?",
                  "When access is not limited as the sheet requires, or a failure cannot be restored.",
                ],
              },
            ],
          },
          closing: [
            "The field card maps example tools onto the lanes. I add a tool only for a line the sheet names. On the individual design, DuckDB is the in-process analytical database and dbt is the column contract. The limit of that contract stays on Keep the definition. Spark 4.2.0 processes at large scale and also runs on one machine, so volume alone does not select it. Airflow runs the path when it is triggered or on a schedule, and a schedule is not required. A scheduler does not define the number.",
          ],
          sources: [DUCKDB_HOME, SPARK_OVERVIEW, AIRFLOW_RUN, DBT_CONTRACT, { href: DATA_CARD, label: "Data analytics field card" }],
        },
        {
          id: "compare",
          title: "Cost, build, and buy",
          paragraphs: [
            "I compare two or three designs that could meet this specification. Reuse, a managed service, a commercial product, and a build the team would own all count when they are available. For each design I look at fit and performance; license, compute, engineering, and maintenance; complexity, reliability, and recovery; security, governance, and regulation; and skills, integrations, and the cost of leaving the vendor.",
            "The lowest cost to start is not the best choice over the life of the design. A cheap extract can cost more once other people depend on it, or once the cost of leaving the vendor exceeds the cost of staying. For a managed service I use that provider's split. On Amazon Web Services, for an abstracted service such as S3, AWS operates the infrastructure, and the customer manages the data, including encryption options, classifies the assets, and sets who may use them. I do not copy that split onto another provider.",
          ],
          sources: [AWS_SHARED],
        },
        {
          id: "operate",
          title: "What has to be run",
          paragraphs: [
            "The controls follow the consequence of failure. Name a technical owner and a business owner. Access controls say who may see the list and who may change it, and they protect sensitive customer data on the invoice. A failure has to be visible: a quality check, a freshness check, and an alert a person can act on. Recovery is proportionate to that consequence. An occasional list needs a rerun and a note of the extract. A list that another system depends on needs a retry, a way back to the previous result, and steps a second person can follow. Keep trust in force uses the freshness named here. Calendars, blast radius, and cutover stay on the technology delivery field card.",
          ],
          sources: [{ href: DELIVERY_CARD, label: "Technology delivery field card" }],
        },
        {
          id: "record",
          title: "The decision record",
          paragraphs: [
            "The record lets a later reader see why this architecture was chosen, what was refused, and what would reopen the choice. Nygard, on 15 November 2011, gives the shape: context, decision, a status of proposed, accepted, or superseded, and consequences, including those that are not benefits. A superseded record stays and points at its replacement. I reopen the record when that context changes.",
            "Completing the sheet does not prove that a system works. The record stays proposed until that evidence exists. A new tool does not, by itself, reopen the choice.",
          ],
          figure: {
            kind: "sheet",
            caption: "",
            steps: [
              { term: "Workload", detail: "The specification and the constraints, including failure, security, and what the team can keep." },
              { term: "Selected", detail: "The pattern, each significant component, and the requirement it meets." },
              { term: "Rejected", detail: "Each alternative and why it lost. Include reuse, a managed service, or a purchase when it was available." },
              { term: "Assumptions", detail: "What was taken as true, the risks, and the limits. A future volume goes here." },
              { term: "Operating", detail: "The expected cost to run, the technical owner, and the business owner." },
              { term: "Evidence", detail: "What must be shown before this is called production." },
              { term: "Revisit", detail: "The change in the workload or a constraint that reopens the choice." },
              {
                term: "Status",
                detail: "Proposed until the evidence is met. Accepted is agreement, not a running system. Superseded names the replacement.",
                gate: true,
              },
            ],
          },
          sources: [NYGARD_ADR],
        },
        {
          id: "stack-limits",
          title: "Where I do not use it",
          paragraphs: [
            "Choose the work decides whether the offer is worth building. The brief, the row, a disagreement, and the owner of the definition stay on Make the number fit to use. Continue, change, or stop stays on Run the product and judge the value. A slow backtest of probability of default or expected credit loss stays on the Bayesian optimisation card.",
          ],
          sources: [
            { href: DATA_CARD, label: "Data analytics field card" },
            { href: BAYES_CARD, label: "Bayesian optimisation field card" },
          ],
        },
        {
          id: "stack-draft",
          title: "When AI drafts the stack",
          paragraphs: [
            "A model may draft the options and the record. The responsible person still checks the assumptions, what the products actually do, the cost, the security, the integrations, and whether this organization can operate the design when it fails. A generated list of tools is not an architecture decision. A draft marked accepted stays proposed until the evidence exists.",
          ],
        },
      ],
      sources: [
        source(
          "https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions",
          "Michael Nygard, Documenting Architecture Decisions (15 Nov 2011, read 21 Oct 2026)",
        ),
        source("https://duckdb.org/", "DuckDB, in-process analytical database (read 21 Oct 2026)"),
        source(
          "https://spark.apache.org/docs/latest/",
          "Apache Spark 4.2.0 overview (read 21 Oct 2026)",
        ),
        source(
          "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html#running-dags",
          "Apache Airflow, Running Dags (read 21 Oct 2026)",
        ),
        source(
          "https://aws.amazon.com/compliance/shared-responsibility-model/",
          "Amazon Web Services, Shared Responsibility Model (read 21 Oct 2026)",
        ),
        source(
          "https://docs.getdbt.com/docs/collaborate/govern/model-contracts",
          "dbt Developer Hub, model contracts (read 16 Oct 2026)",
        ),
        { href: DATA_CARD, label: "Data analytics field card" },
        { href: DELIVERY_CARD, label: "Technology delivery field card" },
        { href: BAYES_CARD, label: "Bayesian optimisation field card" },
      ],
    },
    {
      number: 8,
      topic: "Keep trust in force",
      title: "Keep trust in force",
      lede: "This page is how a published measure stays fit to use. On the analytics field card the path is Ask, Grain, Truth, and Use. This page keeps Truth in force, so the decision that depends on it can still be made.",
      rule: "My operating rule: name who answers for the meaning and who answers for the pipeline, keep a path a person can explain, show whether the freshness the decision needs was met, run the checks that match the failure that would matter, and decide what a failure does. A correct calculation can still be unfit to use.",
      illustration: "The invoice list is a hypothetical illustration, not a record.",
      reviewed: "21 Oct 2026",
      ground: {
        src: `${DATA_ART}/path.jpg`,
        alt: "",
      },
      sections: [
        {
          id: "trust-state",
          title: "What trustworthy use looks like",
          paragraphs: [
            "Make the number fit to use has named the decision, the row, the disagreement, and the owner of the definition. Choose the stack has selected the design. This page is what has to remain true while people use the result. On the analytics field card, Ask is why the measure exists, Grain is what one row means, Truth is whether the evidence is still reliable, and Use is the decision that evidence supports. This page keeps Truth, so that use can continue.",
            "A number can be calculated correctly and still be unsafe to use. It may be older than the decision can bear, drawn from a source the definition did not name, shown to the wrong people, or published after a check that mattered had failed. Trust is maintained after the measure is defined and after it is released, by named responsibility, evidence a person can follow, controls matched to the harm, and a response when something changes or fails.",
            "The state I want is an operating outcome. A business owner is accountable for the meaning and the permitted use. A technical owner is accountable for the pipeline and its operation. Access fits the decision and the sensitivity of the data. Someone can explain the path from the source to the published measure. The freshness the decision needs is written down, and a person can see whether the last successful update met it. Automated checks catch the failures that would matter before users rely on the result. A failed check has an owner and a response: a publication hold, a qualification the user can see, an authorized exception, or a verified recovery. A review keeps these arrangements current. A small team may give more than one of these to the same person. Each responsibility is still named, and it matches the risk.",
            "The card also names security, governance, observability, evals, and human approve. Here those are who may see or change the data, who owns the meaning, the path and the freshness, the checks, and the decision to hold or release. An unresolved discrepancy is investigated on When two reports don't match.",
          ],
          sources: [{ href: DATA_CARD, label: "Data analytics field card" }],
        },
        {
          id: "trust-model",
          title: "The operating model",
          paragraphs: [
            "Six responsibilities keep a measure fit to use. Release is a point in the cycle. The review sends the work back to the owners.",
          ],
          figure: {
            kind: "flow",
            caption:
              "Maintaining trust continues after release. Review and improvement return the product to the owners when the source, the definition, the use, or a failure gives a reason to look again.",
            steps: [
              {
                term: "Accountability",
                detail: "A business owner for the meaning and the use. A technical owner for the pipeline. Access and approval named.",
                mark: "shield",
              },
              {
                term: "Traceability",
                detail: "Source, material transformation, defined measure, published output, and the decision that output supports.",
                mark: "search",
              },
              {
                term: "Freshness",
                detail: "The expectation the decision needs, shown against the last successful update.",
                mark: "clock",
              },
              {
                term: "Testing and monitoring",
                detail: "The failures worth detecting, run before users rely on the result, each critical one with an owner.",
                mark: "check",
              },
              {
                term: "Exception response",
                detail: "Hold, qualify, warn, or record an authorized exception. The choice matches the decision and the harm.",
                mark: "alert",
              },
              {
                term: "Review and improvement",
                detail: "After a material change or a failure, and on a period that matches the risk. Then the owners look again.",
                mark: "refresh",
              },
            ],
          },
          closing: [
            "These arrangements make a harmful failure more likely to be seen and answered. They do not guarantee a correct number, remove the risk, or by themselves establish compliance.",
          ],
        },
        {
          id: "trust-owners",
          title: "Who owns the number",
          paragraphs: [
            "Business ownership is accountability for the meaning, the definition, the permitted use, and the business consequence. Technical ownership is accountability for the pipeline, the implementation, the testing, the monitoring, and the technical repair when a run fails. Access authorization decides which roles may see or use the data, and which may change it. Approval authority decides who may authorize a material change to the definition, an authorized exception, or a release after a material check has failed.",
            "The same person can hold more than one of these. On the individual design in Choose the stack, one person refreshes the list and the credit controller uses it. The questions stay distinct. Seeing the list is a different authority from changing the definition. Using the list for the offer is a different authority from approving an exception.",
            "The Green Book is the GAO standard for internal control in the federal government, May 2025. I use the principles it states. I do not treat it as this organization's compliance manual. Principle 3 requires management to assign responsibility and delegate authority to achieve the entity's objectives. Paragraph 3.07 says a person who assigns the work further down still keeps the overall responsibility. Principle 10 separates incompatible duties where that is practical, and where it is not, it calls for another control. Its categories limit access to resources and records to authorized people, and they limit authorization to people acting within their authority. The four responsibilities on this page are my practice for an analytical measure.",
          ],
          sources: [GAO_P3, GAO_P10],
        },
        {
          id: "trust-lineage",
          title: "Where the number came from",
          paragraphs: [
            "For a measure that can affect a decision, someone should be able to explain the source, the transformations that change the meaning, the defined measure, the published output, and the decision or workflow that output is for.",
            "Documentation describes the path that was intended. Technical lineage records the path that ran. A test checks whether the result is right. A lineage record can help an investigation. The investigation of an unresolved discrepancy stays on When two reports don't match.",
            "OpenLineage is one way to record the path that ran. Its object model describes a job, a run of that job, and the datasets the run consumed or produced. A run event is an observation of an execution. A design-time record of a job or a dataset is not a run. A facet can store a schema, or the result of a data test. The stored result is a record of that test. It is not the test, and it does not decide whether the measure is fit to publish. On a small design, the sentence a person can say may be enough.",
          ],
          sources: [OPENLINEAGE_MODEL],
        },
        {
          id: "trust-fresh",
          title: "Whether the evidence is still fit",
          paragraphs: [
            "The freshness expectation follows the decision. The Government Data Quality Hub, in its note of 24 June 2021, says timeliness means different things for different uses: a hospital bed-allocation system needs the most up-to-date data, while previous quarterly figures may still be acceptable for forecasting care needs. I write four things: the expectation, how the last successful update is compared with it, what happens when it is missed, and how users are told. The expected schedule and the last success are different facts. A schedule that says daily does not mean the latest run succeeded.",
            "OpenLineage can record the time a run was scheduled for separately from the time it happened. That pair can show that a run did not happen when it was scheduled. The business expectation is still the one written for the decision. The Government Data Quality Framework, published 3 December 2020, says data is timely when the lag between collection and availability is appropriate for the intended use, and that putting timeliness first may come at the expense of completeness. That trade-off is told to the users. The framework is about the quality of input data, not this operating method.",
          ],
          sources: [DQ_DIMENSIONS, DQ_FRAMEWORK, OPENLINEAGE_MODEL],
        },
        {
          id: "trust-checks",
          title: "How failure is detected",
          paragraphs: [
            "I choose checks from the way this result can fail, from the harm if it does, and from the cost of detecting the failure or of missing it. A product does not need every kind. Structural checks ask whether the expected fields, the schema, and the types are present. Quality checks use the Data Quality Hub dimensions. Completeness is the data this use requires, not every field filled in. Validity is the expected format, type, and range, and a valid value can still be the wrong fact. Uniqueness asks whether the same thing was recorded more than once. Business-rule checks ask whether the output obeys this use, including the row sentence on Say what one row means. Reconciliation checks ask whether related results agree within an understood tolerance, where they should. An unexpected discrepancy is investigated on When two reports don't match. Freshness checks ask whether the expected data arrived and processing finished. Operational checks ask whether the pipeline and its dependencies ran.",
            "Paragraph 10.18 of the Green Book uses a second meaning of validity: a recorded event occurred, relates to the entity, and was executed under the prescribed procedure. Paragraph 10.19 says those processing objectives can apply to a decision that uses data other than a financial transaction. I keep that business rule apart from a format test. Paragraph 10.10 says a detective control discovers an unintended result and corrects it in time, and that its effectiveness depends on the correction being timely. The check is the detection. It is a control when someone owns the response. For each critical check I write what it tests, what failure looks like, whether it leads to a publication hold, a warning, or an investigation, who is alerted, and who owns the next action. A count of checks is not evidence the result is trustworthy. A check that never ran is not a pass. When the check is a dbt test, error and warn are the severities already described on When two reports don't match.",
          ],
          sources: [DQ_DIMENSIONS, GAO_P10],
        },
        {
          id: "trust-response",
          title: "What a failure does",
          paragraphs: [
            "I choose the response from the decision the output supports, the harm of acting on a wrong or stale result, whether the problem affects the whole output or only part of it, whether the limitation can be stated where the user will see it, and whether an authorized person can justify continued use. A publication hold, a qualification, a warning, and an authorized exception are different decisions. The person with approval authority makes the call.",
            "A missing field the decision cannot be made without, such as whether an invoice is still open, withholds that use until the field is restored and the check passes. A historical monthly note that arrives late can remain in use when its age is on the page and the decision does not need a newer figure. The approval authority records that continued use as an authorized exception. A warning or an exception is reviewed. A repeated critical failure stays on hold until there is a verified recovery.",
            "Paragraph 6.09 of the Green Book distinguishes the variation allowed for an operation, the precision a user needs from a nonfinancial report, and materiality in financial reporting. Paragraph 10.02 says the nature and extent of a control depend in part on that tolerance. Paragraph 10.11 says management weighs how likely an unintended result is and how large its impact would be, and that a higher risk of that result calls for a stronger control. An exploratory chart does not need the release controls of a metric used for an automated eligibility decision, for financial reporting, or for a regulatory process. Principle 17 requires management to evaluate an internal-control issue, assign a corrective action when the issue is a deficiency, and finish that action in time. I review the controls after a material change, an incident, a source change, a definition change, or a repeated failure, and on a period matched to the risk. Paragraph 16.06 ties the scope and frequency of a separate evaluation to the risks, to new deficiencies, and to the rate of change.",
          ],
          sources: [GAO_P6, GAO_P10, GAO_P16, GAO_P17],
        },
        {
          id: "trust-scene",
          title: "The invoice list",
          paragraphs: [
            "This illustration is hypothetical. It states no amount and no duration. The decision, from the earlier pages, is whether the credit controller offers an open invoice more time before write-off. The list is open invoices as of yesterday.",
            "In ordinary operation the business owner answers for what the list means and for the offer it may support. The technical owner runs the refresh and the checks. The controller's role can see the list. The path runs from the invoice ledger, through the transformations that apply the row sentence, to the published list. The expected freshness is yesterday, and the date of the last success meets it. The promised columns are present, written-off invoices are absent, and the refresh has finished. The controller uses the list for the offer.",
            "The last success is then older than yesterday. The freshness check records the miss and notifies the technical owner. The offer depends on which invoices are still open, so the stale list could be used for an invoice that has since been paid or written off. The approval authority withholds it as the answer for that offer. A copy that remains visible carries the date it actually has, so it is a qualification, not yesterday's list.",
            "The business owner names the offer as the decision that could be affected. The technical owner corrects the refresh. Freshness and the other checks for this use run again. The business owner confirms the list is fit for the offer, and only then does ordinary publication resume. If the stale list could be seen and the owner was not told, the check is changed so the next miss is seen. An unresolved discrepancy with a second report is investigated on When two reports don't match.",
          ],
          figure: {
            kind: "flow",
            caption:
              "Illustrative. No amount and no duration. Ordinary use resumes after the checks pass and the business owner confirms the list is fit for the offer.",
            steps: [
              {
                term: "Detect",
                detail: "The freshness check records the miss and notifies the technical owner.",
                mark: "alert",
              },
              {
                term: "Assess",
                detail: "The business owner names the offer: a stale list could treat a paid or written-off invoice as still open.",
                mark: "flag",
              },
              {
                term: "Contain",
                detail: "The approval authority withholds the list for the offer, or requires the actual date on any copy that stays visible.",
                mark: "pause",
              },
              {
                term: "Investigate",
                detail: "The technical owner looks for why the refresh did not finish.",
                mark: "search",
              },
              {
                term: "Correct",
                detail: "The technical owner repairs the refresh, or the approval authority accepts a written limitation.",
                mark: "wrench",
              },
              {
                term: "Verify",
                detail: "Freshness and the other checks for this use run again and pass.",
                mark: "check",
              },
              {
                term: "Restore",
                detail: "The business owner confirms the list is fit for the offer. Ordinary use resumes.",
                mark: "play",
              },
            ],
          },
        },
        {
          id: "trust-know",
          title: "How I would know",
          paragraphs: [
            "These are proposed operational indicators. They ask whether the controls are operating. A document that names a control is not yet that operation. They are not a judgment that the product is worth its cost. That question stays on Run the product and judge the value. I have not collected these figures, and this page sets no target. A high share of passing checks can sit beside weak checks, and beside checks that do not run.",
          ],
          lines: [
            {
              term: "Ownership coverage",
              detail:
                "Of the analytical products marked critical on the review date, the share with both a named business owner and a named technical owner. The numerator is that pair of names. The denominator is the critical set. The period is the review date. A missing name counts as not met. A product with no critical mark is listed as unclassified and stays outside the denominator. The indicator shows where to name an owner before the next use.",
            },
            {
              term: "Freshness compliance",
              detail:
                "Of the refreshes expected in the interval named on the review, the share that completed within the agreed freshness requirement. The numerator is those completed refreshes. The denominator is the refreshes the requirement said should finish in that interval. A refresh with no completion record counts as not met. A critical product with no agreed requirement is counted beside the share, so a missing requirement cannot look like a pass. If the review names no interval, the indicator is not computed. It shows which products are late for the decision they support.",
            },
            {
              term: "Checks executed",
              detail:
                "Over the same interval, of the critical checks scheduled to run, the share with a run record, and separately the share whose record says they passed. Both shares use the scheduled checks as the denominator. A check with no run record is not a pass. If the review names no interval, neither share is computed. The pair shows whether to repair the monitoring before reading a pass rate. Neither share says the check was a strong one.",
            },
            {
              term: "Open exceptions",
              detail:
                "The count of material exceptions still open on the review date, and the age of the oldest, from its recorded detection time to that date. Material means the approval authority has marked the exception as affecting the intended use. There is no denominator. An open exception with no detection time is counted, and its age is unknown rather than zero. Failures nobody has marked stay in a separate unmarked count. The count and the age show which issue to contain or close, and whether an authorized exception is being left in place.",
            },
          ],
        },
        {
          id: "trust-limits",
          title: "The neighbouring chapters",
          paragraphs: [
            "Name the decision, Say what one row means, and Keep the definition own the question, the grain, and the definition. When two reports don't match owns the investigation of an unresolved discrepancy. This page keeps the control that detects a discrepancy, and the response. Choose the stack owns the technology and the freshness the workload needs. Run the product and judge the value owns whether to continue, change, or stop the investment.",
          ],
          sources: [{ href: DATA_CARD, label: "Data analytics field card" }],
        },
        {
          id: "trust-draft",
          title: "When AI drafts the controls",
          paragraphs: [
            "A model may draft the owners, a diagram of the path, a freshness sentence, and a set of checks. The draft is not the business owner. A diagram of the intended path is not the record of the run. A sentence that the checks passed is not a run record. The person with approval authority still decides whether a failure is a publication hold, a qualification, or an authorized exception. A generated decision is not that acceptance, and it is not the confirmation that ordinary use can resume.",
          ],
        },
      ],
      sources: [
        { href: DATA_CARD, label: "Data analytics field card" },
        source(
          "https://www.gao.gov/assets/gao-25-107721.pdf",
          "GAO, Standards for Internal Control in the Federal Government, GAO-25-107721 (May 2025, read 21 Oct 2026)",
        ),
        source(
          "https://guides.gaoinnovations.gov/greenbook/2025/principle-3-establish-structure-responsibility-and-authority/",
          "GAO Green Book, principle 3 (read 21 Oct 2026)",
        ),
        source(
          "https://guides.gaoinnovations.gov/greenbook/2025/principle-6-define-objectives-and-risk-tolerances/",
          "GAO Green Book, principle 6 (read 21 Oct 2026)",
        ),
        source(
          "https://guides.gaoinnovations.gov/greenbook/2025/principle-10-design-control-activities/",
          "GAO Green Book, principle 10 (read 21 Oct 2026)",
        ),
        source(
          "https://guides.gaoinnovations.gov/greenbook/2025/principle-16-perform-monitoring-activities/",
          "GAO Green Book, principle 16 (read 21 Oct 2026)",
        ),
        source(
          "https://guides.gaoinnovations.gov/greenbook/2025/principle-17-evaluate-issues-and-remediate-deficiencies/",
          "GAO Green Book, principle 17 (read 21 Oct 2026)",
        ),
        source(
          "https://www.gov.uk/government/news/meet-the-data-quality-dimensions",
          "Government Data Quality Hub, Meet the data quality dimensions (24 June 2021, read 21 Oct 2026)",
        ),
        source(
          "https://www.gov.uk/government/publications/the-government-data-quality-framework/the-government-data-quality-framework",
          "UK Government Data Quality Framework (3 December 2020, read 21 Oct 2026)",
        ),
        source(
          "https://openlineage.io/docs/spec/object-model",
          "OpenLineage, object model (read 21 Oct 2026)",
        ),
      ],
    },
    {
      number: 9,
      topic: "Run the product and judge the value",
      title: "Run the product and judge the value",
      lede: "Does this analytics product still justify what it consumes, by supporting a real decision with evidence that is trustworthy enough and in time? This page is how I make the call.",
      rule: "My operating rule: I continue only when the decision is still necessary, the product is fit for that use, and the evidence supports the cost of keeping it. I change it when the decision remains and a diagnosed problem can be fixed. I stop it when the decision has ended, the product no longer serves a necessary purpose, or the cost is no longer justified. If the decision owner, the evidence, or a material risk is missing, the call is investigate.",
      illustration: "The invoice review is an illustration, not a record.",
      reviewed: "22 Oct 2026",
      ground: {
        src: `${DATA_ART}/path.jpg`,
        alt: "",
      },
      sections: [
        {
          id: "value-why",
          title: "Why the review recurs",
          paragraphs: [
            "Keep trust in force watches whether a published number is fit to use the next time someone needs it. This page asks a later question: should the product still be kept?",
            "A job can keep succeeding after the decision has ended, the deadline has moved, or the cost has grown. A value review is how I catch that. It is separate from operational monitoring. A serious failure is handled when it happens. The review date does not delay that response.",
            "A control used every day is reviewed sooner than a periodic report. The date is written on the record.",
          ],
          sources: [dataChapter(8, "Keep trust in force")],
        },
        {
          id: "value-stages",
          title: "The four stages",
          paragraphs: [
            "I walk four stages. A failed stage is not the call until the cause is diagnosed. Investigate is interim, while the record is not sufficient. It is not a permanent outcome.",
          ],
          figure: {
            kind: "tree",
            caption: "Continue is only the yes path. Change and stop need a diagnosed cause.",
            steps: [
              {
                term: "A · Decision",
                detail: "Is the decision still made, by the decision owner, with this product in the workflow?",
                spine: "Yes → Fitness",
                branches: [
                  {
                    term: "Stop",
                    detail: "The decision has ended.",
                  },
                  {
                    term: "Change",
                    detail: "The decision remains, and the product can be brought back into the workflow.",
                  },
                  {
                    term: "Investigate",
                    detail: "No decision owner. A title or a named stakeholder is not enough.",
                  },
                ],
              },
              {
                term: "B · Fitness",
                detail: "Is it correct, at the right grain, in time for the deadline, reliable, controlled, and usable?",
                spine: "Yes → Value",
                branches: [
                  {
                    term: "Change",
                    detail: "The cause can be fixed on the chapter that owns it.",
                  },
                  {
                    term: "Stop",
                    detail: "It cannot be made to serve the decision.",
                  },
                  {
                    term: "Investigate",
                    detail: "The fitness evidence is missing, or a material risk is open.",
                  },
                ],
              },
              {
                term: "C · Value",
                detail: "Is there evidence of decision influence, or of a control the decision needs?",
                spine: "Yes → Investment",
                branches: [
                  {
                    term: "Change",
                    detail: "A fixable gap blocks that value.",
                  },
                  {
                    term: "Stop",
                    detail: "No necessary action remains.",
                  },
                  {
                    term: "Investigate",
                    detail: "Neither decision influence nor a needed control is shown.",
                  },
                ],
              },
              {
                term: "D · Investment",
                detail: "Do the benefits still justify the cost and risk? A mandatory control can be worth keeping without a calculated return.",
                branches: [
                  {
                    term: "Continue",
                    detail: "The decision, the fitness, and the cost still justify keeping it.",
                  },
                  {
                    term: "Change",
                    detail: "A simpler or corrected form would justify the cost.",
                  },
                  {
                    term: "Stop",
                    detail: "The cost or risk is no longer justified.",
                  },
                  {
                    term: "Investigate",
                    detail: "A material cost or risk is unknown. Unknown is not zero.",
                  },
                ],
              },
            ],
          },
        },
        {
          id: "value-invoice",
          title: "The controller's offer",
          paragraphs: [
            "This illustration continues the invoice list from the earlier pages. I have not measured it, and it states no amount. The credit controller is the decision owner.",
            "Before an invoice is written off, the controller decides whether to offer more time to pay, or to refuse it, inside the agreed policy. Yesterday's list supplies the terms, any dispute, and what has been paid, in time for that offer. It does not replace the controller. A list of whom to call, and the write-off itself, are different decisions.",
          ],
          figure: {
            kind: "flow",
            plain: true,
            caption: "Illustrative. The offer of more time is the decision. The list is the information for that offer.",
            steps: [
              {
                term: "Decision",
                detail: "Whether to offer an open invoice more time to pay, or to refuse it, before write-off.",
              },
              {
                term: "Information",
                detail: "Open invoices as of yesterday: the terms, any dispute, and what has been paid.",
              },
              {
                term: "Action",
                detail: "The controller offers more time, or refuses it, inside the policy.",
              },
              {
                term: "Evidence",
                detail: "The list arrives before the offer, and the decision owner can identify an offer it changed.",
              },
              {
                term: "Investment",
                detail: "Continue, change, or stop.",
              },
            ],
          },
        },
        {
          id: "value-outcomes",
          title: "Three calls",
          paragraphs: [
            "One list can support three calls. The cause decides which.",
          ],
          figure: {
            kind: "uses",
            caption: "Illustrative.",
            steps: [],
            head: ["Call", "Cause", "Action"],
            rows: [
              {
                label: "Continue",
                cells: [
                  "The offer of more time, yesterday's list, and the cost of the refresh still hold.",
                  "No corrective action is required. The technical owner keeps the refresh until the next review.",
                ],
              },
              {
                label: "Change",
                cells: [
                  "The offer is now made before the list arrives.",
                  "Correct the delivery, then verify the list arrives before the offer.",
                ],
              },
              {
                label: "Stop",
                cells: [
                  "The controller no longer makes this offer from the list.",
                  "Run the retirement checks, then turn it off.",
                ],
              },
            ],
          },
        },
        {
          id: "value-levels",
          title: "Four levels",
          paragraphs: [
            "Match the strength of the evidence to the cost and the importance of the decision.",
          ],
          figure: {
            kind: "uses",
            caption: "Usage does not prove decision influence. A business outcome does not, by itself, prove the product caused it. A measured outcome is not required for every product.",
            steps: [],
            head: ["Level", "It establishes", "It leaves open"],
            rows: [
              {
                label: "Availability",
                cells: ["The product runs and can be opened.", "Whether the intended people use it."],
              },
              {
                label: "Adoption",
                cells: ["Those people use it in the work.", "Whether an action changed."],
              },
              {
                label: "Influence",
                cells: ["It changed or supported the action.", "Whether a business outcome followed, and whether the product caused it."],
              },
              {
                label: "Outcome",
                cells: [
                  "A business outcome followed the action: a faster decision, less effort, fewer errors, lower risk, or a better service.",
                  "Other explanations. A baseline and a period come before the outcome is attributed to the product.",
                ],
              },
            ],
          },
        },
        {
          id: "value-evidence",
          title: "Five kinds of evidence",
          paragraphs: [
            "I do not add these into one score. A critical failure stays visible.",
          ],
          figure: {
            kind: "uses",
            caption: "What is acceptable, and what to do when it is not.",
            steps: [],
            head: ["Category", "Question", "If it fails"],
            rows: [
              {
                label: "Ownership",
                cells: [
                  "Who is the decision owner, who acts, and is the product in that workflow? Usage records, and the decision owner's confirmation.",
                  "No decision owner, or only a title: investigate.",
                ],
              },
              {
                label: "Fitness",
                cells: [
                  "Is the product still fit for the decision? The row definition, freshness against the deadline, failure logs, access, and the checks on Keep trust in force.",
                  "Send the cause to the chapter that owns it. Missing evidence, or an open material risk: investigate.",
                ],
              },
              {
                label: "Influence",
                cells: [
                  "What shows decision influence, or that this is a control the decision needs? The decision owner's confirmation or a decision log. Add an outcome measure, with a baseline, only when the decision needs one.",
                  "Missing evidence: investigate. Usage alone does not pass.",
                ],
              },
              {
                label: "Cost, risk",
                cells: [
                  "Which costs and risks are still being paid? Maintenance, compute, support, incidents, dependencies, security, compliance, and opportunity cost, where they apply.",
                  "No record of a material cost: investigate.",
                ],
              },
              {
                label: "Governance",
                cells: [
                  "Is the call written, and is the next review set? The written call, the action and its owner when a fix is required, and the date or trigger.",
                  "Nothing written: investigate.",
                ],
              },
            ],
          },
          sources: [dataChapter(8, "Keep trust in force")],
        },
        {
          id: "value-routine",
          title: "Before, during, and after",
          lines: [
            {
              term: "Before",
              detail: "Collect the evidence the five categories name, and note what has changed since the last review.",
            },
            {
              term: "During",
              detail: "Walk the four stages with that evidence.",
            },
            {
              term: "After",
              detail: "Write the review record. If it cannot be completed, the call is investigate.",
            },
          ],
        },
        {
          id: "value-record",
          title: "The review record",
          paragraphs: [
            "An illustrative continue. A change names the fix, who does it, and when it is due. A stop points at the retirement checks. An empty call is investigate.",
          ],
          figure: {
            kind: "sheet",
            caption: "Illustrative continue for this list.",
            steps: [
              {
                term: "Product",
                detail: "Yesterday's list for the offer of more time. One report, refreshed from the invoice ledger.",
              },
              {
                term: "Decision",
                detail: "Whether to offer an open invoice more time to pay, or to refuse it. The offer is still made before write-off.",
              },
              {
                term: "Decision owner",
                detail: "The credit controller. Accountable for the offer and for this call.",
              },
              {
                term: "Technical owner",
                detail: "The person who refreshes the list.",
              },
              {
                term: "Evidence",
                detail:
                  "The decision owner can identify offers the list supported or changed. The list arrives before the offer is made. The row definition remains valid. No material exception is open.",
              },
              {
                term: "Cost, risk",
                detail:
                  "One person's time to refresh the list, dependence on the invoice ledger, access to customer invoice data, and the harm of an offer from a stale or wrong list. No baseline has been kept, so this call does not claim a business result.",
              },
              {
                term: "Call",
                detail: "Continue. The list is fit for the offer, and the refresh is still justified.",
              },
              {
                term: "Action",
                detail: "No corrective action is required. The technical owner keeps the refresh.",
              },
              {
                term: "Next review",
                detail: "At the next scheduled review, or sooner if the workflow, the deadline, or the cost changes.",
              },
            ],
          },
        },
        {
          id: "value-diagnose",
          title: "What the symptom means",
          paragraphs: [
            "The same symptom can come from more than one cause. The remedy follows the cause, not the symptom.",
          ],
          figure: {
            kind: "uses",
            caption: "Diagnose, then send the fix to the chapter that owns the cause.",
            steps: [],
            head: ["Symptom", "Possible cause", "Remedy"],
            rows: [
              {
                label: "Low usage",
                cells: [
                  "Hard to find. Missing from the workflow. Or the decision has ended.",
                  "A discovery or workflow problem is a change, when the decision remains. An ended decision is a stop.",
                ],
              },
              {
                label: "Corrections",
                cells: [
                  "The data is wrong, or people do not share one definition.",
                  "Quality and the response stay on Keep trust in force. The row definition is Say what one row means. An unexplained second report is When two reports don't match.",
                ],
              },
              {
                label: "Late delivery",
                cells: [
                  "The deadline moved, or an upstream step is late.",
                  "A changed freshness requirement goes to Choose the stack. A failed or late run goes to Keep trust in force.",
                ],
              },
              {
                label: "Use, no change",
                cells: [
                  "People open it, and the action stays the same.",
                  "If a decision remains, put the product into that action. If none remains, stop.",
                ],
              },
              {
                label: "High cost",
                cells: [
                  "More machinery than the decision needs, or several products doing one job.",
                  "Simplify, consolidate, or retire. The cost is not a reason to add a platform.",
                ],
              },
              {
                label: "Decision ended",
                cells: [
                  "The workflow moved on. The job can still succeed.",
                  "Stop, after the retirement checks. Remaining use is a reason to look for another decision, not a reason to keep this product.",
                ],
              },
            ],
          },
          sources: [
            dataChapter(3, "Say what one row means"),
            dataChapter(4, "When two reports don't match"),
            dataChapter(7, "Choose the stack"),
            dataChapter(8, "Keep trust in force"),
          ],
        },
        {
          id: "value-retire",
          title: "Retiring the product",
          paragraphs: [
            "Stop ends the investment only after these checks. This is not a technology change-management manual.",
          ],
          steps: [
            "Confirm the decision has ended, or that a replacement is ready and fit for the use that remains.",
            "Identify the reports, models, applications, workflows, and people that still depend on the product.",
            "Check what retention, audit, contract, or regulation requires you to keep.",
            "Tell the users the product is going, and name the alternative where there is one.",
            "Turn off the jobs, the access, and the infrastructure in an order that leaves a kept dependency working.",
            "Check that the cost and the dependencies you meant to remove are gone.",
            "Keep the record: the call, the reason, the evidence, and who approved the retirement.",
          ],
        },
        {
          id: "value-limits",
          title: "The neighbouring chapters",
          paragraphs: [
            "This page owns whether a running product should continue, change, or stop. Another problem belongs to the chapter that owns it.",
          ],
          figure: {
            kind: "uses",
            caption: "",
            steps: [],
            head: ["Chapter", "It decides", "Open it when"],
            rows: [
              {
                label: "Choose the work",
                href: "/handbooks/data-that-drives-decisions/6",
                cells: [
                  "Whether to start the investment.",
                  "The decision is new.",
                ],
              },
              {
                label: "Name the decision",
                href: "/handbooks/data-that-drives-decisions/2",
                cells: [
                  "The decision and the intended outcome.",
                  "The brief no longer matches the use. A hypothesis is checked there.",
                ],
              },
              {
                label: "Make the number fit to use",
                href: "/handbooks/data-that-drives-decisions/2",
                cells: [
                  "The information the decision needs, and the contract that keeps it.",
                  "The row, an unresolved disagreement, or the definition.",
                ],
              },
              {
                label: "Choose the stack",
                href: "/handbooks/data-that-drives-decisions/7",
                cells: [
                  "The technology that delivers the result.",
                  "The design no longer meets the workload, including freshness.",
                ],
              },
              {
                label: "Keep trust in force",
                href: "/handbooks/data-that-drives-decisions/8",
                cells: [
                  "Quality, access, and the controls that keep the number fit to use.",
                  "A failed check, access, a freshness miss, or an incident.",
                ],
              },
              {
                label: "This page",
                cells: [
                  "Whether to continue, change, or stop.",
                  "The product is already running.",
                ],
              },
            ],
          },
          closing: [
            "I do not continue a product so the organization can climb the ladder on the analytics field card. Calendars, blast radius, and cutover stay on the technology delivery field card.",
          ],
          sources: [
            dataChapter(2, "Name the decision"),
            dataChapter(3, "Say what one row means"),
            dataChapter(4, "When two reports don't match"),
            dataChapter(5, "Keep the definition"),
            dataChapter(6, "Choose the work"),
            dataChapter(7, "Choose the stack"),
            dataChapter(8, "Keep trust in force"),
            { href: DATA_CARD, label: "Data analytics field card" },
            { href: DELIVERY_CARD, label: "Technology delivery field card" },
          ],
        },
        {
          id: "value-draft",
          title: "When AI drafts the review",
          paragraphs: [
            "A model may summarize evidence from sources the decision owner has approved, point out anomalies, missing information, and changes since the last review, and draft a recommendation that states its reasoning and what it does not know. It must not invent usage, savings, outcomes, or supporting evidence.",
            "The decision owner checks those sources, keeps a missing fact visible, and approves the call. A generated continue is not that approval. An automated change or retirement follows the access, change, and approval controls that already apply. This holds when a draft is cheap: a complete-looking review stays investigate until a person accepts the call.",
          ],
        },
      ],
      sources: [
        { href: DATA_CARD, label: "Data analytics field card" },
        { href: DELIVERY_CARD, label: "Technology delivery field card" },
      ],
    },
  ],
};

export const HANDBOOKS: Handbook[] = [SOFTWARE_THAT_STAYS_IN_USE, DATA_THAT_DRIVES_DECISIONS];

export const LATER_HANDBOOKS: LaterHandbook[] = [
  {
    index: "02",
    title: "Engineering reliable delivery",
    card: { href: DELIVERY_CARD, label: "Technology delivery field card" },
  },
  {
    index: "04",
    title: "Decision systems under uncertainty",
    card: { href: CREDIT_CARD, label: "Credit risk field card" },
  },
];
