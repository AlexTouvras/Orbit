import type { Metadata } from "next";
import {
  MapPin,
  Mail,
  Download,
  Briefcase,
  GraduationCap,
  Languages as LanguagesIcon,
  Award,
} from "lucide-react";
import { cv } from "@/content/cv";
import { getEditableProfile } from "@/lib/profile-store";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "Background, experience, education, and skills — from Nordic banking and credit risk to technology delivery and AI automation.",
};

const skillTones = ["cyan", "blue", "violet"] as const;

export default function AboutPage() {
  const profile = getEditableProfile();

  return (
    <div className="space-y-16">
      <section>
        <Reveal>
          <SectionHeading
            eyebrow="About"
            title="Background & experience"
            description="Around seven years across Nordic banking — credit risk and data — now leading technology delivery and building AI automation on the side."
          />
        </Reveal>

        <Reveal delay={0.05}>
          <GlassCard className="mt-8 p-6 sm:p-8">
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
              {cv.summary}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-neon-cyan" />
                {cv.location}
              </span>
              <a
                href={`mailto:${profile.email || cv.email}`}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-neon-cyan"
              >
                <Mail className="h-4 w-4 text-neon-cyan" />
                {profile.email || cv.email}
              </a>
              {profile.resumeUrl && (
                <a
                  href={profile.resumeUrl}
                  className="ml-auto inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-neon-cyan/50 hover:text-neon-cyan"
                >
                  <Download className="h-4 w-4" />
                  Download CV
                </a>
              )}
            </div>
          </GlassCard>
        </Reveal>
      </section>

      <section>
        <div className="mb-6 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-neon-cyan" />
          <h2 className="text-xl font-bold text-white">Experience</h2>
        </div>

        <Stagger className="space-y-5">
          {cv.experience.map((exp) => (
            <StaggerItem key={exp.company}>
              <GlassCard className="p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h3 className="text-lg font-semibold text-white">
                    {exp.company}
                  </h3>
                  <span className="text-xs uppercase tracking-wide text-slate-500">
                    {exp.location}
                  </span>
                </div>

                <div className="mt-4 space-y-5">
                  {exp.roles.map((role) => (
                    <div
                      key={role.title + role.period}
                      className="border-l border-white/10 pl-4"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <p className="font-medium text-neon-cyan">
                          {role.title}
                        </p>
                        <p className="font-mono text-xs text-slate-500">
                          {role.period}
                        </p>
                      </div>
                      <ul className="mt-2 space-y-1.5">
                        {role.bullets.map((b, i) => (
                          <li
                            key={i}
                            className="relative pl-4 text-sm leading-relaxed text-slate-400 before:absolute before:left-0 before:top-2 before:h-1 before:w-1 before:rounded-full before:bg-slate-600"
                          >
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-6 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-neon-blue" />
            <h2 className="text-xl font-bold text-white">Education</h2>
          </div>
          <div className="space-y-4">
            {cv.education.map((ed) => (
              <GlassCard key={ed.degree} className="p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="font-semibold text-white">{ed.degree}</h3>
                  {ed.period && (
                    <span className="font-mono text-xs text-slate-500">
                      {ed.period}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-400">{ed.school}</p>
                {ed.detail && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {ed.detail}
                  </p>
                )}
              </GlassCard>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <div className="mb-6 flex items-center gap-2">
              <Award className="h-5 w-5 text-neon-violet" />
              <h2 className="text-xl font-bold text-white">Skills</h2>
            </div>
            <div className="space-y-5">
              {cv.skills.map((group, gi) => (
                <div key={group.label}>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <Badge key={item} tone={skillTones[gi % skillTones.length]}>
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <LanguagesIcon className="h-5 w-5 text-neon-cyan" />
              <h2 className="text-xl font-bold text-white">Languages</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {cv.languages.map((lang) => (
                <Badge key={lang.name} tone="neutral">
                  {lang.name} · {lang.level}
                </Badge>
              ))}
            </div>
          </div>

          {cv.training.length > 0 && (
            <div>
              <h2 className="mb-3 text-xl font-bold text-white">
                Training & more
              </h2>
              <ul className="space-y-2">
                {cv.training.map((t) => (
                  <li
                    key={t}
                    className="relative pl-4 text-sm leading-relaxed text-slate-400 before:absolute before:left-0 before:top-2 before:h-1 before:w-1 before:rounded-full before:bg-neon-cyan/60"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
