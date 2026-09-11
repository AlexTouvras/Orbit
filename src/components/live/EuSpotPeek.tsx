import { EU_ZONE_MAP } from "@/content/live/eu-zone-paths";
import { fillFor } from "@/lib/live/eu-map-fill";
import { readEuSpotSnapshot } from "@/lib/live/eu-spot";

/** Static baseload choropleth for portfolio tiles — no hover, no keys. */
export function EuSpotPeek() {
  const snap = readEuSpotSnapshot();
  const today = snap?.today ?? [];
  const values = today.map((z) => z.baseload);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const liveStems = new Set(today.map((z) => z.geoStem));
  const byStem = new Map(today.map((z) => [z.geoStem, z]));

  return (
    <svg
      viewBox={EU_ZONE_MAP.viewBox}
      className="h-full w-full"
      aria-hidden
      focusable="false"
    >
      <rect width="100%" height="100%" className="fill-void" />
      {Object.entries(EU_ZONE_MAP.shapes).map(([stem, shape]) => {
        if (liveStems.has(stem)) return null;
        return (
          <path
            key={stem}
            d={shape.d}
            className="fill-white/[0.04] stroke-white/15"
            strokeWidth={0.55}
          />
        );
      })}
      {today.map((z) => {
        const shape = EU_ZONE_MAP.shapes[z.geoStem];
        if (!shape) return null;
        const row = byStem.get(z.geoStem);
        return (
          <path
            key={z.id}
            d={shape.d}
            fill={
              row
                ? fillFor(row.baseload, min, max, false)
                : "rgba(255,255,255,0.08)"
            }
            fillOpacity={0.82}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={0.7}
          />
        );
      })}
    </svg>
  );
}
