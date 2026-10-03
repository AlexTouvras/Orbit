import { MapPin, Mail, ArrowUpRight, Download } from "lucide-react";
import Link from "next/link";
import { cv, placePath } from "@/content/cv";
import { profile as profileDefaults } from "@/content/profile";
import { getEditableProfile } from "@/lib/profile-store";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { ExperienceTimeline } from "@/components/about/ExperienceTimeline";
import { PlaceLink } from "@/components/about/PlaceLink";

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
  const resumeUrl = profile.resumeUrl || "/resume.pdf";

  return (
    <>
      <section id="background" className="scroll-mt-28">
        <Reveal>
          <SectionHeading eyebrow="Background" title="Story & record" />
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-8 max-w-2xl">
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
              {profileDefaults.aboutStory}
            </p>
            <p className="mt-6 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {profileDefaults.aboutQuestion}
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
            description="Nordic consumer finance, from credit analysis to technology delivery, plus earlier roles in Helsinki and Greece."
          />
        </Reveal>

        <ExperienceTimeline />
      </section>

      <section id="education" className="scroll-mt-28">
        <Reveal>
          <SectionHeading
            eyebrow="Academic"
            title="Education"
            description="Quantitative finance and big data analytics foundations."
          />
        </Reveal>
        <ol className="mt-10">
          {cv.education.map((ed) => (
            <li key={ed.slug} className="border-t border-white/10">
              <div className="py-10">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <PlaceLink
                    href={placePath(ed.slug)}
                    name={ed.school}
                    mark={ed.mark}
                  />
                  {ed.period ? (
                    <span className="font-mono text-xs text-slate-400">
                      {ed.period}
                    </span>
                  ) : null}
                </div>
                <p className="orbit-accent mt-6 font-medium">{ed.degree}</p>
                {ed.thesisTitle ? (
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    Thesis: {ed.thesisTitle}
                  </p>
                ) : null}
                {ed.detail ? (
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {ed.detail}
                  </p>
                ) : null}
                {ed.thesisUrl ? (
                  <a
                    href={ed.thesisUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-neon-cyan"
                  >
                    Press for master&apos;s thesis
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="skills" className="scroll-mt-28">
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
                    <Badge key={item} tone={skillTones[gi % skillTones.length]}>
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="languages" className="scroll-mt-28">
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
      </section>

      {cv.training.length > 0 && (
        <section id="training" className="scroll-mt-28">
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
        </section>
      )}

      <section id="cv" className="scroll-mt-28">
        <Reveal>
          <SectionHeading
            eyebrow="File"
            title="Download the CV"
            description="The same record, as a PDF."
          />
          <a
            href={resumeUrl}
            className="focus-ring group mt-8 inline-flex min-h-11 items-center gap-2 rounded-xl bg-neon-cyan px-5 py-3 text-sm font-semibold text-void shadow-glow transition-[transform,box-shadow] active:scale-[0.98] motion-safe:hover:shadow-glow"
          >
            <Download className="h-4 w-4" />
            Download CV
          </a>
        </Reveal>
      </section>
    </>
  );
}
