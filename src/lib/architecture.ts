import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ARCH_DIR = path.join(process.cwd(), "src", "content", "architecture");

export interface ArchitectureDoc {
  slug: string;
  title: string;
  summary: string;
  projectDir: string;
  content: string;
}

/** Essay that links to this architecture page (for back navigation). */
export const ARCHITECTURE_ESSAY_LINKS: Record<
  string,
  { title: string; href: string }
> = {
  "orbit-platform": {
    title: "Building Orbit",
    href: "/writes/building-orbit",
  },
  "powerbi-portfolio": {
    title: "Power BI portfolio",
    href: "/writes/power-bi-portfolio-nordic-boardroom",
  },
};

/** Reverse map: write slug → architecture page slug (if any). */
export function architectureSlugForWrite(writeSlug: string): string | null {
  const href = `/writes/${writeSlug}`;
  for (const [archSlug, essay] of Object.entries(ARCHITECTURE_ESSAY_LINKS)) {
    if (essay.href === href) return archSlug;
  }
  return null;
}

function readArchFile(fileName: string): ArchitectureDoc {
  const slug = fileName.replace(/\.mdx?$/, "");
  const raw = fs.readFileSync(path.join(ARCH_DIR, fileName), "utf8");
  const { data, content } = matter(raw);
  const fm = data as {
    title?: string;
    summary?: string;
    projectDir?: string;
  };

  return {
    slug,
    title: fm.title ?? slug,
    summary: fm.summary ?? "",
    projectDir: fm.projectDir ?? "",
    content,
  };
}

export function getArchitectureSlugs(): string[] {
  if (!fs.existsSync(ARCH_DIR)) return [];
  return fs
    .readdirSync(ARCH_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => f.replace(/\.mdx?$/, ""));
}

export function getArchitectureBySlug(slug: string): ArchitectureDoc | null {
  const mdx = path.join(ARCH_DIR, `${slug}.mdx`);
  const md = path.join(ARCH_DIR, `${slug}.md`);
  const file = fs.existsSync(mdx)
    ? `${slug}.mdx`
    : fs.existsSync(md)
      ? `${slug}.md`
      : null;
  if (!file) return null;
  return readArchFile(file);
}
