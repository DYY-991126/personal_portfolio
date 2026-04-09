"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { buildProject2ChatApiMessages } from "@/lib/project2/chat-api-messages";
import type { Project2UIToolCall } from "@/lib/project2/ui-tools";
import Project2AIToolGroupCard from "./Project2AIToolGroupCard";
import { Project2UIToolCard } from "./Project2AIToolCards";

type Project2AIPanelProps = {
  width?: number;
};

type TextMessage = {
  kind: "text";
  role: "user" | "assistant";
  content: string;
  expandedContent?: string;
  isCollapsedOptionPrompt?: boolean;
};

type ToolMessage = {
  kind: "tool";
  tool: Project2UIToolCall;
};

type RunMessage = {
  kind: "run";
  id: string;
  status: "loading" | "done";
  title: string;
  description: string;
  taskTitle?: string;
  detailItems?: Array<
    | {
        id: string;
        type: "tool";
        tool: Project2UIToolCall;
      }
    | {
        id: string;
        type: "note";
        title?: string;
        body: string;
      }
  >;
};

type LoadingMessage = {
  kind: "loading";
  id: string;
};

type OptionState = {
  question: string;
  expandedQuestion?: string;
  options: Array<{
    label: string;
    value?: string;
  }>;
};

type ChatMessage = TextMessage | ToolMessage | RunMessage | LoadingMessage;

/** 资料收集表单：任一条用户消息出现在该 tool 消息之后，即视为已回应，收起表单 UI。 */
function assetCollectionFormStillOpen(messages: ChatMessage[], toolIndex: number): boolean {
  for (let j = toolIndex + 1; j < messages.length; j++) {
    const m = messages[j];
    if (m.kind === "text" && m.role === "user") return false;
  }
  return true;
}

type GenerationSkillId = "website_design" | "image_generation" | "video_generation";

type GenerateResponse = {
  ok: boolean;
  status: string;
  message: string;
  execution: {
    skill: GenerationSkillId;
    title: string;
    objective: string;
    sourceSkillPath?: string;
    skillMeta?: {
      name: string;
      description: string;
      filePath: string;
    };
    recommendedNextSkills: string[];
    outputs: string[];
    promptHints: string[];
  };
  result?: {
    skill: GenerationSkillId;
    title: string;
    summary: string;
    format: "website_brief" | "image" | "video";
    websiteBrief?: {
      projectSummary: string;
      pages: string[];
      styleDirection: string;
      mediaPlan: string[];
      buildPrompt: string;
    };
    imageUrls?: string[];
    videoUrl?: string;
  };
  error?: string;
  details?: string;
};

function renderAssistantMessage(content: string) {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listKey = 0;

  const flushList = () => {
    if (!listItems.length) return;
    nodes.push(
      <ul key={`list-${listKey}`} className="my-2 space-y-1 pl-6 text-sm leading-relaxed text-black/85">
        {listItems.map((item, index) => (
          <li key={`item-${listKey}-${index}`} className="list-disc">
            {item}
          </li>
        ))}
      </ul>
    );
    listItems = [];
    listKey += 1;
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    const bulletMatch = line.match(/^[-*•]\s+(.+)$/);

    if (bulletMatch) {
      listItems.push(bulletMatch[1]);
      return;
    }

    flushList();

    if (!line) {
      nodes.push(<div key={`space-${index}`} className="h-3" />);
      return;
    }

    nodes.push(
      <p key={`line-${index}`} className="text-sm leading-relaxed text-black/85">
        {line}
      </p>
    );
  });

  flushList();
  return nodes;
}

