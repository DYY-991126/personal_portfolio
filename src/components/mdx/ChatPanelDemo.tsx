"use client";

import { useEffect, useRef, useState } from "react";
import ProgressBarDemo from "./ProgressBarDemo";
import ToolCallCardPanel from "./ToolCallCardPanel";
import { ToolCallCardPanelCards } from "./ToolCallCardPanelDemo";

type ChatPanelDemoProps = {
  width?: number;
};

export default function ChatPanelDemo({ width = 380 }: ChatPanelDemoProps) {
  const [showToolPanel, setShowToolPanel] = useState(false);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const expandedPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showToolPanel || !messagesScrollRef.current || !expandedPanelRef.current) return;
    const scrollEl = messagesScrollRef.current;
    const target = expandedPanelRef.current;
    requestAnimationFrame(() => {
      const targetRect = target.getBoundingClientRect();
      const scrollRect = scrollEl.getBoundingClientRect();
      const scrollTop = targetRect.top - scrollRect.top + scrollEl.scrollTop - 8;
      scrollEl.scrollTo({ top: Math.max(0, scrollTop), behavior: "smooth" });
    });
  }, [showToolPanel]);

  return (
    <div className="my-10 flex justify-center bg-[#f3f4f6] py-10">
      <div
        className="h-[820px] overflow-hidden rounded-2xl flex flex-col"
        style={{
          width,
          fontFamily: "var(--font-sans), Inter, sans-serif",
          backgroundColor: "#F7F6F5",
          boxShadow: "0 0 10px 0 #E3E0DB, 0 0 0 1px rgba(0,0,0,0.06), inset 0 0 2px 2px #FFFFFF",
        }}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Header：项目名、Free plan 与箭头间距 4px */}
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
          <button type="button" className="rounded p-1 text-black/50 hover:bg-black/5" aria-label="菜单">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Messages：消息间距 16px，占满中间剩余高度；仅在此容器内滚动 */}
        <div ref={messagesScrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-4 py-4 overscroll-contain">
          {/* User message */}
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-xl bg-[#1a1a1a] px-4 py-3">
              <p className="text-sm leading-relaxed text-white">
                我在上海有一个高品质牛排专门店,你帮我生成一个官网。
              </p>
            </div>
          </div>

          {/* AI 文本消息：内边距 24px，Think 与正文间距 12px，圆角 12px，阴影同卡片 */}
          <div className="flex justify-start">
            <div
              className="max-w-[90%] rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.5)_inset,0_1px_4px_0_rgba(0,0,0,0.06)]"
              style={{ padding: 24 }}
            >
              <p className="mb-3 text-xs text-black/50">Think for 3s. &gt;</p>
              <p className="text-sm leading-relaxed text-black/85">
                收到!您想为您的上海高品质牛肉汉堡店制作一个网站。我将根据你的诉求制定了一个建站计划,一共5步。你什么都不用做,我将自动完成这些任务,整个过程只需10-15分钟。
              </p>
            </div>
          </div>

          {/* AI 卡片消息：点击描述区内联展开为工具调用面板，仅该消息被替换 */}
          <div className="flex justify-start">
            <div className="w-full max-w-[90%]">
              {showToolPanel ? (
                <div
                  ref={expandedPanelRef}
                  className="flex h-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.5)_inset,0_1px_4px_0_rgba(0,0,0,0.06)]"
                  style={{ fontFamily: "var(--font-sans), Inter, sans-serif" }}
                >
                  <ToolCallCardPanel onBack={() => setShowToolPanel(false)}>
                    <ToolCallCardPanelCards />
                  </ToolCallCardPanel>
                </div>
              ) : (
                <ProgressBarDemo embedded onExpandClick={() => setShowToolPanel(true)} />
              )}
            </div>
          </div>
        </div>

        {/* Input area：左右 8px，高度 140px，无分割线；与下方文案间距 2px */}
        <div className="px-2 pt-3 pb-0.5">
          <div
            className="flex h-[140px] flex-col rounded-xl bg-white px-3 py-3"
            style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)" }}
          >
            <textarea
              placeholder="Say what you want and Kimmy will surprise you"
              className="min-h-0 flex-1 resize-none bg-transparent text-left text-sm leading-relaxed text-black/90 placeholder:text-black/40 outline-none"
              rows={1}
            />
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-black/50 transition-colors hover:bg-black/5 hover:text-black/70"
                aria-label="添加附件"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white transition-all duration-150 hover:scale-[0.99] hover:bg-black/[0.02] hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.08)] active:scale-[0.98] active:bg-black/[0.03]"
                style={{
                  boxShadow:
                    "inset 0 20px 20px 0 rgba(0,0,0,0.02), inset 0 -2px 1px 1px rgba(0,0,0,0.06), inset 0 1px 4px 1px rgba(255,255,255,0.2), inset 0 -1px 1px 0 rgba(255,255,255,0.2), inset 0 1px 0 0 #fff, 0 1px 1px 0 rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.08)",
                }}
                aria-label="发送"
              >
                <img src="/projects/project-3/send.svg" alt="" width={16} height={16} className="opacity-90" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer：space-between，无分割线 */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-xs text-black/50">Upgrade for more credits.</span>
          <button type="button" className="text-xs font-medium text-[#a855f7] hover:underline">
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}
