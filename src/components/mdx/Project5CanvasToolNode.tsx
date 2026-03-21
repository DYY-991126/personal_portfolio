"use client";

import type { Project5CanvasNode } from "./Project5CanvasNodeTypes";

interface Project5CanvasToolNodeProps {
  node: Project5CanvasNode;
  preview?: boolean;
}

export default function Project5CanvasToolNode({
  node,
  preview = false,
}: Project5CanvasToolNodeProps) {
  if (node.type === "highlighter") {
    return (
      <div className={`absolute inset-0 ${preview ? "opacity-50" : ""}`}>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 176 44"
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ filter: "drop-shadow(0 8px 12px rgba(15,23,42,0.12))" }}
        >
          <g>
            <rect x="16" y="6" width="112" height="32" rx="12" fill="#ffd24f" />
            <rect x="112" y="6" width="28" height="32" rx="8" fill="#f59e0b" />
            <path d="M140 8 H154 C162 8 168 14 168 22 C168 30 162 36 154 36 H140 Z" fill="#fb7185" />
            <rect x="124" y="6" width="6" height="32" fill="#d97706" opacity="0.35" />
            <rect x="28" y="11" width="70" height="5" rx="2.5" fill="white" opacity="0.26" />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 ${preview ? "opacity-50" : ""}`}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 196 36"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ filter: "drop-shadow(0 8px 12px rgba(15,23,42,0.1))" }}
      >
        <g>
          <path d="M14 18 L30 4 H156 L172 18 L156 32 H30 Z" fill="#f8d15c" />
          <path d="M30 4 H46 L62 18 L46 32 H30 Z" fill="#facc15" opacity="0.85" />
          <path d="M156 4 H170 L182 18 L170 32 H156 Z" fill="#fbbf24" />
          <path d="M170 4 H181 L191 18 L181 32 H170 Z" fill="#f5e7c9" />
          <path d="M181 4 L191 18 L181 32 Z" fill="#111827" opacity="0.86" />
          <rect x="8" y="6" width="18" height="24" rx="6" fill="#f9a8d4" />
          <rect x="24" y="6" width="6" height="24" fill="#cbd5e1" />
          <path d="M46 8 H148" stroke="#f59e0b" strokeWidth="1.6" opacity="0.45" />
          <path d="M46 28 H148" stroke="#f59e0b" strokeWidth="1.6" opacity="0.32" />
        </g>
      </svg>
    </div>
  );
}
