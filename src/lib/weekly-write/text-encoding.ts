/** Repair common UTF-8 mojibake (e.g. â€" → —) from double-encoding. */
export function repairUtf8Mojibake(input: string): string {
  if (!input || !/â€.|Ã.|Â./.test(input)) return input;

  const repaired = Buffer.from(input, "latin1").toString("utf8");
  if (
    !repaired.includes("\uFFFD") &&
    (repaired.match(/â€/g) || []).length < (input.match(/â€/g) || []).length
  ) {
    return repaired;
  }

  return input
    .replace(/â€”/g, "\u2014")
    .replace(/â€“/g, "\u2013")
    .replace(/â€™/g, "\u2019")
    .replace(/â€˜/g, "\u2018")
    .replace(/â€œ/g, "\u201C")
    .replace(/â€/g, "\u201D")
    .replace(/â€¦/g, "\u2026")
    .replace(/â†’/g, "\u2192")
    .replace(/â†/g, "\u2190")
    .replace(/Ã—/g, "\u00D7")
    .replace(/Â /g, " ")
    .replace(/Â/g, "");
}

export function repairDraftTextFields<T extends Record<string, unknown>>(
  draft: T,
): T {
  const walk = (value: unknown): unknown => {
    if (typeof value === "string") return repairUtf8Mojibake(value);
    if (Array.isArray(value)) return value.map(walk);
    if (value && typeof value === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        out[k] = walk(v);
      }
      return out;
    }
    return value;
  };
  return walk(draft) as T;
}
