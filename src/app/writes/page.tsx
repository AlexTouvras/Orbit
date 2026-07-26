import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { WritesExplorer } from "@/components/writes/WritesExplorer";
import { WritesHero } from "@/components/writes/WritesHero";
import { getAllWrites } from "@/lib/writes";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Evergreen articles on delivery, data, AI, and career — what I learn and ship in public.",
  alternates: { canonical: "/writes" },
};

export default function WritesPage() {
  const writes = getAllWrites();
  const categories = new Set(writes.map((w) => w.category));
  const latestDate = writes[0]?.date ?? null;

  return (
    <div className="space-y-24 sm:space-y-32">
      <WritesHero
        articleCount={writes.length}
        categoryCount={categories.size}
        latestDate={latestDate}
      />

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
