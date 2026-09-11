import { HEATMAP_BOARD_URL } from "@/content/live-desks";

/**
 * Render the live board at a desktop width, skip title/chips, then scale the
 * treemap to the tile — full heatmap, not a zoomed slice.
 */
export function HeatmapPeek() {
  return (
    <div
      className="relative h-full w-full overflow-hidden bg-[#0c1219] [container-type:size]"
      aria-hidden
    >
      <iframe
        src={HEATMAP_BOARD_URL}
        title=""
        tabIndex={-1}
        loading="lazy"
        className="pointer-events-none absolute left-1/2 top-0 border-0"
        style={{
          width: 1120,
          height: 860,
          transformOrigin: "top center",
          transform:
            "translateX(-50%) translateY(-244px) scale(calc(100cqw / 1080))",
        }}
      />
    </div>
  );
}
