import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Write, WriteFrontmatter } from "@/lib/types";

const WRITES_DIR = path.join(process.cwd(), "src", "content", "writes");

function readingTimeMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function readWriteFile(fileName: string): Write {
  const slug = fileName.replace(/\.mdx?$/, "");
  const fullPath = path.join(WRITES_DIR, fileName);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const fm = data as WriteFrontmatter;

  return {
    slug,
    content,
    title: fm.title,
    summary: fm.summary,
    date: fm.date,
    tags: fm.tags ?? [],
    category: fm.category,
    featured: fm.featured ?? false,
    showcase: fm.showcase ?? false,
    readingTime: readingTimeMinutes(content),
  };
}

function isEssayFile(fileName: string): boolean {
  return /\.mdx?$/.test(fileName) && !fileName.endsWith("-architecture.mdx");
}

export function getWriteSlugs(): string[] {
  if (!fs.existsSync(WRITES_DIR)) return [];
  return fs
    .readdirSync(WRITES_DIR)
    .filter(isEssayFile)
    .map((f) => f.replace(/\.mdx?$/, ""));
}

export function getAllWrites(): Write[] {
  if (!fs.existsSync(WRITES_DIR)) return [];
  return fs
    .readdirSync(WRITES_DIR)
    .filter(isEssayFile)
    .map(readWriteFile)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export function getWriteBySlug(slug: string): Write | null {
  const mdx = path.join(WRITES_DIR, `${slug}.mdx`);
  const md = path.join(WRITES_DIR, `${slug}.md`);
  const file = fs.existsSync(mdx) ? `${slug}.mdx` : fs.existsSync(md) ? `${slug}.md` : null;
  if (!file) return null;
  return readWriteFile(file);
}

/** Home “From the blog” — article teasers; excludes showcase posts. */
export function getFeaturedWrites(limit?: number): Write[] {
  const all = getAllWrites();
  const featured = all.filter((w) => w.featured && !w.showcase);
  const list =
    featured.length > 0 ? featured : all.filter((w) => !w.showcase);
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

/** Home “Selected work” — system / project showcases from the same MDX bank. */
export function getShowcaseWrites(limit?: number): Write[] {
  const showcase = getAllWrites().filter((w) => w.showcase);
  return typeof limit === "number" ? showcase.slice(0, limit) : showcase;
}

export function getLatestWrites(limit = 3): Write[] {
  return getAllWrites().slice(0, limit);
}
