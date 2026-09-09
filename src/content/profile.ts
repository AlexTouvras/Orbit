import type { ComponentType, SVGProps } from "react";
import type { LucideIcon } from "lucide-react";
import { Bot, LineChart, Mail, Globe, Route } from "lucide-react";
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
  accent: "cyan" | "violet" | "blue";
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
  role: "Delivery · Data · AI automation",
  location: "Vantaa, Finland",
  tagline:
    "Anyone can generate a draft nowadays. Fewer teams can prove what works or agree on what deserves to exist. That's the work I lead. If nobody owns that call, nothing ships.",
  /** One line on the identity HUD — stranger-readable, no workshop slang. */
  cardTagline:
    "Anyone can generate a draft. I lead the work of proving what works and deciding what deserves to exist.",
  pillars: "Delivery · Data · AI automation",
  /** Primary contact CTA — replaces a separate “open to …” pill. */
  contactCta: "Get in touch about a role",
  availability:
    "Open to Data & Analytics, Credit Risk, AI or delivery roles",
  yearsExperience: "7+",
  summary:
    "I lead IT application operations on Azure at Santander Consumer Bank Nordics, after years on PD models, scorecards, and ECL-style work. Orbit is the public HQ: one-question Blog essays, portfolio proof (Power BI, Ledger, workshop tools), and a curated Related articles feed. Automation gets a human Approve gate — including the weekly Write draft.",
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
    "Happy to talk delivery, data systems, AI automation, and what's broken in your stack.",
  /** Public repos shown on Portfolio. Empty = show newest non-fork repos (legacy). */
  githubRepoAllowlist: ["powerbi-portfolio"],
} as const;

export const competencies: Competency[] = [
  {
    title: "AI Orchestration & Automation",
    shortTitle: "AI",
    description:
      "Bounded agent loops with an owner and a kill switch: drafts and runbooks yes; priority calls and production publish stay human.",
    hudTitle: "Agentic AI is a stack, not a menu",
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
      "Python, SQL, and Power BI / Fabric — gold tables, semantic models, and page paths that survive a cold Monday open. Roots in credit risk (PD, scorecards, ECL).",
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
];

export const socials: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/AlexTouvras", icon: GithubIcon },
  { label: "LinkedIn", href: "https://linkedin.com/in/alextouvras", icon: LinkedinIcon },
  { label: "Email", href: "mailto:a.touvras@gmail.com", icon: Mail },
  // To add X later: re-add `XIcon` to the import on line 3, then uncomment:
  // { label: "X", href: "https://x.com/yourhandle", icon: XIcon },
];
