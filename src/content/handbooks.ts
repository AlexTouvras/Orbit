/**
 * Field handbooks — the method layer.
 * Product owner: docs/product/HANDBOOKS.md
 * Lines tagged as principle or practice trace to public copy on this site
 * (the chain in profile, the field cards). A hypothesis says so in the sentence.
 */

export type ClaimKind = "principle" | "practice" | "hypothesis";

export type ChainLinkId = "problem" | "data" | "system" | "delivery" | "outcome";

export interface HandbookLink {
  href: string;
  label: string;
}

export interface HandbookLine {
  term: string;
  detail: string;
}

export interface HandbookSection {
  id: string;
  index: string;
  title: string;
  lead: string;
  claim?: ClaimKind;
  paragraphs?: string[];
  steps?: string[];
  lines?: HandbookLine[];
  links?: HandbookLink[];
}

export interface HandbookChapter {
  slug: string;
  index: string;
  /** What this chapter is for in the series: principle, method, or worked example. */
  role: "principle" | "method" | "example";
  roleLabel: string;
  title: string;
  lede: string;
  /** Leading link, and the one link that supports it, when the chapter draws the chain. */
  chain?: { lead: ChainLinkId; support?: ChainLinkId };
  sections: HandbookSection[];
  related: HandbookLink[];
}

export interface Handbook {
  slug: string;
  index: string;
  title: string;
  kicker: string;
  line: string;
  accent: string;
  thesis: string;
  reader: string;
  edition: string;
  nonGoals: string[];
  chapters: HandbookChapter[];
}

export interface LaterHandbook {
  index: string;
  title: string;
  scope: string;
}

export const CHAIN_LINKS: { id: ChainLinkId; label: string }[] = [
  { id: "problem", label: "Business problem" },
  { id: "data", label: "Data" },
  { id: "system", label: "Intelligent system" },
  { id: "delivery", label: "Delivery" },
  { id: "outcome", label: "Measured outcome" },
];

export const CLAIM_LABEL: Record<ClaimKind, string> = {
  principle: "Operating principle",
  practice: "Practice I treat as given",
  hypothesis: "Hypothesis",
};

const STORY_CARD = "/story-field-card/index.html";
const AI_CARD = "/field-card/index.html";
const DATA_CARD = "/analytics-field-card/index.html";
const DELIVERY_CARD = "/delivery-field-card/index.html";
const SDLC_CARD = "/sdlc-field-card/index.html";
const CREDIT_CARD = "/credit-risk-field-card/index.html";
const CUTOFF_STORY = "/stories/where-should-the-cutoff-sit";

