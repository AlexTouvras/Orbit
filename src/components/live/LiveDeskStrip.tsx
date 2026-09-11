import { liveDesks } from "@/content/live-desks";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { LiveDeskTile } from "@/components/live/LiveDeskTile";

export function LiveDeskStrip() {
  const desks = liveDesks.filter((d) => d.status === "live");
  if (desks.length === 0) return null;

  return (
    <section id="live" className="scroll-mt-28">
      <Reveal>
        <SectionHeading
          eyebrow="Not Power BI"
          title="Live dashboards"
          description="One-page desks that refresh at the grain the data actually moves. Screenshots stay in the Power BI lane."
        />
      </Reveal>
      <Stagger className="mt-8 grid gap-6 sm:grid-cols-2">
        {desks.map((desk) => (
          <StaggerItem key={desk.slug}>
            <LiveDeskTile desk={desk} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
