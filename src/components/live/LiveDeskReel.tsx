import type { ReactNode } from "react";
import type { LiveDesk } from "@/content/live-desks";
import { LiveDeskTile } from "@/components/live/LiveDeskTile";
import { ScrollRail } from "@/components/story/ScrollRail";

/** Live desks as a peek reel: sneak-peek image + question. Vertical scroll drives the track. */
export function LiveDeskReel({
  desks,
  header,
}: {
  desks: LiveDesk[];
  header?: ReactNode;
}) {
  if (desks.length === 0) return null;

  return (
    <ScrollRail length={desks.length} header={header}>
      {desks.map((desk, i) => (
        <LiveDeskTile key={desk.slug} desk={desk} index={i} />
      ))}
    </ScrollRail>
  );
}
