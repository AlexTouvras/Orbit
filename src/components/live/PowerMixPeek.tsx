import { readPowerMixSnapshot } from "@/lib/live/power-mix";
import { MIX_BUCKETS } from "@/lib/live/power-mix-types";

/** Mini stacked bars for portfolio tiles — no keys. */
export function PowerMixPeek() {
  const snap = readPowerMixSnapshot();
  const rows = snap?.countries.slice(0, 8) ?? [];

  if (rows.length < 3) {
    return (
      <div className="flex h-full w-full flex-col justify-center gap-1.5 bg-void-800 px-4 py-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-2.5 w-full rounded-sm bg-neon-cyan/15"
            style={{ opacity: 1 - i * 0.1 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col justify-center gap-1.5 bg-void-800 px-3 py-4">
      {rows.map((row) => (
        <div
          key={row.id}
          className="flex h-2.5 w-full overflow-hidden rounded-sm bg-white/5"
        >
          {MIX_BUCKETS.map((b) => {
            const pct = row.shares[b.id];
            if (pct < 0.5) return null;
            return (
              <div
                key={b.id}
                style={{ width: `${pct}%`, backgroundColor: b.color }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
