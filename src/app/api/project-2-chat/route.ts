import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  buildMarkdownExcerpt,
  extractGoogleMapsHints,
  extractPageSignals,
  fetchFirecrawlMarkdown,
  fetchSerpApiPlaceFromMapsUrl,
  fetchWebsiteMetadata,
  getLinkType,
} from "@/lib/project2/link-intelligence";
import { loadSkill } from "@/lib/project2/skill-loader";
import { getSkillContract, inferScenarioSkill } from "@/lib/project2/skills";
import type { Project2UIToolCall as UIToolCall } from "@/lib/project2/ui-tools";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.PROJECT2_TEXT_MODEL || "anthropic/claude-sonnet-4";
const PROMPT_PATH = path.join(process.cwd(), "src/prompts/project-2-chat-prompt.md");
const TOOLS_OVERVIEW_PATH = path.join(process.cwd(), "src/prompts/project-2-tools-overview.md");
const SKILLS_OVERVIEW_PATH = path.join(process.cwd(), "src/prompts/project-2-skills-overview.md");

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
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

function getLatestUserMessage(messages: ChatMessage[]) {
  return [...messages].reverse().find((message) => message.role === "user")?.content || "";
}

const UI_TOOLS = [
  {
    type: "function",
    function: {
      name: "firecrawl",
      description:
        "Read and research a user-provided link. Use this to inspect a website or Google Maps link, understand the source, and extract the key facts needed for the next step.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string" },
          intent: { type: "string" },
          focus: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "design_content_structure",
      description:
        "Required to present or revise the website content structure card. You propose pages and modules; do not ask the user to list or brainstorm main pages/columns first—never replace this with markdown bullets, example page lists, or wegic_options of page names in chat. Call this tool so the user sees the structure UI. Use when Discovery is sufficient or the user asks to change structure. If transcript shows the card was already sent and the user is only approving, advance to the next step instead of calling again.",
      parameters: {
        type: "object",
        properties: {
          siteName: { type: "string" },
          pages: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                description: { type: "string" },
                modules: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      purpose: { type: "string" },
                      assets: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            type: {
                              type: "string",
                              enum: ["image", "text", "video", "audio", "link"],
                            },
                            description: { type: "string" },
                            count: { type: "number" },
                            required: { type: "boolean" },
                            status: {
                              type: "string",
                              enum: ["missing", "collected", "partial"],
                            },
                          },
                          required: ["type", "description", "count", "required", "status"],
                        },
                      },
                    },
                    required: ["id", "name"],
                  },
                },
              },
              required: ["id", "name", "modules"],
            },
          },
        },
        required: ["pages"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_style_references",
      description:
        "Show style reference cards when entering the visual-style step. Required in the same turn whenever you would tell the user you prepared reference images or ask which visual direction they prefer—do not only describe that in chat. After the user clearly chose one reference, do not call again unless they ask to see more options or restart style.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          referenceImages: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                imageUrl: { type: "string" },
                accent: { type: "string" },
              },
              required: ["id", "title"],
            },
          },
        },
        required: ["referenceImages"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_asset_collection_form",
      description:
        "Show the materials collection UI for factual assets. After the user locks a style direction, normally call this in the same turn—do not only describe uploads in chat; prose does not render the form. Do not ask first whether the user will upload; the form supports skip/optional fields. Keep reassurance to one short line alongside the form.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          submitLabel: { type: "string" },
          skipLabel: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                description: { type: "string" },
                type: {
                  type: "string",
                  enum: ["text", "file"],
                },
                placeholder: { type: "string" },
                required: { type: "boolean" },
                accept: { type: "string" },
              },
              required: ["id", "name", "description", "type"],
            },
          },
        },
        required: ["items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "website_ready_summary",
      description:
        "Required to show the final “生成网站卡片” (website production plan) with CTA after asset collection is complete. Call in the same turn when the user submits or skips the materials form, or when the conversation is otherwise ready for generation handoff. Populate from the full transcript (structure, style, materials). Do not only say “正在生成” or paste the plan in chat — the card is the only surface for the payment CTA. visitorBenefits should usually be exactly 3 strings: (1) 网站目标, (2) 网站核心内容, (3) 关键资料/素材摘要 (e.g. 哪些用 AI 生成、已上传项). If telemetry shows this card was already sent and the user is only tapping the CTA or confirming, do not call again.",
      parameters: {
        type: "object",
        properties: {
          businessName: { type: "string", description: "Brand or site title shown on the card." },
          businessDescription: {
            type: "string",
            description: "One short line under the brand: what the site is for.",
          },
          visitorBenefits: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
            description:
              "Maps to the three rows on the card when you pass 3 strings: 网站目标, 网站核心内容, 关键资料. Use the user's language.",
          },
        },
        required: ["businessName", "businessDescription", "visitorBenefits"],
      },
    },
  },
] as const;

