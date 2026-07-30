import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { competencies } from "@/content/profile";
import { getEditableProfile } from "@/lib/profile-store";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFeaturedWrites, getShowcaseWrites } from "@/lib/writes";
import { WriteCard } from "@/components/writes/WriteCard";
import { HubHero } from "@/components/hub/HubHero";
import { SelectedWorkCard } from "@/components/hub/SelectedWorkCard";
import { cn } from "@/lib/utils";

function CompetencyCard({
  title,
  description,
  accent,
  icon: Icon,
  href,
  hrefLabel,
}: (typeof competencies)[number]) {
  const card = (
    <GlassCard
      hover
      className={cn("h-full border-l-[3px] pl-5", accentBar[accent], href && "group")}
    >
      <Icon className={cn("h-6 w-6", accentIcon[accent])} />
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{description}</p>
      {href && (
        <span className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-neon-cyan sm:min-h-0">
          {hrefLabel ?? "Open"}
          <ArrowRight className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:translate-x-0.5" />
        </span>
      )}
    </GlassCard>
  );

  if (!href) return card;

  // Plain <a>: /field-card/ is static HTML in public/, not an App Router page.
  // next/link soft-nav would no-op / 404 inside the SPA shell.
  return (
    <a href={href} className="focus-ring block h-full rounded-2xl">
      {card}
    </a>
  );
}

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
  const showcaseWrites = getShowcaseWrites(3);
  const featuredWrites = getFeaturedWrites(3);

  return (
    <div className="space-y-24 sm:space-y-32">
      <HubHero
        name={profile.name}
        pillars={profile.pillars}
        tagline={profile.tagline}
        availability={profile.availability}
        socials={profile.socials}
      />

      <section>
        <SectionHeading
          eyebrow="Core competencies"
          title="Delivery, data, and agent systems"
          description="How I ship: delivery leadership, analytics I can defend, and automation with a human gate."
        />
        <Stagger className="mt-10 grid gap-6 sm:grid-cols-3">
          {competencies.map((c) => (
            <StaggerItem key={c.title}>
              <CompetencyCard {...c} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {showcaseWrites.length > 0 && (
        <section id="selected-work" className="scroll-mt-28">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Selected work"
              title="Systems I've built"
              description="Project write-ups with architecture — the proof behind the competencies."
            />
            <Link
              href="/portfolio"
              className="focus-ring group inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-medium text-neon-cyan"
            >
              Full portfolio
              <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
            </Link>
          </div>
          <Stagger className="mt-10 grid gap-6 sm:grid-cols-3">
            {showcaseWrites.map((write) => (
              <StaggerItem key={write.slug}>
                <SelectedWorkCard write={write} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      {featuredWrites.length > 0 && (
        <section>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="From the blog"
              title="Latest articles"
              description="What I'm learning and documenting in public — one question per article."
            />
            <Link
              href="/writes"
              className="focus-ring group inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-medium text-neon-cyan"
            >
              All posts
              <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
            </Link>
          </div>
          <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredWrites.map((write) => (
              <StaggerItem key={write.slug}>
                <WriteCard write={write} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

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
    </div>
  );
}
