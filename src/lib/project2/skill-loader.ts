import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Project2SkillId } from "@/lib/project2/skills";

export type LoadedSkill = {
  id: Project2SkillId;
  filePath: string;
  name: string;
  description: string;
  content: string;
};

const SKILL_PATHS: Record<Project2SkillId, string> = {
  maps: "src/project2-skills/scenario/maps/SKILL.md",
  redesign: "src/project2-skills/scenario/redesign/SKILL.md",
  clone: "src/project2-skills/scenario/clone/SKILL.md",
  website_design: "src/project2-skills/design/website/SKILL.md",
  image_generation: "src/project2-skills/design/image-generation/SKILL.md",
  video_generation: "src/project2-skills/design/video-generation/SKILL.md",
};

function parseFrontmatter(content: string) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  const raw = match?.[1] || "";
  const name = raw.match(/^name:\s*(.+)$/m)?.[1]?.trim() || "";
  const description = raw.match(/^description:\s*(.+)$/m)?.[1]?.trim() || "";

  return {
    name,
    description,
  };
}

export async function loadSkill(skillId: Project2SkillId): Promise<LoadedSkill> {
  const relativePath = SKILL_PATHS[skillId];
  const filePath = path.join(process.cwd(), relativePath);
  const content = await readFile(filePath, "utf8");
  const meta = parseFrontmatter(content);

  return {
    id: skillId,
    filePath: relativePath,
    name: meta.name,
    description: meta.description,
    content,
  };
}

export function getSkillFilePath(skillId: Project2SkillId) {
  return SKILL_PATHS[skillId];
}

