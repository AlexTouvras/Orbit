import type { PowerView } from "@/lib/live/power";
import { BackLink } from "@/components/ui/BackLink";
import { Badge } from "@/components/ui/Badge";
import { GridTape } from "@/components/live/GridTape";
import { PriceTape } from "@/components/live/PriceTape";

function formatMw(n: number): string {
  return `${Math.round(n).toLocaleString("en-US")} MW`;
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

function formatEur(n: number): string {
  return `€${n.toFixed(1)}`;
}

function formatHelsinkiUnix(unix: number): string {
  return new Date(unix * 1000).toLocaleString("en-GB", {
    timeZone: "Europe/Helsinki",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function PriceNowcast({ view }: { view: PowerView }) {
  const score = view.price;
  if (!score) return null;
  const points = view.tape.flatMap((p) => {
    if (p.priceActual === null || p.priceNowcast === null) return [];
    return [{ t: p.t, actual: p.priceActual, nowcast: p.priceNowcast }];
  });
  const last = points[points.length - 1];
  const beatPersist = score.mae < score.persistMae;
  const beatYday = score.ydayMae !== null && score.mae < score.ydayMae;

  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-white">
        Mix nowcast vs day-ahead
      </h2>
      <p className="mt-1 mb-4 text-sm text-slate-400">
        Wind share, net import, and load from the previous 15 minutes, plus
        the last published print. Linear fit on the week before each step.
        White is day-ahead; amber is the nowcast. Last-print persistence is
        the bar to beat.
      </p>
      {last ? (
        <p className="mb-5 text-sm leading-relaxed text-slate-300">
          Last print {formatEur(last.actual)} · nowcast{" "}
          {formatEur(last.nowcast)} · miss{" "}
          {formatEur(Math.abs(last.actual - last.nowcast))}
        </p>
      ) : null}
      <dl className="mb-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
        <div>
          <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
            Nowcast MAE
          </dt>
          <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">
            {formatEur(score.mae)}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
            Last-print MAE
          </dt>
          <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">
            {formatEur(score.persistMae)}
          </dd>
        </div>
        {score.ydayMae !== null ? (
          <div>
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
              Yesterday MAE
            </dt>
            <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">
              {formatEur(score.ydayMae)}
            </dd>
          </div>
        ) : null}
      </dl>
      <PriceTape points={points} />
      <p className="mt-4 text-sm leading-relaxed text-slate-400">
        {beatPersist ? "Beats" : "Loses to"} last-print persistence
        {score.ydayMae !== null
          ? ` · ${beatYday ? "beats" : "loses to"} yesterday same slot`
          : ""}
        . {score.n} quarter-hours in this window. {score.method}.
      </p>
    </section>
  );
}

export function PowerPulseDesk({ view }: { view: PowerView }) {
  const importing = view.latest.importMw >= 0;
  const flowWord = importing ? "Importing" : "Exporting";
  const flowMw = formatMw(Math.abs(view.latest.importMw));

  return (
    <article className="space-y-10">
      <BackLink fallbackHref="/portfolio/live" label="Live dashboards" />

      <header>
        <Badge tone="cyan" className="mb-4">
          {view.cadenceMinutes}-minute snapshot
        </Badge>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Is Finland importing because the wind dropped?
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
          Wind, nuclear, load, and net imports. Below the tape, a one-step
          nowcast from that mix is scored against the published FI day-ahead.
        </p>
      </header>

      <div className="border-y border-white/10 py-8">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-slate-400">
          Net flow now
        </p>
        <p
          className={`mt-2 font-display text-4xl font-bold tabular-nums tracking-tight sm:text-5xl ${
            importing ? "text-rose-300" : "text-neon-cyan"
          }`}
        >
          {flowWord} {flowMw}
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
          Wind is {formatMw(view.latest.wind)},{" "}
          {view.latest.windSharePct.toFixed(0)}% of load (
          {formatMw(view.latest.load)}). Nuclear holds{" "}
          {formatMw(view.latest.nuclear)}.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {(
          [
            ["Wind", view.latest.wind],
            ["Nuclear", view.latest.nuclear],
            ["Hydro", view.latest.hydro],
            ["Load", view.latest.load],
          ] as const
        ).map(([label, value]) => (
          <div key={label}>
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
              {label}
            </dt>
            <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">
              {formatMw(value)}
            </dd>
          </div>
        ))}
      </dl>

      <section>
        <h2 className="font-display text-lg font-semibold text-white">
          Last day on the tape
        </h2>
        <p className="mt-1 mb-4 text-sm text-slate-400">
          When the cyan fill falls and the rose dashed line rises, Finland is
          covering the gap with imports.
        </p>
        <GridTape tape={view.tape} />
      </section>

      {view.price && view.price.n > 0 ? (
        <PriceNowcast view={view} />
      ) : null}

      <section>
        <h2 className="font-display text-lg font-semibold text-white">
          Wind down, imports up
        </h2>
        {view.exceptions.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">
            No 15-minute step in this window had both a wind drop and an
            import rise over 80 MW.
          </p>
        ) : (
          <ol className="mt-4 space-y-3 border-l border-white/10 pl-4">
            {view.exceptions.map((ex) => (
              <li key={ex.t} className="text-sm leading-relaxed text-slate-300">
                <span className="font-mono text-slate-400">
                  {formatHelsinkiUnix(ex.t)}
                </span>
                <span className="mt-0.5 block">{ex.note}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <footer className="border-t border-white/10 pt-6 text-sm leading-relaxed text-slate-400">
        <p>
          As of {formatHelsinki(view.asOf)}. Grain is {view.cadenceMinutes}{" "}
          minutes — this is not a 3-second control-room feed.
        </p>
        <p className="mt-2">
          {view.source}. {view.license}
          {view.price ? ` ${view.price.license}` : ""}
        </p>
      </footer>
    </article>
  );
}

export function PowerPulseMissing() {
  return (
    <article className="space-y-6">
      <BackLink fallbackHref="/portfolio/live" label="Live dashboards" />
      <h1 className="font-display text-3xl font-bold text-white">
        Finland Power Pulse
      </h1>
      <p className="max-w-xl text-slate-300">
        No snapshot on disk. From the website repo run{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-neon-cyan">
          npm run live:fetch
        </code>{" "}
        then reload.
      </p>
    </article>
  );
}