async function loadSystemPrompt() {
  const [prompt, toolsOverview, skillsOverview] = await Promise.all([
    readFile(PROMPT_PATH, "utf8"),
    readFile(TOOLS_OVERVIEW_PATH, "utf8"),
    readFile(SKILLS_OVERVIEW_PATH, "utf8"),
  ]);

  return [prompt, toolsOverview, skillsOverview].join("\n\n");
}

async function hydrateToolPayload(
  toolName: string,
  payload: Record<string, unknown>,
  latestUserMessage?: string
) {
  if (toolName === "firecrawl") {
    const url = String(payload.url || "");
    const linkType = getLinkType(url);
    const metadata = linkType === "website" ? await fetchWebsiteMetadata(url) : {};
    const firecrawlMarkdown = linkType !== "unknown" ? await fetchFirecrawlMarkdown(url) : undefined;
    const placeProfile = linkType === "google_maps" ? await fetchSerpApiPlaceFromMapsUrl(url) : undefined;
    const markdownExcerpt = buildMarkdownExcerpt(firecrawlMarkdown);
    const signals = extractPageSignals(metadata.html);
    const googleHints =
      linkType === "google_maps"
        ? extractGoogleMapsHints(url)
        : { businessName: undefined, locationHint: undefined };
    const routing = inferScenarioSkill({ latestUserMessage, linkType });
    const activeSkill = getSkillContract(routing.activeSkill);
    const nextSkill = routing.nextSkill ? getSkillContract(routing.nextSkill) : undefined;
    const loadedActiveSkill = await loadSkill(routing.activeSkill);
    const suggestions =
      linkType === "google_maps"
        ? ["把这个商家做成官网", "先分析一下这个商家适合什么官网结构"]
        : linkType === "website"
          ? ["帮我改版这个网站", "参考这个网站做一个类似的", "先分析一下这个网站适合怎么做"]
          : ["帮我分析这个链接", "我想做一个网站", "我还没想清楚，你来引导我"];
    const keyFacts = [
      linkType === "google_maps" ? "Google Maps 商家链接" : linkType === "website" ? "普通网站链接" : "链接类型暂不明确",
      metadata.title,
      metadata.description,
      markdownExcerpt,
      googleHints.businessName,
      googleHints.locationHint,
      placeProfile?.name,
      placeProfile?.type,
      placeProfile?.address,
      placeProfile?.phone,
      placeProfile?.website,
      placeProfile?.rating ? `Rating ${placeProfile.rating}${placeProfile.totalReviews ? ` (${placeProfile.totalReviews} reviews)` : ""}` : undefined,
      placeProfile?.priceLevel,
      placeProfile?.openState,
      ...(placeProfile?.highlights || []).slice(0, 3),
      ...signals.headings.slice(0, 3),
    ].filter(Boolean) as string[];

    return {
      type: "firecrawl" as const,
      payload: {
        url,
        intent: String(payload.intent || ""),
        suggestedSkill: activeSkill.id,
        nextSkill: nextSkill?.id,
        suggestedSkillDescription: loadedActiveSkill.description,
        title: metadata.title,
        description: metadata.description,
        markdownExcerpt,
        placeProfile: placeProfile
          ? {
              name: placeProfile.name,
              address: placeProfile.address,
              phone: placeProfile.phone,
              rating: placeProfile.rating,
              totalReviews: placeProfile.totalReviews,
              website: placeProfile.website,
              type: placeProfile.type,
              description: placeProfile.description,
              priceLevel: placeProfile.priceLevel,
              openState: placeProfile.openState,
              highlights: placeProfile.highlights,
              offerings: placeProfile.offerings,
              photosCount: placeProfile.photos?.length,
            }
          : undefined,
        summary:
          linkType === "google_maps"
            ? `我已经结合 Google Maps 线索和商家结构化信息读取了这个来源；它更像一个本地商家建站场景${markdownExcerpt ? "，并且还提取到了可用的网页内容摘要" : ""}。`
            : linkType === "website"
              ? `Firecrawl 已读取这个链接；它是一个网站来源${metadata.title ? `，标题是“${metadata.title}”` : ""}${markdownExcerpt ? "，并且已经提取到正文摘要" : ""}。`
              : "这个链接暂时无法明确识别类型，适合先进一步确认你的意图。",
        keyFacts,
        suggestedActions: Array.isArray(payload.focus) && payload.focus.length
          ? payload.focus.map(String)
          : [...suggestions, ...(nextSkill ? [`继续进入 ${nextSkill.title}`] : [])],
      },
    };
  }

  return null;
}

/**
 * Parses `<wegic_options>…</wegic_options>` for option chips.
 * Models sometimes emit a stray leading `</wegic_options>` before the JSON array; accept that shape too.
 */
