import type { ComponentType, SVGProps } from "react";
import type { LucideIcon } from "lucide-react";
import { Bot, GitBranch, Landmark, LineChart, Mail, Globe, Route, ScrollText } from "lucide-react";
import { GithubIcon, LinkedinIcon, XIcon } from "@/components/ui/BrandIcons";

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Resolve a social platform icon by its label (case-insensitive).
 * Used by the content loader so Studio-edited socials (stored as plain
 * label/href text) still render the right glyph. Unknown labels get a globe.
 */
export function socialIconFor(label: string): IconComponent {
  switch (label.trim().toLowerCase()) {
    case "github":
      return GithubIcon;
    case "linkedin":
      return LinkedinIcon;
    case "x":
    case "twitter":
      return XIcon;
    case "email":
    case "mail":
      return Mail;
    default:
      return Globe;
  }
}

export interface SocialLink {
  label: string;
  href: string;
  icon: IconComponent;
}

export interface Competency {
  title: string;
  /** Compact label for the identity HUD tile. */
  shortTitle: string;
  description: string;
  /** Field-card thesis on the identity HUD (Home keeps `description`). */
  hudTitle?: string;
  hudVerbs?: string;
  hudDescription?: string;
  accent: "cyan" | "violet" | "blue" | "amber";
  icon: LucideIcon;
  /** Optional deep link (e.g. field card) — makes the home card pressable. */
  href?: string;
  hrefLabel?: string;
}

export const profile = {
  name: "Alex Touvras",
  handle: "@alextouvras",
  // Used by the Portfolio page to auto-showcase your public repos.
  githubUsername: "alextouvras",
  role: "AI & Data Systems Lead",
  location: "Vantaa, Finland",
  /** Big home line. Second line takes the gradient. */
  headlineLine: "Drafts take seconds.",
  headlineAccent: "The call does not.",
  tagline:
    "Building and leading data & AI systems that solve complex business problems.",
  /** One line on the identity HUD — stranger-readable, no workshop slang. */
  cardTagline:
    "Building and leading data & AI systems that solve complex business problems.",
  /** Hub kicker under the name — capability breadth along the chain. */
  pillars: "AI · Data · Delivery · Credit · SDLC · Story",
  /** Primary contact CTA — replaces a separate “open to …” pill. */
  contactCta: "Get in touch about a role",
  availability:
    "Open to AI & Data Systems, delivery, and analytics roles",
  yearsExperience: "7+",
  summary:
    "I build and lead systems along the chain from business problems to data, intelligent systems, delivery, and measurable outcomes. Financial services is the domain I know deepest — credit risk, portfolio analytics, then Azure application operations at Santander Nordics — and a starting advantage, not a ceiling. Orbit is the public HQ: essays, portfolio proof, live desks, and automation that waits for a human Approve.",
  /** Short brand line — why the site is called Orbit (Hub + About). */
  whyOrbit:
    "An orbit is a stable relationship around a center. The gravity here is how I build: systems, gates, and the habit of getting better. What orbits are the products, essays, signals, and projects that come out of that.",
  /** Fuller name story for About (essay has the full version). */
  whyOrbitDetail:
    "An orbit is a stable relationship around a center. The center isn't the portfolio card or the latest post. It's the gravitational force that keeps the work from drifting: owned files in git, diagrams that stay with the code, automation that waits for a human Approve, and a commitment to evolve the way I build instead of chasing a prettier homepage. What orbits that center are the products I ship, the Blog essays, the Related signals, workshop projects, and field cards. They move on different schedules. They stay in range because the process at the middle holds.",
  resumeUrl: "/resume.pdf",
  /** Pixel-art mark — Hub/About hero beside name. Native sprite in public/. */
  avatarUrl: "/avatar-pixel-64.png",
  email: "a.touvras@gmail.com",
  contactBlurb:
    "Happy to talk AI and data systems, delivery, and hard business problems — especially where financial-domain depth helps.",
  /** Public repos shown on Portfolio. Empty = show newest non-fork repos (legacy). */
  githubRepoAllowlist: [
    "powerbi-portfolio",
    "ProjectBrain",
    "ledger",
    "agentic-ai-field-card",
    "data-analytics-field-card",
    "technology-delivery-field-card",
  ],
} as const;

