"use client";

import { useLayoutEffect, useRef } from "react";

import type { Project5CanvasNode } from "./Project5CanvasNodeTypes";

interface Project5ShapeTextNodeProps {
  node: Project5CanvasNode;
  preview?: boolean;
  editing?: boolean;
  editingSeed?: string | null;
  onTextChange?: (value: string) => void;
  onCommandEnter?: (value: string) => void;
}

export default function Project5ShapeTextNode({
  node,
  preview = false,
  editing = false,
  editingSeed = null,
  onTextChange,
  onCommandEnter,
}: Project5ShapeTextNodeProps) {
  const shapeKind = node.shapeKind ?? "process";
  const strokeColor = "rgba(15,23,42,0.18)";
  const fillColor = "rgba(255,255,255,0.95)";
  const shapeShadow = "drop-shadow(0 22px 48px rgba(15,23,42,0.08))";
  const editableRef = useRef<HTMLDivElement>(null);
  const isPlaceholder = node.text.trim() === "输入文本";

  useLayoutEffect(() => {
    if (!editing || !editableRef.current) {
      return;
    }

    const editableElement = editableRef.current;
    const selection = window.getSelection();

    editableElement.focus();

    if (editingSeed !== null) {
      editableElement.textContent = editingSeed;
    }

    if (!selection) {
      return;
    }

    const textNode = editableElement.firstChild;
    const range = document.createRange();

    if (textNode) {
      range.setStart(textNode, textNode.textContent?.length ?? 0);
    } else {
      range.setStart(editableElement, 0);
    }

    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }, [editing, editingSeed]);

  return (
    <div className={`absolute inset-0 text-[#0f172a] ${preview ? "opacity-50" : ""}`}>
      {shapeKind === "database" ? (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 184 94"
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ filter: shapeShadow }}
        >
          <path
            d="M4 14 C4 6, 180 6, 180 14 L180 80 C180 88, 4 88, 4 80 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1.5"
          />
          <ellipse cx="92" cy="14" rx="88" ry="14" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M4 80 C4 88, 180 88, 180 80" fill="none" stroke={strokeColor} strokeWidth="1.5" />
        </svg>
      ) : shapeKind === "decision" ? (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 168 112"
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ filter: shapeShadow }}
        >
          <polygon points="84,4 164,56 84,108 4,56" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
        </svg>
      ) : (
        <div
          className={`absolute inset-0 border border-[#0f172a]/14 bg-white/95 ${
            shapeKind === "start" ? "rounded-full" : ""
          }`}
          style={{ boxShadow: "0 22px 48px rgba(15,23,42,0.08)" }}
        />
      )}

      <div
        className={`absolute inset-0 flex flex-col items-center justify-center px-5 text-center ${
          shapeKind === "decision" ? "px-8" : ""
        }`}
      >
        {editing ? (
          <div
            ref={editableRef}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="输入文本"
            className="min-w-[40px] outline-none text-[18px] font-medium leading-7 text-[#0f172a] empty:before:pointer-events-none empty:before:content-[attr(data-placeholder)] empty:before:opacity-40"
            onBlur={(event) => onTextChange?.(event.currentTarget.textContent ?? "")}
            onPointerDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.metaKey && event.key === "Enter") {
                event.preventDefault();
                onCommandEnter?.(event.currentTarget.textContent ?? "");
              }
            }}
          >
            {editingSeed !== null ? "" : isPlaceholder ? "" : node.text}
          </div>
        ) : (
          <p className={`text-[18px] font-medium leading-7 text-[#0f172a] ${isPlaceholder ? "opacity-40" : ""}`}>
            {node.text}
          </p>
        )}
      </div>
    </div>
  );
}
