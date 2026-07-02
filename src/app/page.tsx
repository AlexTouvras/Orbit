import Link from "next/link";
import { ArrowRight, Radar, Sparkles } from "lucide-react";
import { competencies } from "@/content/profile";
import { getEditableProfile, getResolvedSocials } from "@/lib/profile-store";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFeaturedProjects } from "@/lib/projects";
import { ProjectCard } from "@/components/portfolio/ProjectCard";

export default function HomePage() {
  const profile = getEditableProfile();
  const socials = getResolvedSocials();
  const featured = getFeaturedProjects(2);

  return (
    <div className="space-y-28">
      {/* Hero */}
      <section className="relative">
        <Reveal>
          <Badge tone="cyan" className="mb-6">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-neon-cyan" />
            Available for new missions
          </Badge>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            Hi, I&apos;m {profile.name}.{" "}
            <span className="text-gradient">{profile.role}.</span>
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            {profile.tagline}
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/portfolio"
              className="group inline-flex items-center gap-2 rounded-xl bg-neon-cyan px-5 py-3 text-sm font-semibold text-void shadow-glow transition-transform hover:scale-[1.03]"
            >
              View Portfolio
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/radar"
              className="group inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-neon-violet/50 hover:text-white"
            >
              <Radar className="h-4 w-4 text-neon-violet" />
              Open the Radar
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-8 flex items-center gap-4">
            {socials.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-slate-500 transition-colors hover:text-neon-cyan"
              >
                <social.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Competencies */}
      <section>
        <SectionHeading
          eyebrow="Core competencies"
          title="What I bring to orbit"
          description="Three disciplines I combine to ship reliable, intelligent systems."
        />
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-3">
          {competencies.map((c) => (
            <StaggerItem key={c.title}>
              <GlassCard hover className="h-full">
                <Sparkles
                  className={
                    c.accent === "cyan"
                      ? "h-6 w-6 text-neon-cyan"
                      : c.accent === "violet"
                        ? "h-6 w-6 text-neon-violet"
                        : "h-6 w-6 text-neon-blue"
                  }
                />
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {c.description}
                </p>
              </GlassCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Expertise summary */}
      <section>
        <Reveal>
          <GlassCard className="p-8 sm:p-10">
            <SectionHeading eyebrow="About" title="A quick summary" />
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300">
              {profile.summary}
            </p>
            <Link
              href="/about"
              className="group mt-6 inline-flex items-center gap-1 text-sm font-medium text-neon-cyan"
            >
              Full background &amp; experience
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </GlassCard>
        </Reveal>
      </section>

      {/* Featured work */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-end justify-between">
            <SectionHeading
              eyebrow="Selected work"
              title="Featured missions"
            />
            <Link
              href="/portfolio"
              className="group hidden items-center gap-1 text-sm font-medium text-neon-cyan sm:inline-flex"
            >
              All projects
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <Stagger className="mt-10 grid gap-6 sm:grid-cols-2">
            {featured.map((project) => (
              <StaggerItem key={project.slug}>
                <ProjectCard project={project} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}
    </div>
  );
}
