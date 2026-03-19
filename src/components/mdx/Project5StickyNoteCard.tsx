"use client";

import { useLayoutEffect, useRef } from "react";

export const PROJECT5_NOTE_WIDTH = 168;
export const PROJECT5_NOTE_HEIGHT = 132;

interface Project5StickyNoteCardProps {
  preview?: boolean;
  editing?: boolean;
  editingSeed?: string | null;
  text?: string;
  onTextChange?: (value: string) => void;
  onCommandEnter?: (value: string) => void;
}

export default function Project5StickyNoteCard({
  preview = false,
  editing = false,
  editingSeed = null,
  text = "输入文本",
  onTextChange,
  onCommandEnter,
}: Project5StickyNoteCardProps) {
  const editableRef = useRef<HTMLDivElement>(null);
  const isPlaceholder = text.trim() === "输入文本";

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
    <div
      className={`absolute inset-0 border border-[#f6c944]/70 bg-[#ffd95f] p-5 text-[#5e4a08] shadow-[0_24px_56px_rgba(245,158,11,0.2)] ${
        preview ? "opacity-50" : ""
      }`}
    >
      <div className="absolute right-0 top-0 h-8 w-8 bg-white/30" />
      {editing ? (
        <div
          ref={editableRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="输入文本"
          className="h-full outline-none whitespace-pre-line font-handwriting text-[20px] leading-8 empty:before:pointer-events-none empty:before:content-[attr(data-placeholder)] empty:before:opacity-40"
          onBlur={(event) => onTextChange?.(event.currentTarget.textContent ?? "")}
          onPointerDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.metaKey && event.key === "Enter") {
              event.preventDefault();
              onCommandEnter?.(event.currentTarget.textContent ?? "");
            }
          }}
        >
          {editingSeed !== null ? "" : isPlaceholder ? "" : text}
        </div>
      ) : (
        <p className={`whitespace-pre-line font-handwriting text-[20px] leading-8 ${isPlaceholder ? "opacity-40" : ""}`}>
          {text}
        </p>
      )}
    </div>
  );
}
