import { NextResponse } from "next/server";
import { PROJECTS } from "@/app/data";
import {
  getToolsForScreen,
  parseToolCalls,
  buildToolResultMessages,
  type AIAction,
  type ScreenState,
} from "@/lib/ai-tools";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
// 更换为更快的模型，提升用户体验和工具调用响应速度
// 可以选择 anthropic/claude-3-haiku, google/gemini-flash-1.5 等以速度见长的模型
// 这里换成 gemini-2.5-flash，它在处理大量上下文和工具调用时速度极快且稳定
const MODEL = "google/gemini-2.5-flash";

// ── System prompt builder ──

function buildSystemPrompt(opts: {
  screenState: ScreenState;
  currentProjectId?: string;
  screenContext?: string;
}) {
  const projectsContext = PROJECTS.map(
    (p) =>
      `项目ID: ${p.id} | 名称: ${p.title} | 类别: ${p.category} | 年份: ${p.year} | 客户: ${p.client} | 角色: ${p.role} | 描述: ${p.description}`
  ).join("\n");

  let prompt = `你是 DYY，一名拥有 5 年经验的产品设计师，专长于 AI 和复杂交互设计。
你也承担产品经理角色——定义目标、规划路线图、拆解交付路径，并推动需求从概念到上线。
你主导的 Wegic 核心模块实现了支付率 80% 的增长。

联系方式：
- 电话：17623066004
- 邮箱：dyyisgod@gmail.com
- 微信：_DYYYYYD_

项目档案：
${projectsContext}

你可以通过工具操控网页。根据用户意图选择合适的工具调用。
当用户选择了某个选项时，不要反问，直接执行或给出内容。

请以 DYY 的口吻回答，自信、专业、友善、简练（100-200 字以内）。`;

  if (opts.currentProjectId) {
    const p = PROJECTS.find((p) => p.id === opts.currentProjectId);
    if (p) {
      prompt += `\n\n【当前项目】用户正在查看「${p.title}」(${p.id})，可主动结合该项目沟通。`;
    }
  }

  if (opts.screenContext) {
    prompt += `\n\n[当前屏幕]\n${opts.screenContext}`;
  }

  return prompt;
}

// ── LLM caller ──

async function callLLM(
  apiKey: string,
  messages: Array<Record<string, unknown>>,
  systemPrompt: string,
  tools?: Array<Record<string, unknown>>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: Record<string, any> = {
    model: MODEL,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  };

  if (tools && tools.length > 0) {
    body.tools = tools;
    body.tool_choice = "auto";
  }

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": "DYY Portfolio",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`OpenRouter API error [${res.status}]:`, err);
    throw new Error(`AI 服务暂时不可用 (${res.status})`);
  }

  return res.json();
}

// ── API route ──

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const {
      messages,
      currentProjectId,
      screenContext,
      screenState = "menu",
    } = await req.json();

    const prompt = buildSystemPrompt({ screenState, currentProjectId, screenContext });
    const tools = getToolsForScreen(screenState as ScreenState);

    // Step 1: LLM call with dynamically provisioned tools
    const data = await callLLM(apiKey, messages, prompt, tools);
    const choice = data.choices[0];
    const assistantMsg = choice.message;

    // No tool calls → plain text
    if (!assistantMsg.tool_calls?.length) {
      return NextResponse.json({ message: assistantMsg.content ?? "", actions: [] });
    }

    // Step 2: Parse actions + get follow-up text
    const actions: AIAction[] = parseToolCalls(assistantMsg.tool_calls);
    const toolResults = buildToolResultMessages(assistantMsg.tool_calls);

    const followUpData = await callLLM(
      apiKey,
      [
        ...messages,
        { role: "assistant", content: assistantMsg.content ?? "", tool_calls: assistantMsg.tool_calls },
        ...toolResults,
      ],
      prompt
    );

    return NextResponse.json({
      message: followUpData.choices[0].message.content ?? "好的，已执行。",
      actions,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate response" },
      { status: 500 }
    );
  }
}
