"use client";

import { useEffect, useState } from "react";
import ProgressBarDemo from "./ProgressBarDemo";

const CARD_DURATION_MS = 5500;
const DONE_DISPLAY_MS = 3500;
const TYPEWRITER_CHAR_MS_PANEL2 = 70;

const PANEL2_AI_REPLY = "已经为你生成了网站，请查看右侧预览。如需调整直接告诉我即可。";

const panelBaseStyle = {
  fontFamily: "var(--font-sans), Inter, sans-serif",
  backgroundColor: "#F7F6F5",
  boxShadow: "0 0 10px 0 #E3E0DB, 0 0 0 1px rgba(0,0,0,0.06), inset 0 0 2px 2px #FFFFFF",
};

function ChatPanelShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl flex flex-col ${className}`}
      style={panelBaseStyle}
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1 border-b border-black/6 px-4 py-3">
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

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-4 py-4 overscroll-contain">
        {children}
      </div>
    </div>
  );
}

const AI_REPLY_DELAY_MS = 600;
const TYPEWRITER_CHAR_MS = 70;
const PAUSE_AFTER_REPLY_MS = 5000;
const CLEAR_DURATION_MS = 300;

const AI_REPLY_TEXT =
  "你可以在输入框里描述你的需求，比如「帮我生成一个官网」，我会自动完成建站任务。如有修改需求，直接告诉我即可。";

/** 面板 1：用户发消息 → AI 普通文本回复（循环播放，打字机效果） */
function Panel1PlainText() {
  const [phase, setPhase] = useState<"user" | "ai" | "clear">("user");
  const [visibleLength, setVisibleLength] = useState(0);
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    if (phase === "user") {
      setVisibleLength(0);
      setTypingDone(false);
      const t = setTimeout(() => setPhase("ai"), AI_REPLY_DELAY_MS);
      return () => clearTimeout(t);
    }
    if (phase === "clear") {
      const t = setTimeout(() => setPhase("user"), CLEAR_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "ai") return;
    if (visibleLength >= AI_REPLY_TEXT.length) {
      setTypingDone(true);
      return;
    }
    const t = setTimeout(() => setVisibleLength((n) => n + 1), TYPEWRITER_CHAR_MS);
    return () => clearTimeout(t);
  }, [phase, visibleLength]);

  useEffect(() => {
    if (!typingDone || phase !== "ai") return;
    const t = setTimeout(() => setPhase("clear"), PAUSE_AFTER_REPLY_MS);
    return () => clearTimeout(t);
  }, [typingDone, phase]);

  const showContent = phase !== "clear";

  return (
    <ChatPanelShell className="h-[520px] w-[340px]">
      {showContent && (
        <>
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-xl bg-[#1a1a1a] px-4 py-3">
              <p className="text-sm leading-relaxed text-white">这个网站怎么用？</p>
            </div>
          </div>
          {phase === "ai" && (
            <div
              className="max-w-[90%] rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.5)_inset,0_1px_4px_0_rgba(0,0,0,0.06)]"
              style={{ padding: 20 }}
            >
              <p className="text-sm leading-relaxed text-black/85">
                {AI_REPLY_TEXT.slice(0, visibleLength)}
              </p>
            </div>
          )}
        </>
      )}
    </ChatPanelShell>
  );
}

/** 面板 2：用户发消息 → AI 信息卡片 (0→100%) → Past Work → AI 文本回复（循环播放，打字机效果） */
function Panel2WithCard() {
  const [cardPhase, setCardPhase] = useState<"running" | "done">("running");
  const [cycleKey, setCycleKey] = useState(0);
  const [replyLength, setReplyLength] = useState(0);

  useEffect(() => {
    if (cardPhase === "running") {
      setReplyLength(0);
      const t = setTimeout(() => setCardPhase("done"), CARD_DURATION_MS);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setCardPhase("running");
        setCycleKey((k) => k + 1);
      }, DONE_DISPLAY_MS);
      return () => clearTimeout(t);
    }
  }, [cardPhase]);

  useEffect(() => {
    if (cardPhase !== "done") return;
    if (replyLength >= PANEL2_AI_REPLY.length) return;
    const t = setTimeout(() => setReplyLength((n) => n + 1), TYPEWRITER_CHAR_MS_PANEL2);
    return () => clearTimeout(t);
  }, [cardPhase, replyLength]);

  return (
    <ChatPanelShell className="h-[520px] w-[340px]">
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-xl bg-[#1a1a1a] px-4 py-3">
          <p className="text-sm leading-relaxed text-white">帮我生成一个官网。</p>
        </div>
      </div>

      <div className="flex justify-start">
        <div className="w-full max-w-[90%]">
          {cardPhase === "running" ? (
            <ProgressBarDemo key={cycleKey} embedded />
          ) : (
            <div
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-black/60"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.01)",
                borderRadius: 12,
                boxShadow:
                  "0 1px 4px 0 rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(255,255,255,0.5)",
              }}
            >
              Past work
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-60">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {cardPhase === "done" && (
        <div className="flex justify-start">
          <div
            className="max-w-[90%] rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.5)_inset,0_1px_4px_0_rgba(0,0,0,0.06)]"
            style={{ padding: 20 }}
          >
            <p className="text-sm leading-relaxed text-black/85">
              {PANEL2_AI_REPLY.slice(0, replyLength)}
            </p>
          </div>
        </div>
      )}
    </ChatPanelShell>
  );
}

export default function ChatPanelTwoTypesDemo() {
  return (
    <div className="my-10 flex justify-center bg-[#f3f4f6] py-10">
      <div className="flex gap-8">
        <div className="flex flex-col items-center gap-2">
          <Panel1PlainText />
          <span className="text-xs text-black/50">第一类</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Panel2WithCard />
          <span className="text-xs text-black/50">第二类</span>
        </div>
      </div>
    </div>
  );
}