function extractWegicOptionsBlock(content: string): { fullBlock: string; jsonText: string } | null {
  const closeTag = "<\\/weg[a-z_]*options>";

  const wellFormed = content.match(
    new RegExp(`<wegic_options>([\\s\\S]*?)${closeTag}`, "i")
  );
  if (wellFormed) {
    return { fullBlock: wellFormed[0], jsonText: wellFormed[1].trim() };
  }

  const strayCloseThenArray = content.match(
    new RegExp(`${closeTag}\\s*(\\[[\\s\\S]*?\\])\\s*${closeTag}`, "i")
  );
  if (strayCloseThenArray) {
    return { fullBlock: strayCloseThenArray[0], jsonText: strayCloseThenArray[1].trim() };
  }

  return null;
}

/**
 * Models sometimes echo client-injected transcript lines (`【界面已送出｜…】`) into visible replies.
 * That text is not for end users and does not trigger UI — strip it from API responses.
 */
function stripEchoedUiTelemetry(content: string): string {
  const withoutTags = content.replace(/【界面已送出\s*[｜|]\s*[^】]*】/g, "").trim();
  return withoutTags.replace(/\n{3,}/g, "\n\n").trim();
}

function extractOptionsFromMessage(content: string) {
  const block = extractWegicOptionsBlock(content);
  if (!block) {
    return {
      cleanedContent: content,
      optionTool: null,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(block.jsonText);
  } catch {
    return {
      cleanedContent: content.replace(block.fullBlock, "").trim(),
      optionTool: null,
    };
  }

  const options = Array.isArray(parsed)
    ? parsed
        .map((option) => String(option).trim())
        .filter(Boolean)
        .slice(0, 5)
        .map((option) => ({ label: option, value: option }))
    : [];

  const cleanedContent = content.replace(block.fullBlock, "").trim();
  const lines = cleanedContent.split("\n");
  const trimmedOptionLabels = options.map((option) => option.label.trim());
  let optionLineCount = 0;

  for (let index = lines.length - 1; index >= 0 && optionLineCount < trimmedOptionLabels.length; index -= 1) {
    const normalizedLine = lines[index].trim().replace(/^(\d+\.|[-*•])\s*/, "");
    const expected = trimmedOptionLabels[trimmedOptionLabels.length - 1 - optionLineCount];

    if (!normalizedLine || normalizedLine !== expected) {
      break;
    }

    optionLineCount += 1;
  }

  let collapsedContent = cleanedContent;
  if (optionLineCount === trimmedOptionLabels.length && trimmedOptionLabels.length > 0) {
    const prefixLines = lines.slice(0, lines.length - optionLineCount);
    while (prefixLines.length > 0 && !prefixLines[prefixLines.length - 1]?.trim()) {
      prefixLines.pop();
    }

    const lastLine = prefixLines[prefixLines.length - 1]?.trim();
    if (lastLine === "比如：" || lastLine === "比如:" || lastLine === "例如：" || lastLine === "例如:") {
      prefixLines.pop();
      while (prefixLines.length > 0 && !prefixLines[prefixLines.length - 1]?.trim()) {
        prefixLines.pop();
      }
    }

    collapsedContent = prefixLines.join("\n").trim();
  }

  const expandedQuestion =
    options.length > 0
      ? optionLineCount === trimmedOptionLabels.length && trimmedOptionLabels.length > 0
        ? cleanedContent
        : `${collapsedContent}${collapsedContent ? "\n\n比如：\n\n" : ""}${options
            .map((option) => `- ${option.label}`)
            .join("\n")}`
      : collapsedContent;

  return {
    cleanedContent: collapsedContent,
    optionTool: options.length
      ? ({
          type: "show_input_options",
          payload: {
            question: collapsedContent,
            expandedQuestion,
            options,
          },
        } satisfies UIToolCall)
      : null,
  };
}

async function callLLM({
  apiKey,
  systemPrompt,
  messages,
  tools,
}: {
  apiKey: string;
  systemPrompt: string;
  messages: Array<Record<string, unknown>>;
  tools?: typeof UI_TOOLS;
}) {
  const body: Record<string, unknown> = {
    model: MODEL,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  };

  if (tools?.length) {
    body.tools = tools;
    body.tool_choice = "auto";
  }

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": "Project 2 AI Demo",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Project 2 AI error [${res.status}]:`, errorText);
    throw new Project2APIError(
      `OpenRouter error (${res.status})`,
      res.status,
      errorText
    );
  }

  return res.json();
}

