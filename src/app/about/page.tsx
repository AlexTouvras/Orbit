import type { Metadata } from "next";
import { cv } from "@/content/cv";
import { getEditableProfile } from "@/lib/profile-store";
import { AboutHero } from "@/components/about/AboutHero";
import { BackgroundSections } from "@/components/about/BackgroundSections";

export const metadata: Metadata = {
  title: "About",
  description:
    "Background, experience, education, and skills — AI & Data Systems Lead; financial services as domain depth, not a ceiling.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const profile = getEditableProfile();
  const resumeUrl = profile.resumeUrl || "/resume.pdf";

  return (
    <div className="space-y-24 sm:space-y-32">
      <AboutHero
        name={profile.name}
        role={profile.role}
        yearsExperience={profile.yearsExperience}
        employerCount={cv.experience.length}
        degreeCount={cv.education.length}
        resumeUrl={resumeUrl}
        avatarUrl={profile.avatarUrl}
      />

      <BackgroundSections />
    </div>
  );
}
