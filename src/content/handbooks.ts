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
  kind: "flow" | "pyramid" | "loop" | "recovery" | "signals" | "scene" | "compare" | "curve";
  caption: string;
  steps: HandbookFigureStep[];
  columns?: HandbookFigureColumn[];
  /** Axis names for a sketch. The figure states no amount. */
  axes?: { y: string; x: string };
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
      rule: "My operating rule: I name the decision and the person who will act. I decide whether the work is worth the cost of keeping it. I define the number so it answers that decision. I choose technology I can operate. I later ask whether the decision got better. If it did not, I change the work or I stop it.",
      illustration: "The invoice path is an illustration, not a record.",
      reviewed: "19 Oct 2026",
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
            "The tools follow that choice. This illustration takes one report, dbt, DuckDB, and the invoice ledger. Snowflake is refused because the warehouse is not the constraint. A live refresh and a scheduler are refused because the controller can refresh yesterday's list.",
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
            "Run the product and judge the value decides whether to continue, change, or stop, from whether the list is still used, whether it is still fresh enough, and what is still kept. It does not score a return. Name the decision is where a hypothesis is written so it can be checked. The method for separating the offer's effect from everything else is not on this page.",
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
            "Choose the work compares the investment: the outcome, a way that is sufficient, the cost of keeping it, and what to defer. Make the number fit to use is Name the decision, Say what one row means, When two reports don't match, and Keep the definition. Choose the stack names the tools. Keep trust in force keeps the rules. Run the product and judge the value is continue, change, or stop.",
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
      lede: "This page is the brief I fill before a number goes out as the answer. The brief names the decision, the outcome that decision is for, the person who will act, the constraint they have to respect, the one activity, and a hypothesis for a rise and a hypothesis for a fall. A blank line means the number is not that answer.",
      rule: "My operating rule: I can say the decision, the outcome, the person, the constraint, a hypothesis for a rise, and a hypothesis for a fall, and I do not publish the number as the answer until those are named. Each hypothesis is a proposal to check against the outcome.",
      illustration: "The two chairs are an illustration, not a record.",
      reviewed: "18 Oct 2026",
      cover: {
        src: `${DATA_ART}/decision.jpg`,
        alt: "One sheet of light, one chair in that light, and one chair left dark. No amount.",
      },
      sections: [
        {
          id: "brief",
          title: "The brief",
          paragraphs: [
            "This is the sheet I fill when the number will be given to someone as the answer. A blank line means it is not that answer. The Activity line is Kimball's business process. The Outcome line is the goal I write down, so the measure has something to represent. The GAO guide requires that link. The decision, the person, the constraint, the two hypotheses, and the stop are my rule. The field card names the outcome beside the question and the audience. What one row means comes after this sheet. Two reports that disagree are handled on When two reports don't match.",
          ],
          lines: [
            {
              term: "Decision",
              detail:
                "The decision, in the words of the person who will act. A report title does not finish the line. It is filled when someone who missed the meeting can say what is being decided.",
            },
            {
              term: "Outcome",
              detail:
                "The business result that decision is for. What should be true if the decision works. If the outcome is only to see the number, this number is not an answer yet.",
            },
            {
              term: "Actor",
              detail: "Who will act. One person, or one role. A mailing list is not the actor.",
            },
            {
              term: "Constraint",
              detail:
                "The limit the decision has to respect. What they will not do, or what has to stay true. If there is no limit, write that. A blank line is not the same as no limit.",
            },
            {
              term: "If it rises",
              detail:
                "A hypothesis to check, not an order. The response they propose to try if the number goes up. Afterward they compare it with the outcome. If they would do nothing different, this number is not the answer to this decision.",
            },
            {
              term: "If it falls",
              detail:
                "A hypothesis to check, not an order. The response they propose to try if the number goes down. Write both, or set this number aside. Neither one fires by itself.",
            },
            {
              term: "Activity",
              detail:
                "The one activity that produces the number. If the decision needs two activities, they are two numbers.",
            },
            {
              term: "Send it",
              detail:
                "Only when the lines above are filled. A blank line means the table can stay, and it is not the answer. Sending it does not make a hypothesis true. This sheet does not pick a number between two reports.",
            },
          ],
          sources: [KIMBALL_PROCESS, KIMBALL_STEPS, GAO_RESULTS, { href: DATA_CARD, label: "Data analytics field card" }],
        },
        {
          id: "why-lines",
          title: "Why the lines are separate",
          paragraphs: [
            "Kimball's four-step design puts the business first. Before the model is drawn, the team sits with the people who use the numbers. They learn the goals, the problems, how decisions get made, the analysis those people need, and what the source data can support. The design then starts by choosing the business process. That process is a real activity, such as taking an order, handling a claim, or recording every account at month-end. Most fact tables cover one activity. Choosing it is what lets you say what one row means. People from the business take part so the names and the rules are agreed. That meeting learns how decisions get made. It does not fill this brief. A report title is not the activity.",
            "The GAO guide for agency performance plans, April 1998, is about a plan, not a dashboard. It says the measures should show progress toward the goals. When a goal does not measure itself, the measures turn the goal into something you can observe, so the agency can see what happened, decide, and say who is accountable. A measure has to represent the performance it is supposed to assess, or be clearly related to it. The guide's example is a measure that misses its goal: the average time to process a tax return does not represent the goal of making tax-return processing more accurate. The time can be collected carefully and still be the wrong number. I am not running the guide's checklist. I use that link, and I write the goal on the Outcome line. The guide does not give the constraint, and it does not turn a response into an order.",
            "A check can already have passed, and the number can still be the wrong answer. The number came from one activity. The meeting may be deciding something else. The field card names that failure: the wrong question, the wrong audience, or an unclear decision. I read the question as the Decision line, the audience as the Actor, and an unclear decision as a hypothesis that has not been written.",
          ],
          sources: [KIMBALL_STEPS, KIMBALL_PROCESS, KIMBALL_PDF, GAO_RESULTS, { href: DATA_CARD, label: "Data analytics field card" }],
        },
        {
          id: "question-scene",
          title: "An example",
          paragraphs: [
            "This is an illustration. It is not a portfolio I measured, and it states no amount.",
            "One list is titled overdue balance. A row is an open invoice as of yesterday. Everyone agrees what a row is, and there is no second report. Two decisions are in the room. One person will choose which customers to call. Another will decide whether to give an invoice more time to pay. The rows can answer the second decision, because that decision is about an invoice. They are not the call list, because a call is about a customer. Until the brief names which decision this number is for, the list stays dark.",
            "Once the sheet is filled, the decision is whether to give an invoice more time to pay. The outcome is that the account stays current, and the invoice is not written off to get there. The actor is the role that can offer more time. The constraint is that more time may be offered, and the amount owed is not forgiven. The activity is the open invoice. The call list is a second activity, so it is not this number.",
            "If it rises, the hypothesis is to propose no more time. If it falls, the hypothesis is to propose that the extension can be offered. Neither line is an order. After the number moves, the team writes whether they did what they proposed, and whether the account stayed current without a write-off. This illustration stops at the proposal. It does not report that check.",
            "The chair in the light is the role that can offer more time. The dark chair is the call list, which this number does not answer. The invoice list can go out as the answer to the filled brief. No amount is written. If a second list arrives and a row on it is an account at month-end, that disagreement is When two reports don't match.",
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
            "I watch four things. I have no target times, and these definitions are not results I have collected. They are the notes a team writes so the next brief can use the last one. A filled sheet that nobody looks back at does not show that the decisions are getting better.",
            "A said-back brief means a person who missed the meeting can say the decision, the outcome, the constraint, and who will act. If they cannot, the practice is not in use yet. This check comes before any result.",
            "A checked hypothesis means that after they acted, they wrote whether they did what the hypothesis proposed, and whether the outcome moved as they expected. A match is not proof the hypothesis was right. A miss is the note the next brief starts from. That comparison is how the team learns which responses are worth proposing again.",
            "A retired hypothesis means they stopped proposing a response because the outcome did not follow. The retired line is the sign the practice is getting more precise. I am defining the signal. I am not reporting a response I have retired.",
            "A parked answer means the number stayed unpublished because a line on the brief was blank. The stop is working. A parked answer is not a quality score.",
            "The rows below are the illustration on this page. One is the blank sheet. One is the sheet once it is filled. Neither is a result I collected, and neither states an amount.",
          ],
          lines: [
            { term: "Blocked", detail: "The sheet while the decision line is blank. The list stayed dark." },
            { term: "Measure", detail: "Overdue balance. One list of open invoices. No amount is written." },
            { term: "Action", detail: "Do not send the list out as an answer." },
            {
              term: "Filled",
              detail:
                "Decision: whether to give an invoice more time to pay. Outcome: the account stays current, and the invoice is not written off to get there. Actor: the role that can offer more time. Constraint: more time may be offered, and the amount owed is not forgiven. If it rises: propose no more time, then check the outcome. If it falls: propose that the extension can be offered, then check the outcome. Activity: the open invoice. Action: send the invoice list as that answer. The call list stays dark. No amount is written.",
            },
          ],
        },
        {
          id: "question-limits",
          title: "Where I do not use it",
          paragraphs: [
            "What one row means is the next page. This page does not say it. Two reports that disagree stay on When two reports don't match. This page does not pick a number between them.",
            "A search that is not being given to someone as the answer can continue with no brief. This page stops the number that is being given as the answer.",
            "The calendar, the blast radius, and the cutover stay on the technology delivery field card. A slow backtest of probability of default or expected credit loss stays on the Bayesian optimisation card. Keeping the meaning in force after the number goes out is Keep the definition.",
          ],
          sources: [
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
      topic: "Make the number fit",
      title: "Say what one row means",
      lede: "This page comes after the decision is named. It says what one row of the number means, before anyone compares two reports. Kimball calls that the grain: exactly what one record represents, in business words. A report title is not that sentence. A list of columns is not that sentence.",
      rule: "My operating rule: name the thing, the time, what is included, and what is left out, and do not publish the number until the person who will use it can say that row back.",
      illustration: "The one list is an illustration, not a record.",
      reviewed: "18 Oct 2026",
      sections: [
        {
          id: "row-why",
          title: "Why a column list is not enough",
          paragraphs: [
            "The short path is to name the columns and call that the definition. Kimball says that is the most common mistake in his students' designs. The grain ends up the same thing as the primary key, and it is still a mistake to list the dimensions and treat that list as the declaration. He says to anchor the grain first to a clear business object and a set of business rules. The dimensions that carry it then become obvious.",
            "If the grain is not clearly defined at the start, he says the whole design rests on quicksand. Talk about which dimensions to include goes in circles, and facts that do not belong on that row sneak in. A fact has to be true to the grain. In his doctor-bill example, a row is one line on a bill. The amount of that line belongs there. The amount billed to that patient for the whole year does not. Add the lines up and that year-to-date figure becomes nonsense. It is dangerous because it looks trustworthy. He says to leave it off the row and calculate the total in the application.",
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
            "The operating rule at the top of this page is the stop. A design meeting can list the columns and still leave the row unsaid. The decision can be named on Name the decision, and the row can still be blank.",
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
              detail: "What is included.",
            },
            {
              term: "Out",
              detail:
                "What is left out. If nothing is left out, write that. A blank line is not the same as everything.",
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
            "This is an illustration. It is not a portfolio I measured, and it states no amount.",
            "The decision, from Name the decision, is whether to give an invoice more time to pay. The list is titled overdue balance. The title is not the row. While the thing, the time, what is included, or what is left out is blank, the list stays dark.",
            "Once the sheet is filled, a row is an open invoice. The time is as of yesterday. Open invoices are included. Accounts already written off are left out. The person who can give more time can say that sentence back. That sentence is what one row means. No amount is written. There is no second report on this page.",
            "If a second list with the same title arrives, and a row on that list is an account at month-end, that disagreement is When two reports don't match. This page does not pick a number between them.",
          ],
        },
        {
          id: "row-know",
          title: "How I would know",
          paragraphs: [
            "I watch four things. I have no target times, and these definitions are not results I have collected. A column list offered as the definition is not the practice.",
            "An unstated row is a published number whose user cannot say what one row is.",
            "A column list is a published number whose definition is only the names of the columns.",
            "A mixed row is a published total that adds a fact the row does not support. A year-to-date amount sitting on a single line is the shape of that failure. This is the definition of the signal. It is not a case I am reporting.",
            "A parked row is a time the number stayed unpublished because the thing, the time, what is included, or what is left out was blank.",
            "The rows below are written for the illustration on this page. One is the blank sheet. One is the sheet once it is filled. Neither is a result I collected, and neither states an amount.",
          ],
          lines: [
            { term: "Blocked", detail: "The sheet while the thing is blank. The title is not the row." },
            { term: "Measure", detail: "Overdue balance. No amount is written." },
            { term: "Thing", detail: "Blank." },
            { term: "Action", detail: "Do not send the list out." },
            { term: "Outcome", detail: "The list stayed dark." },
            {
              term: "Filled",
              detail:
                "The same title once the row is said. Thing: an open invoice. Time: as of yesterday. In: open invoices. Out: accounts already written off. Say it back: the role that can give more time. Action: keep that sentence as the row. Outcome: that sentence is what one row means. No second report. No amount is written.",
            },
          ],
        },
        {
          id: "row-limits",
          title: "Where I do not use it",
          paragraphs: [
            "The decision, the person who will act, and the moves stay on Name the decision.",
            "Two reports that disagree stay on When two reports don't match. This page does not pick a number between them.",
            "Kimball says to start with the most detailed row the activity captures, because it can answer questions you did not plan. A summary assumes the questions people already share. A summary can exist. It is a different row, and it gets its own table. I do not treat it as the detailed row.",
            "A search that is not being offered as the answer can look at the rows before this sentence is written. This page stops the number that is being given to someone as the answer.",
            "The columns, the owner, and the stop when a column breaks stay on Keep the definition.",
            "The calendar, the blast radius, and the cutover stay on the technology delivery field card. A slow backtest of probability of default or expected credit loss stays on the Bayesian optimisation card.",
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
      lede: "This page is for a number you are about to give someone as the answer, when two reports disagree. What one row means is already written on Say what one row means. The two reports can share a title and still not match. Sending one of them out, or a third number in between, before the difference has a cause, gives that person a figure you cannot defend. A search that is not being offered as the answer can keep both versions.",
      rule: "My operating rule: say what one row means before the two reports are compared, explain the difference or block the publish, and do not publish a number between them.",
      illustration: "The two extracts are an illustration, not a record.",
      reviewed: "18 Oct 2026",
      sections: [
        {
          id: "disagreement",
          title: "Why the middle number gets published",
          paragraphs: [
            "The decision needs a number today. Two systems already show it, and the two figures differ. The short path is to read out the figure someone recognizes, or to place a third figure between them so the meeting has one number. That third figure becomes the baseline the next report is judged against. The difference goes out under a published name, and it is still unexplained.",
            "What one row means was named on Say what one row means. Kimball calls that the grain, and a fact has to be true to it. Different grains are different tables. If the second report will not sit on the named row, it is a different measure. A number placed between the two reports is not that row.",
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
            "The operating rule at the top of this page is that stop. The owner of the definition approves the grain. A green pipeline is not that approval. The analytics field card draws the same stop. Its picture of 4.8%, 6.2%, and 5.1% is a picture of a disagreement, not a result. The published figure in that picture is one grain after the difference is explained. It is not the middle of the two reports.",
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
                "For each difference on the list: the grain, what is included, the definition, the timing, a missing record, or a defect. The explanation is part of the reconciliation. A difference with no cause is the one that blocks the number.",
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
            "This is an illustration. It is not a portfolio I measured, and it states no amount.",
            "The decision, from Name the decision, is whether to give an invoice more time to pay. The row, from Say what one row means, is an open invoice as of yesterday, and accounts already written off are left out. A second list with the same title then arrives. On that list, a row is an account at month-end. While the cause of the difference is blank, the sheet cannot be filled, and both lists stay dark. A figure placed between the two totals would be true to neither row.",
            "Once the sheet is filled, the account-at-month-end list will not sit on the named row, so it is set aside as a different measure. The cause is the grain. The owner accepts the invoice row in writing. The number that goes out is that row. The other list stays dark. Nothing is placed between them, and no amount is written. The person named on Name the decision can use this number for the decision about more time.",
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
            "I watch four things. I have no target times, and these definitions are not results I have collected. A green build that leaves two meanings of the same measure in use is not the practice.",
            "An open disagreement is a published measure whose second report differs, and the difference is not yet named.",
            "Time open runs from the difference appearing until it is explained or the number is blocked.",
            "A blocked publish is a time the gate stopped a number that would otherwise have gone out.",
            "An owned definition is a measure whose grain has a named owner.",
            "The rows below are written for the illustration on this page. One is the block. One is the number that went out. Neither is a result I collected, and neither states an amount.",
          ],
          lines: [
            { term: "Blocked", detail: "The sheet while the cause is blank. The row was already named." },
            { term: "Measure", detail: "Overdue balance. No amount is written." },
            {
              term: "Owner",
              detail: "The role that would approve the grain. While the sheet is blocked, the role is not named, so the field stays blank.",
            },
            { term: "Baseline", detail: "Nothing is published. Two lists carry the same title." },
            {
              term: "Unresolved",
              detail:
                "The rows mean different things. One is an account at month-end, and written-off accounts are left out. The other is an invoice as of yesterday, and written-off accounts are included.",
            },
            { term: "Action", detail: "Block the number." },
            { term: "Outcome", detail: "The number did not go out. Both lists stay dark." },
            {
              term: "Filled",
              detail:
                "The same title once the cause is named. One row: an open invoice as of yesterday, written-off accounts left out. That sentence came from Say what one row means. Other report: the account-at-month-end list, set aside. Cause: the grain. What we do: the owner accepts the invoice row in writing. Action: send that row out. Outcome: that row is the number, and the person on Name the decision can use it. The other list stays dark. No amount is written.",
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
      number: 5,
      topic: "Make the number fit",
      title: "Keep the definition",
      lede: "A filled decision and a filled comparison can still go stale the next time the query changes. This page is what I leave in place: who owns the definition, the columns the number promises, and the stop when those columns break.",
      rule: "My operating rule: name the owner of the published definition, check its columns before the next build, and stop the old number when those columns break.",
      illustration: "The three sheets are an illustration, not a record.",
      reviewed: "18 Oct 2026",
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
            "This is an illustration. It is not a portfolio I measured, and it states no amount.",
            "The overdue-balance number is the invoice row from the filled comparison. Accounts already written off are left out. The owner is the role that approved that row. The contract includes the column that marks that boundary. The decision is still whether to give more time to pay.",
            "A change removes that column. The shape breaks. The build stops. The lit sheet is the number that was kept. The cracked sheet is the shape that no longer matches. The sheet in the tray is the next version, and it is not the number until the owner accepts it. No amount is written.",
            "A second change leaves every column name and type in place, and starts treating written-off accounts as included. The contract can stay green. That change is a new sheet on When two reports don't match. This page does not pick a number between the two meanings. If the meeting changes the decision from giving more time to a call list, that change is the brief on Name the decision.",
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
            "I watch four things. I have no target times, and these definitions are not results I have collected. A green contract that hides a changed grain is not the practice.",
            "An unowned number is a published measure whose definition has no named owner.",
            "A shape break is a build that stopped because the contract did not match.",
            "A quiet change is a green contract whose grain, or what it includes, changed, and the comparison sheet was not reopened.",
            "A kept version is a breaking change that still offers the previous version while people move.",
            "The rows below are written for the illustration on this page. Neither is a result I collected, and neither states an amount.",
          ],
          lines: [
            { term: "Shape break", detail: "The column that marked written-off accounts as left out is removed." },
            { term: "Measure", detail: "Overdue balance. No amount is written." },
            { term: "Owner", detail: "The role that approved the invoice row." },
            { term: "Action", detail: "Stop the build." },
            { term: "Outcome", detail: "The old number stops. The sheet in the tray is not the number yet." },
            {
              term: "Quiet change",
              detail:
                "The same title, with every column name and type left in place, and written-off accounts moved in. Action: reopen When two reports don't match. Outcome: the contract stayed green, and the new meaning was not published. No amount is written.",
            },
          ],
        },
        {
          id: "keep-limits",
          title: "Where I do not use it",
          paragraphs: [
            "A table that is still changing, and a search that is not being offered as an answer, do not get a contract. dbt says turning this on while tables are still changing makes later changes harder.",
            "Comparing two reports stays on When two reports don't match. This page does not publish a number between them.",
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
            "The brief, the row, the cause, and the owner hold today, and I expect them to hold, because the person who will act has to be able to say them. AI can draft the brief, the row sentence, an explanation of two reports, and the columns. A generated explanation is not a cause until that person accepts it.",
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
      lede: "This page names the plates and the tools for a case that was taken, including what was refused. The workload is that case, and the scale it still needs.",
      rule: "My operating rule: I name the workload before I name a tool. A choice with no refusal is not finished. I do not add a plate the decision does not need.",
      illustration: "The invoice stack is an illustration, not a record.",
      reviewed: "18 Oct 2026",
      ground: {
        src: `${DATA_ART}/path.jpg`,
        alt: "",
      },
      sections: [
        {
          id: "stack",
          title: "The workload",
          paragraphs: [
            "Choose the work has already taken the case, or written the reason not to. This page is the stack for a case that was taken.",
            "Scale is whether the number still arrives, for the people who use it, inside the time the decision needs. I name how much data, how many people use the number at once, and how new it has to be. Choose the work refused the scale the decision does not need. I build only what remains.",
            "The plates, the tool names, and the conditions are on the analytics field card. They are the lines below. The sheet is my rule. The refusal is mine.",
          ],
          lines: [
            {
              term: "Workload",
              detail:
                "The case that was taken, with how much data, how many people at once, and how new the number has to be. A report title does not finish the line.",
            },
            {
              term: "Consumption",
              detail:
                "One report, dashboard, or app. Power BI, Looker, or Tableau when that is already the room's tool. A second consume tool is a refusal.",
            },
            {
              term: "Semantic",
              detail:
                "Where the sentence of what one row means is kept. That sentence stays on Say what one row means. This line does not write a new one.",
            },
            {
              term: "Processing",
              detail:
                "dbt, Python, or Jupyter for transform, enrich, and validate. Spark when the volume requires it. When it does not, Spark is the refusal.",
            },
            {
              term: "Sources",
              detail:
                "The internal or external source for this activity. A source that does not feed the decision is the refusal.",
            },
            {
              term: "Platform",
              detail:
                "Databricks, DuckDB, or MotherDuck. Snowflake when the warehouse is the constraint. When the warehouse is not the constraint, write that refusal.",
            },
            {
              term: "Schedule",
              detail:
                "Airflow or Fabric, and only when the path has to run again without the person. It does not define the number. When a person can refresh the list, the scheduler is the refusal.",
            },
            {
              term: "Watching",
              detail:
                "Great Expectations for the tests. OpenLineage for where the number came from.",
            },
            {
              term: "Refused",
              detail:
                "Each tool not taken, with the workload reason. A blank refusal means the choice is not finished.",
            },
          ],
          sources: [{ href: DATA_CARD, label: "Data analytics field card" }],
        },
        {
          id: "stack-scene",
          title: "An example",
          paragraphs: [
            "This is an illustration. It is not a portfolio I measured, and it states no amount.",
            "The case, from Choose the work, is whether one role gives an invoice more time to pay. The organization is Defined. The number is as of yesterday. One person reads one list. The warehouse is not the constraint.",
            "Spark is refused, because the volume does not require it. A screen for every collector, and a number that moves through the day, stay refused. Snowflake is refused, because the warehouse is not the constraint. A second dashboard is refused. A scheduler is refused, because that role can refresh yesterday's list.",
            "What I take is one report, the one that role already opens. I do not name the brand. This is not a record of a room. The semantic layer carries the sentence from Say what one row means: an open invoice as of yesterday, and accounts already written off are left out. dbt builds the table that publishes. I use DuckDB for this illustration, because the list is one machine's work. The source is the invoice ledger. The tests sit on that table. No amount is written.",
          ],
          figure: {
            kind: "flow",
            caption: "The same illustration. The workload, what is taken, and what is refused. It states no amount.",
            steps: [
              {
                term: "Workload",
                detail:
                  "One role. An open invoice as of yesterday. One list. The warehouse is not the constraint.",
              },
              {
                term: "Taken",
                detail:
                  "One report that role already opens. The row sentence. dbt for the table. DuckDB for the list. The invoice ledger.",
              },
              {
                term: "Refused",
                detail:
                  "Spark, a live screen, Snowflake, a second dashboard, and a scheduler.",
              },
            ],
          },
        },
        {
          id: "stack-know",
          title: "How I would know",
          paragraphs: [
            "I watch three things. I have no target times, and these definitions are not results I have collected.",
            "A named workload has the volume, the people, and the freshness, and they match the case that was taken.",
            "A refusal names a tool that was not taken, and the workload reason.",
            "A pasted lane is a list of tools with no workload and no refusal.",
            "The rows below are the illustration on this page. Neither is a result I collected, and neither states an amount.",
          ],
          lines: [
            {
              term: "Refused",
              detail:
                "Spark, a live screen, Snowflake, a second dashboard, and a scheduler. The list is one role, as of yesterday, and the warehouse is not the constraint.",
            },
            {
              term: "Taken",
              detail:
                "One report, the row sentence, dbt, DuckDB, and the invoice ledger. Action: build that stack. No amount is written. No consume brand is named.",
            },
          ],
        },
        {
          id: "stack-limits",
          title: "Where I do not use it",
          paragraphs: [
            "Choose the work decides whether to build. This page does not reopen that choice. It refuses a tool the decision does not need.",
            "The brief, the row, the disagreement, and the contract stay on Make the number fit. A semantic layer does not replace the row sentence. A green contract does not choose the platform.",
            "Keep trust in force is security, governance, observability, evals, and human approve for the numbers that share a system. This page names the monitoring lane. It does not write the lineage method.",
            "A product that is already running is Run the product and judge the value: continue it, change it, or stop the investment.",
            "The calendar, the blast radius, and the cutover stay on the technology delivery field card. A slow backtest of probability of default or expected credit loss stays on the Bayesian optimisation card.",
          ],
          sources: [
            { href: DATA_CARD, label: "Data analytics field card" },
            { href: DELIVERY_CARD, label: "Technology delivery field card" },
            { href: BAYES_CARD, label: "Bayesian optimisation field card" },
          ],
        },
        {
          id: "stack-draft",
          title: "When AI drafts the stack",
          paragraphs: [
            "This page holds today, and I expect it to hold, because the workload has to be the case that was taken, and a tool that was not taken has to be written down. AI can draft a full lane of tools. A full lane is not a choice, and a draft does not make the warehouse the constraint.",
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
      number: 8,
      topic: "Keep trust in force",
      title: "Keep trust in force",
      lede: "This page is what stays true for the numbers that share a system. One number is still Ask, Grain, Truth, and Use. These lines are the trust around it.",
      rule: "My operating rule: I name who can see the number, who can change it, the source and the published measure, the freshness, and a test that can fail before it ships. An unexplained gap stays dark. A blank line means the number is not being kept.",
      illustration: "The invoice trust lines are an illustration, not a record.",
      reviewed: "18 Oct 2026",
      ground: {
        src: `${DATA_ART}/path.jpg`,
        alt: "",
      },
      sections: [
        {
          id: "trust",
          title: "The lines",
          paragraphs: [
            "Make the number fit keeps one number. Choose the stack names the tools. This page is what stays true the next time that number is used, and for the next number on the same system.",
            "The card's lines are security, governance, observability, evals, and human approve. Security is who can see and change the number. Governance is a named owner who approves the definition. Observability is lineage from the source to the published measure. Evals are tests on gold before a number ships. Human approve means an unexplained gap stays dark. The card's gate traces lineage, and a disagreement is resolved or blocked before the number reaches the decision.",
            "I read gold as the table that is about to go out. Freshness is the freshness already named on Choose the stack. The sheet is my rule for how a line is filled. The five names are the card's.",
          ],
          lines: [
            {
              term: "See",
              detail: "Who can see the number. One role. A mailing list is not the role.",
            },
            {
              term: "Change",
              detail:
                "Who can change the number or the definition. One role. This is the owner on Keep the definition. The same person may see it and change it. Both lines are still filled.",
            },
            {
              term: "Lineage",
              detail:
                "The source and the published measure, in one sentence a person can say. The card calls that lineage from the source to the published measure. OpenLineage is the card's tool for where the number came from. This line is the sentence.",
            },
            {
              term: "Fresh",
              detail:
                "How new the number has to be, from Choose the stack. If the number is older than that, it is not the answer.",
            },
            {
              term: "Test",
              detail:
                "A test that can fail before the number ships. The card calls that a test on gold. I read gold as the table about to go out. The stop when the columns break stays on Keep the definition.",
            },
            {
              term: "Dark",
              detail:
                "An unexplained gap stays dark. The cause is written on When two reports don't match, or the number does not stay up.",
            },
            {
              term: "Again",
              detail:
                "The lines above are still true the next time the number is used. The Green Book includes comparisons and reconciliations in ongoing monitoring, and it ties a detective control to a correction that happens in time. I use that as the reason these lines are checked again.",
            },
          ],
          sources: [
            { href: DATA_CARD, label: "Data analytics field card" },
            GAO_RECONCILE,
          ],
        },
        {
          id: "trust-scene",
          title: "An example",
          paragraphs: [
            "This is an illustration. It is not a portfolio I measured, and it states no amount.",
            "The number, from the earlier pages, is whether one role gives an invoice more time to pay. The list is as of yesterday. The source is the invoice ledger. Accounts already written off are left out.",
            "The role that can offer more time can see the list. The role that approved the row can change it. The lineage sentence is the invoice ledger to that list. If the list is older than yesterday, it does not go out as that answer. The test is the one on Keep the definition: if the column that marks written-off accounts breaks, the build stops. If a second list arrives and the cause is blank, the number stays dark. The call list was not taken, so it is not on this system. No amount is written.",
          ],
          figure: {
            kind: "flow",
            caption: "The same illustration. Who can see it, where it came from, and the gap that stays dark. It states no amount.",
            steps: [
              {
                term: "See",
                detail:
                  "The role that can offer more time can see the list. The role that approved the row can change it.",
              },
              {
                term: "Lineage",
                detail: "The invoice ledger to that list, as of yesterday. Written-off accounts stay out.",
              },
              {
                term: "Dark",
                detail: "A second list with no cause stays dark. The call list is not on this system.",
              },
            ],
          },
        },
        {
          id: "trust-know",
          title: "How I would know",
          paragraphs: [
            "I watch three things. I have no target times, and these definitions are not results I have collected.",
            "A said line means a person who missed the meeting can say who sees the number, who changes it, and the source and the measure.",
            "A stale number went out older than the freshness that was named.",
            "A lit gap is a published number whose second report differs, and the cause is blank.",
            "The rows below are the illustration on this page. Neither is a result I collected, and neither states an amount.",
          ],
          lines: [
            {
              term: "Kept",
              detail:
                "See: the role that can offer more time. Change: the role that approved the row. Lineage: the invoice ledger to the list, as of yesterday. A list older than yesterday stays dark. No amount is written.",
            },
            {
              term: "Dark",
              detail:
                "A second list arrives and the cause is blank. Action: the number stays dark. The call list is not on this system.",
            },
          ],
        },
        {
          id: "trust-limits",
          title: "Where I do not use it",
          paragraphs: [
            "The brief, the row, the disagreement, and the contract stay on Make the number fit. This page does not fill them again.",
            "Choose the stack picks the tools. OpenLineage is the card's name for where the number came from. This page keeps the sentence. It does not install the tool.",
            "This page names the role that can see the number and the role that can change it. It does not choose a login product.",
            "Completeness, validity, and timeliness are not lines on this sheet.",
            "A number someone has already acted on is a review of a figure that already went out. That review is When two reports don't match.",
            "Continue the product, change it, or stop the investment is Run the product and judge the value.",
            "The calendar, the blast radius, and the cutover stay on the technology delivery field card. A slow backtest of probability of default or expected credit loss stays on the Bayesian optimisation card.",
          ],
          sources: [
            { href: DATA_CARD, label: "Data analytics field card" },
            GAO_RECONCILE,
            { href: DELIVERY_CARD, label: "Technology delivery field card" },
            { href: BAYES_CARD, label: "Bayesian optimisation field card" },
          ],
        },
        {
          id: "trust-draft",
          title: "When AI drafts the lines",
          paragraphs: [
            "This page holds today, and I expect it to hold, because a person has to be able to say who can see the number, who can change it, and the source and the measure. AI can draft those sentences and a diagram of the path. A draft is not that person, and a diagram is not the lineage until they can say it. An unexplained gap still stays dark.",
          ],
        },
      ],
      sources: [
        { href: DATA_CARD, label: "Data analytics field card" },
        source(
          "https://www.gao.gov/assets/gao-25-107721.pdf",
          "GAO, Standards for Internal Control in the Federal Government, GAO-25-107721 (May 2025)",
        ),
        { href: DELIVERY_CARD, label: "Technology delivery field card" },
        { href: BAYES_CARD, label: "Bayesian optimisation field card" },
      ],
    },
    {
      number: 9,
      topic: "Run the product and judge the value",
      title: "Run the product and judge the value",
      lede: "This page is a product that is already running. I continue it, change it, or stop the investment. The case was already taken.",
      rule: "My operating rule: I continue only when the person still uses the number for the decision that was taken, and the number still arrives inside the time that decision needs. Otherwise I change the line that failed, or I stop. A blank call is not a continue.",
      illustration: "The invoice review is an illustration, not a record.",
      reviewed: "18 Oct 2026",
      ground: {
        src: `${DATA_ART}/path.jpg`,
        alt: "",
      },
      sections: [
        {
          id: "value",
          title: "The review",
          paragraphs: [
            "Keep trust keeps the lines true the next time the number is used. This page is whether the product should still be kept.",
            "The product is the case that was taken. The decision and the person are the ones on that case. If the decision has changed, that is a new case on Choose the work. This page does not take it.",
            "Scale is whether the number still arrives, for the people who use it, inside the time the decision needs. Choose the work refused the scale the decision did not need. Choose the stack built what remained. If that scale has stopped, the call is change or stop.",
            "The sheet is my rule for the call.",
          ],
          lines: [
            {
              term: "Product",
              detail:
                "The case that was taken. The decision, and the person who would act. A report title does not finish the line.",
            },
            {
              term: "Used",
              detail:
                "The person still uses the number for that decision. If they do not, the product is not in use.",
            },
            {
              term: "Arrives",
              detail:
                "The number still arrives, for the people who use it, inside the time the decision needs. If it does not, the scale has stopped.",
            },
            {
              term: "Answer",
              detail:
                "Ask, Grain, Truth, and Use can still be said. A blank line is not a score. It goes back to the page that owns it.",
            },
            {
              term: "Kept",
              detail:
                "The people and the tools still kept for this product. The tools are the ones taken on Choose the stack. A tool that was refused is not on this line. If nothing is still kept, write that. A blank line is not the same as nothing.",
            },
            {
              term: "Call",
              detail:
                "Continue, change, or stop, with the reason. Continue when the person still uses it, it still arrives, and the four steps can still be said, and what is kept is still needed for that decision. Change when the decision is the same and one line has failed. Name the page that owns the failed line. Stop when the person no longer acts, or what is kept is no longer needed, or the rung in force cannot keep the scale. A blank call is not a continue.",
            },
          ],
        },
        {
          id: "value-scene",
          title: "An example",
          paragraphs: [
            "This is an illustration. It is not a portfolio I measured, and it states no amount.",
            "The product, from the earlier pages, is whether one role gives an invoice more time to pay. The organization is Defined. The list is as of yesterday. What is kept is that role's refresh of the list, one report, dbt, DuckDB, and the invoice ledger.",
            "On one review, the role still uses the list for that decision. The list still arrives as of yesterday. Ask, Grain, Truth, and Use can still be said. What is kept is still what that decision needs. The call is continue. No amount is written.",
            "On the next review, the same role needs the list before the day starts. Yesterday is too old. The decision has not changed. The freshness has. The call is change, and the change is the freshness on Choose the stack. This page does not pick a new platform.",
            "On the last review, the role no longer decides more time from this list. The list is still refreshing. The call is stop. The reason is that the person no longer acts. The call list was never this product. No amount is written.",
          ],
          figure: {
            kind: "flow",
            caption:
              "The same illustration. One review continues, one changes the freshness, and one stops. It states no amount.",
            steps: [
              {
                term: "Continue",
                detail:
                  "The role still uses the list. It arrives as of yesterday. What is kept is still what that decision needs.",
              },
              {
                term: "Change",
                detail:
                  "The same decision. The list is needed before the day starts. The change is the freshness on Choose the stack.",
              },
              {
                term: "Stop",
                detail:
                  "The role no longer decides more time from this list. The list is still refreshing. The call list was never this product.",
              },
            ],
          },
        },
        {
          id: "value-know",
          title: "How I would know",
          paragraphs: [
            "I watch three things. I have no target times, and these definitions are not results I have collected.",
            "A said use means a person who missed the meeting can say who still uses the number, and for which decision.",
            "A stopped scale is a number that went out older than the time the decision needs, or to people the case did not name, while the call was still continue.",
            "A silent product is still running, and nobody has written continue, change, or stop.",
            "The rows below are the illustration on this page. None is a result I collected, and none states an amount.",
          ],
          lines: [
            {
              term: "Continued",
              detail:
                "The role that can offer more time still uses the list. It arrives as of yesterday. What is kept is that role's refresh, one report, dbt, DuckDB, and the invoice ledger. Call: continue. No amount is written.",
            },
            {
              term: "Changed",
              detail:
                "The same decision. The list is needed before the day starts. Call: change the freshness on Choose the stack. No platform is named. No amount is written.",
            },
            {
              term: "Stopped",
              detail:
                "The role no longer decides more time from this list. The list is still refreshing. Call: stop. The call list was never this product.",
            },
          ],
        },
        {
          id: "value-limits",
          title: "Where I do not use it",
          paragraphs: [
            "Choose the work decides whether to start. This page is a product that is already running.",
            "The brief, the row, the disagreement, and the contract stay on Make the number fit. A blank line there goes back to that page. It is not a score.",
            "Choose the stack names the tools. A freshness that no longer fits goes back there. This page does not pick a platform.",
            "Keep trust names who can see the number and who can change it. This page does not rewrite those lines.",
            "A number someone has already acted on, when two reports disagree, is When two reports don't match.",
            "Whether they did what the hypothesis proposed, and whether the outcome moved, is the note on Name the decision. This page does not report that check.",
            "The card's ladder is the rung already named on Choose the work. I do not continue a product so the organization can climb it.",
            "The calendar, the blast radius, and the cutover stay on the technology delivery field card. A slow backtest of probability of default or expected credit loss stays on the Bayesian optimisation card.",
          ],
          sources: [
            { href: DATA_CARD, label: "Data analytics field card" },
            { href: DELIVERY_CARD, label: "Technology delivery field card" },
            { href: BAYES_CARD, label: "Bayesian optimisation field card" },
          ],
        },
        {
          id: "value-draft",
          title: "When AI drafts the review",
          paragraphs: [
            "This page holds today, and I expect it to hold, because a person has to say whether the number is still used for the decision that was taken, and the call has to be continue, change, or stop. AI can draft the review and a recommendation to continue. A draft does not name that person, and a recommendation is not the call until they accept it.",
          ],
        },
      ],
      sources: [
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