export default function Project2AIPanel({ width = 760 }: Project2AIPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [optionState, setOptionState] = useState<OptionState | null>(null);
  const [activeSkill, setActiveSkill] = useState<string>("website_design");
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasBootstrapped, setHasBootstrapped] = useState(false);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  function nextMessageId(prefix: string) {
    messageIdRef.current += 1;
    return `${prefix}-${messageIdRef.current}`;
  }

  function buildChatRunMessage(tools: Project2UIToolCall[]): RunMessage {
    const primaryTool = tools[0];
    const titleMap: Record<Project2UIToolCall["type"], string> = {
      show_input_options: "Clarifying Requirements",
      firecrawl: "Researching Your Business",
      design_content_structure: "Structuring The Website",
      show_style_references: "Collecting Style Directions",
      show_asset_collection_form: "Preparing Asset Collection",
      website_ready_summary: "Website Plan Ready",
      generation_execution_plan: "Executing Skill",
      generation_result: "Generation Finished",
    };

    const descriptionMap: Partial<Record<Project2UIToolCall["type"], string>> = {
      firecrawl: "I looked through the source information and organized the key business signals for the next step.",
      design_content_structure: "I translated the discussion into page structure and module planning.",
      show_style_references: "I prepared visual directions so you can react to a concrete style instead of abstract words.",
      show_asset_collection_form: "I identified the materials needed before moving into generation.",
      website_ready_summary: "I wrapped the current findings into a website-ready summary.",
    };

    return {
      kind: "run",
      id: nextMessageId("chat-run"),
      status: "done",
      title: titleMap[primaryTool.type] || "AI Run",
      taskTitle: "Tool Run",
      description:
        descriptionMap[primaryTool.type] ||
        "I completed a round of tool work and packaged the outputs into the cards below.",
      detailItems: tools.map((tool, index) => ({
        id: `tool-${index}`,
        type: "tool" as const,
        tool,
      })),
    };
  }

  function buildPendingLoadingMessage(): LoadingMessage {
    return {
      kind: "loading",
      id: nextMessageId("chat-loading"),
    };
  }

  function buildPendingGenerationRunMessage(skill: GenerationSkillId): RunMessage {
    const label =
      skill === "image_generation"
        ? "Image Generation"
        : skill === "video_generation"
          ? "Video Generation"
          : "Website Design";

    return {
      kind: "run",
      id: nextMessageId("generation-pending"),
      status: "loading",
      title: label,
      taskTitle: "Skill Run",
      description: `I am entering ${label} and preparing the execution plan plus the first output package.`,
    };
  }

  function buildCompletedGenerationRunMessage(data: GenerateResponse): RunMessage {
    const detailItems: RunMessage["detailItems"] = [
      {
        id: "execution-plan",
        type: "tool",
        tool: {
          type: "generation_execution_plan",
          payload: {
            skill: data.execution.skill,
            title: data.execution.title,
            objective: data.execution.objective,
            status: data.status,
            sourceSkillPath: data.execution.sourceSkillPath,
            skillMeta: data.execution.skillMeta,
            recommendedNextSkills: data.execution.recommendedNextSkills,
            outputs: data.execution.outputs,
            promptHints: data.execution.promptHints,
          },
        },
      },
    ];

    if (data.result) {
      detailItems.push({
        id: "generation-result",
        type: "tool",
        tool: {
          type: "generation_result",
          payload: data.result,
        },
      });
    }

    return {
      kind: "run",
      id: nextMessageId("generation-run"),
      status: "done",
      title: data.execution.title,
      taskTitle: "Skill Run",
      description: `I completed ${data.execution.title} and packaged the plan and output into one run card.`,
      detailItems,
    };
  }

  function appendToInput(text: string) {
    const nextText = text.trim();
    if (!nextText) return;

    setInputValue((prev) => {
      const current = prev.trim();
      if (!current) return nextText;
      if (current.includes(nextText)) return prev;
      return `${current}，${nextText}`;
    });
  }

  function expandPendingAssistantPrompt(history: ChatMessage[]) {
    return history.map((message, index) => {
      if (
        index === history.length - 1 &&
        message.kind === "text" &&
        message.role === "assistant" &&
        message.isCollapsedOptionPrompt &&
        message.expandedContent
      ) {
        return {
          ...message,
          content: message.expandedContent,
          isCollapsedOptionPrompt: false,
        };
      }

      return message;
    });
  }

  useEffect(() => {
    const node = messagesScrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (hasBootstrapped) return;

    let cancelled = false;

    async function bootstrapConversation() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/project-2-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [],
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.details ? `${data.error || "初始化失败"}\n\n${data.details}` : data.error || "初始化失败");
        }

        if (cancelled) return;

        const nextOptionTool = (data.uiTools || []).find(
          (tool: Project2UIToolCall) => tool.type === "show_input_options"
        );

        setActiveSkill(data.activeSkill || "website_design");
        setOptionState(
          nextOptionTool?.type === "show_input_options"
            ? {
                question: nextOptionTool.payload.question,
                expandedQuestion: nextOptionTool.payload.expandedQuestion,
                options: nextOptionTool.payload.options,
              }
            : null
        );
        setMessages([
          {
            kind: "text",
            role: "assistant",
            content: data.message ?? "你好，说说你想做一个什么网站。",
            expandedContent:
              nextOptionTool?.type === "show_input_options"
                ? nextOptionTool.payload.expandedQuestion || nextOptionTool.payload.question
                : undefined,
            isCollapsedOptionPrompt: nextOptionTool?.type === "show_input_options",
          },
          ...((data.uiTools || [])
            .filter((tool: Project2UIToolCall) => tool.type !== "show_input_options")
            .map((tool: Project2UIToolCall) => ({
            kind: "tool" as const,
            tool,
          })) as ChatMessage[]),
        ]);
        setHasBootstrapped(true);
      } catch (error) {
        if (cancelled) return;
        setMessages([
          {
            kind: "text",
            role: "assistant",
            content: error instanceof Error ? error.message : "初始化失败，请刷新重试。",
          },
        ]);
        setHasBootstrapped(true);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void bootstrapConversation();

    return () => {
      cancelled = true;
    };
  }, [hasBootstrapped]);

  function resolveGenerationSkill(skill: string): GenerationSkillId {
    if (skill === "image_generation" || skill === "video_generation") {
      return skill;
    }

    return "website_design";
  }

  function buildGenerationContext() {
    const latestUserMessage = [...messages].reverse().find(
      (message): message is TextMessage => message.kind === "text" && message.role === "user"
    );
    const latestFirecrawlTool = [...messages].reverse().find(
      (
        message
      ): message is ToolMessage & {
        tool: Extract<Project2UIToolCall, { type: "firecrawl" }>;
      } => message.kind === "tool" && message.tool.type === "firecrawl"
    );
    const latestStyleSelection = [...messages].reverse().find(
      (message): message is TextMessage =>
        message.kind === "text" &&
        message.role === "user" &&
        (message.content.includes("我选择这个风格方向") || message.content.includes("风格"))
    );

    return {
      projectName: "Project 2 Portfolio Demo",
      sourceUrl: latestFirecrawlTool?.tool.payload.url,
      summary: latestFirecrawlTool?.tool.payload.summary,
      selectedStyle: latestStyleSelection?.content,
      goal: latestUserMessage?.content,
    };
  }

  async function handleGenerateSkill(skill?: GenerationSkillId) {
    if (isGenerating || isLoading) return;

    const generationSkill = skill || resolveGenerationSkill(activeSkill);
    const pendingRun = buildPendingGenerationRunMessage(generationSkill);
    setIsGenerating(true);
    setMessages((prev) => [...prev, pendingRun]);

    try {
      const res = await fetch("/api/project-2-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: generationSkill,
          context: buildGenerationContext(),
        }),
      });

      const data = (await res.json()) as GenerateResponse;

      if (!res.ok || !data.ok) {
        throw new Error(
          data.details
            ? `${data.error || "生成阶段请求失败"}\n\n${data.details}`
            : data.error || "生成阶段请求失败"
        );
      }

      setMessages((prev) => [
        ...prev.filter((message) => !(message.kind === "run" && message.id === pendingRun.id)),
        {
          kind: "text",
          role: "assistant",
          content: `已进入 ${data.execution.title}，我先把生成阶段的执行计划整理给你。`,
        },
        buildCompletedGenerationRunMessage(data),
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev.filter((message) => !(message.kind === "run" && message.id === pendingRun.id)),
        {
          kind: "text",
          role: "assistant",
          content: error instanceof Error ? error.message : "生成阶段暂时不可用。",
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }

  async function executeChatFromMessages(
    nextMessages: ChatMessage[],
    options?: { clearInput?: boolean }
  ) {
    const clearInput = options?.clearInput !== false;
    const pendingLoading = buildPendingLoadingMessage();
    setMessages([...nextMessages, pendingLoading]);
    setOptionState(null);
    if (clearInput) setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/project-2-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: buildProject2ChatApiMessages(
            nextMessages.filter((message) => message.kind !== "loading")
          ),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details ? `${data.error || "请求失败"}\n\n${data.details}` : data.error || "请求失败");
      }

      const nextOptionTool = (data.uiTools || []).find(
        (tool: Project2UIToolCall) => tool.type === "show_input_options"
      );
      setActiveSkill(data.activeSkill || "website_design");
      setOptionState(
        nextOptionTool?.type === "show_input_options"
          ? {
              question: nextOptionTool.payload.question,
              expandedQuestion: nextOptionTool.payload.expandedQuestion,
              options: nextOptionTool.payload.options,
            }
          : null
      );

      setMessages((prev) => [
        ...prev.filter((message) => !(message.kind === "loading" && message.id === pendingLoading.id)),
        {
          kind: "text",
          role: "assistant",
          content: data.message ?? "暂时没有生成内容。",
          expandedContent:
            nextOptionTool?.type === "show_input_options"
              ? nextOptionTool.payload.expandedQuestion || nextOptionTool.payload.question
              : undefined,
          isCollapsedOptionPrompt: nextOptionTool?.type === "show_input_options",
        },
        ...((data.uiTools || []).filter((tool: Project2UIToolCall) => tool.type !== "show_input_options").length
          ? [buildChatRunMessage((data.uiTools || []).filter((tool: Project2UIToolCall) => tool.type !== "show_input_options"))]
          : []),
        ...((data.uiTools || [])
          .filter((tool: Project2UIToolCall) => tool.type !== "show_input_options")
          .map((tool: Project2UIToolCall) => ({
          kind: "tool" as const,
          tool,
        })) as ChatMessage[]),
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev.filter((message) => !(message.kind === "loading" && message.id === pendingLoading.id)),
        {
          kind: "text",
          role: "assistant",
          content: error instanceof Error ? error.message : "网络异常，请稍后再试。",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendUserMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    await executeChatFromMessages(
      [...expandPendingAssistantPrompt(messages), { kind: "text", role: "user", content: trimmed }],
      { clearInput: false }
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const currentInput = inputValue.trim();
    if (!currentInput || isLoading) return;

    await executeChatFromMessages(
      [...expandPendingAssistantPrompt(messages), { kind: "text", role: "user", content: currentInput }],
      { clearInput: true }
    );
  }

  function handleTextareaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!inputValue.trim() || isLoading) return;
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  }

  return (
    <div
      className="h-[720px] overflow-hidden rounded-2xl flex flex-col border border-black/8"
      style={{
        width: Math.max(width, 920),
        fontFamily: "var(--font-sans), Inter, sans-serif",
        backgroundColor: "#F7F6F5",
      }}
      onWheel={(e) => e.stopPropagation()}
    >
        <div className="flex items-center gap-1 border-b border-black/[0.06] px-4 py-3">
          <div className="flex items-center gap-2">
            <img
              src="/projects/project-3/wegicLogo.svg"
              alt="WeGIC"
              width={24}
              height={24}
              className="shrink-0"
            />
            <div>
              <div className="text-sm font-medium text-black/90">disney.wegic.app</div>
              <div className="text-xs text-black/50">Free plan</div>
            </div>
          </div>
          <button type="button" className="ml-auto rounded p-1 text-black/50 hover:bg-black/5" aria-label="菜单">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        <div
          ref={messagesScrollRef}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-4 py-4 overscroll-contain"
        >
          {messages.map((message, index) => {
            if (message.kind === "loading") {
              return (
                <div key={message.id} className="flex justify-start">
                  <div className="rounded-xl bg-white px-5 py-4 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.5)_inset,0_1px_4px_0_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map((dot) => (
                        <span
                          key={dot}
                          className="h-2.5 w-2.5 rounded-full bg-black/25 animate-[bounce_1.2s_infinite_ease-in-out_both]"
                          style={{ animationDelay: `${dot * 0.16}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            if (message.kind === "run") {
              return (
                <div key={message.id} className="flex justify-start">
                  <Project2AIToolGroupCard
                    status={message.status}
                    title={message.title}
                    description={message.description}
                    detailItems={message.detailItems?.filter(
                      (
                        item
                      ): item is {
                        id: string;
                        type: "tool";
                        tool: Project2UIToolCall;
                      } =>
                        item.type === "tool" &&
                        (item.tool.type === "generation_execution_plan" || item.tool.type === "generation_result")
                    )}
                    onQuickReply={appendToInput}
                    onRunSkill={handleGenerateSkill}
                  />
                </div>
              );
            }

            if (message.kind === "tool") {
              if (
                message.tool.type === "show_asset_collection_form" &&
                !assetCollectionFormStillOpen(messages, index)
              ) {
                return <Fragment key={`asset-form-dismissed-${index}`} />;
              }

              const isCenteredTool = message.tool.type === "show_style_references";
              return (
                <div
                  key={`tool-${index}`}
                  className={`flex ${isCenteredTool ? "h-[88%] min-h-[360px] justify-center items-center" : "justify-start"}`}
                >
                  <Project2UIToolCard
                    tool={message.tool}
                    onQuickReply={appendToInput}
                    onSendMessage={sendUserMessage}
                    onRunSkill={handleGenerateSkill}
                  />
                </div>
              );
            }

            return (
              <div key={`${message.role}-${index}`} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[85%] rounded-xl bg-[#1a1a1a] px-4 py-3"
                      : "max-w-[90%] rounded-xl bg-white px-6 py-5 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.5)_inset,0_1px_4px_0_rgba(0,0,0,0.06)]"
                  }
                >
                  {message.role === "assistant" ? (
                    <div className="space-y-0">{renderAssistantMessage(message.content)}</div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-white">{message.content}</p>
                  )}
                </div>
              </div>
            );
          })}

        </div>

        <div className="px-2 pt-3 pb-0.5">
          {optionState ? (
            <div className="mb-2 flex flex-wrap gap-2 px-2 pb-1">
              {optionState.options.map((option, index) => (
                <button
                  key={`${option.label}-${index}`}
                  type="button"
                  onClick={() => appendToInput(option.value || option.label)}
                  className="select-none rounded-[8px] border-none bg-[#fbfbfb] px-4 py-[7px] text-[14px] font-normal leading-[22px] text-black/70 shadow-[0_1px_2px_rgba(229,231,235,1),inset_0_0_0_1px_rgba(255,255,255,0.8),0_0_0_1px_rgba(0,0,0,0.04)] transition-all duration-150 hover:bg-white hover:text-black/90 hover:shadow-[inset_0_0_0_2px_rgba(255,255,255,1),0_0_0_1px_rgba(0,0,0,0.04)]"
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
          <form
            onSubmit={handleSubmit}
            className="flex h-[140px] flex-col rounded-xl bg-white px-3 py-3"
            style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)" }}
          >
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Say what you want and Kimmy will surprise you"
              className="min-h-0 flex-1 resize-none bg-transparent text-left text-sm leading-relaxed text-black/90 placeholder:text-black/40 outline-none"
              rows={1}
            />
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-black/50 transition-colors hover:bg-black/5 hover:text-black/70"
                aria-label="添加附件"
                disabled
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white transition-all duration-150 hover:scale-[0.99] hover:bg-black/[0.02] hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.08)] active:scale-[0.98] active:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  boxShadow:
                    "inset 0 20px 20px 0 rgba(0,0,0,0.02), inset 0 -2px 1px 1px rgba(0,0,0,0.06), inset 0 1px 4px 1px rgba(255,255,255,0.2), inset 0 -1px 1px 0 rgba(255,255,255,0.2), inset 0 1px 0 0 #fff, 0 1px 1px 0 rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.08)",
                }}
                aria-label="发送"
              >
                <img src="/projects/project-3/send.svg" alt="" width={16} height={16} className="opacity-90" />
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-xs text-black/50">Upgrade for more credits.</span>
          <button type="button" className="text-xs font-medium text-[#a855f7] hover:underline">
            Upgrade
          </button>
        </div>
    </div>
  );
}
