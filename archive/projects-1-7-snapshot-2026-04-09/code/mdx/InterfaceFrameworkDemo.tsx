"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProgressBarDemo from "./ProgressBarDemo";
import ToolCallCardPanel from "./ToolCallCardPanel";
import { ToolCallCardPanelCards } from "./ToolCallCardPanelDemo";
import { MobileMockup } from "./MobileMockup";

function PreviewContent() {
  return (
    <div className="min-w-full bg-white">
      {/* 第一屏：Hero */}
      <section className="min-h-[85vh] flex flex-col items-center justify-center gap-10 px-10 py-24 text-center bg-gradient-to-b from-white to-black/[0.02]">
        <h1 className="text-4xl font-bold leading-tight text-black md:text-6xl max-w-3xl">
          精选手工艺术品展示
        </h1>
        <p className="max-w-2xl text-lg text-black/60 leading-relaxed">
          探索我们精心挑选的手工艺术品的世界，每一件作品都由顶尖工艺师精心打造。
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square overflow-hidden rounded-2xl bg-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/projects/project-3/mh${i}.svg`}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 第二屏：作品长廊 */}
      <section className="min-h-[85vh] px-10 py-24 bg-white">
        <h2 className="text-3xl font-bold text-black mb-12 text-center">精选作品</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="group">
              <div className="aspect-[3/4] overflow-hidden rounded-xl bg-black/5 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/projects/project-3/mh${(i % 4) + 1}.svg`}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="text-sm font-medium text-black/80">作品 {i}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 第三屏：工艺与理念 */}
      <section className="min-h-[85vh] px-10 py-24 bg-black/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-black mb-12 text-center">工艺与理念</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-black/70">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                </svg>
              </div>
              <h3 className="font-semibold text-black mb-2">匠心传承</h3>
              <p className="text-sm text-black/60 leading-relaxed">每一件作品都凝聚数代匠人的智慧与技艺，我们将传统工艺与现代审美无缝融合。</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-black/70">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="font-semibold text-black mb-2">精选材质</h3>
              <p className="text-sm text-black/60 leading-relaxed">严选天然材料，从木材、陶瓷到织物，确保每一件作品都经得起时间的考验。</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-black/70">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3 className="font-semibold text-black mb-2">慢工细活</h3>
              <p className="text-sm text-black/60 leading-relaxed">拒绝流水线生产，每一件作品都经数月乃至数年的悉心打磨才得以呈现。</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="h-48 flex items-center justify-center bg-black/[0.04] text-sm text-black/50">
        © 手工艺术品展示 · 匠心与美的集合
      </footer>
    </div>
  );
}

const USER_PROMPTS = [
  "我在上海有一个高品质牛排专门店，你帮我生成一个官网。",
  "把主色调改成深蓝色",
  "在首页加一个客户评价区块",
  "把 logo 放大一点",
  "导航栏增加「关于我们」入口",
  "帮我把产品图替换成更高级的",
];

const AI_TEXT_REPLIES = [
  { think: "Think for 3s. >", text: "收到！您想为您的上海高品质牛肉汉堡店制作一个网站。我将根据你的诉求制定了一个建站计划，一共5步。你什么都不用做，我将自动完成这些任务，整个过程只需10-15分钟。" },
  { think: "Think for 2s. >", text: "好的，我马上调整主色调为深蓝色，让整体视觉更沉稳专业。" },
  { think: "Think for 1s. >", text: "明白，我会在首页添加客户评价区块，展示用户好评以增强信任感。" },
  { think: "Think for 2s. >", text: "收到，正在放大 logo 尺寸。" },
  { think: "Think for 1s. >", text: "好的，会在导航栏增加「关于我们」入口。" },
  { think: "Think for 3s. >", text: "了解，我会替换产品图为更高级的视觉效果。" },
];

const AI_COMPLETION_REPLIES = [
  "我已经完成建站计划，网站框架和初版页面都已就绪，你可以在右侧预览查看。",
  "主色调已调整为深蓝色，整体风格更显沉稳。",
  "客户评价区块已添加到首页底部。",
  "Logo 已放大，视觉权重更突出。",
  "「关于我们」已加入导航栏。",
  "产品图已更新为更高级的展示效果。",
];

type SimMessage = { id: number; type: "user" | "ai_text" | "ai_card"; content?: string; think?: string; cardPhase?: "loading" | "done" };

