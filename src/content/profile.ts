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
}

export const profile = {
  name: "Alex Touvras",
  handle: "@alextouvras",
  // Used by the Portfolio page to auto-showcase your public repos.
  githubUsername: "alextouvras",
  role: "Technology Delivery Lead · Data & AI Automation",
  location: "Vantaa, Finland",
  tagline:
    "A living record of what I build, learn, and ship — from credit risk and delivery leadership to agentic AI and automation.",
  pillars: "Delivery · Data · AI automation",
  availability:
    "Open to delivery in Data analytics & AI work",
  yearsExperience: "7+",
  summary:
    "I work across technology delivery, data, and credit risk — leading IT application operations on Azure while building multi-agent AI workflows, automation pipelines, and analytics teams trust. This site is my public headquarters: articles on what I learn, real projects from the workshop, and a curated signal feed across AI, Data, and Delivery.",
  resumeUrl: "/resume.pdf",
  email: "a.touvras@gmail.com",
} as const;

export const competencies: Competency[] = [
  {
    title: "AI Orchestration & Automation",
    description:
      "Multi-agent systems, tool-use & RAG pipelines, and event-driven automation that removes toil and stays reliable in production.",
    accent: "cyan",
    icon: Bot,
  },
  {
    title: "Data & Analytics",
    description:
      "Python, SQL, and Power BI / Fabric — models, dashboards, and ETL that turn data into decisions. Quantitative roots in credit risk (PD, scorecards, ECL).",
    accent: "blue",
    icon: LineChart,
  },
  {
    title: "Technology Delivery",
    description:
      "Leading IT application operations across Azure and middleware — coordinating cross-team delivery with flow, clarity, and measurable outcomes.",
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
