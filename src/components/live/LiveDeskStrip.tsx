import { liveDesks } from "@/content/live-desks";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { LiveDeskTile } from "@/components/live/LiveDeskTile";
import { LiveDeskCarousel } from "@/components/live/LiveDeskCarousel";

export function LiveDeskStrip() {
  const desks = liveDesks.filter((d) => d.status === "live");
  if (desks.length === 0) return null;

  return (
    <section id="live" className="scroll-mt-28">
      <Reveal>
        <SectionHeading
          eyebrow="Live desks"
          title="Questions the desks answer"
          description="One-page desks that refresh at the grain the data actually moves. Screenshots stay in the Power BI lane."
        />
      </Reveal>
      <LiveDeskCarousel labels={desks.map((d) => d.title)}>
        {desks.map((desk) => (
          <LiveDeskTile key={desk.slug} desk={desk} />
        ))}
      </LiveDeskCarousel>
    </section>
  );
}
