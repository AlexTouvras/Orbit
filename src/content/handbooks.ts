/**
 * Field handbooks — the method layer.
 * Product owner: docs/product/HANDBOOKS.md
 * Edition 1 extends the SDLC field card. A page is the unit. A hypothesis
 * says so in the first line of that page.
 */

export type ClaimKind = "principle" | "practice" | "hypothesis";

export interface HandbookLink {
  href: string;
  label: string;
}

export interface HandbookLine {
  term: string;
  detail: string;
}

export interface HandbookPage {
  /** 1-based, stable. The public URL uses this number. */
  number: number;
  title: string;
  claim?: ClaimKind;
  paragraphs: string[];
  steps?: string[];
  lines?: HandbookLine[];
  links?: HandbookLink[];
}

/** A contents entry. It opens on `page` and runs until the next entry. */
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

export const SOFTWARE_THAT_STAYS_IN_USE: Handbook = {
  slug: "software-that-stays-in-use",
  index: "01",
  title: "Software that stays in use",
  kicker: "Handbook 01",
  line: "One change.",
  accent: "Four pillars.",
  thesis:
    "How I take one software change through plan, build, release, and the next change.",
  card: { href: SDLC_CARD, label: "SDLC field card" },
  contents: [
    { title: "The change", page: 1 },
    { title: "Plan and design", page: 4 },
    { title: "Build and verify", page: 7 },
    { title: "Release and deploy", page: 10 },
    { title: "Maintain and improve", page: 12 },
    { title: "Monday", page: 14 },
  ],
  pages: [
    {
      number: 1,
      title: "One change",
      paragraphs: [
        "The SDLC field card draws one change moving through four pillars. This book is how I work that change. The card keeps the picture.",
        "I start from a change a person can name: a rule, a screen, a check, a fix. A programme that tries to install a new life cycle is a different job. I do not open this book for that job.",
      ],
      links: [{ href: SDLC_CARD, label: "SDLC field card" }],
    },
    {
      number: 2,
      title: "The same four pillars",
      paragraphs: [
        "Plan and design. Build and verify. Release and deploy. Maintain and improve.",
        "A change walks them in that order. A fix walks them again. I do not open the build because the editor is already up.",
      ],
    },
    {
      number: 3,
      title: "What this book leaves alone",
      paragraphs: [
        "Technology delivery owns the calendars, the proof of blast radius, and the cutover sequence. This book owns the software on that cutover: the page someone reviews, the checks that can fail, the version people run, and the next change.",
        "When the question is when to cut over, I use the delivery field card.",
      ],
      links: [{ href: DELIVERY_CARD, label: "Technology delivery field card" }],
    },
    {
      number: 4,
      title: "The plan fits on a page",
      claim: "principle",
      paragraphs: [
        "Goal, cost, and what done means, on a page a person will actually review.",
        "A file no one will read is not a plan. I write this page before I name a tool.",
      ],
    },
    {
      number: 5,
      title: "Who can reach the data",
      paragraphs: [
        "The same page names who can reach the data, and how that reach can be abused.",
        "I treat that as part of the design. A scan after the merge is late. The person who reviews the page has to see the reach while they can still refuse it.",
      ],
    },
    {
      number: 6,
      title: "A file is not the understanding",
      claim: "practice",
      paragraphs: [
        "A spec file is not shared understanding. Someone has to be able to walk the journey and the ways it can fail before build and verify.",
        "Meetings with nothing written down do not make the change safer. The writing is required. It is not sufficient on its own.",
      ],
    },
    {
      number: 7,
      title: "A gate has to be able to fail",
      claim: "principle",
      paragraphs: [
        "A check that cannot fail is not a gate.",
        "I have watched a suite stay green while the behavior I cared about was wrong. That light is not a stop. The check has to fail when the change is the wrong change.",
      ],
    },
    {
      number: 8,
      title: "Drop the test that lies",
      claim: "practice",
      paragraphs: [
        "A person drops a test that fails for the wrong reason. A renamed label. A clock. A fixture that drifted. The behavior can still be right.",
        "Agent-written tests are drafts until that person has thrown one out. Feedback in the build stays. I do not add a second scoring pass over a task the tree already checks.",
      ],
    },
    {
      number: 9,
      title: "The security check stops the build",
      paragraphs: [
        "The checks named on the plan have to fail the build, beside the tests.",
        "A report that arrives after the merge is a note for the next change. It did not gate this one.",
      ],
    },
    {
      number: 10,
      title: "People run the version just verified",
      paragraphs: [
        "The version in use is the version that passed the gates.",
        "A tight calendar does not point production at a commit that skipped them. The calendar is a delivery question. This page only decides which bytes are allowed to run.",
      ],
      links: [{ href: DELIVERY_CARD, label: "Technology delivery field card" }],
    },
    {
      number: 11,
      title: "The last version stays",
      paragraphs: [
        "The previous version stays one deploy away.",
        "If I cannot put it back, I do not call the new one released. A better version can still be the one you need to leave.",
      ],
    },
    {
      number: 12,
      title: "Use becomes the next change",
      paragraphs: [
        "A defect, or what you learn in use, comes back as the next change.",
        "It does not skip back into the build. It gets a page, then the same pillars. The card draws that return under the track. This book treats it as another change, with an owner.",
      ],
      links: [{ href: SDLC_CARD, label: "SDLC field card" }],
    },
    {
      number: 13,
      title: "A small fix is still a change",
      paragraphs: [
        "A one-line fix goes back through the four pillars.",
        "The diff can be small and still change who can reach the data. I do not skip the page because the patch looks obvious.",
      ],
    },
    {
      number: 14,
      title: "The line before merge",
      claim: "principle",
      paragraphs: [
        "If you cannot name the plan, the test, the security check, and who reviews, you do not merge. If you cannot put the last version back, you do not call it released.",
        "The card already lists seven named practices under the pillars. I leave them there. This book does not add an eighth.",
      ],
      links: [{ href: SDLC_CARD, label: "SDLC field card" }],
    },
    {
      number: 15,
      title: "A scoring rule, made up",
      claim: "hypothesis",
      paragraphs: [
        "This change is synthetic. There is no client, and no count of defects.",
      ],
      lines: [
        {
          term: "Plan",
          detail:
            "A scoring rule changes which applications a person reviews first. Done means the queue order matches the rule, and the person can still open any application.",
        },
        {
          term: "Who can reach the data",
          detail:
            "The casework role that already can. A draft of the rule must not widen that role.",
        },
        {
          term: "Test that must fail",
          detail:
            "A fixture where the rule buries the application the person was told to see first.",
        },
        {
          term: "Security check",
          detail:
            "The build fails if the new path grants a role that was not on the page.",
        },
        {
          term: "Who reviews",
          detail: "The person who owns the queue.",
        },
        {
          term: "Previous version",
          detail: "The last rule, still one deploy away.",
        },
      ],
    },
    {
      number: 16,
      title: "Your change",
      paragraphs: [
        "Take a change you have. Write the page before the code.",
      ],
      steps: [
        "Name the test that fails for the right reason.",
        "Name the security check that fails the build.",
        "Name who reviews.",
        "Name how the last version comes back.",
        "When one of those is missing, the change is still in plan and design.",
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
