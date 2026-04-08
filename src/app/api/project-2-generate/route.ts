import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  buildGenerationPlan,
  type GenerationRequestContext,
  type GenerationSkillId,
} from "@/lib/project2/generation-skills";
import { loadSkill } from "@/lib/project2/skill-loader";
import { getSkillContract } from "@/lib/project2/skills";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = process.env.PROJECT2_TEXT_MODEL || "anthropic/claude-sonnet-4";
const RUNWARE_URL = "https://api.runware.ai/v1";
const RUNWARE_IMAGE_MODEL = process.env.RUNWARE_IMAGE_MODEL || "runware:101@1";
const RUNWARE_VIDEO_MODEL = process.env.RUNWARE_VIDEO_MODEL || "klingai:1@1";

type GenerateRequest = {
  skill?: GenerationSkillId;
  context?: GenerationRequestContext;
};

type WebsiteBrief = {
  projectSummary: string;
  pages: string[];
  styleDirection: string;
  mediaPlan: string[];
  buildPrompt: string;
};

type GenerationResult =
  | {
      skill: "website_design";
      title: string;
      summary: string;
      format: "website_brief";
      websiteBrief: WebsiteBrief;
    }
  | {
      skill: "image_generation";
      title: string;
      summary: string;
      format: "image";
      imageUrls: string[];
    }
  | {
      skill: "video_generation";
      title: string;
      summary: string;
      format: "video";
      videoUrl: string;
    };

class Project2APIError extends Error {
  status: number;
  details?: string;

  constructor(message: string, status: number, details?: string) {
    super(message);
    this.name = "Project2APIError";
    this.status = status;
    this.details = details;
  }
}

async function callOpenRouterJSON({
  system,
  user,
}: {
  system: string;
  user: string;
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": "Project 2 Generation Demo",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Project2APIError(`OpenRouter error (${res.status})`, res.status, errorText);
  }

  const data = await res.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error("OpenRouter returned empty content");
  }

  return JSON.parse(rawContent);
}

