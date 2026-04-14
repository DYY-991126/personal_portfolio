"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { Terminal, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PROJECTS, Project } from "@/app/data";
import type { AIAction, ScreenState } from "@/lib/ai-tools";
import { terminalAudio } from "@/lib/audio";
import { ChatMessageText } from "@/components/ui/ChatMessageText";
import { CatLumi } from "@/components/ui/CatLumi";
import { ResumeModal } from "@/components/ui/ResumeModal";

// ── Constants ──

const CHAT_KEY = "terminal_chat_history";

const MAIN_MENU = [
  { id: "about",    label: "1. 我的简历" },
  { id: "projects", label: "2. 过往项目" },
];

/** 首页自我介绍行：字符串为纯文本，`{ href, text }` 为跳转案例的链接 */
type IntroPart = string | { href: `/projects/${string}`; text: string };

const INTRO_LINES: IntroPart[][] = [
  [
    "嗨！我是毅洋👋 产品设计师，深耕工具类产品。从",
    { href: "/projects/project-5", text: " 👉 即时设计（国内标杆 UI 工具）" },
    "到 ",
    { href: "/projects/project-3", text: " 👉 Wegic（海外 Product Hunt #1）" },
  ],
  ["一直以来我在中型创业团队工作。除了设计师身份，也承担跨职能角色，负责过："],
  [
    "- ",
    { href: "/projects/project-7", text: "👉 全球首创 Design System 生成 UI: 从产品到商业化" },
  ],
  ["- ", { href: "/projects/project-1", text: "👉 AI 建站产品里程碑规划和拆解" }],
  ["- ", { href: "/projects/project-2", text: "👉 产品首付率翻倍, 从服务洞察到需求上线" }],
  ["- ", { href: "/projects/project-4", text: "👉 Agentic 驱动的网页视觉行业标杆" }],
  [
    "这些经历让我同时具备系统思考、交付能力和业务影响力，期待与你共事。点击下方查看我的简历或全部项目",
  ],
];

// ── Helpers ──

type TerminalChatMessage =
  | { role: "user"; content: string }
  | { role: "dyy"; content: string; animate?: boolean; resume?: boolean };