export const competencies: Competency[] = [
  {
    title: "AI Orchestration & Automation",
    shortTitle: "AI",
    description:
      "Bounded agent loops with an owner and a kill switch: drafts and runbooks yes; priority calls and production publish stay human.",
    hudTitle: "Agentic AI is a loop, not a menu",
    hudVerbs: "Understand → find → act → orchestrate",
    hudDescription:
      "Knowledge, a control loop, tools, then peers if you need them. Start at the thinnest layer that solves the job.",
    accent: "cyan",
    icon: Bot,
    href: "/field-card/index.html",
    hrefLabel: "Field card",
  },
  {
    title: "Data & Analytics",
    shortTitle: "Data",
    description:
      "Python, SQL, and Power BI / Fabric — gold tables, semantic models, and page paths that survive a cold Monday open.",
    hudTitle: "Analytics is a stack, not a dashboard",
    hudVerbs: "Ask → name → define → consume",
    hudDescription:
      "Question, grain, truth layer, consume path: those are the layers. Tools are lanes.",
    accent: "blue",
    icon: LineChart,
    href: "/analytics-field-card/index.html",
    hrefLabel: "Field card",
  },
  {
    title: "Technology Delivery",
    shortTitle: "Delivery",
    description:
      "Sequencing Azure and middleware changes across platform, security, and business calendars — evidence before the call, rollback before green.",
    hudTitle: "Delivery is a sequence, not a ticket",
    hudVerbs: "Name → calendar → prove → cut over",
    hudDescription:
      "Intent, window, proof, cutover: those are the layers. Methods are lanes. Name rollback before anyone calls it done.",
    accent: "violet",
    icon: Route,
    href: "/delivery-field-card/index.html",
    hrefLabel: "Field card",
  },
  {
    title: "Software Development Life Cycle",
    shortTitle: "SDLC",
    description:
      "Check the goal and the cost, write what users need, design who can reach the data, write the code, and test the bugs and the security holes before anyone calls it done. The release window sits on Delivery.",
    hudTitle: "Write the plan before the code",
    hudVerbs: "Plan → specify → design → build → test",
    hudDescription:
      "Goal and cost first, then the rules and user needs. Design names who can reach the data. Then the code, then tests for bugs and security holes. The release window sits on Delivery.",
    accent: "violet",
    icon: GitBranch,
    href: "/sdlc-field-card/index.html",
    hrefLabel: "Field card",
  },
  {
    title: "Credit Risk Management",
    shortTitle: "Credit",
    description:
      "Loan origination and IFRS 9: creditworthiness in the engine, watch the book, stage on SICR, hold 12-month or lifetime ECL.",
    hudTitle: "Credit risk is a lifetime, not a cutoff",
    hudVerbs: "Decide → watch → stage → hold",
    hudDescription:
      "Originate, monitor, stage, provision: those are the layers. Models are lanes. A score is not the loss you hold.",
    accent: "amber",
    icon: Landmark,
    href: "/credit-risk-field-card/index.html",
    hrefLabel: "Field card",
  },
  {
    title: "Data & Visual Storytelling",
    shortTitle: "Story",
    description:
      "One question, the figures that answer it, then one picture you can move. Source, lag, and the limit sit in the close. A chart gallery is not a story.",
    hudTitle: "A reading order, not a dashboard",
    hudVerbs: "Ask → cast → show → move → close",
    hudDescription:
      "Question, figures, one picture, that same picture moving, then source and limit. Charts and themes are lanes.",
    accent: "cyan",
    icon: ScrollText,
    href: "/story-field-card/index.html",
    hrefLabel: "Field card",
  },
];

export const socials: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/AlexTouvras", icon: GithubIcon },
  { label: "LinkedIn", href: "https://linkedin.com/in/alextouvras", icon: LinkedinIcon },
  { label: "Email", href: "mailto:a.touvras@gmail.com", icon: Mail },
  // To add X later: re-add `XIcon` to the import on line 3, then uncomment:
  // { label: "X", href: "https://x.com/yourhandle", icon: XIcon },
];
