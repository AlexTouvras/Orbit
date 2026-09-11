import {
  changeColor,
  fetchHeatmapBoard,
  layoutHeatmapTiles,
} from "@/lib/live/heatmap-board";

const W = 800;
const H = 500;

/** Live treemap peek — not an iframe of the board page chrome. */
export async function HeatmapPeek() {
  const board = await fetchHeatmapBoard();
  if (!board) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0c1219] text-xs text-slate-500">
        Heatmap snapshot unavailable
      </div>
    );
  }

  const tiles = layoutHeatmapTiles(board.stocks, W, H);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full"
      aria-hidden
      focusable="false"
    >
      <title>Nordic equity heatmap sneak peek</title>
      <rect width={W} height={H} fill="#0c1219" />
      {tiles.map((t) => (
        <g key={t.ticker}>
          <rect
            x={t.x}
            y={t.y}
            width={Math.max(t.w, 0)}
            height={Math.max(t.h, 0)}
            fill={changeColor(t.changePct)}
            rx={1.2}
          />
          {t.w > 42 && t.h > 16 ? (
            <text
              x={t.x + 4}
              y={t.y + Math.min(14, t.h - 3)}
              fill="rgba(255,255,255,0.92)"
              fontSize={t.w > 70 ? 11 : 9}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontWeight={650}
            >
              {t.ticker}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}
