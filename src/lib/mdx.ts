import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "src/content/projects");

export interface ProjectFrontmatter {
  id: string;
  title: string;
  category: string;
  year: string;
  client: string;
  role: string;
  coverImage: string;
  description: string;
}

export function getProjectSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getAllProjectsFrontmatter(): ProjectFrontmatter[] {
  return getProjectSlugs().map((slug) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, `${slug}.mdx`), "utf-8");
    const { data } = matter(raw);
    return data as ProjectFrontmatter;
  });
}

export function getProjectSource(slug: string): {
  frontmatter: ProjectFrontmatter;
  source: string;
} | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    frontmatter: data as ProjectFrontmatter,
    source: content,
  };
}
