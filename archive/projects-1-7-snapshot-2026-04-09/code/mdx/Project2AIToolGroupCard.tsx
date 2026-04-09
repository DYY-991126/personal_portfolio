"use client";

import { useEffect, useMemo, useState } from "react";
import type { Project2UIToolCall } from "@/lib/project2/ui-tools";
import { Project2UIToolCard } from "./Project2AIToolCards";
import ToolCallCardPanel from "./ToolCallCardPanel";

type GenerationSkillId = "website_design" | "image_generation" | "video_generation";

type DetailItem = {
  id: string;
  type: "tool";
  tool: Project2UIToolCall;
};

export interface Project2AIToolGroupCardProps {
  status: "loading" | "done";
  title: string;
  description: string;
  detailItems?: DetailItem[];
  onQuickReply?: (message: string) => void;
  onRunSkill?: (skill: GenerationSkillId) => void;
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-[3px] bg-[#eeeeee]">
      <div
        className="h-full rounded-[3px] bg-[#5fdd7d] transition-[width] duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function Project2AIToolGroupCard({
  status,
  title,
  description,
  detailItems,
  onQuickReply,
  onRunSkill,
}: Project2AIToolGroupCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    if (status !== "loading") {
      return;
    }

    const values = [18, 27, 35, 44, 53, 61, 69, 76, 82, 87, 91];
    let index = 0;
    const timer = window.setInterval(() => {
      setProgress(values[Math.min(index, values.length - 1)] ?? 91);
      index += 1;
      if (index >= values.length) {
        window.clearInterval(timer);
      }
    }, 520);

    return () => window.clearInterval(timer);
  }, [status]);

  const displayProgress = status === "loading" ? progress : 100;
  const percent = useMemo(() => Math.round(displayProgress), [displayProgress]);

  if (expanded && detailItems?.length) {
    return (
      <div
        className="w-full max-w-[532px] overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.08),inset_0_0_0_1px_rgba(255,255,255,0.5)]"
        onWheel={(e) => e.stopPropagation()}
      >
        <ToolCallCardPanel onBack={() => setExpanded(false)}>
          {detailItems.map((item) => (
            <Project2UIToolCard
              key={item.id}
              tool={item.tool}
              onQuickReply={onQuickReply ?? (() => {})}
              onRunSkill={onRunSkill}
            />
          ))}
        </ToolCallCardPanel>
      </div>
    );
  }

  if (status === "done") {
    return (
      <button
        type="button"
        onClick={() => detailItems?.length && setExpanded(true)}
        className="flex items-center gap-1 rounded-xl bg-[rgba(255,255,255,0.01)] px-3 py-2 text-left shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06),inset_0_0_0_1px_rgba(255,255,255,0.5)]"
      >
        <span className="text-[13px] font-medium leading-6 text-black/50">Past work</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black/45">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => detailItems?.length && setExpanded(true)}
      className="w-[340px] overflow-hidden rounded-2xl bg-white text-left shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.08),inset_0_0_0_1px_rgba(255,255,255,0.5)]"
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-6 pt-5">
          <div className="flex items-center gap-3">
            <div className="text-[32px] font-medium leading-none text-black/85">
              {percent}
              <span className="text-base text-black/40">%</span>
            </div>
          </div>
          <div className="h-16 w-16 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(95,221,125,0.3),transparent_58%),linear-gradient(135deg,#f7f7f7,#ededed)]" />
        </div>
        <div className="px-6 pt-3">
          <ProgressBar progress={displayProgress} />
        </div>
        <div className="flex items-end justify-between gap-3 bg-[#f6f6f6] px-6 py-5 transition-colors hover:bg-[#ededed]">
          <p className="min-w-0 flex-1 truncate text-sm leading-[22px] text-black/50">{description || title}</p>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-black/40">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </button>
  );
}
