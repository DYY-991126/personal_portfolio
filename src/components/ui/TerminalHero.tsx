"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { Terminal, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { PROJECTS, Project } from "@/app/data";
import type { AIAction, ScreenState } from "@/lib/ai-tools";
import { terminalAudio } from "@/lib/audio";
import { ChatMessageText } from "@/components/ui/ChatMessageText";
import { CatLumi } from "@/components/ui/CatLumi";

// ── Constants ──

const SESSION_KEY = "terminal_intro_done";
const CHAT_KEY = "terminal_chat_history";

const MAIN_MENU = [
  { id: "about",    label: "1. 更多关于我 (About Me)" },
  { id: "projects", label: "2. 过往项目 (Projects)" },
  { id: "contact",  label: "3. 联系方式 (Contact)" },
  { id: "chat",     label: "4. 随便看看 / 和我聊天 (Explore)" },
];

const INTRO_LINES = [
  "Hi, I'm DYY, a Product Designer with 5 years of experience specializing in AI and complex interaction design.",
  "I build LLM-driven products, drive requirements from conception to launch, and rely on data analysis to validate outcomes.",
];

// ── Helpers ──

function getSessionFlag(): boolean {
  try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
}

function getSavedChat(): Array<{ role: "user" | "dyy"; content: string; animate?: boolean }> {
  try { const r = sessionStorage.getItem(CHAT_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}

function buildScreenContext(projectListVisible: boolean): string {
  let ctx = `主菜单选项：
1. 更多关于我
2. 过往项目
3. 联系方式
4. 随便看看 / 和我聊天`;

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
  const isReturning = useRef(false);

  // Intro animation state
  const [displayedLines, setDisplayedLines] = useState<string[]>([""]);
  const [lineIndex, setLineIndex] = useState(0);
  const [introDone, setIntroDone] = useState(false);
  const [menuReady, setMenuReady] = useState(false);

  // Interactive state
  const [projectListOpen, setProjectListOpen] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [focusedIdx, setFocusedIdx] = useState(-1);

  // Chat state
  const [chat, setChat] = useState<Array<{ role: "user" | "dyy"; content: string; animate?: boolean }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Effects / CRT
  const [glitch, setGlitch] = useState(false);
  const [typing, setTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerGlitch = useCallback(() => {
    setGlitch(true);
    setTimeout(() => setGlitch(false), 250);
  }, []);

  const triggerTyping = useCallback(() => {
    setTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 100);
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

  // ── Mount & session restore ──

  useEffect(() => {
    isReturning.current = getSessionFlag();
    if (isReturning.current) {
      setDisplayedLines(INTRO_LINES);
      setLineIndex(INTRO_LINES.length);
      setIntroDone(true);
      setMenuReady(true);
      setChat(getSavedChat());
    }
    setMounted(true);
  }, []);

  // Persist chat
  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_KEY, JSON.stringify(chat.filter((m) => m.content !== "Thinking...")));
    } catch { /* */ }
  }, [chat]);

  useEffect(() => { scrollToBottom(); }, [chat, introDone, menuReady, projectListOpen, scrollToBottom]);
  useEffect(() => { if (menuReady && inputRef.current) inputRef.current.focus(); }, [menuReady]);

  // ── Intro typing animation ──

  useEffect(() => {
    if (!mounted || isReturning.current) return;

    if (lineIndex >= INTRO_LINES.length) {
      setTimeout(() => {
        setIntroDone(true);
        setTimeout(() => {
          setMenuReady(true);
          try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* */ }
        }, 600);
      }, 500);
      return;
    }

    const text = INTRO_LINES[lineIndex];
    let charIdx = 0;

    const iv = setInterval(() => {
      if (charIdx <= text.length) {
        setDisplayedLines((prev) => {
          const next = [...prev];
          next[lineIndex] = text.slice(0, charIdx);
          return next;
        });
        charIdx++;
        if (charIdx % 2 === 0) { terminalAudio?.playKeystroke(); triggerTyping(); }
      } else {
        clearInterval(iv);
        setTimeout(() => { setLineIndex((p) => p + 1); setDisplayedLines((p) => [...p, ""]); }, 200);
      }
    }, 20);

    return () => clearInterval(iv);
  }, [lineIndex, triggerTyping, mounted]);

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

      setChat((p) => {
        const prev = p.slice(0, -1);
        return [...prev, { role: "dyy" as const, content: data.message || "哎呀，出了点问题。", animate: true }];
      });

      if (data.actions?.length) executeActions(data.actions);
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

  const handleMenuSelect = useCallback((idx: number) => {
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
    sendToAI(item.label);
    if (item.id === "chat") setTimeout(() => inputRef.current?.focus(), 100);
  }, [router, sendToAI]);

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
        handleMenuSelect(num - 1);
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

  if (!mounted) return <div className="fixed inset-0 bg-[#020204]" />;

  return (
    <div
      onMouseLeave={() => setFocusedIdx(-1)}
      className={`fixed inset-0 w-screen h-screen flex crt-screen overflow-hidden bg-[#020204] ${glitch ? "trigger-glitch" : "flicker-effect"} ${typing ? "power-surge" : ""}`}
    >
      {/* CLI Panel */}
      <div className={`flex-1 flex flex-col font-mono text-sm sm:text-base h-full relative z-20 transition-all duration-700 ease-[0.16,1,0.3,1] ${hoveredProject ? "md:max-w-[50vw]" : "w-full"}`}>

        {/* Top Bar */}
        <div className="px-6 py-4 flex items-center shrink-0 border-b border-[#00ff41]/20 bg-[#00ff41]/5">
          <div className="flex items-center gap-3 phosphor-dim select-none">
            <Terminal className="w-5 h-5" />
            <span className="tracking-widest uppercase font-bold text-xs">SYSTEM_OS_v2.0 :: DYY_TERMINAL</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div ref={scrollRef} className="p-6 md:p-12 flex-1 overflow-y-auto crt-scrollbar" data-lenis-prevent>

          {/* Intro Lines */}
          <div className="space-y-4 mb-10">
            {displayedLines.map((line, i) => (
              <div key={i} className="flex">
                {i < lineIndex || (i === lineIndex && line.length > 0) ? (
                  <>
                    <span className="phosphor-dim mr-4 shrink-0 mt-0.5">❯</span>
                    <span className="phosphor-text leading-relaxed tracking-wide">
                      {line}
                      {i === lineIndex && !introDone && <span className="caret-block ml-1" />}
                    </span>
                  </>
                ) : null}
              </div>
            ))}
          </div>

          {/* Main Menu (always visible once ready) */}
          {introDone && (
            <div className="mb-10">
              <div className="flex mb-6">
                <span className="phosphor-dim mr-4 shrink-0 mt-0.5">❯</span>
                <span className="phosphor-text tracking-wide">init_system</span>
              </div>
              {menuReady && (
                <div className="pl-6 space-y-1">
                  <p className="phosphor-dim opacity-70 text-xs mb-4 uppercase tracking-widest">[ SYSTEM: Select an option ]</p>
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
                        className={`flex items-center cursor-pointer transition-colors px-3 py-2 -ml-3 ${focused ? "bg-[#00ff41]/20" : "hover:bg-[#00ff41]/10"}`}
                      >
                        <span className={`mr-3 w-4 text-center ${focused ? "phosphor-text font-bold" : "text-transparent"}`}>█</span>
                        <span className={`font-mono ${focused ? "phosphor-text" : "phosphor-dim"}`}>{item.label}</span>
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
                      <div className="flex">
                        <span className="phosphor-text mr-4 shrink-0 mt-0.5">❯</span>
                        <span className="phosphor-text whitespace-pre-wrap tracking-wide">
                          {msg.content === "Thinking..." ? (
                            <span className="flex items-center gap-3 opacity-80">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              [ PROCESSING QUERY ]...
                            </span>
                          ) : (
                            <ChatMessageText content={msg.content} animate={msg.animate} />
                          )}
                        </span>
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
            <form onSubmit={handleSubmit} className="flex items-center relative z-10 text-[#00ff41]">
              <div className="flex items-center shrink-0 mr-3 font-mono font-bold tracking-wide select-none">
                <span className="opacity-70 text-sm">Send to</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/avatar.png" alt="DYY" className="w-7 h-7 rounded-full mx-2 border border-[#00ff41]/50 object-cover" draggable={false} />
                <span>DYY :</span>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key !== "Enter") { terminalAudio?.playKeystroke(); triggerTyping(); } }}
                onFocus={() => setFocusedIdx(-1)}
                spellCheck={false}
                autoComplete="off"
                className="w-full bg-transparent border-none outline-none phosphor-text placeholder:text-[#008f11]/50 focus:ring-0 caret-[#00ff41] font-mono text-base tracking-wide"
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
                  <span className="phosphor-text bg-black/60 px-2 py-0.5 text-xs tracking-widest uppercase">YEAR: {hoveredProject.year}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
