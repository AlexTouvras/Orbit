function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function markdownSection(markdown: string, heading: string): string {
  const re = new RegExp(
    `(?:^|\\n)##\\s+${escapeRegExp(heading)}[^\\n]*\\r?\\n([\\s\\S]*?)(?=\\n##\\s+|$)`,
    "i",
  );
  return markdown.match(re)?.[1]?.trim() ?? "";
}

export function firstMarkdownParagraph(markdown: string): string {
  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  for (const line of lines) {
    if (line.startsWith("#")) continue;
    if (line.startsWith("|") || line.startsWith("---")) continue;
    return line.replace(/\*\*/g, "").trim();
  }
  return "";
}

function splitRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

export function parseMarkdownTable(block: string): {
  headers: string[];
  rows: string[][];
} {
  const lines = block
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"));
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = splitRow(lines[0]).map((h) => h.replace(/\*\*/g, ""));
  const rows: string[][] = [];
  for (const line of lines.slice(2)) {
    if (/^\|?\s*:?-{3,}/.test(line)) continue;
    const cells = splitRow(line).map((cell) =>
      cell.replace(/\*\*/g, "").replace(/\\$/g, "").trim(),
    );
    if (cells.every((cell) => cell === "" || /^:?-{3,}:?$/.test(cell))) continue;
    rows.push(cells);
  }
  return { headers, rows };
}

export function cellLink(cell: string): { text: string; href?: string } {
  const match = cell.match(/\[([^\]]+)\]\((https?:[^)]+)\)/);
  if (match) {
    return { text: `${cell.replace(match[0], match[1]).trim()}`, href: match[2] };
  }
  const url = cell.match(/https?:\/\/[^\s)]+/);
  return { text: cell.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(), href: url?.[0] };
}
