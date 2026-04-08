import type { Project2SkillId } from "@/lib/project2/skills";

export type GenerationSkillId = Extract<
  Project2SkillId,
  "website_design" | "image_generation" | "video_generation"
>;

export type GenerationRequestContext = {
  projectName?: string;
  businessType?: string;
  sourceUrl?: string;
  summary?: string;
  selectedStyle?: string;
  assetsProvided?: string[];
  goal?: string;
};

export type GenerationSkillEntry = {
  id: GenerationSkillId;
  title: string;
  sourceSkillPath?: string;
  objective: string;
  triggerWhen: string[];
  outputs: string[];
};

export const GENERATION_SKILL_ENTRIES: Record<GenerationSkillId, GenerationSkillEntry> = {
  website_design: {
    id: "website_design",
    title: "Website Design",
    sourceSkillPath: "src/project2-skills/design/website/SKILL.md",
    objective: "Turn aligned business context into a complete website generation direction.",
    triggerWhen: [
      "The user has provided enough business context to move from沟通阶段 into actual website generation.",
      "A scenario skill such as maps, redesign, or clone has already collected enough context and hands off to the main generation path.",
      "The request is a normal text-only website request without a special external source.",
    ],
    outputs: [
      "Website generation direction",
      "Page/system design plan",
      "Required media plan",
    ],
  },
  image_generation: {
    id: "image_generation",
    title: "Image Generation",
    sourceSkillPath: "src/project2-skills/design/image-generation/SKILL.md",
    objective: "Produce image-based visual assets or image generation directions needed by website design.",
    triggerWhen: [
      "Website design needs generated visual assets.",
      "A section or hero needs a reference-style image output.",
      "Uploaded user images need enhancement before being used on the site.",
    ],
    outputs: ["Image generation direction", "Enhanced image plan", "Visual asset requirements"],
  },
  video_generation: {
    id: "video_generation",
    title: "Video Generation",
    sourceSkillPath: "src/project2-skills/design/video-generation/SKILL.md",
    objective: "Produce hero or launch-related website video directions when motion content is needed.",
    triggerWhen: [
      "Website design needs a hero background video.",
      "The experience needs a launch-style video moment before or during homepage presentation.",
    ],
    outputs: ["Video generation direction", "Hero video brief", "Launch video brief"],
  },
};

export type GenerationExecutionPlan = {
  activeSkill: GenerationSkillId;
  title: string;
  objective: string;
  sourceSkillPath?: string;
  recommendedNextSkills: GenerationSkillId[];
  outputs: string[];
  promptHints: string[];
};

export function buildGenerationPlan(
  skillId: GenerationSkillId,
  context: GenerationRequestContext
): GenerationExecutionPlan {
  const entry = GENERATION_SKILL_ENTRIES[skillId];
  const baseHints = [
    context.projectName ? `Project: ${context.projectName}` : "",
    context.businessType ? `Business: ${context.businessType}` : "",
    context.goal ? `Goal: ${context.goal}` : "",
    context.selectedStyle ? `Style Direction: ${context.selectedStyle}` : "",
    context.sourceUrl ? `Source: ${context.sourceUrl}` : "",
    context.summary ? `Summary: ${context.summary}` : "",
    context.assetsProvided?.length ? `Assets: ${context.assetsProvided.join(", ")}` : "",
  ].filter(Boolean);

  const recommendedNextSkills =
    skillId === "website_design"
      ? (["image_generation", "video_generation"] satisfies GenerationSkillId[])
      : ([] satisfies GenerationSkillId[]);

  return {
    activeSkill: entry.id,
    title: entry.title,
    objective: entry.objective,
    sourceSkillPath: entry.sourceSkillPath,
    recommendedNextSkills,
    outputs: entry.outputs,
    promptHints: baseHints,
  };
}
