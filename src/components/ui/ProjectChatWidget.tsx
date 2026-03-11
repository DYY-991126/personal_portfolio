"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Send } from "lucide-react";
import type { AIAction } from "@/lib/ai-tools";
import { ChatMessageText } from "@/components/ui/ChatMessageText";

interface ProjectChatWidgetProps {
  projectId: string;
  projectTitle: string;
}

export default function ProjectChatWidget({ projectId, projectTitle }: ProjectChatWidgetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{role: 'user' | 'dyy', content: string, animate?: boolean}>>([
    { role: 'dyy', content: `嗨！我是 DYY。你正在查看我的项目 "${projectTitle}"，关于这个项目有什么想问我的吗？`, animate: true }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const executeActions = (actions: AIAction[]) => {
    for (const action of actions) {
      switch (action.type) {
        case "navigate_to_project":
          setTimeout(() => router.push(`/projects/${action.projectId}`), 1200);
          break;
        case "navigate_home":
          setTimeout(() => router.push("/"), 1200);
          break;
        case "show_project_index":
          if (action.projectId && action.projectId !== projectId) {
            setTimeout(
              () =>
                router.push(
                  `/projects/${action.projectId}?index=1&returnTo=${encodeURIComponent(`/projects/${projectId}`)}`
                ),
              800
            );
          } else {
            window.dispatchEvent(new CustomEvent("project-index:open"));
          }
          break;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const currentInput = inputValue.trim();
    setInputValue("");
    setMessages(prev => [...prev, { role: 'user', content: currentInput }]);
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'dyy', content: 'Thinking...' }]);

    try {
      const apiMessages = messages.filter(m => m.content !== 'Thinking...').map(m => ({
        role: m.role === 'dyy' ? 'assistant' : 'user',
        content: m.content
      }));
      apiMessages.push({ role: 'user', content: currentInput });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          currentProjectId: projectId,
          screenState: "project_detail",
        })
      });
      const data = await res.json();
      
      setMessages(prev => {
        const newHistory = prev.slice(0, -1);
        return [...newHistory, { role: 'dyy', content: data.message || '哎呀，思考时出了点问题，请再试一次。', animate: true }];
      });

      if (data.actions && data.actions.length > 0) {
        executeActions(data.actions);
      }
    } catch (error) {
      setMessages(prev => {
        const newHistory = prev.slice(0, -1);
        return [...newHistory, { role: 'dyy', content: '网络似乎出了点问题。', animate: true }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Avatar Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-8 z-50 w-14 h-14 rounded-full overflow-hidden border-2 border-foreground/10 shadow-xl flex items-center justify-center bg-background transition-opacity duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <img src="/avatar.png" alt="Chat with DYY" className="w-full h-full object-cover" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-8 right-8 z-50 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-background border border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src="/avatar.png" alt="DYY" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">DYY</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                    Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-foreground text-background rounded-br-sm' 
                        : 'bg-muted text-foreground rounded-bl-sm whitespace-pre-wrap'
                    }`}
                  >
                    {msg.content === 'Thinking...' ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        思考中...
                      </span>
                    ) : (
                      <ChatMessageText content={msg.content} theme={msg.role === 'user' ? "retro" : "modern"} animate={msg.animate} />
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border shrink-0">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`关于 "${projectTitle}" 问点什么...`}
                  className="flex-1 bg-muted px-4 py-2.5 rounded-full text-sm outline-none focus:ring-1 focus:ring-foreground/20 transition-all placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-50 transition-opacity"
                >
                  <Send className="w-4 h-4 ml-[-2px]" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