/** Past work 小按钮：完成的任务折叠显示，点击可展开 Wegic Studio（样式与 ChatPanelTwoTypesDemo 一致） */
function PastWorkButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-black/60 transition-colors hover:bg-black/5"
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
    </button>
  );
}

/** 2.0 整体界面框架：对话面板在左、网站预览在右 */
export default function InterfaceFrameworkDemo() {
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"pc" | "mobile">("pc");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [simMessages, setSimMessages] = useState<SimMessage[]>([]);
  const simIndexRef = useRef(0);
  
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const expandedPanelRef = useRef<HTMLDivElement>(null);
  
  const containerWrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Resize logic for absolute 1440x900 accuracy
  useEffect(() => {
    const updateScale = () => {
      if (containerWrapperRef.current) {
        // Find parent container width or fallback to window width
        const parentWidth = containerWrapperRef.current.parentElement?.clientWidth || window.innerWidth;
        // Limit max width to 1440
        const targetWidth = Math.min(parentWidth, 1440);
        setScale(targetWidth / 1440);
      }
    };
    
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerWrapperRef.current?.parentElement) {
      observer.observe(containerWrapperRef.current.parentElement);
    }
    window.addEventListener("resize", updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  useEffect(() => {
    const el = messagesScrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [simMessages]);

  useEffect(() => {
    if (expandedCardId == null || !messagesScrollRef.current || !expandedPanelRef.current) return;
    const scrollEl = messagesScrollRef.current;
    const target = expandedPanelRef.current;
    requestAnimationFrame(() => {
      const targetRect = target.getBoundingClientRect();
      const scrollRect = scrollEl.getBoundingClientRect();
      const scrollTop = targetRect.top - scrollRect.top + scrollEl.scrollTop - 8;
      scrollEl.scrollTo({ top: Math.max(0, scrollTop), behavior: "smooth" });
    });
  }, [expandedCardId]);

  // 持续模拟对话：用户发消息 → AI 回复 → 卡片加载 → 完成 → AI 提示完成 → 用户再发 → 循环
  useEffect(() => {
    const nextId = () => ++simIndexRef.current;
    const schedule = (fn: () => void, ms: number) => {
      const t = setTimeout(fn, ms);
      return () => clearTimeout(t);
    };

    const addUser = () => {
      setSimMessages((m) => {
        const idx = m.length % USER_PROMPTS.length;
        return [...m, { id: nextId(), type: "user" as const, content: USER_PROMPTS[idx] }];
      });
    };

    const cleanupFns: (() => void)[] = [];

    if (simMessages.length === 0) {
      addUser();
      return;
    }

    const last = simMessages[simMessages.length - 1];
    const prev = simMessages.length >= 2 ? simMessages[simMessages.length - 2] : null;

    if (last.type === "user") {
      const useCard = Math.random() < 0.5;
      cleanupFns.push(schedule(() => {
        if (useCard) {
          setSimMessages((m) => [...m, { id: nextId(), type: "ai_card" as const, cardPhase: "loading" as const }]);
        } else {
          setSimMessages((m) => {
            const r = AI_TEXT_REPLIES[m.length % AI_TEXT_REPLIES.length];
            return [...m, { id: nextId(), type: "ai_text" as const, content: r.text, think: r.think }];
          });
        }
      }, 1200));
    } else if (last.type === "ai_text" && prev?.type === "user") {
      cleanupFns.push(schedule(() => {
        setSimMessages((m) => [...m, { id: nextId(), type: "ai_card" as const, cardPhase: "loading" as const }]);
      }, 800));
    } else if (last.type === "ai_card" && last.cardPhase === "loading") {
      cleanupFns.push(schedule(() => {
        setSimMessages((m) => {
          const next = [...m];
          const idx = next.findIndex((x) => x.type === "ai_card" && x.cardPhase === "loading");
          if (idx >= 0) next[idx] = { ...next[idx], cardPhase: "done" as const };
          return next;
        });
      }, 10000));
    } else if (last.type === "ai_card" && last.cardPhase === "done") {
      cleanupFns.push(schedule(() => {
        setSimMessages((m) => {
          const c = AI_COMPLETION_REPLIES[m.length % AI_COMPLETION_REPLIES.length];
          return [...m, { id: nextId(), type: "ai_text" as const, content: c }];
        });
      }, 500));
    } else if (last.type === "ai_text" && prev?.type === "ai_card") {
      cleanupFns.push(schedule(() => addUser(), 2000));
    }

    return () => cleanupFns.forEach((f) => f());
  }, [simMessages]);

  const handlePublish = () => {
    setIsPublished(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const chatPanel = (
    <div
      className="h-full w-[380px] shrink-0 overflow-hidden rounded-2xl flex flex-col"
      style={{
        fontFamily: "var(--font-sans), Inter, sans-serif",
        backgroundColor: "#F7F6F5",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)",
      }}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center gap-1 border-b border-black/6 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <img src="/projects/project-3/wegicLogo.svg" alt="WeGIC" width={24} height={24} className="shrink-0" />
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

      {/* Messages */}
      <div
        ref={messagesScrollRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-4 py-4 overscroll-contain"
        data-lenis-prevent
      >
        {simMessages.map((msg) => {
          if (msg.type === "user") {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-xl bg-[#1a1a1a] px-4 py-3">
                  <p className="text-sm leading-relaxed text-white">{msg.content}</p>
                </div>
              </div>
            );
          }
          if (msg.type === "ai_text") {
            return (
              <div key={msg.id} className="flex justify-start">
                <div
                  className="max-w-[90%] rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.5)_inset,0_1px_4px_0_rgba(0,0,0,0.06)]"
                  style={{ padding: 24 }}
                >
                  {msg.think && <p className="mb-3 text-xs text-black/50">{msg.think}</p>}
                  <p className="text-sm leading-relaxed text-black/85">{msg.content}</p>
                </div>
              </div>
            );
          }
          if (msg.type === "ai_card") {
            const isLastCard = simMessages.filter((m) => m.type === "ai_card").pop()?.id === msg.id;
            const isLoading = isLastCard && msg.cardPhase === "loading";
            const isDone = msg.cardPhase === "done";
            const isExpanded = expandedCardId === msg.id;

            return (
              <div key={msg.id} className="flex justify-start">
                <div className="w-full max-w-[90%]">
                  {isExpanded ? (
                    <div
                      ref={expandedPanelRef}
                      className="flex h-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.5)_inset,0_1px_4px_0_rgba(0,0,0,0.06)]"
                      style={{ fontFamily: "var(--font-sans), Inter, sans-serif" }}
                    >
                      <ToolCallCardPanel onBack={() => setExpandedCardId(null)}>
                        <ToolCallCardPanelCards />
                      </ToolCallCardPanel>
                    </div>
                  ) : isLoading ? (
                    <ProgressBarDemo embedded onExpandClick={() => setExpandedCardId(msg.id)} />
                  ) : isDone ? (
                    <PastWorkButton onClick={() => setExpandedCardId(msg.id)} />
                  ) : null}
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Input */}
      <div className="px-2 pt-3 pb-0.5 shrink-0">
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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white transition-all duration-150 hover:scale-[0.99] hover:bg-black/2 hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.08)] active:scale-[0.98] active:bg-black/3"
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

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-black/4 shrink-0">
        <span className="text-xs text-black/50">Upgrade for more credits.</span>
        <button type="button" className="text-xs font-medium text-[#a855f7] hover:underline">
          Upgrade
        </button>
      </div>
    </div>
  );


  const previewToolbar = (
    <div className="flex shrink-0 items-center justify-between border-b border-black/6 px-4 bg-white sticky top-0 z-20" style={{ height: 60 }}>
      <button type="button" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-black/50 hover:bg-black/5 hover:text-black/70 transition-colors" aria-label="刷新">
        <img src="/projects/project-3/refresh.svg" alt="" width={36} height={36} />
      </button>
      
      <div className="flex items-center gap-3">
        {/* 设备切换：默认电脑端，点击切换；按钮图标表示将要切换到的视图 */}
        <button
          type="button"
          onClick={() => setViewMode((m) => (m === "mobile" ? "pc" : "mobile"))}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-black/70 hover:bg-black/5 transition-colors"
          aria-label={viewMode === "pc" ? "切换至手机视图" : "切换至 PC 视图"}
        >
          <img
            src={viewMode === "pc" ? "/projects/project-3/device_mobile.svg" : "/projects/project-3/device_pc.svg"}
            alt=""
            width={36}
            height={36}
          />
        </button>

        <button
          type="button"
          onClick={() => setIsPreviewMode(true)}
          className="px-4 py-2.5 text-sm font-medium text-black/80 transition-all hover:bg-black/5"
          style={{
            borderRadius: "10px",
            backgroundColor: "rgba(59, 42, 0, 0.05)",
            boxShadow: "inset 0 0 1px 1px #fff, 0 0 0 1px rgba(230, 227, 223, 0.8)",
          }}
        >
          Preview
        </button>
        <button
          type="button"
          onClick={handlePublish}
          className="px-4 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
          style={{
            borderRadius: "10px",
            backgroundColor: "#000",
            boxShadow: `
              inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
              inset 0 -1px 1px 0 rgba(255, 255, 255, 0.2),
              inset 0 1px 4px 1px rgba(255, 255, 255, 0.2),
              inset 0 -2px 1px 1px rgba(255, 255, 255, 0.2),
              inset 0 20px 20px 0 rgba(255, 255, 255, 0.04),
              0 0 0 1px #000,
              0 1px 1px 0 rgba(0, 0, 0, 0.2)
            `,
          }}
        >
          {isPublished ? "Upgrade" : "Publish"}
        </button>
      </div>
    </div>
  );

  const previewModeBar = (
    <div className="flex shrink-0 w-full items-center justify-between border-b border-black/6 px-4 bg-white sticky top-0 z-20" style={{ height: 60 }}>
      <button type="button" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-black/50 hover:bg-black/5 hover:text-black/70 transition-colors" aria-label="刷新">
        <img src="/projects/project-3/refresh.svg" alt="" width={36} height={36} />
      </button>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setViewMode((m) => (m === "mobile" ? "pc" : "mobile"))}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-black/70 hover:bg-black/5 transition-colors"
          aria-label={viewMode === "pc" ? "切换至手机视图" : "切换至 PC 视图"}
        >
          <img
            src={viewMode === "pc" ? "/projects/project-3/device_mobile.svg" : "/projects/project-3/device_pc.svg"}
            alt=""
            width={36}
            height={36}
          />
        </button>
        <button
          type="button"
          onClick={() => setIsPreviewMode(false)}
          className="px-4 py-2.5 text-sm font-medium text-black/80 transition-all hover:bg-black/5"
          style={{
            borderRadius: "10px",
            backgroundColor: "rgba(59, 42, 0, 0.05)",
            boxShadow: "inset 0 0 1px 1px #fff, 0 0 0 1px rgba(230, 227, 223, 0.8)",
          }}
        >
          Back to Edit
        </button>
      </div>
    </div>
  );

  return (
    <div className="my-10 flex justify-center w-full overflow-hidden" ref={containerWrapperRef} style={{ height: 900 * scale }}>
      <div
        className="flex shrink-0 p-4 origin-top-left md:origin-top"
        style={{ 
          width: 1440,
          height: 900,
          gap: 10,
          transform: `scale(${scale})`,
          backgroundColor: '#F3F4F6',
          borderRadius: 32
        }}
      >
        {!isPreviewMode && chatPanel}
        
        <div 
          className="flex-1 min-w-0 overflow-hidden bg-white flex flex-col rounded-2xl relative"
          style={{
            boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)"
          }}
        >
          {isPreviewMode ? previewModeBar : previewToolbar}
          
          <div className="flex-1 overflow-auto relative bg-white" data-lenis-prevent>
            <motion.div 
              className="h-full w-full"
              initial={false}
              animate={{
                backgroundColor: viewMode === "mobile" ? "#f5f5f5" : "#ffffff",
                paddingTop: viewMode === "mobile" ? 40 : 0,
                paddingBottom: viewMode === "mobile" ? 40 : 0,
              }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <AnimatePresence mode="wait">
                {viewMode === "pc" ? (
                  <motion.div
                    key="pc"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                    className="h-full w-full bg-white"
                  >
                    <PreviewContent />
                  </motion.div>
                ) : (
                  <motion.div
                    key="mobile"
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 0.85 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                    className="h-full w-full flex items-start justify-center origin-top pt-4"
                  >
                    <MobileMockup style={{ marginTop: 0 }}>
                      <div className="h-full w-full overflow-auto bg-white" data-lenis-prevent>
                        <PreviewContent />
                      </div>
                    </MobileMockup>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Toast */}
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100]"
              >
                <div className="rounded-full bg-black/80 px-4 py-2 text-sm text-white shadow-lg backdrop-blur-md">
                  网站已发布
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
