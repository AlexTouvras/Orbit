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
    readingTime: readingTimeMinutes(content),
  };
}

export function getWriteSlugs(): string[] {
  if (!fs.existsSync(WRITES_DIR)) return [];
  return fs
    .readdirSync(WRITES_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => f.replace(/\.mdx?$/, ""));
}

export function getAllWrites(): Write[] {
  if (!fs.existsSync(WRITES_DIR)) return [];
  return fs
    .readdirSync(WRITES_DIR)
    .filter((f) => /\.mdx?$/.test(f))
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

export function getFeaturedWrites(limit?: number): Write[] {
  const featured = getAllWrites().filter((w) => w.featured);
  const list = featured.length > 0 ? featured : getAllWrites();
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

export function getLatestWrites(limit = 3): Write[] {
  return getAllWrites().slice(0, limit);
}
