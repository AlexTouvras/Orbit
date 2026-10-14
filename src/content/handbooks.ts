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
}

export interface HandbookFigure {
  kind: "flow" | "pyramid";
  caption: string;
  steps: HandbookFigureStep[];
}

export interface HandbookSection {
  id: string;
  title: string;
  paragraphs?: string[];
  steps?: string[];
  figure?: HandbookFigure;
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
  ],
  pages: [
    {
      number: 1,
      topic: "Continuous integration",
      title: "Keep main releasable",
      lede: "Software stays in use when a team can still change it. Continuous integration keeps that change cheap: people merge to main at least daily, a build tests the merge, and a broken main is the team's work.",
      rule: "My operating rule: keep main releasable, make the failure visible immediately, and do not let a red main become normal.",
      reviewed: "14 Oct 2026",
      sections: [
        {
          id: "decay",
          title: "Why the code stops lasting",
          paragraphs: [
            "Fowler describes the decay as a cost, not a mood. A structure that was reasonable at the start is in the way six months later. Improving it means a deep edit. On a long-lived branch that edit collides with everyone else's work. People remember the week a good change broke the team, and they stop making those changes. The awkward structure stays. New work gets slower.",
            "The reversal he names is refactoring: small, behaviour-preserving changes to the structure, done often, on a build that can tell you the behaviour held. A refactor that sits on a branch for two weeks can improve the code and still be too expensive to merge, because everyone else spent those two weeks building on the old structure. Integrate often enough and the same change is a few hours of adjustment. A clash shows up while the two people can still talk.",
            "That is how I use the phrase software that stays in use. The code lasts because the team can still restructure it. Rare integration is what makes the restructuring too expensive to start.",
          ],
          sources: [FOWLER_REFACTOR],
        },
        {
          id: "practice",
          title: "The practice, and my rule",
          paragraphs: [
            "Fowler's definition is the established practice. Each person merges their work into the shared codebase, together with their colleagues' changes, at least daily. Each merge is verified by an automated build that includes tests, so a fault shows up while the change is small.",
            "A build server that only compiles feature branches does not meet that definition. He calls it semi-integration. You have pulled main into your branch. You have not combined your work with the other branches still open. The collisions wait until someone finally merges.",
            "Hammant describes trunk-based development as one trunk, resistance to long-lived branches, and a main you can release. On that page he also describes a full build on the workstation before anyone else depends on the change. I use that workstation build as a safeguard. I do not treat it as the definition of every trunk-based team. Fowler argues the two names are one practice, and that a build server on feature branches is not it. A team can keep one trunk and still miss his rule, if the merge is rarer than daily or the build does not test it. The invariant I hold is frequent integration and a result you can trust. The tool sequence can vary. The work still has to land on main today, and the build still has to check that landing.",
          ],
          sources: [FOWLER_DAILY, FOWLER_SEMI, FOWLER_TRUNK, HAMMANT],
        },
        {
          id: "day",
          title: "The day",
          paragraphs: [
            "This is the order I use on a full-time team. The pull, the build on the machine that made the change, and the push follow Fowler's walk.",
          ],
          figure: {
            kind: "flow",
            caption: "The commit loop. Repair is part of the loop, not a later project.",
            steps: [
              { term: "Pull", detail: "Take main. If it is red, repair it before a feature." },
              { term: "Change", detail: "A slice that can merge today." },
              { term: "Test", detail: "Run the build before anyone else depends on it." },
              { term: "Integrate", detail: "Pull again, combine, push to main." },
              { term: "Verify", detail: "The integration machine, not the laptop." },
              { term: "Repair", detail: "Fix or revert the break before the next feature." },
            ],
          },
          steps: [
            "Pull main and run the build before you change anything. If it is red, fix that first. A new edit on a red build hides which change failed.",
            "Keep the change small enough to merge the same day. If it will not fit, split it. When the behaviour has to stay off while the code lands, Hammant uses a feature flag or a branch by abstraction. Those keep unfinished behaviour off the path a person uses. They do not make an untested change safe to release.",
            "Run the build on your machine before anyone else can depend on the result. Then pull again, combine, and run it again. Then push.",
            "Wait for the build on the integration machine. A green result on your laptop is not the gate.",
            "A pull request can carry the review when the branch is short-lived and lands the same day. Fowler's warning is the other case: a review that waits for hours or days adds enough friction to break the daily merge.",
          ],
          sources: [FOWLER_DAILY, FOWLER_REVIEW, HAMMANT],
        },
        {
          id: "broken",
          title: "A broken main",
          paragraphs: [
            "A red main is the team's work, not a badge someone notices tomorrow. Fowler's rule, which he takes from Kent Beck, is that nobody has a higher priority than fixing the build. I stop further feature integration. The change that repairs the break, or reverts it, still lands. Normal integration resumes when main is green.",
          ],
          figure: {
            kind: "flow",
            caption: "Feature work waits. The corrective change does not.",
            steps: [
              { term: "Fails", detail: "The integration build goes red." },
              { term: "Stop", detail: "No further feature work lands on main." },
              { term: "Find", detail: "The change that broke it." },
              { term: "Repair", detail: "Fix that change, or revert it. That change still lands." },
              { term: "Resume", detail: "Main is green. Feature integration starts again." },
            ],
          },
          sources: [FOWLER_FIX, { href: SDLC_CARD, label: "SDLC field card" }],
        },
        {
          id: "tests",
          title: "The tests that make the day possible",
          paragraphs: [
            "Daily merging dies if the build is too slow to run, or if red has stopped meaning anything. Fowler's ten minutes is a guideline for the commit build, the one that runs on every push to main. It is not a limit on every later stage. He splits what will not fit. The first stage compiles and runs the localized tests, with slow collaborators replaced by a double. A later stage may hit a real database and take a couple of hours. The first stage is the stop. The second stage is still fixed quickly. It is not the build you wait on before every push.",
            "Vocke, using Mike Cohn's pyramid, is the shape inside those ten minutes. Many small fast tests. Some coarser tests. Very few that drive the whole application. He warns against a test ice-cream cone: a nightmare to maintain, and too slow to run. Test observable behaviour. A test tied to the internal structure breaks when you refactor, the safety net becomes noise, and people stop refactoring.",
            "If the behaviour held and the test went red because a name or a collaborator moved, delete the test or rewrite it against the behaviour. An agent-written test is a draft until a person has done that once.",
            "A control I rely on to stop a bad merge has to be able to fail the build. A review, a policy call, or a check on another cadence is a different control, and I do not describe it as that gate. NIST SP 800-218 says to integrate secure-development practices into the life cycle you already run. Practice PW.1 says you identify the security requirements and the risks the software will face, threat modeling being one form of risk modeling it names, and you track the requirements, the risks, and the design decisions. I use that record to decide which checks are gates.",
          ],
          figure: {
            kind: "pyramid",
            caption:
              "Most of the commit build is fast tests of behaviour. The slow end-to-end checks are few, and they are not the ten-minute loop.",
            steps: [
              { term: "Fast", detail: "Many tests of observable behaviour, close to the change." },
              { term: "Coarser", detail: "Fewer tests across a boundary, still in the commit build when they stay fast." },
              { term: "End to end", detail: "Very few. They can run in a later stage." },
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
            "Can a developer get a meaningful result from the commit build while the change is still small?",
            "How long does a change typically sit before it is on main?",
            "When main is red, who stops, and who restores it?",
            "Do the tests fail because the behaviour changed, or because the structure moved?",
            "Can the team say what would make this change safe to release, separately from the fact that it merged?",
          ],
        },
        {
          id: "measure",
          title: "How I would know",
          paragraphs: [
            "I track three times. How often a change reaches main. How long from that push until the integration build returns a result. How long a red main stays red. A faster build only counts if the main you restore is still one you can release. A green badge with rare merges, or a fast loop that leaves main broken, is not the practice.",
          ],
        },
        {
          id: "limits",
          title: "Where I do not use it",
          paragraphs: [
            "Fowler's limit, which I use: a project with one or two part-time maintainers and contributors they do not work beside. Daily integration is not plausible there. The pull-request workflow came from that setting. Raise the frequency you can. A build badge is not the practice.",
            "The practice fails without the skill under it. No self-testing build, and main goes red for reasons nobody can see. No automation, and the integration itself takes too long to do daily. A team that pushes red and walks away trains everyone else to work on a broken trunk. I do not install the daily merge until the commit build exists and someone will stop for it.",
            "Release calendars, blast-radius proof, and the cutover sequence stay on the technology delivery field card. Fowler separates the two decisions. Once main is releasable, whether to put that build in production is a business decision. Keeping main releasable does not pick the window.",
          ],
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
  ],
};

export const HANDBOOKS: Handbook[] = [SOFTWARE_THAT_STAYS_IN_USE];

export const LATER_HANDBOOKS: LaterHandbook[] = [
  {
    index: "02",
    title: "Engineering reliable delivery",
    card: { href: DELIVERY_CARD, label: "Technology delivery field card" },
  },
  {
    index: "03",
    title: "Data that drives decisions",
    card: { href: DATA_CARD, label: "Data analytics field card" },
  },
  {
    index: "04",
    title: "Decision systems under uncertainty",
    card: { href: CREDIT_CARD, label: "Credit risk field card" },
  },
];
