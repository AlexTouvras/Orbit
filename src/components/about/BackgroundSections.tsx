import { MapPin, Mail, Download, ArrowUpRight } from "lucide-react";
import { cv } from "@/content/cv";
import { getEditableProfile } from "@/lib/profile-store";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";

const skillTones = ["cyan", "blue", "violet"] as const;

/** CV & background sections — rendered on the home page. */
export function BackgroundSections() {
  const profile = getEditableProfile();
  const email = profile.email || cv.email;
  const resumeUrl = profile.resumeUrl || "/resume.pdf";

  return (
    <>
      <section id="background" className="scroll-mt-28">
        <Reveal>
          <SectionHeading
            eyebrow="Background"
            title="Story & record"
            description="Credit risk roots, delivery leadership, and the quantitative tooling in between."
          />
        </Reveal>

        <Reveal delay={0.05}>
          <GlassCard className="mt-8 p-6 sm:p-8">
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
              {cv.summary}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
              <span className="inline-flex min-h-11 items-center gap-1.5 text-slate-300">
                <MapPin className="h-4 w-4 text-neon-cyan" aria-hidden />
                {cv.location}
              </span>
              <a
                href={`mailto:${email}`}
                className="focus-ring inline-flex min-h-11 items-center gap-1.5 text-slate-300 transition-colors hover:text-neon-cyan"
              >
                <Mail className="h-4 w-4 text-neon-cyan" aria-hidden />
                {email}
              </a>
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  className="focus-ring ml-auto inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-[transform,border-color,color] active:scale-[0.98] hover:border-neon-cyan/50 hover:text-neon-cyan"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Download CV
                </a>
              )}
            </div>
          </GlassCard>
        </Reveal>
      </section>

      <section id="experience" className="scroll-mt-28">
        <Reveal>
          <SectionHeading
            eyebrow="Career"
            title="Experience"
            description="Seven years across Nordic consumer finance — from credit analysis to technology delivery lead."
          />
        </Reveal>

        <Stagger className="mt-8 space-y-6">
          {cv.experience.map((exp) => (
            <StaggerItem key={exp.company}>
              <GlassCard className="p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h3 className="text-lg font-semibold text-white">
                    {exp.company}
                  </h3>
                  <span className="font-mono text-xs uppercase tracking-wide text-slate-400">
                    {exp.location}
                  </span>
                </div>

                <div className="mt-4 space-y-5">
                  {exp.roles.map((role) => (
                    <div
                      key={role.title + role.period}
                      className="border-l-2 border-neon-cyan/20 pl-4"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <p className="font-medium text-neon-cyan">
                          {role.title}
                        </p>
                        <p className="font-mono text-xs text-slate-400">
                          {role.period}
                        </p>
                      </div>
                      <ul className="mt-2 space-y-2">
                        {role.bullets.map((b, i) => (
                          <li
                            key={i}
                            className="relative pl-4 text-sm leading-relaxed text-slate-300 before:absolute before:left-0 before:top-2.5 before:h-1 before:w-1 before:rounded-full before:bg-slate-500"
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

      <section
        id="education-skills"
        className="scroll-mt-28 grid gap-16 lg:grid-cols-2 lg:gap-8"
      >
        <div id="education">
          <Reveal>
            <SectionHeading
              eyebrow="Academic"
              title="Education"
              description="Quantitative finance and big data analytics foundations."
            />
          </Reveal>
          <div className="mt-8 space-y-4">
            {cv.education.map((ed) => {
              const card = (
                <GlassCard
                  hover={Boolean(ed.thesisUrl)}
                  className="group relative p-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="font-semibold text-white">{ed.degree}</h3>
                    <div className="flex items-center gap-2">
                      {ed.period && (
                        <span className="font-mono text-xs text-slate-400">
                          {ed.period}
                        </span>
                      )}
                      {ed.thesisUrl && (
                        <ArrowUpRight
                          className="h-4 w-4 text-slate-500 transition-[transform,color] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neon-cyan"
                          aria-hidden
                        />
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">{ed.school}</p>
                  {ed.thesisTitle && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      Thesis: {ed.thesisTitle}
                    </p>
                  )}
                  {ed.detail && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {ed.detail}
                    </p>
                  )}
                </GlassCard>
              );

              return (
                <Reveal key={ed.degree}>
                  {ed.thesisUrl ? (
                    <a
                      href={ed.thesisUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-ring block rounded-2xl"
                      aria-label={`${ed.degree} — open thesis`}
                    >
                      {card}
                    </a>
                  ) : (
                    card
                  )}
                </Reveal>
              );
            })}
          </div>
        </div>

        <div id="skills" className="space-y-16">
          <div>
            <Reveal>
              <SectionHeading
                eyebrow="Toolkit"
                title="Skills"
                description="Credit risk, data analytics, and delivery operations."
              />
            </Reveal>
            <div className="mt-8 space-y-6">
              {cv.skills.map((group, gi) => (
                <Reveal key={group.label} delay={gi * 0.03}>
                  <div>
                    <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-slate-400">
                      {group.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <Badge
                          key={item}
                          tone={skillTones[gi % skillTones.length]}
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div>
            <Reveal>
              <SectionHeading eyebrow="Multilingual" title="Languages" />
            </Reveal>
            <div className="mt-6 flex flex-wrap gap-2">
              {cv.languages.map((lang) => (
                <Badge key={lang.name} tone="neutral">
                  {lang.name} · {lang.level}
                </Badge>
              ))}
            </div>
          </div>

          {cv.training.length > 0 && (
            <div>
              <Reveal>
                <SectionHeading eyebrow="Continuous" title="Training & more" />
              </Reveal>
              <ul className="mt-6 space-y-3">
                {cv.training.map((t) => (
                  <li
                    key={t}
                    className="relative pl-4 text-sm leading-relaxed text-slate-300 before:absolute before:left-0 before:top-2.5 before:h-1 before:w-1 before:rounded-full before:bg-neon-cyan/60"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
