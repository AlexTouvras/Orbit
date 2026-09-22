import { HEATMAP_BOARD_URL } from "@/content/live-desks";
import { BackLink } from "@/components/ui/BackLink";
import { DeskStoryHeader } from "@/components/story/DeskStoryHeader";
import { DeskCast } from "@/components/story/DeskCast";
import { DeskPicture } from "@/components/story/DeskPicture";
import { DeskClose } from "@/components/story/DeskClose";
import { StoryStat } from "@/components/story/StoryStat";
import {
  fetchHeatmapBoard,
  type HeatmapStock,
} from "@/lib/live/heatmap-board";

function formatPct(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

function formatHelsinki(iso: string): string {
  return `${new Date(iso).toLocaleString("en-GB", {
    timeZone: "Europe/Helsinki",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} Helsinki`;
}

function boardCast(stocks: HeatmapStock[]) {
  const withChange = stocks.filter(
    (s) => s.changePct !== null && Number.isFinite(s.changePct),
  );
  const up = withChange.filter((s) => (s.changePct ?? 0) > 0).length;
  const down = withChange.filter((s) => (s.changePct ?? 0) < 0).length;
  const leader = [...withChange].sort(
    (a, b) => (b.changePct ?? Number.NEGATIVE_INFINITY) - (a.changePct ?? Number.NEGATIVE_INFINITY),
  )[0];
  return { up, down, leader, names: stocks.length };
}

export async function NordicEquityDesk() {
  const board = await fetchHeatmapBoard();
  const { up, down, leader, names } = boardCast(board?.stocks ?? []);

  return (
    <article className="space-y-8">
      <BackLink fallbackHref="/portfolio/live" label="Live dashboards" />
      <DeskStoryHeader
        kicker="Weekday gold · delayed quotes"
        question="Which big Nordic stocks moved today?"
      />

      <DeskCast className="lg:grid-cols-4">
        <StoryStat
          label="Up"
          value={String(up)}
          countTo={up}
          valueClassName="text-emerald-300"
        />
        <StoryStat
          label="Down"
          value={String(down)}
          countTo={down}
          valueClassName="text-rose-300"
        />
        <StoryStat
          label="Leader"
          value={leader?.ticker ?? "—"}
          hint={leader ? formatPct(leader.changePct) : undefined}
        />
        <StoryStat
          label="Names"
          value={names > 0 ? String(names) : "—"}
          countTo={names || undefined}
        />
      </DeskCast>

      <DeskPicture label="Nordic equity heatmap board">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-void-800">
          <iframe
            src={HEATMAP_BOARD_URL}
            title="Nordic equity heatmap board"
            className="h-[min(70vh,720px)] w-full bg-void"
          />
        </div>
      </DeskPicture>

      <DeskClose>
        {board?.asOf ? <p>Board as of {formatHelsinki(board.asOf)}.</p> : null}
        <p className={board?.asOf ? "mt-2" : undefined}>
          Embed blank?{" "}
          <a
            href={HEATMAP_BOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring rounded-sm text-neon-cyan underline-offset-4 hover:underline"
          >
            Open the board in a new tab
          </a>
          . Quotes are delayed; do not treat this as a trading terminal.
        </p>
      </DeskClose>
    </article>
  );
}
