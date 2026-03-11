"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  // Props injected by rehype-pretty-code
  "data-language"?: string;
  "data-theme"?: string;
}

export function Pre({
  children,
  title,
  "data-language": language,
  ...props
}: CodeBlockProps & React.HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const el = document.querySelector("[data-copy-target]");
    const text = el?.textContent ?? "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-12 rounded-2xl overflow-hidden border border-border/30 bg-[#0d0d0d] group">
      {(title || language) && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20 bg-[#111]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            </div>
            {title && (
              <span className="text-xs text-muted-foreground font-mono ml-2">
                {title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {language && (
              <span className="text-xs text-muted-foreground/60 font-mono uppercase">
                {language}
              </span>
            )}
            <button
              onClick={copyToClipboard}
              className="text-muted-foreground/50 hover:text-foreground transition-colors p-1"
              aria-label="Copy code"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      )}
      <pre
        {...props}
        className="overflow-x-auto p-4 text-sm leading-relaxed font-mono"
        data-copy-target=""
      >
        {children}
      </pre>
    </div>
  );
}
