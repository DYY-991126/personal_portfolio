import type { Project2UIToolCall } from "@/lib/project2/ui-tools";

/**
 * Minimal chat shape from the client — only fields needed to build the LLM transcript.
 */
export type Project2ClientChatMessage =
  | { kind: "text"; role: "user" | "assistant"; content: string }
  | { kind: "tool"; tool: Project2UIToolCall }
  | { kind: "run"; status: "loading" | "done"; detailItems?: unknown }
  | { kind: "loading"; id: string };

export type Project2ApiChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function truncate(text: string, max: number) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/**
 * Compact, model-facing record of a UI tool the user already saw.
 * Must stay in sync with system prompt: Kimmy should treat these as factual UI state, not wording to repeat to the user.
 */
export function summarizeProject2ToolForModel(tool: Project2UIToolCall): string {
  const head = "【界面已送出｜";

  switch (tool.type) {
    case "design_content_structure": {
      const { siteName, pages } = tool.payload;
      const pageParts = pages.map((p) => {
        const modNames = p.modules.map((m) => m.name).filter(Boolean);
        const modText = modNames.length ? modNames.join("、") : "（模块待命名）";
        return `${p.name}（${modText}）`;
      });
      return `${head}内容结构】${siteName ? `站点：${siteName}。` : ""}已向用户展示结构卡片。页面与模块：${pageParts.join("；")}。`;
    }
    case "show_style_references": {
      const refs = tool.payload.referenceImages.map((r, index) => {
        const id = r.id?.trim() || `ref_${index + 1}`;
        return `${id}=${r.title}`;
      });
      return `${head}风格参考】已向用户展示参考图卡片。方向列表（id=标题）：${refs.join("；")}。`;
    }
    case "show_asset_collection_form": {
      const items = tool.payload.items.map((i) => i.name).join("、");
      return `${head}资料收集】已向用户展示资料收集表单。字段：${items || "（无）"}。`;
    }
    case "firecrawl": {
      const url = tool.payload.url;
      return `${head}链接调研】已向用户展示调研卡片。链接：${url}。要点摘要：${truncate(tool.payload.summary || "", 220)}`;
    }
    case "show_input_options":
      return `${head}选项面板】已向用户展示快捷选项（与上一条助手问题对应）。`;
    case "website_ready_summary": {
      const { businessName, businessDescription } = tool.payload;
      const bits = tool.payload.visitorBenefits.map((b) => truncate(b, 80)).filter(Boolean);
      return `${head}建站就绪摘要】已向用户展示生成网站卡片。品牌：${truncate(businessName, 60)}。简介：${truncate(businessDescription, 120)}。摘要行：${bits.join(" / ") || "（无）"}。`;
    }
    case "generation_execution_plan":
    case "generation_result":
      return `${head}生成阶段】已向用户展示生成相关卡片。`;
    default:
      return `${head}其他界面】已向用户展示工具卡片（类型：${(tool as { type: string }).type}）。`;
  }
}

/**
 * Builds the message list for /api/project-2-chat from the full client transcript.
 *
 * Text-only history makes the model "forget" structure/style cards and re-fire tools.
 * We inject compact assistant lines that describe what was already rendered (telemetry — not shown as chat bubbles in the UI).
 */
export function buildProject2ChatApiMessages(
  chatMessages: Project2ClientChatMessage[]
): Project2ApiChatMessage[] {
  const out: Project2ApiChatMessage[] = [];

  for (const message of chatMessages) {
    if (message.kind === "loading") continue;
    if (message.kind === "text") {
      const content = message.content.trim();
      if (content) {
        out.push({ role: message.role, content });
      }
      continue;
    }

    if (message.kind === "tool") {
      out.push({
        role: "assistant",
        content: summarizeProject2ToolForModel(message.tool),
      });
      continue;
    }

    // Run cards duplicate the same tools as separate `kind: "tool"` messages after submit; skip runs to avoid doubling.
    if (message.kind === "run") continue;
  }

  return out;
}
