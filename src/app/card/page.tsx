import type { Metadata, Viewport } from "next";
import { IdentityHud } from "@/components/card/IdentityHud";
import { cv } from "@/content/cv";
import { competencies, profile as profileDefaults } from "@/content/profile";
import { getEditableProfile } from "@/lib/profile-store";

const HUD_DOMAINS = [
  "Data & Analytics",
  "Credit Risk",
  "SDLC",
  "AI",
  "Delivery",
  "Story",
] as const;

export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Identity HUD",
  description:
    "Compact identity card — AI & Data Systems Lead; then into the rest of the site.",
  alternates: { canonical: "/card" },
};

export default function CardPage() {
  const profile = getEditableProfile();
  const masters = cv.education.filter((ed) => /^MSc\b/i.test(ed.degree));
  const thesisLinks = masters
    .filter((ed) => ed.thesisUrl && ed.thesisTitle)
    .map((ed) => ({
      href: ed.thesisUrl as string,
      label: ed.degree.replace(/^MSc,\s*/i, "") + " thesis",
    }));

  const pillars = competencies.map((c) => ({
    id: c.shortTitle.toLowerCase(),
    shortTitle: c.shortTitle,
    title: c.hudTitle ?? c.title,
    verbs: c.hudVerbs,
    description: c.hudDescription ?? c.description,
    accent: c.accent,
    links: c.href
      ? [{ href: c.href, label: c.hrefLabel ?? "Open field card" }]
      : undefined,
  }));

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <IdentityHud
        name={profile.name}
        role={profile.role || profileDefaults.pillars}
        location={profile.location || cv.location}
        tagline={profileDefaults.cardTagline}
        contactCta={profileDefaults.contactCta}
        avatarUrl={profile.avatarUrl || profileDefaults.avatarUrl}
        stats={[
          {
            id: "experience",
            label: "Experience",
            value: profile.yearsExperience.replace(/\s*years?$/i, ""),
            unit: "years",
            title: "Experience",
            description:
              "Seven-plus years in Nordic consumer finance: credit analysis, PD models and scorecards, then technology delivery lead for Azure and middleware at Santander Nordics.",
            links: [
              { href: "/about#experience", label: "Experience on About" },
            ],
          },
          {
            id: "education",
            label: "Education",
            value: String(masters.length),
            unit: "master's",
            title: "Education",
            description:
              "Two master's: Big Data Analytics at Arcada, Banking and International Finance at Jyväskylä. Economics bachelor from AUEB in Athens.",
            links: [
              ...thesisLinks,
              { href: "/about#education", label: "Education on About" },
            ],
          },
          {
            id: "domains",
            label: "Domains",
            value: String(HUD_DOMAINS.length),
            unit: "fields",
            title: "Domains",
            description: `${HUD_DOMAINS.join(", ")}. Tap a lane above for the field-card thesis in that field.`,
            links: [{ href: "/about#skills", label: "Skills on About" }],
          },
        ]}
        pillars={pillars}
      />
    </div>
  );
}
