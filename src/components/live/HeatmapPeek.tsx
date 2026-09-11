import { HEATMAP_BOARD_URL } from "@/content/live-desks";

/** Scaled live board for portfolio tiles. Pointers stay on the card link. */
export function HeatmapPeek() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-void" aria-hidden>
      <iframe
        src={HEATMAP_BOARD_URL}
        title=""
        tabIndex={-1}
        loading="lazy"
        className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
        style={{ width: "200%", height: "200%", transform: "scale(0.5)" }}
      />
    </div>
  );
}
