import type { Metadata } from "next";
import { cv } from "@/content/cv";
import { profile as profileDefaults } from "@/content/profile";
import { getEditableProfile } from "@/lib/profile-store";
import { AboutHero } from "@/components/about/AboutHero";
import { BackgroundSections } from "@/components/about/BackgroundSections";

const languageCodes: Record<string, string> = {
  English: "EN",
  Finnish: "FI",
  Greek: "GR",
};

export const metadata: Metadata = {
  title: "About",
  description: profileDefaults.aboutStatement,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const profile = getEditableProfile();

  return (
    <div className="space-y-24 sm:space-y-32">
      <AboutHero
        name={profile.name}
        role={profile.role}
        yearsExperience={profile.yearsExperience}
        languageCount={cv.languages.length}
        languageHint={cv.languages
          .map((lang) => languageCodes[lang.name] ?? lang.name)
          .join(" · ")}
        degreeCount={cv.education.length}
        avatarUrl={profile.avatarUrl}
      />

      <BackgroundSections />
    </div>
  );
}
