import type {
  EconomyGeoBundle,
  EconomyLatestCell,
  EconomyMetricId,
} from "@/lib/live/economy-types";

function cell(
  latest: EconomyLatestCell[],
  metric: EconomyMetricId,
): EconomyLatestCell | undefined {
  return latest.find((c) => c.metric === metric);
}

function formatPeriod(period: string): string {
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [y, m] = period.split("-");
    const date = new Date(Date.UTC(Number(y), Number(m) - 1, 1));
    return date.toLocaleString("en-GB", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }
  if (/^\d{4}-Q\d$/.test(period)) {
    return `${period.slice(0, 4)} ${period.slice(5)}`;
  }
  if (/^\d{4}Q\d$/.test(period)) {
    return `${period.slice(0, 4)} Q${period.slice(5)}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    return new Date(`${period}T00:00:00Z`).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }
  return period;
}

function pct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

function signedPp(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)} pp`;
}

function inflationClause(c: EconomyLatestCell | undefined): string | null {
  if (!c || c.value === null) return null;
  const when = formatPeriod(c.period);
  if (c.delta === null || c.delta === 0) {
    return `HICP inflation held at ${pct(c.value)} in ${when}`;
  }
  if (c.delta > 0) {
    return `HICP inflation rose to ${pct(c.value)} in ${when} (${signedPp(c.delta)})`;
  }
  return `HICP inflation eased to ${pct(c.value)} in ${when} (${signedPp(c.delta)})`;
}

function unemploymentClause(c: EconomyLatestCell | undefined): string | null {
  if (!c || c.value === null) return null;
  const when = formatPeriod(c.period);
  if (c.delta === null || c.delta === 0) {
    return `unemployment was steady at ${pct(c.value)} in ${when}`;
  }
  if (c.delta > 0) {
    return `unemployment edged up to ${pct(c.value)} in ${when} (${signedPp(c.delta)})`;
  }
  return `unemployment edged down to ${pct(c.value)} in ${when} (${signedPp(c.delta)})`;
}

function confidenceClause(c: EconomyLatestCell | undefined): string | null {
  if (!c || c.value === null) return null;
  const when = formatPeriod(c.period);
  const level = `${c.value > 0 ? "+" : ""}${c.value.toFixed(1)}`;
  if (c.delta === null || c.delta === 0) {
    return `consumer confidence sat at ${level} in ${when}`;
  }
  if (c.delta > 0) {
    return `consumer confidence improved to ${level} in ${when}`;
  }
  return `consumer confidence softened to ${level} in ${when}`;
}

function gdpClause(c: EconomyLatestCell | undefined): string | null {
  if (!c || c.value === null) return null;
  const when = formatPeriod(c.period);
  const level = `${c.value > 0 ? "+" : ""}${c.value.toFixed(1)}%`;
  if (c.value > 0) {
    return `GDP grew ${level} in ${when}`;
  }
  if (c.value < 0) {
    return `GDP contracted ${level} in ${when}`;
  }
  return `GDP was flat in ${when}`;
}

function policyClause(c: EconomyLatestCell | undefined): string | null {
  if (!c || c.value === null) return null;
  const when = formatPeriod(c.period);
  if (c.delta === null || c.delta === 0) {
    return `the ECB deposit rate is ${pct(c.value)} (as of ${when})`;
  }
  if (c.delta > 0) {
    return `the ECB deposit rate is ${pct(c.value)} after a ${signedPp(c.delta)} move (as of ${when})`;
  }
  return `the ECB deposit rate is ${pct(c.value)} after a ${signedPp(c.delta)} cut (as of ${when})`;
}

function joinClauses(parts: string[]): string {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!;
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join("; ")}; and ${parts[parts.length - 1]}`;
}

/**
 * Short monthly brief for the spotlighted geo, built from latest prints.
 * Deterministic — no model call.
 */
export function economyMonthlyBrief(
  focus: EconomyGeoBundle,
  euroArea: EconomyGeoBundle | null,
): string {
  const latest = focus.latest;
  const clauses = [
    inflationClause(cell(latest, "inflation")),
    unemploymentClause(cell(latest, "unemployment")),
    confidenceClause(cell(latest, "confidence")),
    gdpClause(cell(latest, "gdp")),
    policyClause(cell(latest, "policyRate")),
  ].filter((c): c is string => Boolean(c));

  if (clauses.length === 0) {
    return `${focus.label}: no fresh prints in this snapshot yet.`;
  }

  // Capitalize first clause for sentence start.
  const body = joinClauses(clauses);
  const lead = `${focus.label} monthly brief — ${body.charAt(0).toUpperCase()}${body.slice(1)}.`;

  if (!euroArea || euroArea.id === focus.id) return lead;

  const eaInf = cell(euroArea.latest, "inflation");
  const foInf = cell(latest, "inflation");
  if (
    eaInf?.value !== null &&
    eaInf?.value !== undefined &&
    foInf?.value !== null &&
    foInf?.value !== undefined
  ) {
    const gap = foInf.value - eaInf.value;
    const gapText =
      Math.abs(gap) < 0.05
        ? "in line with the euro area"
        : gap > 0
          ? `${gap.toFixed(1)} pp above the euro area`
          : `${Math.abs(gap).toFixed(1)} pp below the euro area`;
    return `${lead} Inflation is ${gapText} (${pct(eaInf.value)}).`;
  }

  return lead;
}
