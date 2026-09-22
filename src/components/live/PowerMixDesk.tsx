import type { PowerMixView } from "@/lib/live/power-mix-types";
import { MIX_BUCKETS } from "@/lib/live/power-mix-types";
import { BackLink } from "@/components/ui/BackLink";
import { DeskStoryHeader } from "@/components/story/DeskStoryHeader";
import { DeskCast } from "@/components/story/DeskCast";
import { DeskPicture } from "@/components/story/DeskPicture";
import { DeskClose } from "@/components/story/DeskClose";
import { StoryStat } from "@/components/story/StoryStat";

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

function countryLabel(
  row: { iso2: string; label: string } | undefined,
): string {
  if (!row) return "—";
  const flag = flagEmoji(row.iso2);
  return flag ? `${flag} ${row.label}` : row.label;
}

export function PowerMixDesk({ view }: { view: PowerMixView }) {
  const cleanest = view.countries[0];
  const dirtiest = view.countries[view.countries.length - 1];

  return (
    <article className="space-y-10">
      <BackLink fallbackHref="/portfolio/live" label="Live dashboards" />

      <DeskStoryHeader
        kicker="Last 24h · generation share"
        question="What is Europe making its electricity from today?"
        lede="Country bars are 100% of measured generation over the last day — not capacity, not load. Sorted clean → fossil so the story is the mix, not the map."
      />

      <DeskCast className="lg:grid-cols-4">
        <StoryStat
          label="Europe fossil"
          value={`${Math.round(view.europe.fossil)}%`}
          countTo={Math.round(view.europe.fossil)}
          suffix="%"
          valueClassName="text-amber-200"
        />
        <StoryStat
          label="Countries"
          value={String(view.countries.length)}
          countTo={view.countries.length}
        />
        <StoryStat
          label="Cleanest"
          value={countryLabel(cleanest)}
          hint={
            cleanest
              ? `${Math.round(cleanest.shares.fossil)}% fossil`
              : undefined
          }
        />
        <StoryStat
          label="Most fossil"
          value={countryLabel(dirtiest)}
          hint={
            dirtiest
              ? `${Math.round(dirtiest.shares.fossil)}% fossil`
              : undefined
          }
        />
      </DeskCast>

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

      <DeskPicture label="Country generation mix">
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
      </DeskPicture>

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

      <DeskClose>
        <p>As of {formatHelsinki(view.asOf)}.</p>
        <p className="mt-2">
          Window {formatHelsinki(view.windowStart)} →{" "}
          {formatHelsinki(view.windowEnd)}. {view.source}. {view.license}.
        </p>
        <p className="mt-2 text-slate-500">
          Shares exclude load and storage consumption. Small segments omit
          labels. Not a capacity chart.
        </p>
      </DeskClose>
    </article>
  );
}