async function parseUIToolCalls(
  toolCalls: Array<{ function: { name: string; arguments: string } }>,
  latestUserMessage?: string
): Promise<UIToolCall[]> {
  const resolved: UIToolCall[] = [];

  for (const toolCall of toolCalls) {
    try {
      const payload = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;

      if (toolCall.function.name === "firecrawl") {
        const hydrated = await hydrateToolPayload(toolCall.function.name, payload, latestUserMessage);
        if (hydrated) resolved.push(hydrated);
        continue;
      }

      if (toolCall.function.name === "design_content_structure") {
        resolved.push({ type: "design_content_structure", payload } as UIToolCall);
        continue;
      }

      if (toolCall.function.name === "show_style_references") {
        resolved.push({ type: "show_style_references", payload } as UIToolCall);
        continue;
      }

      if (toolCall.function.name === "show_asset_collection_form") {
        resolved.push({ type: "show_asset_collection_form", payload } as UIToolCall);
        continue;
      }

      if (toolCall.function.name === "website_ready_summary") {
        const rawBenefits = payload.visitorBenefits;
        const visitorBenefits = Array.isArray(rawBenefits)
          ? rawBenefits.map((item) => String(item).trim()).filter(Boolean)
          : [];
        resolved.push({
          type: "website_ready_summary",
          payload: {
            businessName: String(payload.businessName ?? "").trim() || "未命名项目",
            businessDescription: String(payload.businessDescription ?? "").trim() || "官网与品牌展示。",
            visitorBenefits:
              visitorBenefits.length > 0
                ? visitorBenefits
                : ["明确访客来到网站后要完成的核心动作。", "用真实或 AI 补充的信息建立信任并引导转化。", "资料与素材可按后续步骤补充或生成。"],
          },
        } satisfies UIToolCall);
      }
    } catch {
      continue;
    }
  }

  return resolved;
}

function buildToolResultMessages(
  toolCalls: Array<{ id: string; function: { name: string; arguments: string } }>
) {
  return toolCalls.map((toolCall) => {
    const name = toolCall.function.name;
    const content =
      name === "firecrawl"
          ? "Firecrawl has researched the provided source and extracted the key signals."
        : name === "design_content_structure"
        ? "The content structure card has been shown to the user."
        : name === "show_style_references"
          ? "The style reference cards have been shown to the user."
          : name === "website_ready_summary"
            ? "The website-ready summary card (生成网站卡片) has been shown to the user."
            : "The asset collection form has been shown to the user.";

    return {
      role: "tool" as const,
      tool_call_id: toolCall.id,
      content,
    };
  });
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 500 });
  }

  try {
    const { messages } = (await req.json()) as { messages?: ChatMessage[] };
    const safeMessages = Array.isArray(messages) ? messages : [];
    const systemPrompt = await loadSystemPrompt();
    const latestUserMessage = getLatestUserMessage(safeMessages);
    const initialData = await callLLM({
      apiKey,
      systemPrompt,
      messages:
        safeMessages.length > 0
          ? safeMessages
          : [
              {
                role: "user",
                content:
                  "Start the conversation proactively. Ask an open and simple first question so the user can describe what they want to build in their own words.",
              },
            ],
      tools: UI_TOOLS,
    });
    const assistantMessage = initialData.choices?.[0]?.message;

    if (!assistantMessage?.tool_calls?.length) {
      const parsedMessage = extractOptionsFromMessage(assistantMessage?.content ?? "");
      return NextResponse.json({
        message:
          stripEchoedUiTelemetry(parsedMessage.cleanedContent) || "暂时没有生成内容，请稍后再试。",
        uiTools: parsedMessage.optionTool ? [parsedMessage.optionTool] : [],
      });
    }

    const uiTools = await parseUIToolCalls(assistantMessage.tool_calls, latestUserMessage);
    const activeSkill = inferScenarioSkill({ latestUserMessage });
    const toolResults = buildToolResultMessages(assistantMessage.tool_calls);
    const followUpData = await callLLM({
      apiKey,
      systemPrompt,
      messages: [
        ...safeMessages,
        {
          role: "assistant",
          content: assistantMessage.content ?? "",
          tool_calls: assistantMessage.tool_calls,
        },
        ...toolResults,
      ],
    });

    const parsedFollowUp = extractOptionsFromMessage(
      followUpData.choices?.[0]?.message?.content ?? assistantMessage.content ?? ""
    );
    const nextUiTools = parsedFollowUp.optionTool ? [...uiTools, parsedFollowUp.optionTool] : uiTools;

    return NextResponse.json({
      message:
        stripEchoedUiTelemetry(parsedFollowUp.cleanedContent) || "我已经先把结果展示给你了。",
      uiTools: nextUiTools,
      activeSkill: activeSkill.activeSkill,
    });
  } catch (error) {
    console.error("Project 2 chat error:", error);
    const status =
      error instanceof Project2APIError
        ? error.status
        : 500;

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate response",
        details:
          error instanceof Project2APIError
            ? error.details
            : undefined,
      },
      { status }
    );
  }
}
