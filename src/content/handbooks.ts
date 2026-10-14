/**
 * Field handbooks — the method layer.
 * Product owner: docs/product/HANDBOOKS.md
 * Edition 1 extends the SDLC field card. One page is written.
 * Sources for that page were opened on 2026-10-14. See the page.
 */

export type ClaimKind = "principle" | "practice" | "hypothesis";

export interface HandbookLink {
  href: string;
  label: string;
}

export interface HandbookSection {
  id: string;
  title: string;
  paragraphs?: string[];
  steps?: string[];
}

export interface HandbookPage {
  /** 1-based, stable. The public URL uses this number. */
  number: number;
  title: string;
  claim?: ClaimKind;
  lede: string;
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
  kicker: string;
  line: string;
  accent: string;
  thesis: string;
  /** Shown on the cover. The unread rest of the book. */
  rest: string;
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
const NIST = "https://csrc.nist.gov/projects/ssdf";
const NIST_PDF =
  "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-218.pdf";

export const SOFTWARE_THAT_STAYS_IN_USE: Handbook = {
  slug: "software-that-stays-in-use",
  index: "01",
  title: "Software that stays in use",
  kicker: "Handbook 01",
  line: "Keep main",
  accent: "releasable.",
  thesis:
    "A codebase stays changeable when everyone merges to main at least daily, and a build tests that merge before anyone builds on it.",
  rest: "Only this page is written. The next page waits until this one has been read.",
  card: { href: SDLC_CARD, label: "SDLC field card" },
  contents: [{ title: "Keep main releasable", page: 1 }],
  pages: [
    {
      number: 1,
      title: "Keep main releasable",
      claim: "practice",
      lede: "Software stays in use when a team can still change it. This page is the practice that makes the change cheap enough to keep doing.",
      sections: [
        {
          id: "job",
          title: "The job of this page",
          paragraphs: [
            "The SDLC field card draws one change moving through four pillars. Under named practices it points at continuous integration, and the line under that link is: a broken trunk is the incident. This page is how I run that practice.",
            "The procedure below follows Martin Fowler’s Continuous Integration article, revised 18 January 2024, Paul Hammant’s trunk-based development site, and Ham Vocke’s Practical Test Pyramid of 26 February 2018. The links are at the end of the page.",
          ],
        },
        {
          id: "decay",
          title: "Why the code stops lasting",
          paragraphs: [
            "Fowler’s account of decay is the one I am using. A structure that was reasonable at the start is in the way six months later. Improving it means a deep edit. On a long-lived branch that edit collides with everyone else’s work. People remember the week a good change broke the team, and they stop making those changes. The awkward structure stays. New work gets slower.",
            "The reversal he names is refactoring: small, behaviour-preserving changes to the structure, done often, on top of a build that can tell you the behaviour held. A refactor that sits on a branch for two weeks can improve the code and still be too expensive to merge, because everyone else spent those two weeks building on the old structure. Integrate often enough and the same change is a few hours of adjustment. A clash shows up while the two people can still talk.",
            "That is the mechanism I mean by software that stays in use. The code lasts because the team can still restructure it. Rare integration is what makes the restructuring too expensive to start.",
          ],
        },
        {
          id: "practice",
          title: "What the practice is",
          paragraphs: [
            "Fowler’s definition, which I am treating as the rule: each person merges their work into the shared codebase, together with their colleagues’ changes, at least daily. Each of those merges is verified by an automated build that includes tests, so an integration fault shows up while the change is small.",
            "A build server that only compiles feature branches is a different practice. He calls it semi-integration. You have pulled main into your branch. You have not combined your work with the other branches still open. The collisions wait until someone finally merges, which is the expensive moment the practice exists to avoid.",
            "Hammant describes the same constraint as trunk-based development. One trunk. Developers resist long-lived branches. Short-lived branches are for review and for the build check, and they come from a single workstation. The team runs the build, including unit and integration tests, on that machine before the rest of the team can depend on the change. Main stays in a state you can release. Fowler treats the two names as one practice and prefers the older name, continuous integration. I link both. The test I will use is whether the work landed on main today, not what the tool is called.",
          ],
        },
        {
          id: "day",
          title: "The day",
          paragraphs: [
            "This is the order I want on a full-time team. It follows the walk Fowler gives, without his example.",
          ],
          steps: [
            "Pull main and run the build before you change anything. If it is red, fix that first. A new edit on a red build hides which change failed.",
            "Keep the change small enough to merge the same day. If it will not fit, split it. Hammant’s escape for a change that has to last longer is a feature flag or a branch by abstraction, so main still accepts the unfinished work without turning it on.",
            "Run the build on your machine before anyone else can depend on the result. Then pull again, combine, and run it again. Then push.",
            "Wait for the build on the integration machine. A green result on your laptop is not the gate. Fowler’s phrase for the gap is the usual one: works on my machine.",
            "If the integration build is red, fix it before the next change. That is his rule, and it is the card’s incident. A red main is the team’s work, not a badge someone notices tomorrow.",
            "A pull request can carry the review when the branch is short-lived and lands the same day. A review that waits for days is a long-lived branch with a different name.",
          ],
        },
        {
          id: "tests",
          title: "The tests that make the day possible",
          paragraphs: [
            "Daily merging dies if the build is too slow to run, or if red has stopped meaning anything. Fowler’s guideline for the commit build, the one that runs on every push to main, is the old extreme-programming limit of about ten minutes. He splits what will not fit. The first stage compiles and runs the localized tests, with slow collaborators replaced by a double. A later stage may hit a real database and take a couple of hours. People treat the first stage as the stop. They still fix the second stage quickly. They do not pretend the slow stage is the one they run before every push.",
            "Vocke, using Mike Cohn’s pyramid, is the shape I want inside that ten minutes. Many small fast tests. Some coarser tests. Very few that drive the whole application. He calls the inverted suite an ice-cream cone: slow, and miserable to maintain. He also draws the line I will enforce on a single test. Test observable behaviour. A test tied to the internal structure breaks when you refactor, the safety net becomes noise, and people stop refactoring. That is the decay, arriving through the test suite.",
            "The field card already says a person drops tests that do not fail for the right reason. On this page that means: if the behaviour held and the test went red because a name or a collaborator moved, delete the test or rewrite it against the behaviour. An agent-written test is a draft until a person has done that once.",
            "Security checks belong in the same build, or they are not a gate. NIST Special Publication 800-218 says practices like the Secure Software Development Framework have to be added into the life cycle you already run, because most life-cycle models do not specify security. Practice PW.1 says you identify the security requirements and the risks during design, threat modeling being one form it names, and PW.1.2 says you keep a record of the requirements, the risks, and the design decisions. I have not written the design page, so I will not invent a threat-model template here. The limit for this page is narrower: a check I cannot name does not go in the build, and a check I can name has to be able to fail it.",
          ],
        },
        {
          id: "limits",
          title: "Where I will not use it",
          paragraphs: [
            "Fowler’s limit, which I am keeping: a project with one or two part-time maintainers and contributors they do not work beside. Daily integration is not plausible there. The pull-request workflow came from that setting. Raise the frequency you can. Do not describe a build badge as the practice.",
            "He also says the practice fails without the skill underneath it. No self-testing build, and main goes red for reasons nobody can see. No automation, and the integration itself takes too long to do daily. A team that pushes red and walks away trains everyone else to work on a broken trunk. I would not introduce the daily merge until the commit build exists and someone is willing to stop for it.",
            "Release calendars, blast-radius proof, and the cutover sequence stay on the technology delivery field card. Fowler separates the two decisions. Once main is releasable, whether to put that build in production is a business decision. This page gets main to that state. It does not pick the window.",
          ],
        },
      ],
      sources: [
        { href: FOWLER_CI, label: "Martin Fowler, Continuous Integration (18 Jan 2024)" },
        { href: TRUNK, label: "Paul Hammant, trunk-based development" },
        { href: PYRAMID, label: "Ham Vocke, The Practical Test Pyramid (26 Feb 2018)" },
        { href: NIST, label: "NIST SSDF, SP 800-218" },
        { href: NIST_PDF, label: "NIST SP 800-218, the PW.1 pages" },
        { href: SDLC_CARD, label: "SDLC field card" },
        { href: DELIVERY_CARD, label: "Technology delivery field card" },
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
