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

export interface HandbookFigureStep {
  term: string;
  detail: string;
  /** Icon in the diagram. The words still name the step. */
  mark?: HandbookMark;
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

export interface HandbookFigure {
  kind: "flow" | "pyramid" | "loop" | "recovery" | "signals" | "scene" | "compare";
  caption: string;
  steps: HandbookFigureStep[];
  columns?: HandbookFigureColumn[];
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
  /** Opening plate. The horizon is Software that stays in use. It is not a cover route. */
  plate?: "horizon";
  /** This book's opening picture. It is the first leaf, not a route in front of the page. */
  cover?: HandbookPicture;
  sections: HandbookSection[];
  sources: HandbookLink[];
}

/** A contents entry. It opens on `page`. */
export interface HandbookContentsEntry {
  title: string;
  page: number;
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
      reviewed: "14 Oct 2026",
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
              { term: "Change", detail: "A slice that can merge today.", mark: "code" },
              { term: "Test", detail: "Local build. Not the gate.", mark: "gear" },
              { term: "Integrate", detail: "Pull again, combine, push.", mark: "merge" },
              { term: "Verify", detail: "The integration machine.", mark: "pulse" },
              { term: "Repair", detail: "Repair first, then return to pull.", mark: "wrench" },
            ],
          },
          steps: [
            "Pull. Take main and run the build before you change anything. If main is red, repair it before a feature. A new edit on a red build hides which change failed. Done when that build is green, or the red build is the work in front of you.",
            "Change. Keep the slice small enough to merge the same day. If it will not fit, split it. When the behaviour has to stay off while the code lands, Hammant uses a feature flag or a branch by abstraction. Those keep unfinished behaviour off the path a person uses. They do not make an untested change safe to release. Done when the slice can land today.",
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
            "How long does a change typically sit before it is on main? Look at the merge history.",
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
      reviewed: "14 Oct 2026",
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
      reviewed: "14 Oct 2026",
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
            "Microsoft's Security Development Lifecycle names threat modeling as a core element, in five steps: security requirements, an application diagram, the threats, the mitigations, and a check that the mitigations happened. The tool's notation draws components, data flows, and security boundaries. I do not treat the tool as the plan. The page still has to name who can reach the data, and how that reach can be abused. NIST SP 800-218 practice PW.1 asks for that identification in design. I write it on this page, where a person will review it.",
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
      reviewed: "14 Oct 2026",
      sections: [
        {
          id: "artifact",
          title: "The version people run",
          paragraphs: [
            "Fowler's deployment pipeline breaks the build into stages. The first stage compiles and provides the binaries later stages use. Deploying to production is usually the final stage. The pipeline's job is to detect changes that would cause problems in production, including performance, security, and usability, before that final stage.",
            "People therefore run those binaries, not a fresh build assembled on release day. A rebuild can compile different code, pick up a different dependency, or skip a test the pipeline already ran. I do not put that rebuild in front of people. The version just verified is the artifact the later stage already holds.",
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
      reviewed: "14 Oct 2026",
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

export const DATA_THAT_DRIVES_DECISIONS: Handbook = {
  slug: "data-that-drives-decisions",
  index: "03",
  title: "Data that drives decisions",
  thesis:
    "A number can drive a decision when its grain, its owner, and the way to stop a bad publish are named. This book is how I keep that publish honest.",
  card: { href: DATA_CARD, label: "Data analytics field card" },
  contents: [
    { title: "Reconcile or block", page: 1 },
    { title: "Name the decision", page: 2 },
    { title: "Keep the definition", page: 3 },
  ],
  pages: [
    {
      number: 1,
      topic: "Reconciliation",
      title: "Reconcile or block",
      lede: "This page is a publish offered as an answer. Two reports can carry the same name and still disagree. Publishing one of them, or a third number between them, before the difference has a cause, gives that decision a figure it cannot defend. An exploration, a monitor, or a search that is not offered as the answer can keep both cuts. This page starts when the decision is already named on Name the decision, or when two reports are already being offered as the answer and the figures disagree.",
      rule: "My operating rule: name the grain before the two reports are compared, explain the difference or block the publish, and do not publish a number between them.",
      illustration: "The two extracts are an illustration, not a record.",
      reviewed: "16 Oct 2026",
      cover: {
        src: `${DATA_ART}/gate.jpg`,
        alt: "Two reports meet a shut gate. Nothing is published on the far side.",
      },
      sections: [
        {
          id: "disagreement",
          title: "Why the number gets published",
          paragraphs: [
            "The decision needs a measure today. Two systems already show it, and the two figures differ. The short path is to read out the figure a person recognizes, or to place a third figure between them so the room has one number. That third figure becomes the baseline the next report is judged against. The difference leaves the room under a published name, still unexplained.",
            "Kimball names the design error under that path. If the grain is not declared at the start, the design rests on quicksand, and rogue facts that introduce application errors sneak in. A fact has to be true to the grain. In his doctor-bill example, a year-to-date amount on a line-item row is not true to that grain. When a report combines the rows, the result is nonsense, and it is dangerous because it invites the reader to trust it. He says to omit that fact and calculate the aggregate in the application.",
            "The techniques note states the constraint. Different grains must not be mixed in the same fact table. Each grain is its own table. I treat two reports at two grains as two contracts. One published figure that treats them as the same contract is the mistake that constraint is there to stop.",
          ],
          sources: [KIMBALL_GRAIN, KIMBALL_TECHNIQUES],
        },
        {
          id: "practice",
          title: "The practice, and my rule",
          paragraphs: [
            "The principle is Kimball's. In the 2003 article, declaring the grain means saying what one record represents, in business terms. Listing the dimensions and treating that list as the declaration is the mistake he names in his students' designs. He calls the declaration a contract. The 2013 techniques note calls it a binding contract, and it says the grain is declared before the dimensions and the facts.",
            "The control is the Green Book's: the GAO's Standards for Internal Control in the Federal Government, May 2025. Appendix II describes a reconciliation as identifying and comparing transactions from two sets of records, determining whether they were recorded properly, have yet to be recorded, or were recorded improperly and require correction, and explaining the differences. The two sets may both be internal, or one may be external, as in a bank reconciliation. Paragraph 10.04 includes comparisons that relate different sets of data so management can analyze the relationship and act, as a control over performance measures, and it includes comparing file totals with control accounts as a control over information processing. Paragraph 16.05 includes comparisons and reconciliations in ongoing monitoring.",
            "Paragraph 10.10 calls a detective control the activity that discovers an unintended result and corrects it, and it says the usefulness of that control depends on the correction being timely. I use that timeliness as the reason the explanation happens before the publish. The standard does not describe a dashboard, and the block is my rule.",
            "The mechanism that stops the next build is narrower, and it is dbt's. A test returns the rows it was written to catch. Unless it is configured otherwise, a nonzero count is an error. On the dbt build command I checked, an upstream test that fails skips the downstream resources. Set the severity to warn, or widen the threshold, and those resources run. A uniqueness test can pass on both reports while the reports still disagree. The test is how a check I have already named can stop the next model. The reconciliation is the comparison of the two statements.",
            "The operating rule at the top of this page is that stop. The owner of the definition approves the grain. A green pipeline is not that approval. The analytics field card states the same stop. Its picture of 4.8%, 6.2%, and 5.1% is a disagreement, not a calculated portfolio result. In that picture the published figure is one grain after the difference is explained. It is not the midpoint of the two reports.",
          ],
          sources: [
            KIMBALL_GRAIN,
            KIMBALL_TECHNIQUES,
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
            "This is the worksheet I take into the meeting when a measure is about to be published as an answer. A blank field stops the publish. The grain is Kimball's. The comparison and the explanation are the Green Book's reconciliation. The skip, when a named check fails, is dbt's error severity, and I use that severity for a check that is supposed to stop the publish. The block, when the cause cannot be named, is my rule. A tolerance counts only when the owner wrote it down before the comparison.",
          ],
          lines: [
            {
              term: "Grain",
              detail:
                "What one row represents, in business terms: the unit, the time, the scope, and the definition. A list of dimensions does not finish the field. It is filled when a person who will use the number can restate the row. Otherwise it stays blank, and the publish stops.",
            },
            {
              term: "Second statement",
              detail:
                "The other report, brought to that grain. If it will not sit there, set it aside as a different measure. Different grains are different tables. The field is filled when the second statement is at the declared grain, or it has been set aside.",
            },
            {
              term: "Differences",
              detail:
                "Each difference between the two sets of records: recorded properly, not yet recorded, or recorded improperly. It sits inside a tolerance the owner wrote down before the comparison, or it is on the list. A blank list with a visible gap is not filled.",
            },
            {
              term: "Cause",
              detail:
                "For each listed difference: grain, scope, definition, timing, a missing record, or a defect. The explanation is part of the reconciliation. A difference without a cause is the one that blocks the publish.",
            },
            {
              term: "Resolution",
              detail:
                "The cause fixed, or accepted in writing by the owner against the declared grain. A number placed between the two reports is not a resolution. A fact the grain does not support invites the reader to trust it. One grain is the candidate, and the other statement is explained or out of scope.",
            },
            {
              term: "Publish or block",
              detail:
                "If a cause cannot be named, do not publish. The previous published figure stays, or the measure stays dark. When the check that encodes this gate is a dbt test, set it to error so the downstream resource skips. Warn lets that resource run, so I do not use warn for this gate. The publish carries the one approved grain, or it did not happen.",
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
          title: "An illustrative break",
          paragraphs: [
            "This is an illustrative scenario. It is not a record of a portfolio I measured, and it states no amount.",
            "The decision in the room is whether to extend terms. That decision is the brief on Name the decision, written against an extract titled overdue balance, where a row is an open invoice as of yesterday. A second extract of the same title then arrives. In one, a row is an account at month-end, and charged-off accounts are out of scope. In the other, a row is an invoice as of yesterday, and charged-off accounts are in scope. While the grain field is blank, the record cannot be filled, and both extracts stay dark. A figure placed between the two totals would be true to neither grain.",
            "The same illustration, once the record is filled. The owner names the grain the terms decision can use: a row is an open invoice as of yesterday, and charged-off accounts are out of scope. The account-at-month-end extract will not sit at that grain, so it is set aside as a different measure. The cause is the grain. The owner accepts the invoice grain in writing. The publish carries that grain. The other extract stays dark. Nothing is placed between them, and no amount is written. The actor named on Name the decision can use this publish for the terms decision.",
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
            "I track four signals. I have no target times, and these definitions are not results I have collected. A green build that leaves two definitions of the same measure in use is not the practice.",
            "Open disagreements are published measures whose second statement differs, and the difference is not yet named.",
            "Time open runs from the difference appearing until it is explained or the publish is blocked.",
            "Blocked publishes are the times the gate stopped a number that would otherwise have shipped.",
            "Owned definitions are measures whose grain has a named owner.",
            "The register is how a meeting records the signals. The rows that follow are written for the illustration on this page. One is the block. One is the publish. Neither is a result I collected, and neither states an amount.",
          ],
          lines: [
            { term: "Blocked", detail: "The record while the grain field is blank." },
            { term: "Measure", detail: "Overdue balance. No amount is written." },
            {
              term: "Owner",
              detail: "The role that would approve the grain. While the record is blocked, the role is not named, so the field stays blank.",
            },
            { term: "Baseline", detail: "Nothing is published. Two extracts carry the same title." },
            {
              term: "Unresolved",
              detail:
                "The grains differ. One row is an account at month-end, and charged-off accounts are out of scope. The other is an invoice as of yesterday, and charged-off accounts are in scope.",
            },
            { term: "Action", detail: "Block the publish." },
            { term: "Outcome", detail: "The publish did not happen. Both extracts stay dark." },
            {
              term: "Filled",
              detail:
                "The same title once the owner has named the grain. Grain: an open invoice as of yesterday, charged-off accounts out of scope. Second statement: the account-at-month-end extract, set aside. Cause: the grain. Resolution: the owner accepts the invoice grain in writing. Action: publish that grain. Outcome: that grain is the publish, and the actor on Name the decision can use it for the terms decision. The other extract stays dark. No amount is written.",
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
            "An exploration that is not offered as the answer is the opening of this page. It can hold two cuts. This page blocks the publish that is offered as an answer.",
            "The Green Book's reconciliation compares two sets of records. One statement, with no second set, is a different control. A uniqueness test on that statement can still be an error that skips the next model. That is the dbt mechanism on a single statement.",
            "Kimball says an aggregate is used together with the atomic data it came from, because the aggregate carries less detail. I keep them as two grains. I do not fold them into one cell so a chart has a single figure.",
            "The calendar, the blast radius, and the cutover stay on the technology delivery field card, and a slow PD or ECL backtest stays on the Bayesian optimisation card. This page stops the number.",
            "The Green Book ties a detective control to a correction that is timely. I place that correction before the number is published. A reconciliation that begins after the decision has already used the number is a review of a figure that shipped.",
            "This page stops a publish whose two statements disagree. Keeping that definition in force after the publish is Keep the definition.",
          ],
          sources: [
            KIMBALL_GRAIN,
            GAO_RECONCILE,
            DBT_BUILD,
            { href: DELIVERY_CARD, label: "Technology delivery field card" },
            { href: BAYES_CARD, label: "Bayesian optimisation field card" },
          ],
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
      number: 2,
      topic: "The question",
      title: "Name the decision",
      lede: "This page is a measure offered as the answer to a decision. A measure can reconcile and still be the wrong answer. Publishing it before the decision is named gives that decision a figure it was not built for. Exploration, monitoring, and discovery can continue without a named decision. They are not this publish. When two reports of a measure already offered as an answer disagree, that difference is the record on Reconcile or block.",
      rule: "My operating rule: name the decision, the person who will act, and what they would do if the number moved, before the grain is declared, and do not publish the measure as the answer to a decision that was not named.",
      illustration: "The two chairs are an illustration, not a record.",
      reviewed: "16 Oct 2026",
      sections: [
        {
          id: "wrong-answer",
          title: "Why a reconciled number still misleads",
          paragraphs: [
            "The comparison has already passed. The short path is to read the number out as the answer to whatever question is in the room. The number was produced by a process. The question in the room may be a different decision. A figure that is true to its grain can still be unrelated to the decision someone is about to make.",
            "Kimball's order puts the business before the grain. Before a dimensional model is designed, the team uncovers what the business needs in sessions with business representatives, to understand their objectives from their indicators, their issues, their decision-making processes, and the analysis they need, and at the same time uncovers what the source data can support. The four design decisions then begin by selecting the business process. A business process is an operational activity, such as taking an order, processing a claim, or snapshotting every account each month. Events of that process generate the metrics that become facts. Most fact tables focus on the results of a single process. Choosing the process defines the design target, and it is what allows the grain, the dimensions, and the facts to be declared. The answers come from the needs of the business and from the source data. A report title is not that process.",
            "The relation I use between a measure and a goal is the GAO's, from the evaluator's guide to annual performance plans under the Results Act, April 1998. The guide is about an agency plan. It does not describe a dashboard. Criterion 1.1 says the measures in the plan should adequately indicate progress toward the performance goals. When a goal is not self-measuring, the measures translate it into concrete, observable conditions that determine what data to collect, so the agency can assess what happened, make decisions, and assign accountability. To do that, the measures have to clearly represent, or be related to, the performance they are trying to assess. The guide's example is the shape of the failure: average processing time for tax returns does not represent, and is not clearly related to, the goal of increasing the accuracy of tax return processing. The time can be collected carefully and still be the wrong number for that goal.",
          ],
          sources: [KIMBALL_STEPS, KIMBALL_PROCESS, KIMBALL_PDF, GAO_RESULTS],
        },
        {
          id: "question-rule",
          title: "The practice, and my rule",
          paragraphs: [
            "The design order is Kimball's. Select the business process, then declare the grain. Business data governance representatives participate in that design, so the business has agreed to the names and the rules. I treat that participation as the design session. It does not, by itself, name the decision the published number will answer.",
            "The analytics field card states the failure I am writing about: the wrong question, the wrong audience, or an unclear decision. I read the question as the decision, the audience as the person who will act, and an unclear decision as a move that has not been named. The card's reconciliation gate stays on the first page of this book. This page starts earlier. The number may already be true to a grain.",
            "The operating rule at the top of this page is that stop. A workshop can agree a process and still leave the decision unnamed. A green comparison can agree a grain and still leave the decision unnamed.",
          ],
          sources: [KIMBALL_STEPS, KIMBALL_PDF, { href: DATA_CARD, label: "Data analytics field card" }],
        },
        {
          id: "brief",
          title: "The brief",
          paragraphs: [
            "This is the worksheet I take into the meeting before I declare a grain for a measure that will be offered as an answer. A blank line means the measure is not published as that answer. The process is Kimball's. The relation between the measure and the goal is the shape of the GAO criterion. The stop, when the decision cannot be named, is my rule. The grain is declared only after these lines are filled. A disagreement between two reports is filled on Reconcile or block, not on this brief.",
          ],
          lines: [
            {
              term: "Decision",
              detail:
                "The decision, in the words of the person who will act. A report title does not finish the line. It is filled when someone who was not in the room can restate what is being decided. Otherwise it stays blank.",
            },
            {
              term: "Actor",
              detail: "Who will act. One person, or one role, whose action changes. A distribution list is not the actor.",
            },
            {
              term: "Move if it rises",
              detail:
                "What that person would do if the number went up. If the action does not change, this measure is not the answer to that decision.",
            },
            {
              term: "Move if it falls",
              detail:
                "What that person would do if the number went down. Both moves are written, or the measure is set aside for this decision.",
            },
            {
              term: "Process",
              detail:
                "The one operational activity that generates the metric. If the decision needs the results of two activities, they are two measures. The line is filled when one process is named, or the decision has been split.",
            },
            {
              term: "Publish as an answer",
              detail:
                "Only when the lines above are filled. If the decision, the actor, or a move is blank, the table may stay, and it is not the answer. This brief does not publish a number between two reports.",
            },
          ],
          sources: [KIMBALL_PROCESS, KIMBALL_STEPS, GAO_RESULTS],
        },
        {
          id: "question-scene",
          title: "An illustrative break",
          paragraphs: [
            "This is an illustrative scenario. It is not a record of a portfolio I measured, and it states no amount.",
            "One extract is titled overdue balance. A row is an open invoice as of yesterday. The grain of that extract is agreed, and there is no second report in the room. Two decisions are. One person will choose which customers to call. Another will decide whether to extend terms on an invoice. The rows can answer the terms decision, because that decision is about an invoice. They are not, by themselves, the call list, because a call is a customer and this row is an invoice. The brief's decision line stays blank until the room names which decision this publish is for, and the extract stays dark.",
            "The same illustration, once the brief is filled. The decision is whether to extend terms. The actor is the role that extends them. If more invoices sit past terms, that role withholds the extension. If fewer invoices sit past terms, the extension can be offered. The process is the open invoice. The call list is set aside. The chair in the light is that actor. The chair left dark is the call list, which this publish does not answer. The invoice extract can be published as the answer. It states no amount.",
            "If a second extract of the same title arrives as an account at month-end, with charged-off accounts out of scope, that disagreement is the record on Reconcile or block. This page does not choose a number between them. On that record the filled publish is the invoice grain, and the account extract is set aside.",
          ],
          picture: {
            src: `${DATA_ART}/decision.jpg`,
            alt: "An illustration. One sheet of light, one chair in that light, and one chair left dark. No amount.",
          },
        },
        {
          id: "question-know",
          title: "How I would know",
          paragraphs: [
            "I track four signals. I have no target times, and these definitions are not results I have collected. A reconciled grain whose decision cannot be restated is not the practice.",
            "Unnamed decisions are published measures whose actor cannot restate the decision.",
            "Written moves are measures where the actor has written what changes if the number goes up, and what changes if it goes down.",
            "Parked answers are the times a measure stayed unpublished as an answer because the decision, the actor, or the move was missing.",
            "Single process means the metric comes from one named business process.",
            "The register is how a meeting records the signals. The rows that follow are written for the illustration on this page. One is the blank brief. One is the brief once it is filled. Neither is a result I collected, and neither states an amount.",
          ],
          lines: [
            { term: "Blocked", detail: "The brief while the decision line is blank." },
            { term: "Measure", detail: "Overdue balance, one extract of open invoices. No amount is written." },
            {
              term: "Decision",
              detail: "Blank. The room has not named whether this publish is the call list or the terms decision.",
            },
            {
              term: "Actor",
              detail: "Two roles are in the room. Neither is written as the actor for this publish.",
            },
            { term: "Action", detail: "Do not publish the extract as an answer." },
            { term: "Outcome", detail: "The extract stayed dark." },
            {
              term: "Filled",
              detail:
                "The same title once the room has named the decision. Decision: whether to extend terms. Actor: the role that extends them. Move if it rises: withhold the extension. Move if it falls: the extension can be offered. Process: the open invoice. Action: publish the invoice extract as that answer. Outcome: the extract is the answer to the terms decision, and the call list stays dark. No amount is written.",
            },
          ],
        },
        {
          id: "question-limits",
          title: "Where I do not use it",
          paragraphs: [
            "Two reports that disagree stay on Reconcile or block. This page does not choose a number between them, and it does not replace the named owner of a definition.",
            "Kimball encourages an atomic grain because it withstands questions you did not plan, and a summary grain presupposes the questions people already share. A table at the atomic grain of a process may exist before a decision is named. I do not offer that table as the answer to a decision I have not named.",
            "Exploration without a named decision is the opening of this page. An unpublished investigation can look through a process before anyone has one. This page blocks the publish as an answer.",
            "The calendar, the blast radius, and the cutover stay on the technology delivery field card, and a slow PD or ECL backtest stays on the Bayesian optimisation card, as on Reconcile or block.",
            "The GAO guide assesses an agency performance plan. I am not running its evaluator's checklist against a report. I am using the relation it requires between a measure and the performance that measure is supposed to assess.",
            "This page names the decision a published measure is for. Keeping that definition in force after the publish is Keep the definition.",
          ],
          sources: [
            KIMBALL_TECHNIQUES,
            GAO_RESULTS,
            { href: DELIVERY_CARD, label: "Technology delivery field card" },
            { href: BAYES_CARD, label: "Bayesian optimisation field card" },
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
          "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/grain/",
          "Kimball Group, Grain (read 16 Oct 2026)",
        ),
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
      number: 3,
      topic: "The change",
      title: "Keep the definition",
      lede: "A filled record and a filled brief can still go stale the next time the query changes. This page is what stays after that meeting: the owner of the definition, the shape the publish promises, and the stop when that shape breaks.",
      rule: "My operating rule: name the owner of the published definition, enforce its shape before the next build, and stop the old publish when that shape breaks.",
      illustration: "The three sheets are an illustration, not a record.",
      reviewed: "16 Oct 2026",
      sections: [
        {
          id: "keep",
          title: "The keep",
          paragraphs: [
            "This is what I leave in place after the record and the brief are filled. A blank field means the publish is not kept. The shape is dbt's model contract. The stop, when that shape breaks, is the contract error. The owner is my rule, and it is the approval the analytics field card requires. A change to the grain is not filled on this worksheet. That change goes back to Reconcile or block.",
          ],
          lines: [
            {
              term: "Owner",
              detail:
                "The role that approves a change to the published definition. One person, or one role. A distribution list is not the owner. The field is filled when that role can restate the grain. Otherwise the publish is not kept.",
            },
            {
              term: "Shape",
              detail:
                "Every column the publish promises, by name and data type, with the contract enforced. The build checks that the query returns that shape. If it does not, the model does not build. The grain sentence stays on the record. This field is the columns.",
            },
            {
              term: "Break",
              detail:
                "A removed column, a changed data type, or a removed or modified constraint on a column the publish already promised. That is a breaking change, and the build raises a contract error. The old publish stops. Adding a column is not a break.",
            },
            {
              term: "Version",
              detail:
                "When other people or systems depend on the model, the breaking change is a new version, and the previous version stays for a migration window. When nothing outside this team depends on it, the break can land at once. The field is filled when one of those two is named.",
            },
            {
              term: "Reopen",
              detail:
                "A change to the grain or the scope, with the column names and types unchanged, goes back to the record. A change to the decision goes back to the brief. A green contract does not close either of those.",
            },
          ],
          sources: [DBT_CONTRACT, DBT_VERSIONS, { href: DATA_CARD, label: "Data analytics field card" }],
        },
        {
          id: "shape",
          title: "What the shape does not catch",
          paragraphs: [
            "dbt's contract is a set of guarantees about the shape of a model that other people and processes query. When it is enforced, the build checks that the query returns every promised column, with the promised data type. The check does not depend on column order. dbt recommends a contract for a public model that reports and other systems rely on. A data test is a different check. It runs on the content after the model has built, and it can be set to warn. The contract fails the build when the shape does not match. I do not use a warn test as a substitute for that failure.",
            "A breaking change, in that contract, is removing a column, changing its data type, removing or modifying a constraint on it, or removing the contracted model. dbt then presents a contract error. Model versions are how the producer of a model that other teams depend on can introduce that break: a new version, the latest bumped, and a window in which the old version can still be referenced. dbt says forcing every consumer to take the break at once is appropriate while the model is still changing quickly, or where the group that depends on it is small. Versions do not remove the cost of keeping two shapes. They put a boundary on it.",
            "The contract does not know the grain. Kimball's declaration is what one row means, in business terms. A query can keep every column name and type and still change which rows are in scope. dbt says fixing a bug in a column's calculation is not a breaking change and does not require a new version. That fix can still change the definition. When it does, I send it back to the record. A green contract is not that record.",
            "The Green Book includes comparisons and reconciliations in ongoing monitoring, and it ties a detective control to a correction that is timely. I use that as the reason a break stops the next publish, rather than waiting for the changed number to be noticed. The standard does not describe a model contract. The stop on a broken shape is the contract's. The owner is my rule.",
          ],
          sources: [DBT_CONTRACT, DBT_VERSIONS, KIMBALL_GRAIN, GAO_RECONCILE],
        },
        {
          id: "keep-scene",
          title: "An illustrative break",
          paragraphs: [
            "This is an illustrative scenario. It is not a record of a portfolio I measured, and it states no amount.",
            "The overdue-balance publish is the invoice grain from the filled record. Charged-off accounts are out of scope. The owner is the role that approved that grain. The contract includes the column that marks that scope. The decision is still whether to extend terms.",
            "A change removes that column. The shape breaks. The build stops. The lit sheet is the publish that was kept. The cracked sheet is the shape that no longer matches. The sheet in the tray is the next version, and it is not the publish until the owner accepts it. No amount is written.",
            "A second change leaves every column name and type in place, and starts treating charged-off accounts as in scope. The contract can stay green. That change is a new record on Reconcile or block. This page does not choose a number between the two scopes. If the room changes the decision from extending terms to a call list, that change is the brief on Name the decision.",
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
            "I track four signals. I have no target times, and these definitions are not results I have collected. A green contract that hides a changed grain is not the practice.",
            "Unowned publishes are published measures whose definition has no named owner.",
            "Shape breaks are builds that stopped because the contract did not match.",
            "Quiet grain changes are green contracts whose grain or scope changed, and the record was not reopened.",
            "Kept versions are breaking changes that still offer the previous version for the migration window.",
            "The rows that follow are written for the illustration on this page. Neither is a result I collected, and neither states an amount.",
          ],
          lines: [
            { term: "Shape break", detail: "The column that marked charged-off accounts out of scope is removed." },
            { term: "Measure", detail: "Overdue balance. No amount is written." },
            { term: "Owner", detail: "The role that approved the invoice grain." },
            { term: "Action", detail: "Stop the build." },
            { term: "Outcome", detail: "The old publish stops. The sheet in the tray is not the publish yet." },
            {
              term: "Quiet change",
              detail:
                "The same title, with every column name and type left in place, and charged-off accounts moved into scope. Action: reopen the record. Outcome: the contract stayed green, and the new scope was not published. No amount is written.",
            },
          ],
        },
        {
          id: "keep-limits",
          title: "Where I do not use it",
          paragraphs: [
            "A model that is still changing, and an exploration that is not offered as an answer, do not get a contract. dbt says introducing this governance while models are still changing complicates later changes.",
            "The comparison of two reports stays on Reconcile or block. This page does not publish a number between them.",
            "The decision, the actor, and the moves stay on Name the decision.",
            "A contract does not apply to a seed, a snapshot, a source, or a Python model. A data test can still run on those.",
            "Adding a column is not a breaking change. I do not open a new version for it.",
            "The calendar, the blast radius, and the cutover stay on the technology delivery field card, and a slow PD or ECL backtest stays on the Bayesian optimisation card.",
          ],
          sources: [
            DBT_CONTRACT,
            DBT_VERSIONS,
            { href: DELIVERY_CARD, label: "Technology delivery field card" },
            { href: BAYES_CARD, label: "Bayesian optimisation field card" },
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
