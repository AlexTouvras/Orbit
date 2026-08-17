import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { WritesExplorer } from "@/components/writes/WritesExplorer";
import { WritesHero } from "@/components/writes/WritesHero";
import { getAllWrites } from "@/lib/writes";
import { getEditableProfile } from "@/lib/profile-store";
import { isNewsletterTestMode } from "@/lib/newsletter/config";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Evergreen articles on delivery, data, AI, and career — what I learn and ship in public.",
  alternates: { canonical: "/writes" },
};

export default function WritesPage() {
  const profile = getEditableProfile();
  const writes = getAllWrites();
  const categories = new Set(writes.map((w) => w.category));
  const latestDate = writes[0]?.date ?? null;
  const testing = isNewsletterTestMode();

  return (
    <div className="space-y-24 sm:space-y-32">
      <WritesHero
        articleCount={writes.length}
        categoryCount={categories.size}
        latestDate={latestDate}
        avatarUrl={profile.avatarUrl}
      />

      {!testing && (
        <Reveal>
          <GlassCard className="max-w-xl">
            <SectionHeading
              eyebrow="Weekly digest"
              title="Get the roundup"
              description="This week's Write, a few Related articles, and one Ravens highlight per beat."
            />
            <div className="mt-6">
              <NewsletterForm variant="compact" />
            </div>
          </GlassCard>
        </Reveal>
      )}

      <section id="articles" className="scroll-mt-28">
        <Reveal>
          <SectionHeading
            eyebrow="Archive"
            title="All articles"
            description="Filter by topic or search titles and tags. Each post answers one question."
          />
        </Reveal>
        <div className="mt-8">
          <WritesExplorer writes={writes} />
        </div>
      </section>
    </div>
  );
}
