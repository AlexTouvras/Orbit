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
  description: string;
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
  role: "Technology Delivery Lead · Data & AI Automation",
  location: "Vantaa, Finland",
  tagline:
    "Delivery lead with credit-risk roots: Azure ops by day, public systems that force a named decision before they ship.",
  pillars: "Delivery · Data · AI automation",
  availability: "Open to Data & AI delivery roles",
  yearsExperience: "7+",
  summary:
    "I lead IT application operations on Azure at Santander Consumer Bank Nordics, after years on PD models, scorecards, and ECL-style work. Orbit is the public HQ: one-question Blog essays, portfolio proof (Power BI, Ledger, workshop tools), and a curated Related articles feed. Automation gets a human Approve gate — including the weekly Write draft.",
  resumeUrl: "/resume.pdf",
  email: "a.touvras@gmail.com",
  contactBlurb:
    "Happy to talk delivery, data systems, AI automation, and what's broken in your stack.",
  /** Public repos shown on Portfolio. Empty = show newest non-fork repos (legacy). */
  githubRepoAllowlist: ["powerbi-portfolio"],
} as const;

export const competencies: Competency[] = [
  {
    title: "AI Orchestration & Automation",
    description:
      "Bounded agent loops with an owner and a kill switch: drafts and runbooks yes; priority calls and production publish stay human.",
    accent: "cyan",
    icon: Bot,
    href: "/field-card/index.html",
    hrefLabel: "Field card",
  },
  {
    title: "Data & Analytics",
    description:
      "Python, SQL, and Power BI / Fabric — gold tables, semantic models, and page paths that survive a cold Monday open. Roots in credit risk (PD, scorecards, ECL).",
    accent: "blue",
    icon: LineChart,
  },
  {
    title: "Technology Delivery",
    description:
      "Sequencing Azure and middleware changes across platform, security, and business calendars — evidence before the call, rollback before green.",
    accent: "violet",
    icon: Route,
  },
];

export const socials: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/AlexTouvras", icon: GithubIcon },
  { label: "LinkedIn", href: "https://linkedin.com/in/alextouvras", icon: LinkedinIcon },
  { label: "Email", href: "mailto:a.touvras@gmail.com", icon: Mail },
  // To add X later: re-add `XIcon` to the import on line 3, then uncomment:
  // { label: "X", href: "https://x.com/yourhandle", icon: XIcon },
];