function getSavedChat(): TerminalChatMessage[] {
  try { const r = sessionStorage.getItem(CHAT_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}

function buildScreenContext(projectListVisible: boolean): string {
  let ctx = `主菜单选项：
👉 查看我的简历
👉 查看过往项目`;

  if (projectListVisible) {
    ctx += `\n\n项目列表（仅供命令模式使用）：
${PROJECTS.map((p, i) => `${i + 1}. ${p.id} — ${p.title}`).join("\n")}`;
  }
  return ctx;
}

function deriveScreenState(projectListVisible: boolean): ScreenState {
  return projectListVisible ? "project_list" : "menu";
}

// ── Component ──

export default function TerminalHero() {
  // Hydration guard
  const [mounted, setMounted] = useState(false);

  const menuReady = true;

  // Interactive state
  const [projectListOpen, setProjectListOpen] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [focusedIdx, setFocusedIdx] = useState(-1);

  // Chat state
  const [chat, setChat] = useState<TerminalChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Effects / CRT
  const [glitch, setGlitch] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeLaunchPending, setResumeLaunchPending] = useState(false);

  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const didPinInitialTerminalScroll = useRef(false);

  const triggerGlitch = useCallback(() => {
    setGlitch(true);
    setTimeout(() => setGlitch(false), 250);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth"
          });
        }
      }, 50);
    }
  }, []);

  const openResumeWithTransition = useCallback((opts?: { userAlreadyInChat?: boolean }) => {
    setResumeLaunchPending(true);
    setChat((p) => {
      const next: TerminalChatMessage[] = [...p];
      if (!opts?.userAlreadyInChat) {
        next.push({ role: "user", content: MAIN_MENU[0]?.label ?? "1. 查看我的简历" });
      }
      next.push({
        role: "dyy",
        content: "正在为你调取他的档案...",
        animate: true,
        resume: true,
      });
      return next;
    });

    setTimeout(() => {
      setResumeModalOpen(true);
      setResumeLaunchPending(false);
    }, 900);
  }, []);

  // ── Mount & session restore ──

  useEffect(() => {
    setChat(getSavedChat());
    setMounted(true);
  }, []);

  // Persist chat
  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_KEY, JSON.stringify(chat.filter((m) => m.content !== "Thinking...")));
    } catch { /* */ }
  }, [chat]);

  useEffect(() => {
    if (!mounted) return;

    if (!didPinInitialTerminalScroll.current) {
      didPinInitialTerminalScroll.current = true;
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
      });
      return;
    }

    scrollToBottom();
  }, [chat, menuReady, projectListOpen, scrollToBottom, mounted]);
  useEffect(() => { if (menuReady && inputRef.current) inputRef.current.focus(); }, [menuReady]);

  // ── Keyboard navigation ──

  useEffect(() => {
    if (!menuReady) return;

    const handle = (e: KeyboardEvent) => {
      if (e.isComposing || e.keyCode === 229) return;

      const isInput = document.activeElement?.tagName === "INPUT";
      if (isInput) {
        if (e.key === "Enter") return;
        if (input.length > 0) return;
      }

      const maxIdx = projectListOpen ? PROJECTS.length - 1 : MAIN_MENU.length - 1;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        terminalAudio?.playKeystroke();
        setFocusedIdx((p) => (p < maxIdx ? p + 1 : p));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        terminalAudio?.playKeystroke();
        setFocusedIdx((p) => (p > 0 ? p - 1 : p));
      } else if (e.key === "Enter" && focusedIdx >= 0) {
        e.preventDefault();
        terminalAudio?.playEnter();
        triggerGlitch();
        if (projectListOpen) {
          setTimeout(() => router.push(`/projects/${PROJECTS[focusedIdx].id}`), 300);
        } else {
          handleMenuSelect(focusedIdx);
        }
      } else if (e.key === "Escape" && projectListOpen) {
        e.preventDefault();
        terminalAudio?.playKeystroke();
        setProjectListOpen(false);
        setFocusedIdx(0);
      }
    };

    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuReady, focusedIdx, router, triggerGlitch, projectListOpen, input]);

  // Sync hovered project with focused index
  useEffect(() => {
    if (projectListOpen && focusedIdx >= 0 && focusedIdx < PROJECTS.length) {
      setHoveredProject(PROJECTS[focusedIdx]);
    } else {
      setHoveredProject(null);
    }
  }, [focusedIdx, projectListOpen]);

  // ── Core: execute AI actions returned from API ──

  const executeActions = useCallback((actions: AIAction[]) => {
    for (const a of actions) {
      switch (a.type) {
        case "navigate_to_project":
          setTimeout(() => router.push(`/projects/${a.projectId}`), 1200);
          break;
        case "navigate_home":
          setTimeout(() => router.push("/"), 1200);
          break;
        case "show_project_index": {
          const targetProjectId = a.projectId ?? PROJECTS[0]?.id;
          if (targetProjectId) {
            setTimeout(
              () => router.push(`/projects/${targetProjectId}?index=1&returnTo=${encodeURIComponent("/")}`),
              800
            );
          }
          break;
        }
      }
    }
  }, [router]);

  // ── Core: send message to AI ──

  const sendToAI = useCallback(async (text: string) => {
    if (loading) return;
    setLoading(true);
    setChat((p) => [...p, { role: "user", content: text }]);
    setChat((p) => [...p, { role: "dyy", content: "Thinking..." }]);

    try {
      const apiMessages = chat
        .filter((m) => m.content !== "Thinking...")
        .map((m) => ({ role: m.role === "dyy" ? "assistant" : "user", content: m.content }));
      apiMessages.push({ role: "user", content: text });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          screenState: deriveScreenState(projectListOpen),
          screenContext: buildScreenContext(projectListOpen),
        }),
      });
      const data = await res.json();

      const reply =
        typeof data.message === "string" && data.message.length > 0
          ? data.message
          : typeof data.error === "string" && data.error.length > 0
            ? data.error
            : "哎呀，出了点问题。";

      setChat((p) => {
        const prev = p.slice(0, -1);
        return [...prev, { role: "dyy" as const, content: reply, animate: true }];
      });

      if (res.ok && Array.isArray(data.actions) && data.actions.length > 0) {
        executeActions(data.actions);
      }
    } catch {
      setChat((p) => {
        const prev = p.slice(0, -1);
        return [...prev, { role: "dyy" as const, content: "网络似乎出了点问题。", animate: true }];
      });
    } finally {
      setLoading(false);
    }
  }, [loading, chat, projectListOpen, executeActions]);

  // ── Menu selection (from keyboard/click/number input) ──

  const handleMenuSelect = useCallback((idx: number, opts?: { userAlreadyInChat?: boolean }) => {
    const item = MAIN_MENU[idx];
    if (!item) return;
    if (item.id === "projects") {
      const defaultProjectId = PROJECTS[0]?.id;
      if (defaultProjectId) {
        setChat((p) => [
          ...p,
          { role: "dyy", content: "我来帮你调起过往项目。", animate: true },
        ]);
        setTimeout(
          () => router.push(`/projects/${defaultProjectId}?index=1&returnTo=${encodeURIComponent("/")}`),
          1000
        );
      }
      return;
    }
    if (item.id === "about") {
      openResumeWithTransition({ userAlreadyInChat: opts?.userAlreadyInChat });
      return;
    }
  }, [openResumeWithTransition, router]);

  // ── Form submit: input router ──

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    terminalAudio?.playEnter();
    triggerGlitch();

    // Empty input → use focused item
    if (!input.trim()) {
      if (focusedIdx >= 0) {
        if (projectListOpen) {
          setTimeout(() => router.push(`/projects/${PROJECTS[focusedIdx].id}`), 300);
        } else {
          handleMenuSelect(focusedIdx);
        }
      }
      return;
    }
    if (loading) return;

    const raw = input.trim();
    setInput("");
    const cmd = raw.toLowerCase().split(" ");

    // Layer 1: System commands (deterministic, instant)
    if (cmd[0] === "clear") { setChat([]); setProjectListOpen(false); return; }
    if (cmd[0] === "help") {
      setChat((p) => [...p, { role: "user", content: raw }, { role: "dyy", content: "可用命令:\n- clear: 清除屏幕\n- help: 查看帮助\n- cd <id>: 打开项目\n\n或直接输入问题与 DYY 对话。" }]);
      return;
    }
    if (cmd[0] === "cd" || cmd[0] === "open") {
      const project = PROJECTS.find((p) => p.id === cmd[1]);
      if (project) {
        setChat((p) => [...p, { role: "user", content: raw }, { role: "dyy", content: `正在打开: ${project.title}...` }]);
        setTimeout(() => router.push(`/projects/${project.id}`), 800);
      } else {
        setChat((p) => [...p, { role: "user", content: raw }, { role: "dyy", content: `找不到项目 '${cmd[1]}'。` }]);
      }
      return;
    }

    // Layer 1.5: Number shortcuts (deterministic)
    const num = parseInt(raw);
    if (!isNaN(num)) {
      if (!projectListOpen && num >= 1 && num <= MAIN_MENU.length) {
        setChat((p) => [...p, { role: "user", content: raw }]);
        handleMenuSelect(num - 1, { userAlreadyInChat: true });
        return;
      }
      if (projectListOpen && num >= 1 && num <= PROJECTS.length) {
        setChat((p) => [
          ...p,
          { role: "user", content: raw },
          { role: "dyy", content: `正在打开: ${PROJECTS[num - 1].title}...` },
        ]);
        setTimeout(() => router.push(`/projects/${PROJECTS[num - 1].id}`), 800);
        return;
      }
    }

    // Layer 2: Natural language → AI (with dynamic tool provisioning)
    sendToAI(raw);
  };

  // ── Render ──

  if (!mounted) return <div className="absolute inset-0 bg-[#020204]" />;

  return (
    <div
      onMouseLeave={() => setFocusedIdx(-1)}
      className={`absolute inset-0 h-full w-full flex crt-screen overflow-hidden !bg-transparent transition-transform duration-700 ease-[0.16,1,0.3,1] ${resumeLaunchPending ? "scale-[0.965]" : "scale-100"} ${glitch ? "trigger-glitch" : "flicker-effect"}`}
    >
      {/* CLI Panel */}
      <div className={`flex-1 flex flex-col font-mono text-sm sm:text-base h-full relative z-20 transition-all duration-700 ease-[0.16,1,0.3,1] ${hoveredProject ? "md:max-w-[50vw]" : "w-full"}`}>

        {/* Top Bar */}
        <div className="px-6 py-4 flex items-center shrink-0 border-b border-[#00ff41]/20 bg-[#00ff41]/5">
          <div className="flex items-center gap-3 phosphor-dim select-none">
            <Terminal className="w-5 h-5" />
            <span className="tracking-widest uppercase font-bold text-xs">DYY_TERMINAL</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div ref={scrollRef} className="p-6 md:p-12 flex-1 overflow-y-auto crt-scrollbar" data-lenis-prevent>
          {mounted ? (
            <div className="mb-10 space-y-4">
              {INTRO_LINES.map((parts, index) => (
                <div key={index} className="flex">
                  <span className="phosphor-dim mr-4 shrink-0 mt-0.5">❯</span>
                  <span className="leading-relaxed tracking-wide">
                    {parts.map((part, i) =>
                      typeof part === "string" ? (
                        <span key={i} className="phosphor-dim font-normal">
                          {part}
                        </span>
                      ) : (
                        <Link
                          key={i}
                          href={part.href}
                          className="inline-flex items-center min-h-[44px] py-2.5 px-2 -mx-2 -my-1 cursor-pointer phosphor-text font-semibold underline underline-offset-4 decoration-[#00ff41]/70 decoration-1 hover:decoration-[#00ff41] hover:brightness-110"
                          onClick={() => {
                            terminalAudio?.playEnter();
                            triggerGlitch();
                          }}
                        >
                          {part.text}
                        </Link>
                      )
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {/* Main Menu */}
          {mounted && (
            <div className="mb-10 mt-6">
              {menuReady && (
                <div className="pl-6 space-y-1">
                  {MAIN_MENU.map((item, idx) => {
                    const focused = !projectListOpen && focusedIdx === idx;
                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => { if (!projectListOpen) setFocusedIdx(idx); }}
                        onClick={() => {
                          terminalAudio?.playEnter();
                          triggerGlitch();
                          if (projectListOpen) { setProjectListOpen(false); setFocusedIdx(idx); }
                          handleMenuSelect(idx);
                        }}
                        className={`flex w-full max-w-full min-h-[44px] items-center cursor-pointer transition-colors px-3 py-3 -ml-3 ${focused ? "bg-[#00ff41]/20" : "hover:bg-[#00ff41]/10"}`}
                      >
                        <span className={`mr-3 w-4 text-center ${focused ? "phosphor-text font-bold" : "text-transparent"}`}>█</span>
                        <span
                          className={`font-mono phosphor-text ${focused ? "font-bold brightness-110" : "font-medium opacity-90"}`}
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Chat History */}
          {chat.length > 0 && (
            <div className="space-y-6 mb-6 pt-8 border-t border-[#00ff41]/20">
              {chat.map((msg, idx) => {
                return (
                  <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-1">
                    {msg.role === "user" ? (
                      <div className="flex">
                        <span className="phosphor-blue mr-4 shrink-0 mt-0.5">●</span>
                        <span className="phosphor-blue whitespace-pre-wrap tracking-wide"><ChatMessageText content={msg.content} /></span>
                      </div>
                    ) : (
                      <div className="flex w-full min-w-0">
                        <span className="phosphor-dim mr-4 shrink-0 mt-0.5">❯</span>
                        <div className="min-w-0 flex-1 whitespace-pre-wrap tracking-wide">
                          {msg.content === "Thinking..." ? (
                            <span className="flex items-center gap-3 phosphor-dim font-normal opacity-90">
                              <Loader2 className="w-4 h-4 animate-spin opacity-80" />
                              [ PROCESSING QUERY ]...
                            </span>
                          ) : (
                            <>
                              <ChatMessageText content={msg.content} animate={msg.animate} />
                              {msg.role === "dyy" && msg.resume ? (
                                <button
                                  type="button"
                                  className="mt-3 inline-flex min-h-[44px] items-center py-2 px-1 -mx-1 cursor-pointer font-mono font-semibold text-[11px] uppercase tracking-widest phosphor-text underline underline-offset-4 decoration-[#00ff41]/60 transition-colors hover:decoration-[#00ff41] hover:brightness-110"
                                  onClick={() => {
                                    terminalAudio?.playEnter();
                                    triggerGlitch();
                                    openResumeWithTransition({ userAlreadyInChat: true });
                                  }}
                                >
                                  打开档案
                                </button>
                              ) : null}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Input */}
        {menuReady && (
          <div className="shrink-0 px-6 md:px-12 py-6 border-t border-[#00ff41]/20 bg-[#00ff41]/5 backdrop-blur-md relative">
            <CatLumi containerWidth={typeof window !== 'undefined' ? window.innerWidth : 800} />
            <form onSubmit={handleSubmit} className="flex items-center relative z-10">
              <div className="flex items-center shrink-0 mr-3 font-mono tracking-wide select-none">
                <span className="phosphor-dim font-normal text-sm">Send to</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/avatar.png" alt="DYY" className="w-7 h-7 rounded-full mx-2 border border-[#00ff41]/50 object-cover" draggable={false} />
                <span className="phosphor-text font-bold">DYY :</span>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key !== "Enter") { terminalAudio?.playKeystroke(); } }}
                onFocus={() => setFocusedIdx(-1)}
                spellCheck={false}
                autoComplete="off"
                placeholder="和 DYY 对话..."
                className="w-full bg-transparent border-none outline-none phosphor-text font-medium placeholder:phosphor-dim placeholder:opacity-70 focus:ring-0 caret-[#00ff41] font-mono text-base tracking-wide"
              />
            </form>
          </div>
        )}
      </div>

      {/* Right: Project Preview Image */}
      <AnimatePresence>
        {hoveredProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:block absolute right-0 top-0 bottom-0 w-[50vw] bg-[#020204] z-10 border-l border-[#00ff41]/20"
          >
            <div className="absolute inset-0 p-8 flex flex-col justify-center">
              <div className="relative w-full aspect-video overflow-hidden border border-[#00ff41]/30 p-2 bg-[#00ff41]/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={hoveredProject.coverImage} alt={hoveredProject.title} className="w-full h-full object-cover retro-image opacity-80" />
                <div className="absolute top-6 left-6 flex flex-col gap-1">
                  <span className="phosphor-text bg-black/60 px-2 py-0.5 text-xs font-bold tracking-widest uppercase">[ IMG_DATA: {hoveredProject.id} ]</span>
                  {hoveredProject.year ? (
                    <span className="phosphor-text bg-black/60 px-2 py-0.5 text-xs tracking-widest uppercase">YEAR: {hoveredProject.year}</span>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ResumeModal open={resumeModalOpen} onOpenChange={setResumeModalOpen} />
    </div>
  );
}
