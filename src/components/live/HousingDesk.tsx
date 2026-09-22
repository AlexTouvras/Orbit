import type { HousingView } from "@/lib/live/housing-types";
import { BackLink } from "@/components/ui/BackLink";
import { DeskStoryHeader } from "@/components/story/DeskStoryHeader";
import { DeskCast } from "@/components/story/DeskCast";
import { DeskPicture } from "@/components/story/DeskPicture";
import { DeskClose } from "@/components/story/DeskClose";
import { StoryStat } from "@/components/story/StoryStat";
import { HousingMap } from "@/components/live/HousingMap";
import { HousingTape } from "@/components/live/HousingTape";

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

function formatPeriod(period: string): string {
  const m = period.match(/^(\d{4})M(\d{2})$/);
  if (m) {
    const month = Number(m[2]);
    const date = new Date(Date.UTC(Number(m[1]), month - 1, 1));
    return date.toLocaleString("en-GB", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }
  const q = period.match(/^(\d{4})Q(\d)$/);
  if (q) return `${q[1]} Q${q[2]}`;
  return period;
}

function formatEurM2(n: number | null): string {
  if (n === null) return "—";
  return `€${Math.round(n).toLocaleString("en-US")}`;
}

function formatPct(n: number | null): string {
  if (n === null) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

function formatInt(n: number | null): string {
  if (n === null) return "—";
  return Math.round(n).toLocaleString("en-US");
}

function toneForDelta(n: number | null): string {
  if (n === null) return "text-white";
  if (n > 0) return "text-emerald-300";
  if (n < 0) return "text-rose-300";
  return "text-white";
}

function latestEur(
  monthly: { period: string; eurM2: number | null }[],
): number | null {
  for (let i = monthly.length - 1; i >= 0; i--) {
    const row = monthly[i];
    if (row && row.eurM2 !== null) return row.eurM2;
  }
  return null;
}

function vsHint(n: number | null, label: string): string {
  if (n === null) return `vs ${label} —`;
  const sign = n > 0 ? "+" : "";
  return `vs ${label} ${sign}${Math.round(n).toLocaleString("en-US")} €/m²`;
}

export function HousingDesk({ view }: { view: HousingView }) {
  const latest = view.latest;
  const monthlyTape =
    view.helsinki?.monthly
      .filter((p) => p.eurM2 !== null)
      .map((p) => ({ period: p.period, value: p.eurM2 as number })) ?? [];
  const quarterlyTape = view.helsinkiQuarterly
    .filter((p) => p.eurM2 !== null)
    .map((p) => ({ period: p.period, value: p.eurM2 as number }));

  const regionMax = Math.max(
    ...view.regions.map((r) => latestEur(r.monthly) ?? 0),
    1,
  );
  const districtMax = Math.max(
    ...view.districts.map((x) => x.eurM2 ?? 0),
    1,
  );

  return (
    <article className="space-y-10">
      <BackLink fallbackHref="/portfolio/live" label="Live dashboards" />

      <DeskStoryHeader
        kicker={`Stat.fi · monthly · ${view.buildingType.label.toLowerCase()}`}
        question="Are Helsinki flats still rising in price?"
        lede="Old flats in housing companies — Helsinki against Espoo, Vantaa, Greater Helsinki, and the country. Monthly prints lag about a month; starred months are provisional."
      />

      {latest ? (
        <DeskCast>
          <StoryStat
            label="€/m²"
            value={formatEurM2(latest.eurM2)}
            hint={`${formatPeriod(latest.period)}${latest.provisional ? " · provisional" : ""}`}
          />
          <StoryStat
            label="MoM"
            value={formatPct(latest.momPct)}
            valueClassName={toneForDelta(latest.momPct)}
          />
          <StoryStat
            label="YoY"
            value={formatPct(latest.yoyPct)}
            valueClassName={toneForDelta(latest.yoyPct)}
          />
          <StoryStat label="Sales" value={formatInt(latest.transactions)} />
          <StoryStat
            label="Days to sale"
            value={formatInt(latest.daysToSale)}
          />
        </DeskCast>
      ) : null}

      {latest ? (
        <p className="text-sm leading-relaxed text-slate-400">
          <span className={toneForDelta(latest.vsGreater)}>
            {vsHint(latest.vsGreater, "Greater Helsinki")}
          </span>
          {" · "}
          <span className={toneForDelta(latest.vsCountry)}>
            {vsHint(latest.vsCountry, "country")}
          </span>
        </p>
      ) : null}

      <DeskPicture label="Capital-region postal €/m²">
        <HousingMap postalAreas={view.postalAreas} postalPeriod={view.postalPeriod} />
      </DeskPicture>

      <section>
        <h2 className="font-display text-lg font-semibold text-white">
          Capital region vs country
        </h2>
        <p className="mt-1 mb-5 text-sm text-slate-400">
          Latest monthly €/m² for blocks of flats.
        </p>
        <ul className="space-y-3">
          {view.regions.map((region) => {
            const eur = latestEur(region.monthly);
            const width =
              eur === null ? 0 : Math.max(4, (eur / regionMax) * 100);
            return (
              <li key={region.id} className="grid grid-cols-[7rem_1fr_5.5rem] items-center gap-3 sm:grid-cols-[9rem_1fr_6rem]">
                <span className="truncate text-sm text-slate-300">
                  {region.label}
                </span>
                <div className="h-2.5 overflow-hidden rounded-sm bg-white/5">
                  <div
                    className="h-full rounded-sm bg-neon-cyan/70"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <span className="text-right font-mono text-sm tabular-nums text-white">
                  {formatEurM2(eur)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {view.districts.length > 0 ? (
        <section>
          <h2 className="font-display text-lg font-semibold text-white">
            Helsinki sub-areas
          </h2>
          <p className="mt-1 mb-5 text-sm text-slate-400">
            Quarterly €/m² · {formatPeriod(view.districts[0]?.period ?? "")} ·
            flats, all room sizes.
          </p>
          <ul className="space-y-3">
            {view.districts.map((d) => {
              const width =
                d.eurM2 === null
                  ? 0
                  : Math.max(4, (d.eurM2 / districtMax) * 100);
              return (
                <li
                  key={d.id}
                  className="grid grid-cols-[7rem_1fr_5.5rem] items-center gap-3 sm:grid-cols-[9rem_1fr_6rem]"
                >
                  <span className="truncate text-sm text-slate-300">
                    {d.label}
                  </span>
                  <div className="h-2.5 overflow-hidden rounded-sm bg-white/5">
                    <div
                      className="h-full rounded-sm bg-neon-cyan/55"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="text-right font-mono text-sm tabular-nums text-white">
                    {formatEurM2(d.eurM2)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {monthlyTape.length >= 2 ? (
        <section>
          <h2 className="font-display text-lg font-semibold text-white">
            Helsinki monthly tape
          </h2>
          <p className="mt-1 mb-4 text-sm text-slate-400">
            Average €/m² for old flats since the 2025=100 index base.
          </p>
          <HousingTape
            points={monthlyTape}
            label="Helsinki monthly"
          />
        </section>
      ) : null}

      {quarterlyTape.length >= 2 ? (
        <section>
          <h2 className="font-display text-lg font-semibold text-white">
            Longer Helsinki history
          </h2>
          <p className="mt-1 mb-4 text-sm text-slate-400">
            Quarterly €/m² — same flats definition, longer window.
          </p>
          <HousingTape
            points={quarterlyTape}
            label="Helsinki quarterly"
          />
        </section>
      ) : null}

      <DeskClose>
        <p>As of {formatHelsinki(view.asOf)}.</p>
        <p className="mt-2">
          {view.source}. {view.license}. Tables{" "}
          <code className="font-mono text-xs text-slate-300">15iq</code>{" "}
          (monthly) and{" "}
          <code className="font-mono text-xs text-slate-300">13mv</code>{" "}
          (quarterly). Not advice — published statistics only.
        </p>
      </DeskClose>
    </article>
  );
}
