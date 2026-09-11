import { HEATMAP_BOARD_URL } from "@/content/live-desks";

/**
 * Crop past the live board chrome (title, pills, sector chips) so the tile
 * shows the treemap, not the upper page.
 */
export function HeatmapPeek() {
  return (
    <div
      className="relative h-full w-full overflow-hidden bg-[#0c1219]"
      aria-hidden
    >
      <iframe
        src={HEATMAP_BOARD_URL}
        title=""
        tabIndex={-1}
        loading="lazy"
        className="pointer-events-none absolute left-1/2 top-0 border-0"
        style={{
          width: "240%",
          height: "360%",
          transform: "translate(-50%, min(-270px, -28%))",
        }}
      />
    </div>
  );
}
