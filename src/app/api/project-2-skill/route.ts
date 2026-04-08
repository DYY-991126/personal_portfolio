import { NextResponse } from "next/server";
import type { Project2SkillId } from "@/lib/project2/skills";
import { getSkillContract } from "@/lib/project2/skills";
import { loadSkill } from "@/lib/project2/skill-loader";

const ALLOWED_SKILLS: Project2SkillId[] = [
  "maps",
  "redesign",
  "clone",
  "website_design",
  "image_generation",
  "video_generation",
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const skill = searchParams.get("skill") as Project2SkillId | null;

  if (!skill || !ALLOWED_SKILLS.includes(skill)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing or invalid skill",
      },
      { status: 400 }
    );
  }

  try {
    const loadedSkill = await loadSkill(skill);
    const contract = getSkillContract(skill);

    return NextResponse.json({
      ok: true,
      skill: {
        id: contract.id,
        kind: contract.kind,
        title: contract.title,
        objective: contract.objective,
        handoffTo: contract.handoffTo || [],
        invokesWhenNeeded: contract.invokesWhenNeeded || [],
        meta: {
          name: loadedSkill.name,
          description: loadedSkill.description,
          filePath: loadedSkill.filePath,
        },
        content: loadedSkill.content,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to load skill",
      },
      { status: 500 }
    );
  }
}
