import type { PowerMixView } from "@/lib/live/power-mix-types";
import { MIX_BUCKETS } from "@/lib/live/power-mix-types";
import { BackLink } from "@/components/ui/BackLink";
import { Badge } from "@/components/ui/Badge";

function formatHelsinki(iso: string): string {
  return `${new Date(iso).toLocaleString("en-GB", {
    timeZone: "Europe/Helsinki",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} Helsinki`;
}

function flagEmoji(iso2: string): string {
  const A = 0x1f1e6;
  const chars = iso2.toUpperCase();
  if (chars.length !== 2) return "";
  return String.fromCodePoint(
    A + chars.charCodeAt(0) - 65,
    A + chars.charCodeAt(1) - 65,
  );
}

function formatPct(n: number): string {
  if (n < 0.5) return "";
  if (n < 3) return `${Math.round(n)}`;
  return `${Math.round(n)}%`;
}

export function PowerMixDesk({ view }: { view: PowerMixView }) {
  const cleanest = view.countries[0];
  const dirtiest = view.countries[view.countries.length - 1];

  return (
    <article className="space-y-10">
      <BackLink fallbackHref="/portfolio/live" label="Live dashboards" />

      <header>
        <Badge tone="cyan" className="mb-4">
          Last 24h · generation share
        </Badge>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          What is Europe generating from today?
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
          Country bars are 100% of measured generation over the last day —
          not capacity, not load. Sorted clean → fossil so the story is the
          mix, not the map.
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <div>
          <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
            Countries
          </dt>
          <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white">
            {view.countries.length}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
            Europe fossil
          </dt>
          <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-amber-200">
            {Math.round(view.europe.fossil)}%
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
            Cleanest
          </dt>
          <dd className="mt-1 text-lg font-semibold text-white">
            {cleanest
              ? `${flagEmoji(cleanest.iso2)} ${cleanest.label}`
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
            Most fossil
          </dt>
          <dd className="mt-1 text-lg font-semibold text-white">
            {dirtiest
              ? `${flagEmoji(dirtiest.iso2)} ${dirtiest.label}`
              : "—"}
          </dd>
        </div>
      </dl>

      <ul
        className="flex flex-wrap gap-x-4 gap-y-2"
        aria-label="Generation mix legend"
      >
        {MIX_BUCKETS.map((b) => (
          <li key={b.id} className="inline-flex items-center gap-2 text-sm text-slate-300">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: b.color }}
              aria-hidden
            />
            {b.label}
          </li>
        ))}
      </ul>

      <section aria-label="Country generation mix">
        <ul className="space-y-2.5">
          {view.countries.map((row) => (
            <li
              key={row.id}
              className="grid grid-cols-[7.5rem_1fr] items-center gap-3 sm:grid-cols-[9.5rem_1fr]"
            >
              <div className="flex items-center gap-2 truncate text-sm text-slate-200">
                <span aria-hidden className="text-base leading-none">
                  {flagEmoji(row.iso2)}
                </span>
                <span className="truncate">{row.label}</span>
              </div>
              <div
                className="flex h-7 w-full overflow-hidden rounded-sm bg-white/5"
                role="img"
                aria-label={`${row.label}: fossil ${Math.round(row.shares.fossil)}%, nuclear ${Math.round(row.shares.nuclear)}%, wind ${Math.round(row.shares.wind)}%, hydro ${Math.round(row.shares.hydro)}%, solar ${Math.round(row.shares.solar)}%`}
              >
                {MIX_BUCKETS.map((b) => {
                  const pct = row.shares[b.id];
                  if (pct < 0.4) return null;
                  const label = formatPct(pct);
                  return (
                    <div
                      key={b.id}
                      className="relative flex h-full items-center justify-center overflow-hidden"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: b.color,
                      }}
                      title={`${b.label} ${pct.toFixed(1)}%`}
                    >
                      {pct >= 7 && label ? (
                        <span className="px-0.5 font-mono text-[0.65rem] font-semibold tabular-nums text-void/90">
                          {label}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-white">
          Europe roll-up
        </h2>
        <p className="mt-1 mb-4 text-sm text-slate-400">
          Generation-weighted across the countries above — not equal-country
          average.
        </p>
        <div
          className="flex h-10 w-full overflow-hidden rounded-sm bg-white/5"
          role="img"
          aria-label={`Europe fossil ${Math.round(view.europe.fossil)} percent`}
        >
          {MIX_BUCKETS.map((b) => {
            const pct = view.europe[b.id];
            if (pct < 0.4) return null;
            return (
              <div
                key={b.id}
                className="flex h-full items-center justify-center"
                style={{ width: `${pct}%`, backgroundColor: b.color }}
              >
                {pct >= 8 ? (
                  <span className="font-mono text-xs font-semibold tabular-nums text-void/90">
                    {Math.round(pct)}%
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-white/10 pt-6 text-sm leading-relaxed text-slate-400">
        <p>As of {formatHelsinki(view.asOf)}.</p>
        <p className="mt-2">
          Window {formatHelsinki(view.windowStart)} →{" "}
          {formatHelsinki(view.windowEnd)}. {view.source}. {view.license}.
        </p>
        <p className="mt-2 text-slate-500">
          Shares exclude load and storage consumption. Small segments omit
          labels. Not a capacity chart.
        </p>
      </footer>
    </article>
  );
}

export function PowerMixMissing() {
  return (
    <article className="space-y-6">
      <BackLink fallbackHref="/portfolio/live" label="Live dashboards" />
      <h1 className="font-display text-3xl font-bold text-white">
        Europe Power Mix
      </h1>
      <p className="max-w-xl text-slate-300">
        No snapshot on disk. Run{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-neon-cyan">
          npm run live:fetch-mix
        </code>{" "}
        then reload.
      </p>
    </article>
  );
}
