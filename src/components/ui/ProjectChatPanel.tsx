"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import type { AIAction } from "@/lib/ai-tools";
import { terminalAudio } from "@/lib/audio";
import { ChatMessageText } from "@/components/ui/ChatMessageText";

interface ProjectChatPanelProps {
  projectId: string;
  projectTitle: string;
  onClose?: () => void;
}

export default function ProjectChatPanel({ projectId, projectTitle, onClose }: ProjectChatPanelProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Array<{role: 'user' | 'dyy', content: string}>>([
    { role: 'dyy', content: `Hi! I'm DYY's AI assistant. What would you like to know about "${projectTitle}"?` }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') {
      terminalAudio?.playKeystroke();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    terminalAudio?.playEnter();
    
    if (!inputValue.trim() || isLoading) return;

    const currentInput = inputValue.trim();
    setInputValue("");
    setMessages(prev => [...prev, { role: 'user', content: currentInput }]);
    
    if (currentInput.toLowerCase() === 'clear') {
      setMessages([{ role: 'dyy', content: `Hi! I'm DYY's AI assistant. What would you like to know about "${projectTitle}"?` }]);
      return;
    }

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
        return [...newHistory, { role: 'dyy', content: data.message || 'Sorry, something went wrong.' }];
      });

      if (data.actions && data.actions.length > 0) {
        executeActions(data.actions);
      }
    } catch {
      setMessages(prev => {
        const newHistory = prev.slice(0, -1);
        return [...newHistory, { role: 'dyy', content: 'Network error. Please try again later.' }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-background flex flex-col font-sans">
      {/* Chat Content */}
      <div className="px-5 py-6 flex-1 overflow-y-auto space-y-6">
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div 
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-foreground text-background rounded-br-sm' 
                  : 'bg-muted text-foreground rounded-bl-sm border border-border/50'
              }`}
            >
              {msg.content === 'Thinking...' ? (
                <span className="flex items-center gap-2 opacity-80">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Thinking...
                </span>
              ) : (
                <span className="whitespace-pre-wrap"><ChatMessageText content={msg.content} theme="modern" /></span>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 p-4 border-t border-border/40 bg-background/80 backdrop-blur-sm">
        <form 
          onSubmit={handleSubmit} 
          className="flex items-center relative rounded-full border border-border/60 bg-muted/30 focus-within:bg-background focus-within:border-border transition-colors shadow-sm focus-within:shadow-md"
        >
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            spellCheck={false}
            autoComplete="off"
            placeholder="Ask a question..."
            className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground px-5 py-3.5 text-[15px]"
            autoFocus
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 p-2 bg-foreground text-background rounded-full hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