function buildContextSummary(context: GenerationRequestContext) {
  return [
    context.projectName ? `Project: ${context.projectName}` : "",
    context.businessType ? `Business Type: ${context.businessType}` : "",
    context.goal ? `Goal: ${context.goal}` : "",
    context.selectedStyle ? `Selected Style: ${context.selectedStyle}` : "",
    context.sourceUrl ? `Source URL: ${context.sourceUrl}` : "",
    context.summary ? `Summary: ${context.summary}` : "",
    context.assetsProvided?.length ? `Assets: ${context.assetsProvided.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function generateWebsiteDesign(
  context: GenerationRequestContext,
  skillContent: string
): Promise<GenerationResult> {
  const system = [
    "You are generating a website design brief for a portfolio demo.",
    "Return valid JSON only.",
    "Use this skill definition as the primary guidance:",
    skillContent,
  ].join("\n\n");

  const user = [
    "Generate a website design brief from this context.",
    "Return JSON with keys: projectSummary, pages, styleDirection, mediaPlan, buildPrompt.",
    "pages and mediaPlan must be arrays of strings.",
    buildContextSummary(context),
  ].join("\n\n");

  const result = (await callOpenRouterJSON({ system, user })) as WebsiteBrief;

  return {
    skill: "website_design",
    title: "Website Design Result",
    summary: "已经根据当前沟通内容生成了网站设计 brief，可继续进入图片和视频生成。",
    format: "website_brief",
    websiteBrief: {
      projectSummary: result.projectSummary || "Website direction generated.",
      pages: Array.isArray(result.pages) ? result.pages.map(String) : ["Home"],
      styleDirection: result.styleDirection || "Modern tailored direction",
      mediaPlan: Array.isArray(result.mediaPlan) ? result.mediaPlan.map(String) : [],
      buildPrompt: result.buildPrompt || "Create a polished website based on the aligned context.",
    },
  };
}

async function callRunware(tasks: Array<Record<string, unknown>>) {
  const apiKey = process.env.RUNWARE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RUNWARE_API_KEY");
  }

  const res = await fetch(RUNWARE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tasks),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Project2APIError(`Runware error (${res.status})`, res.status, errorText);
  }

  return res.json();
}

function buildImagePrompt(context: GenerationRequestContext) {
  return [
    "Create a premium website hero / section visual.",
    context.businessType ? `Business: ${context.businessType}.` : "",
    context.selectedStyle ? `Style: ${context.selectedStyle}.` : "",
    context.goal ? `Goal: ${context.goal}.` : "",
    "The image should feel commercial, polished, and suitable for a high-end website.",
    "Leave enough compositional breathing room for headline and CTA overlay.",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildVideoPrompt(context: GenerationRequestContext) {
  return [
    "Cinematic hero background video for a website landing page.",
    context.businessType ? `Business: ${context.businessType}.` : "",
    context.selectedStyle ? `Style: ${context.selectedStyle}.` : "",
    "Use slow, restrained motion and preserve negative space for website copy.",
    "No text, no watermark, suitable as a premium hero background.",
  ]
    .filter(Boolean)
    .join(" ");
}

async function generateImage(context: GenerationRequestContext): Promise<GenerationResult> {
  const taskUUID = randomUUID();
  const response = await callRunware([
    {
      taskType: "imageInference",
      taskUUID,
      outputType: "URL",
      positivePrompt: buildImagePrompt(context),
      model: RUNWARE_IMAGE_MODEL,
      numberResults: 2,
      width: 1344,
      height: 768,
    },
  ]);

  const data = Array.isArray(response?.data) ? response.data : [];
  const imageUrls = data
    .map((item: Record<string, unknown>) => item.imageURL)
    .filter((value: unknown): value is string => typeof value === "string");

  if (!imageUrls.length) {
    throw new Error("Runware did not return image URLs");
  }

  return {
    skill: "image_generation",
    title: "Image Generation Result",
    summary: "已经生成可用于网站 Hero 或版块视觉的图片结果。",
    format: "image",
    imageUrls,
  };
}

async function pollRunwareVideo(taskUUID: string) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await callRunware([
      {
        taskType: "getResponse",
        taskUUID: randomUUID(),
        taskUUIDs: [taskUUID],
      },
    ]);

    const data = Array.isArray(response?.data) ? response.data : [];
    const match = data.find((item: Record<string, unknown>) => item.taskUUID === taskUUID) as
      | Record<string, unknown>
      | undefined;

    const videoUrl = match?.videoURL;
    if (typeof videoUrl === "string" && videoUrl) {
      return videoUrl;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("Runware video generation timed out");
}

async function generateVideo(context: GenerationRequestContext): Promise<GenerationResult> {
  const inferenceUUID = randomUUID();
  await callRunware([
    {
      taskType: "videoInference",
      taskUUID: inferenceUUID,
      outputType: "URL",
      positivePrompt: buildVideoPrompt(context),
      model: RUNWARE_VIDEO_MODEL,
      duration: 5,
      width: 1280,
      height: 720,
    },
  ]);

  const videoUrl = await pollRunwareVideo(inferenceUUID);

  return {
    skill: "video_generation",
    title: "Video Generation Result",
    summary: "已经生成可用于网站 Hero 背景的视频结果。",
    format: "video",
    videoUrl,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateRequest;
    const skill = body.skill || "website_design";
    const context = body.context || {};
    const plan = buildGenerationPlan(skill, context);
    const contract = getSkillContract(skill);
    const loadedSkill = await loadSkill(skill);

    let result: GenerationResult | undefined;
    if (skill === "website_design") {
      result = await generateWebsiteDesign(context, loadedSkill.content);
    } else if (skill === "image_generation") {
      result = await generateImage(context);
    } else if (skill === "video_generation") {
      result = await generateVideo(context);
    }

    return NextResponse.json({
      ok: true,
      status: "completed",
      message: `${contract.title} 已完成。`,
      received: body,
      execution: {
        skill: plan.activeSkill,
        kind: contract.kind,
        title: contract.title,
        objective: plan.objective,
        sourceSkillPath: plan.sourceSkillPath,
        skillMeta: {
          name: loadedSkill.name,
          description: loadedSkill.description,
          filePath: loadedSkill.filePath,
        },
        recommendedNextSkills: plan.recommendedNextSkills,
        outputs: plan.outputs,
        promptHints: plan.promptHints,
      },
      result,
    });
  } catch (error) {
    const status =
      error instanceof Project2APIError
        ? error.status
        : 400;

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Invalid request body",
        details:
          error instanceof Project2APIError
            ? error.details
            : undefined,
      },
      { status }
    );
  }
}