export const BUILDING_INTELLIGENT_SYSTEMS: Handbook = {
  slug: "building-intelligent-systems",
  index: "01",
  title: "Building intelligent systems",
  kicker: "Handbook 01",
  line: "Start with the decision.",
  accent: "Then walk one link.",
  thesis:
    "An intelligent system is the chain from a business problem to a measured outcome. The model, the dashboard, and the agent are lanes on that chain.",
  reader:
    "Someone who has to ship a data or AI change that a team will still own on Monday. A peer can use the checklist. A stranger should be able to repeat the decision.",
  edition: "Edition 1 · 13 Oct 2026 · three chapters",
  nonGoals: [
    "A second copy of a field card. The card owns the field. The chapter owns the handoff.",
    "An essay. Those stay on the blog. A decision story stays on /stories.",
    "A client write-up. The worked scene is synthetic, and it says so.",
    "The other four handbooks. They are named below and not written.",
  ],
  chapters: [
    {
      slug: "start-with-the-decision",
      index: "01",
      role: "principle",
      roleLabel: "Foundational principle",
      title: "Start with the decision",
      lede: "Name who decides, what they are deciding, and what done looks like, before a model, a dashboard, or an agent enters the room.",
      chain: { lead: "problem" },
      sections: [
        {
          id: "problem",
          index: "01",
          title: "The problem",
          lead: "A working demo can still leave Monday’s decision with nobody.",
          paragraphs: [
            "A prompt that answers, a chart that renders, and an agent that drafts a note can all be true on the same afternoon. The person who has to change a case, a release, or a forecast still needs a sentence they can act on.",
            "I keep meeting that gap in the work I publish: something runs, and a team still cannot own the call. The storytelling field card puts the remedy in the first move. Name the decision before you draw anything.",
          ],
          links: [{ href: STORY_CARD, label: "Storytelling field card" }],
        },
        {
          id: "principle",
          index: "02",
          title: "The principle",
          lead: "Start with the decision, not the dataset.",
          claim: "principle",
          paragraphs: [
            "That sentence is the storytelling field card, and I use it as the opening rule for a system, not only for a chart. Name who decides, what they are deciding, and what done looks like.",
            "The same idea is the chain I work in public: a business problem, then data, then an intelligent system, then delivery, then a measured outcome. The decision tells you which link you are actually building this time.",
          ],
          links: [{ href: STORY_CARD, label: "Storytelling field card" }],
        },
        {
          id: "framework",
          index: "03",
          title: "The decision framework",
          lead: "Four lines, before a tool has a name.",
          steps: [
            "Who decides.",
            "The decision, in one sentence a stranger can repeat.",
            "The single link of the chain this release changes.",
            "What done looks like on a Monday a person will actually have.",
            "A second link may support the first. Write that support in the same sitting, and leave the other links for a later release.",
          ],
        },
        {
          id: "method",
          index: "04",
          title: "The operating method",
          lead: "The sentence has to survive a stranger. Then you pick the lane.",
          claim: "principle",
          steps: [
            "Say the decision to someone who does not know the project. If they cannot repeat it, rewrite it.",
            "Name the unit you will ship: a report, a release, or a case action. The platform is the lane.",
            "Name what stays with a person. On the AI field card, drafts and runbooks can be machine work. Priority calls and production publish stay human.",
            "Name rollback, or the kill switch, before anyone calls the work done. The delivery field card puts rollback before green.",
          ],
          links: [
            { href: AI_CARD, label: "Agentic AI field card" },
            { href: DELIVERY_CARD, label: "Technology delivery field card" },
          ],
        },
        {
          id: "tools",
          index: "05",
          title: "The tools",
          lead: "Five lines, on the same page as the work.",
          lines: [
            { term: "Decision", detail: "One sentence a stranger can repeat." },
            { term: "Who decides", detail: "A role, and a person if you have one." },
            { term: "Leading link", detail: "The one chain link this release changes." },
            { term: "What stays human", detail: "The call the system must not make." },
            { term: "Rollback", detail: "How you turn it off and leave the old path standing." },
          ],
        },
        {
          id: "tradeoffs",
          index: "06",
          title: "The trade-offs",
          lead: "Some afternoons the calendar chooses the window. The decision is still the first line.",
          claim: "practice",
          paragraphs: [
            "Platform, security, and business calendars sometimes choose the window for you. The delivery field card says to match those calendars, then cut over. Write the outcome before the window. A clean cutover of the wrong change is a finished mistake.",
            "A spike may start at a model, so you can learn whether a draft is even possible. Call it a spike. It becomes a system when the four lines exist and a person owns the decision.",
            "In credit work I treat human oversight on a consequential call as given. I am not citing a paper for that. The credit field card already separates the objects: a score is not the loss you hold.",
          ],
          links: [
            { href: DELIVERY_CARD, label: "Technology delivery field card" },
            { href: CREDIT_CARD, label: "Credit risk field card" },
          ],
        },
        {
          id: "evidence",
          index: "07",
          title: "The evidence",
          lead: "You can point at the sentence, the owner, and the Monday check.",
          claim: "principle",
          paragraphs: [
            "If a stranger cannot say the decision, the unit, and what stays human, the chapter has not been applied. If you cannot name one action or one figure that moves when the system works, you have a demo.",
            "I use that as a gate on my own releases. It is not an industry certification.",
            "A published story on this site asks where a PD cut-off should sit under a volume need and a bad-rate appetite. Ranking skill and the cut-off are different objects there. That story is proof of a decision. It is not proof of the scene in the next section.",
          ],
          links: [
            {
              href: CUTOFF_STORY,
              label: "Where Should the Cut-Off Sit?",
            },
          ],
        },
        {
          id: "application",
          index: "08",
          title: "The field application",
          lead: "A synthetic loan inbox. No client, and no measured result.",
          claim: "hypothesis",
          paragraphs: [
            "Picture a team that wants a chatbot on the application inbox. The sentence I would make them write: a caseworker changes the next action on this application, or they leave it. The bot may draft a note. It does not originate the loan. The owner is the caseworker. Rollback is turning the draft off and leaving the queue as it was.",
            "The leading link is the decision. Delivery supports it, because the kill switch has to exist on the day the draft goes on. I have not run this case. There is no acceptance rate to report.",
          ],
          links: [
            { href: AI_CARD, label: "Agentic AI field card" },
            { href: CREDIT_CARD, label: "Credit risk field card" },
          ],
        },
      ],
      related: [
        { href: STORY_CARD, label: "Storytelling field card" },
        { href: AI_CARD, label: "Agentic AI field card" },
        { href: DELIVERY_CARD, label: "Technology delivery field card" },
        { href: CREDIT_CARD, label: "Credit risk field card" },
        { href: CUTOFF_STORY, label: "Where Should the Cut-Off Sit?" },
      ],
    },
    {
      slug: "walk-the-chain",
      index: "02",
      role: "method",
      roleLabel: "Practical method",
      title: "Walk the chain",
      lede: "Pick the one link this release changes. Write what you pass to the next link, and why the others can wait.",
      chain: { lead: "problem", support: "delivery" },
      sections: [
        {
          id: "problem",
          index: "01",
          title: "The problem",
          lead: "Five words on a slide will swallow a release if you try to rebuild every link.",
          paragraphs: [
            "The chain is public on this site: business problem, data, intelligent system, delivery, measured outcome. People either jump to a tool or open a programme that tries to move all five.",
            "Both skip the handoff. The output of one link has to be something the next link can use on Monday.",
          ],
        },
        {
          id: "principle",
          index: "02",
          title: "The principle",
          lead: "One link leads. Name the supporting link. Say why the rest can wait.",
          claim: "principle",
          paragraphs: [
            "I treat that as the scope rule for a release. The field cards already say how to work inside a link. This chapter is the handoff between them.",
            "If two links are both broken, I ship the one that makes the other measurable. Often that is the grain or the measure. The model can wait until you can see whether it moved anything. That ordering is my rule of thumb. I have not proved it as a general law.",
          ],
        },
        {
          id: "framework",
          index: "03",
          title: "The decision framework",
          lead: "Each link has a pass-forward. The field card owns the work inside the link.",
          steps: [
            "Business problem. Pass forward who decides and what done looks like. The storytelling card starts here.",
            "Data. Question, grain, truth layer, consume path. Pass forward the grain the decision is about. Tools are lanes. The analytics card owns this.",
            "Intelligent system. The thinnest layer that does the job: understand, find, act, orchestrate, and stop at the first layer that works. The AI card owns this. In credit, a score is an input. The loss you hold is a different object.",
            "Delivery. Name the outcome, match platform, security, and business calendars, prove it, and cut over with the previous version still ready. The delivery card and the SDLC card own this.",
            "Measured outcome. One figure, or one action, a Monday review can see. The storytelling card ends on what changes.",
          ],
          links: [
            { href: STORY_CARD, label: "Storytelling field card" },
            { href: DATA_CARD, label: "Data analytics field card" },
            { href: AI_CARD, label: "Agentic AI field card" },
            { href: DELIVERY_CARD, label: "Technology delivery field card" },
            { href: SDLC_CARD, label: "SDLC field card" },
            { href: CREDIT_CARD, label: "Credit risk field card" },
          ],
        },
        {
          id: "method",
          index: "04",
          title: "The operating method",
          lead: "Mark the chain, then write the waits.",
          steps: [
            "Mark the leading link and one supporting link on the chain.",
            "Write one sentence for why each other link is good enough this release.",
            "Write the pass-forward: the sentence, the grain, the thinnest system, the rollback, or the figure. Whichever this link owes the next one.",
            "If you cannot write the pass-forward, you are still inside the link. Go back to that field card before you add another.",
          ],
        },
        {
          id: "tools",
          index: "05",
          title: "The tools",
          lead: "A handoff you can copy onto the release page.",
          lines: [
            { term: "Leading link", detail: "The one this release changes." },
            { term: "Supporting link", detail: "The one that has to move with it." },
            { term: "Pass-forward", detail: "What the next link receives on Monday." },
            {
              term: "Waiting",
              detail: "Each other link, and the sentence that says why it can wait.",
            },
            { term: "Figure", detail: "What you will look at, or the date you will have it." },
          ],
        },
        {
          id: "tradeoffs",
          index: "06",
          title: "The trade-offs",
          lead: "A full walk of the chain is a programme. A release with no figure is a demo you cannot judge.",
          paragraphs: [
            "Walking all five links on every change produces a programme. I would rather ship one link and a figure.",
            "Shipping an intelligent layer with no measure leaves you unable to tell a draft that helps from a draft people ignore. If the figure needs history you do not have, write the date you will have it. Do not pretend the demo is the measure.",
            "I go deep on credit when the decision is a credit decision. The chain stays the same when the decision is a forecast or a cutover. Financial services is the domain I know deepest, and a starting advantage.",
          ],
        },
        {
          id: "evidence",
          index: "07",
          title: "The evidence",
          lead: "You can name the leading link, the supporting link, and the figure.",
          claim: "principle",
          paragraphs: [
            "If the figure cannot exist on this release, the page says why, and the date you will have it. That dated line is the evidence until the figure exists.",
            "A field card that explains the inside of a link is not a substitute for the handoff. Both should be reachable from the release notes.",
          ],
        },
        {
          id: "application",
          index: "08",
          title: "The field application",
          lead: "The same synthetic inbox, now as a handoff.",
          claim: "hypothesis",
          lines: [
            {
              term: "Leading link",
              detail: "The decision. A caseworker changes the next action, or leaves it.",
            },
            {
              term: "Supporting link",
              detail: "Delivery. The draft turns on with a kill switch, and the queue survives without it.",
            },
            {
              term: "Data",
              detail: "The grain is the application. The chat transcript can wait.",
            },
            {
              term: "Intelligent system",
              detail: "A draft note. Origination stays with a person. A score is not the decision.",
            },
            {
              term: "Figure I would ask for",
              detail:
                "The share of drafts a person accepts, edits, or discards in a week. I do not have this number. The scene is made up.",
            },
          ],
          paragraphs: [
            "The hypothesis is narrow: that share tells you whether the draft is in the workflow. I have not measured it, and I am not borrowing a rate from a paper.",
          ],
          links: [
            { href: DATA_CARD, label: "Data analytics field card" },
            { href: CREDIT_CARD, label: "Credit risk field card" },
          ],
        },
      ],
      related: [
        { href: DATA_CARD, label: "Data analytics field card" },
        { href: AI_CARD, label: "Agentic AI field card" },
        { href: DELIVERY_CARD, label: "Technology delivery field card" },
        { href: SDLC_CARD, label: "SDLC field card" },
        { href: CREDIT_CARD, label: "Credit risk field card" },
      ],
    },
    {
      slug: "a-monday-you-can-run",
      index: "03",
      role: "example",
      roleLabel: "Worked example",
      title: "A Monday you can run",
      lede: "One synthetic afternoon. The artifact is a page with the four lines, the chain, the kill switch, and either a figure or a dated reason.",
      chain: { lead: "problem", support: "delivery" },
      sections: [
        {
          id: "problem",
          index: "01",
          title: "The problem",
          lead: "A principle that cannot be done before the queue fills does not change the queue.",
          paragraphs: [
            "Monday already has a calendar, a person who will be asked what changed, and a tool someone wants to turn on. The chapter is useful if that person can finish the page.",
          ],
        },
        {
          id: "principle",
          index: "02",
          title: "The principle",
          lead: "The test of a chapter is a task someone can perform, with the limit still visible.",
          claim: "principle",
          paragraphs: [
            "Agreement with the prose is a weak test. A filled page is the test. The limit stays on the page: what is synthetic, what is unmeasured, and what a person still decides.",
          ],
        },
        {
          id: "framework",
          index: "03",
          title: "The decision framework",
          lead: "The order of the afternoon is the framework.",
          steps: [
            "Write the four lines with the person who decides.",
            "Mark the leading link and the supporting link.",
            "Name the thinnest system and the kill switch.",
            "Name the figure, or the date you will have it.",
            "Stop. Leave the other links for another release, in writing.",
          ],
        },
        {
          id: "method",
          index: "04",
          title: "The operating method",
          lead: "Fill the page in that order. Do not open a design tool first.",
          claim: "hypothesis",
          paragraphs: [
            "This walk uses the synthetic inbox from the earlier chapters. It is a script you can copy onto a real decision by replacing every line. It is not a record of a bank I worked at.",
          ],
          steps: [
            "With the casework lead, write: “A caseworker changes the next action on this application, or they leave it.” If the lead is not in the room, stop. You have a note, and you still need them.",
            "Mark the business problem as the leading link. Mark delivery as the support. Write “data grain is the application” and “the model is a draft” under waiting.",
            "Name the system in one line: a draft note beside the application, with origination unchanged. Name the kill switch: drafts off, queue unchanged.",
            "Write the figure you would review next week, and write “unmeasured — synthetic” beside it until you have a week of real drafts.",
            "Read the page aloud. If a stranger can repeat the decision and the kill switch, the afternoon is done.",
          ],
        },
        {
          id: "tools",
          index: "05",
          title: "The tools",
          lead: "The filled page is the tool. This is the synthetic one.",
          lines: [
            {
              term: "Decision",
              detail: "A caseworker changes the next action on this application, or they leave it.",
            },
            { term: "Who decides", detail: "The caseworker. A lead accepts the sentence." },
            { term: "Leading link", detail: "Business problem." },
            { term: "Supporting link", detail: "Delivery, because the kill switch ships with the draft." },
            {
              term: "What stays human",
              detail: "Origination. The draft cannot approve, decline, or price.",
            },
            { term: "Rollback", detail: "Drafts off. The queue is the queue." },
            {
              term: "Figure",
              detail: "Share of drafts accepted, edited, or discarded in a week. Unmeasured. This page is synthetic.",
            },
            {
              term: "Waiting",
              detail: "A new scorecard. A new inbox product. A chat-transcript warehouse.",
            },
          ],
        },
        {
          id: "tradeoffs",
          index: "06",
          title: "The trade-offs",
          lead: "Two stops are part of the method.",
          paragraphs: [
            "If the person who decides is absent, book them. A page you filled alone is a proposal.",
            "If the draft could change the loan, I would not turn it on while the figure is blank. In this scene the draft cannot change the loan, because origination stays human, so the kill switch can ship before a week of rates exists. The dated line still has to be on the page.",
            "I would rather ship that narrow draft than a chatbot that also tries to originate. The second scope is a different release, with the credit field card in the room.",
          ],
          links: [{ href: CREDIT_CARD, label: "Credit risk field card" }],
        },
        {
          id: "evidence",
          index: "07",
          title: "The evidence",
          lead: "After the afternoon, the page exists. A slide that says transformation does not.",
          paragraphs: [
            "The evidence of the method is the page: four lines, the chain, the kill switch, and a figure or a dated reason. Show it to the person who decides. Ask them to repeat the decision.",
            "The evidence of the system comes later, from the figure. Until then, say the figure is missing. The cut-off story on this site is a separate piece of proof: a policy point on an acceptance frontier, with the limit labeled. Use it when the decision is a cut-off. Do not cite it as the result of this inbox.",
          ],
          links: [{ href: CUTOFF_STORY, label: "Where Should the Cut-Off Sit?" }],
        },
        {
          id: "application",
          index: "08",
          title: "The field application",
          lead: "Run the same order on a decision you actually have.",
          claim: "principle",
          steps: [
            "Replace the inbox sentence with your decision. Keep it to one sentence.",
            "Replace the caseworker with the role that lives with the call.",
            "Keep the kill switch specific to your path. “Turn the feature flag off” counts when the old path still works.",
            "Keep the figure specific, or keep the date. Delete any number you do not have.",
            "Send the page to one person who was not in the room. If they cannot say what changes on Monday, the page is not done.",
          ],
        },
      ],
      related: [
        { href: CREDIT_CARD, label: "Credit risk field card" },
        { href: DELIVERY_CARD, label: "Technology delivery field card" },
        { href: CUTOFF_STORY, label: "Where Should the Cut-Off Sit?" },
      ],
    },
  ],
};

export const HANDBOOKS: Handbook[] = [BUILDING_INTELLIGENT_SYSTEMS];

export const LATER_HANDBOOKS: LaterHandbook[] = [
  {
    index: "02",
    title: "Engineering reliable delivery",
    scope: "SDLC and technology delivery. A roadmap becomes a release a team can own.",
  },
  {
    index: "03",
    title: "Data that drives decisions",
    scope: "Analytics and data. A decision gets a grain, a truth layer, and a consume path.",
  },
  {
    index: "04",
    title: "Decision systems under uncertainty",
    scope: "Credit risk and AI. A consequential call gets a policy, a monitor, and a person.",
  },
  {
    index: "05",
    title: "Leading through systems",
    scope: "Ownership, decision rights, and feedback, without a bottleneck in one person.",
  },
];
