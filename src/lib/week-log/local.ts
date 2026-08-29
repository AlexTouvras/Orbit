import fs from "node:fs";
import path from "node:path";

/** Sibling Cursor project, e.g. `../fitness` next to this Orbit checkout. */
export function siblingRoot(folder: string): string {
  return path.resolve(process.cwd(), "..", folder);
}

export function readLocalFile(root: string, relPath: string): string | null {
  const full = path.join(root, relPath);
  try {
    if (!fs.existsSync(full) || !fs.statSync(full).isFile()) return null;
    return fs.readFileSync(full, "utf8");
  } catch {
    return null;
  }
}

export function listLocalDir(
  root: string,
  relPath: string,
): Array<{ name: string; path: string; type: "file" | "dir" }> | null {
  const full = path.join(root, relPath);
  try {
    if (!fs.existsSync(full) || !fs.statSync(full).isDirectory()) return null;
    return fs.readdirSync(full, { withFileTypes: true }).map((entry) => ({
      name: entry.name,
      path: path.posix.join(relPath.replaceAll("\\", "/"), entry.name),
      type: entry.isDirectory() ? "dir" : "file",
    }));
  } catch {
    return null;
  }
}
