import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Project, ProjectFrontmatter } from "@/lib/types";

const PROJECTS_DIR = path.join(process.cwd(), "src", "content", "projects");

function readProjectFile(fileName: string): Project {
  const slug = fileName.replace(/\.mdx?$/, "");
  const fullPath = path.join(PROJECTS_DIR, fileName);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const fm = data as ProjectFrontmatter;

  return {
    slug,
    content,
    title: fm.title,
    summary: fm.summary,
    year: fm.year,
    role: fm.role,
    tags: fm.tags ?? [],
    stack: fm.stack ?? [],
    cover: fm.cover,
    gallery: fm.gallery ?? [],
    repo: fm.repo,
    demo: fm.demo,
    featured: fm.featured ?? false,
    accent: fm.accent ?? "cyan",
  };
}

export function getProjectSlugs(): string[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => f.replace(/\.mdx?$/, ""));
}

export function getAllProjects(): Project[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map(readProjectFile)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.year - a.year;
    });
}

export function getProjectBySlug(slug: string): Project | null {
  const mdx = path.join(PROJECTS_DIR, `${slug}.mdx`);
  const md = path.join(PROJECTS_DIR, `${slug}.md`);
  const file = fs.existsSync(mdx) ? `${slug}.mdx` : fs.existsSync(md) ? `${slug}.md` : null;
  if (!file) return null;
  return readProjectFile(file);
}

export function getFeaturedProjects(limit?: number): Project[] {
  const featured = getAllProjects().filter((p) => p.featured);
  return typeof limit === "number" ? featured.slice(0, limit) : featured;
}
