import { MapPin, Mail, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cv } from "@/content/cv";
import { profile as profileDefaults } from "@/content/profile";
import { getEditableProfile } from "@/lib/profile-store";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { ExperienceTimeline } from "@/components/about/ExperienceTimeline";

const skillTones = ["cyan", "blue", "violet"] as const;

/** First "orbit" shares the brand accent orbit (cyan → purple). */
function withOrbitMark(text: string) {
  const i = text.toLowerCase().indexOf("orbit");
  if (i < 0) return text;
  const end = i + "orbit".length;
  return (
    <>
      {text.slice(0, i)}
      <span className="orbit-accent font-medium">{text.slice(i, end)}</span>
      {text.slice(end)}
    </>
  );
}

/** CV & background sections — rendered on the about page. */
export function BackgroundSections() {
  const profile = getEditableProfile();
  const email = profile.email || cv.email;

  return (
    <>
      <section id="background" className="scroll-mt-28">
        <Reveal>
          <SectionHeading
            eyebrow="Background"
            title="Story & record"
            description="Business problems → data → intelligent systems → delivery → outcomes. Financial services is the deepest domain so far — not the whole identity."
          />
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-8">
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
            </div>
          </div>
        </Reveal>
      </section>

      <section id="why-orbit" className="scroll-mt-28">
        <Reveal>
          <SectionHeading
            eyebrow="This site"
            title="Why Orbit"
            description="What the name means — and how it connects to the vision for this site."
          />
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-8">
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
              {withOrbitMark(profileDefaults.whyOrbitDetail)}
            </p>
            <Link
              href="/writes/building-orbit"
              className="focus-ring group mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-neon-cyan"
            >
              Building Orbit — full case study
              <ArrowUpRight className="h-4 w-4 transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" />
            </Link>
          </div>
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

        <ExperienceTimeline />
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
                    {ed.period && (
                      <span className="font-mono text-xs text-slate-400">
                        {ed.period}
                      </span>
                    )}
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
                  {ed.thesisUrl && (
                    <p className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.15em] text-neon-cyan transition-colors group-hover:text-white">
                      Press for master&apos;s thesis
                      <ArrowUpRight
                        className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden
                      />
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
                      aria-label={`${ed.degree} — press for master's thesis`}
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
