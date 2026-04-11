import { NextResponse } from "next/server";
import { PROJECTS } from "@/app/data";
import { getPersonaBaselineContext, loadProjectCasePlainText } from "@/lib/digital-persona-knowledge";
import {
  getToolsForScreen,
  parseToolCalls,
  buildToolResultMessages,
  type AIAction,
  type ScreenState,
} from "@/lib/ai-tools";
import { normalizeEnvSecret } from "@/lib/normalize-env-secret";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
// OpenRouter：默认 gemini-2.5-flash（工具调用与速度平衡较好）
const OPENROUTER_DEFAULT_MODEL = "google/gemini-2.5-flash";
// OpenAI 直连：未设置 PORTFOLIO_CHAT_MODEL 时使用
const OPENAI_DEFAULT_MODEL = "gpt-4o-mini";

type LLMTarget = {
  url: string;
  model: string;
  headers: Record<string, string>;
};

function resolveLLMTarget(): LLMTarget | null {
  const portfolioModel = process.env.PORTFOLIO_CHAT_MODEL?.trim();

  const openrouterKey = normalizeEnvSecret(process.env.OPENROUTER_API_KEY);
  if (openrouterKey) {
    return {
      url: OPENROUTER_URL,
      model: portfolioModel || OPENROUTER_DEFAULT_MODEL,
      headers: {
        Authorization: `Bearer ${openrouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        "X-Title": "DYY Portfolio",
      },
    };
  }

  const openaiKey = normalizeEnvSecret(process.env.OPENAI_API_KEY);
  if (openaiKey) {
    return {
      url: OPENAI_URL,
      model: portfolioModel || OPENAI_DEFAULT_MODEL,
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
    };
  }

  return null;
}

// ── System prompt builder ──

function buildSystemPrompt(opts: {
  screenState: ScreenState;
  currentProjectId?: string;
  screenContext?: string;
}) {
  const projectIndex = PROJECTS.map(
    (p) =>
      `· ${p.id}｜${p.title}${p.subtitle ? `（${p.subtitle}）` : ""}${p.year ? `｜${p.year}` : ""}｜${p.role}`
  ).join("\n");

  const baseline = getPersonaBaselineContext();

  let prompt = `你是邓毅洋（DYY）在本站上的「数字分身」：第一人称「我」发言，语气自信、专业、友善。
你有约 3 到 5 年行业经验，角色是产品设计师，并常承担产品负责人工作（目标定义、路线图、拆解交付、推动上线）。

【你的知识来源】
1) 下方「档案」含简历全文 + 项目一览（标题、周期、角色、简介）。回答经历与个人数据时以简历为准，不要编造。
2) 各项目案例的**长篇正文默认不在系统提示里**，避免上下文膨胀。当需要引用某案例的段落、方法、具体数据或章节逻辑时，**必须调用 read_project_case(projectId)**，由服务端从 MDX 按需读取（仍可能截断，且已去掉大部分组件标签）。
3) 可连续多轮调用 read_project_case 对比多个项目；若仍缺信息（如图表、PDF、交互 Demo），请让用户打开站内对应项目页。
4) 若档案与工具结果里都没有某内容，明确说「这部分没有写」，不要臆测。

【站内项目索引（口头引用 / 导航 id）】
${projectIndex}

【档案】
${baseline}

【对外联系方式】（可与简历互相印证）
电话：17623066004｜邮箱：dyyisgod@gmail.com｜微信：_DYYYYYD_

【工具】read_project_case = 按需读案例 MDX；navigate_to_project / navigate_home / show_project_index = 帮用户跳转。按意图选用；用户已点选菜单时不要反问。

【篇幅】回答简练，通常 120–280 字；需要罗列步骤或对比时可略长，避免冗长寒暄。`;

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
  target: LLMTarget,
  messages: Array<Record<string, unknown>>,
  systemPrompt: string,
  tools?: Array<Record<string, unknown>>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: Record<string, any> = {
    model: target.model,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  };

  if (tools && tools.length > 0) {
    body.tools = tools;
    body.tool_choice = "auto";
  }

  const res = await fetch(target.url, {
    method: "POST",
    headers: target.headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const raw = await res.text();
    let detail = raw;
    try {
      const parsed = JSON.parse(raw) as { error?: { message?: string }; message?: string };
      const msg = parsed?.error?.message ?? parsed?.message;
      if (typeof msg === "string" && msg.length > 0) detail = msg;
    } catch {
      /* keep raw */
    }
    console.error(`LLM upstream error [${res.status}]:`, detail.slice(0, 800));

    if (res.status === 401 || res.status === 403) {
      throw new Error(
        "模型服务鉴权失败（401/403）：请检查 .env.local 或部署环境里的 OPENROUTER_API_KEY 是否完整、未过期，且没有多余引号、空格或换行。也可到 OpenRouter 控制台重新生成密钥。"
      );
    }

    throw new Error(`AI 服务暂时不可用（上游 ${res.status}）`);
  }

  return res.json();
}

// ── API route ──

export async function POST(req: Request) {
  const target = resolveLLMTarget();
  if (!target) {
    return NextResponse.json(
      {
        error:
          "未配置 AI 密钥：请在 .env.local 中设置 OPENROUTER_API_KEY（OpenRouter）或 OPENAI_API_KEY（OpenAI）。可选：PORTFOLIO_CHAT_MODEL 覆盖默认模型。",
      },
      { status: 500 }
    );
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

    let convo: Array<Record<string, unknown>> = [...messages];
    const accumulatedActions: AIAction[] = [];
    const maxToolRounds = 8;

    for (let round = 0; round < maxToolRounds; round++) {
      const data = await callLLM(target, convo, prompt, tools);
      const assistantMsg = data.choices[0]?.message;
      if (!assistantMsg) {
        return NextResponse.json(
          { error: "AI 无有效回复", actions: accumulatedActions },
          { status: 502 }
        );
      }

      if (!assistantMsg.tool_calls?.length) {
        return NextResponse.json({
          message: assistantMsg.content ?? "",
          actions: accumulatedActions,
        });
      }

      accumulatedActions.push(...parseToolCalls(assistantMsg.tool_calls));
      const toolResults = buildToolResultMessages(assistantMsg.tool_calls, {
        readProjectCase: loadProjectCasePlainText,
      });

      convo = [
        ...convo,
        {
          role: "assistant",
          content: assistantMsg.content ?? "",
          tool_calls: assistantMsg.tool_calls,
        },
        ...toolResults,
      ];
    }

    return NextResponse.json({
      message:
        "我这边读取档案的轮次有点多，可以先问单个项目，或把问题拆成更小的一步再问。",
      actions: accumulatedActions,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate response" },
      { status: 500 }
    );
  }
}
