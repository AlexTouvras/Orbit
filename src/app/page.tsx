import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { competencies } from "@/content/profile";
import { getEditableProfile } from "@/lib/profile-store";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFeaturedProjects } from "@/lib/projects";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { HubHero } from "@/components/hub/HubHero";
import { readNewsCache } from "@/lib/news/cache";
import { cn } from "@/lib/utils";

const accentBar: Record<"cyan" | "violet" | "blue", string> = {
  cyan: "border-l-neon-cyan",
  violet: "border-l-neon-violet",
  blue: "border-l-neon-blue",
};

const accentIcon: Record<"cyan" | "violet" | "blue", string> = {
  cyan: "text-neon-cyan",
  violet: "text-neon-violet",
  blue: "text-neon-blue",
};

export default function HomePage() {
  const profile = getEditableProfile();
  const featured = getFeaturedProjects(2);
  const radarCount = readNewsCache().count;

  const stats = [
    { label: "Disciplines", value: "3" },
    { label: "Radar signals", value: radarCount > 0 ? String(radarCount) : "—" },
    { label: "Nordic banking", value: `${profile.yearsExperience} yrs` },
  ];

  return (
    <div className="space-y-24 sm:space-y-32">
      <HubHero
        name={profile.name}
        pillars={profile.pillars}
        tagline={profile.tagline}
        stats={stats}
        socials={profile.socials}
      />

      <section>
        <SectionHeading
          eyebrow="Core competencies"
          title="Delivery, data, and agent systems"
          description="Three disciplines I combine to ship reliable, intelligent products."
        />
        <Stagger className="mt-10 grid gap-6 sm:grid-cols-3">
          {competencies.map((c) => (
            <StaggerItem key={c.title}>
              <GlassCard
                hover
                className={cn(
                  "h-full border-l-[3px] pl-5",
                  accentBar[c.accent],
                )}
              >
                <c.icon className={cn("h-6 w-6", accentIcon[c.accent])} />
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {c.description}
                </p>
              </GlassCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section>
        <Reveal>
          <GlassCard className="p-8 sm:p-10">
            <SectionHeading eyebrow="About" title="Background in brief" />
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300">
              {profile.summary}
            </p>
            <Link
              href="/about"
              className="focus-ring group mt-6 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-neon-cyan"
            >
              Full background &amp; experience
              <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
            </Link>
          </GlassCard>
        </Reveal>
      </section>

      {featured.length > 0 && (
        <section>
          <div className="flex items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Selected work"
              title="Case studies"
            />
            <Link
              href="/portfolio"
              className="focus-ring group hidden min-h-11 shrink-0 items-center gap-1 text-sm font-medium text-neon-cyan sm:inline-flex"
            >
              All projects
              <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
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
