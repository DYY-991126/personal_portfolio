"use client";

import type { ComponentType } from "react";
import { Diamond, Highlighter, PencilLine, StickyNote } from "lucide-react";

type ToolbarItemId = "sticky-note" | "shape-text" | "pencil" | "highlighter";

interface ToolbarItem {
  id: ToolbarItemId;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const TOOLBAR_ITEMS: ToolbarItem[] = [
  { id: "sticky-note", label: "便签", icon: StickyNote },
  { id: "shape-text", label: "图形文本", icon: Diamond },
  { id: "pencil", label: "铅笔", icon: PencilLine },
  { id: "highlighter", label: "高亮笔", icon: Highlighter },
];

interface Project5FloatingToolbarProps {
  activeTool: ToolbarItemId | null;
  onSelect: (itemId: ToolbarItemId) => void;
}

export default function Project5FloatingToolbar({
  activeTool,
  onSelect,
}: Project5FloatingToolbarProps) {
  return (
    <div
      data-canvas-toolbar="true"
      className="pointer-events-auto absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-black/10 bg-white/94 p-1.5 shadow-[0_18px_48px_rgba(15,23,42,0.14)] backdrop-blur-md"
    >
      {TOOLBAR_ITEMS.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            type="button"
            aria-label={`插入${item.label}`}
            className={`flex min-w-[84px] items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
              activeTool === item.id
                ? "bg-black text-white"
                : "text-black/70 hover:bg-black/[0.05] hover:text-black/88"
            }`}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(item.id);
            }}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
