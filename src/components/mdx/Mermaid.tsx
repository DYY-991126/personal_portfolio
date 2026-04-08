"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";

let mermaidLoader: Promise<typeof import("mermaid").default> | null = null;

function loadMermaid() {
  if (!mermaidLoader) {
    mermaidLoader = import("mermaid").then((mod) => {
      mod.default.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "loose",
        themeVariables: {
          darkMode: true,
          background: "#0a0a0a",
          primaryTextColor: "#ededed",
          secondaryTextColor: "#a3a3a3",
          lineColor: "#525252",
          primaryColor: "#262626",
          secondaryColor: "#171717",
          tertiaryColor: "#0a0a0a",
          mainBkg: "#171717",
          nodeBorder: "#404040",
          clusterBkg: "#141414",
          clusterBorder: "#333333",
        },
      });
      return mod.default;
    });
  }
  return mermaidLoader;
}

export interface MermaidProps {
  /** Mermaid 源码（如 flowchart TD ...），勿含外层 markdown 围栏 */
  chart?: string;
  /** 若 chart 未传入，可使用子节点纯文本作为源码（兼容部分 MDX 序列化） */
  children?: ReactNode;
  className?: string;
}

function normalizeMermaidSource(chart: string | undefined, children: ReactNode): string {
  if (typeof chart === "string" && chart.trim()) return chart.trim();
  if (typeof children === "string") return children.trim();
  if (Array.isArray(children)) {
    return children
      .map((c) => (typeof c === "string" ? c : ""))
      .join("")
      .trim();
  }
  return "";
}

export default function Mermaid({ chart, children, className = "" }: MermaidProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(
    typeof crypto !== "undefined"
      ? `mmd-${crypto.randomUUID()}`
      : `mmd-${Math.random().toString(36).slice(2, 11)}`
  );

  const text = useMemo(() => normalizeMermaidSource(chart, children), [chart, children]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (!text) {
      host.innerHTML = `<p class="text-xs text-muted-foreground text-center py-4">未提供 Mermaid 源码（chart 为空）。</p>`;
      return;
    }

    let cancelled = false;
    const safeId = idRef.current.replace(/[^a-zA-Z0-9-]/g, "");

    (async () => {
      const mermaid = await loadMermaid();
      try {
        const { svg, bindFunctions } = await mermaid.render(safeId, text);
        if (cancelled || !hostRef.current) return;
        hostRef.current.innerHTML = svg;
        bindFunctions?.(hostRef.current);
      } catch {
        if (!cancelled && hostRef.current) {
          hostRef.current.innerHTML = `<pre class="text-xs text-muted-foreground whitespace-pre-wrap p-2">${escapeHtml(
            text
          )}</pre><p class="text-xs text-red-400/90 mt-2">Mermaid 渲染失败，已回退为源码。</p>`;
        }
      }
    })();

    return () => {
      cancelled = true;
      if (hostRef.current) hostRef.current.innerHTML = "";
    };
  }, [text]);

  return (
    <figure
      className={`my-10 w-full overflow-x-auto border border-border/40 bg-muted/10 px-4 py-6 md:px-6 ${className}`}
      aria-label="Mermaid 架构图"
    >
      <div
        ref={hostRef}
        className="flex min-h-[140px] justify-center [&_svg]:h-auto [&_svg]:max-w-full"
      />
    </figure>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
