"use client";

import { useMemo, useState } from "react";
import type { Project2UIToolCall } from "@/lib/project2/ui-tools";
import { Project2UIToolCard } from "./Project2AIToolCards";
import ToolCallCardBase from "./ToolCallCardBase";
import ToolCallCardPanel from "./ToolCallCardPanel";

type GenerationSkillId = "website_design" | "image_generation" | "video_generation";

type DetailItem =
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
    };

export interface Project2AIRunCardProps {
  status: "loading" | "done";
  title: string;
  description: string;
  avatar?: string | string[];
  taskTitle?: string;
  detailItems?: DetailItem[];
  onQuickReply?: (message: string) => void;
  onRunSkill?: (skill: GenerationSkillId) => void;
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="h-2 w-2 rounded-full bg-black/25 animate-[bounce_1.4s_infinite_ease-in-out_both]"
          style={{ animationDelay: `${index * 0.16}s` }}
        />
      ))}
    </div>
  );
}

function resolveDefaultAvatar(detailItems: DetailItem[] | undefined) {
  const firstTool = detailItems?.find((item): item is Extract<DetailItem, { type: "tool" }> => item.type === "tool");
  if (!firstTool) return "kimmy";

  switch (firstTool.tool.type) {
    case "firecrawl":
      return "turi";
    case "generation_execution_plan":
    case "generation_result":
      return "kimmy";
    default:
      return "kimmy";
  }
}

export default function Project2AIRunCard({
  status,
  title,
  description,
  avatar,
  taskTitle,
  detailItems,
  onQuickReply,
  onRunSkill,
}: Project2AIRunCardProps) {
  const [expanded, setExpanded] = useState(false);
  const resolvedAvatar = useMemo(() => avatar || resolveDefaultAvatar(detailItems), [avatar, detailItems]);
  const canExpand = Boolean(detailItems?.length);

  return (
    <div className="w-full max-w-[90%]">
      {expanded && canExpand ? (
        <div
          className="overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.5)_inset,0_1px_4px_0_rgba(0,0,0,0.06)]"
          onWheel={(e) => e.stopPropagation()}
        >
          <ToolCallCardPanel onBack={() => setExpanded(false)}>
            {detailItems?.map((item) => {
              if (item.type === "tool") {
                return (
                  <Project2UIToolCard
                    key={item.id}
                    tool={item.tool}
                    onQuickReply={onQuickReply}
                    onRunSkill={onRunSkill}
                  />
                );
              }

              return (
                <div
                  key={item.id}
                  className="rounded-xl bg-white px-5 py-4 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_1px_4px_0_rgba(0,0,0,0.06)]"
                >
                  {item.title ? <p className="mb-2 text-sm font-medium text-black/80">{item.title}</p> : null}
                  <p className="text-sm leading-relaxed text-black/65">{item.body}</p>
                </div>
              );
            })}
          </ToolCallCardPanel>
        </div>
      ) : (
        <button
          type="button"
          disabled={!canExpand}
          onClick={() => {
            if (canExpand) setExpanded(true);
          }}
          className="w-full text-left disabled:cursor-default"
        >
          <ToolCallCardBase
            avatar={resolvedAvatar}
            taskTitle={taskTitle || title}
            description={description}
            status={status}
          >
            <div className="mt-1 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.16em] text-black/30">{title}</p>
                {status === "loading" ? <LoadingDots /> : null}
              </div>
              {canExpand ? (
                <span className="text-xs font-medium text-black/35">{status === "loading" ? "Live" : "Open"}</span>
              ) : null}
            </div>
          </ToolCallCardBase>
        </button>
      )}
    </div>
  );
}
