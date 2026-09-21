import { HEATMAP_BOARD_URL } from "@/content/live-desks";
import { BackLink } from "@/components/ui/BackLink";
import { DeskStoryHeader } from "@/components/story/DeskStoryHeader";

export function NordicEquityDesk() {
  return (
    <article className="space-y-8">
      <BackLink fallbackHref="/portfolio/live" label="Live dashboards" />
      <DeskStoryHeader
        kicker="Weekday gold · delayed quotes"
        question="Which Nordic large-caps moved today?"
      />

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-void-800">
        <iframe
          src={HEATMAP_BOARD_URL}
          title="Nordic equity heatmap board"
          className="h-[min(70vh,720px)] w-full bg-void"
        />
      </div>

      <p className="text-sm text-slate-400">
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
    </article>
  );
}
