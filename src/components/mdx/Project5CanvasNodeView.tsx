"use client";

import Project5ShapeTextNode from "./Project5ShapeTextNode";
import Project5StickyNoteCard from "./Project5StickyNoteCard";
import type { Project5CanvasNode } from "./Project5CanvasNodeTypes";

interface Project5CanvasNodeViewProps {
  node: Project5CanvasNode;
  preview?: boolean;
  editing?: boolean;
  editingSeed?: string | null;
  onTextChange?: (value: string) => void;
  onCommandEnter?: (value: string) => void;
}

export default function Project5CanvasNodeView({
  node,
  preview = false,
  editing = false,
  editingSeed = null,
  onTextChange,
  onCommandEnter,
}: Project5CanvasNodeViewProps) {
  if (node.type === "sticky-note") {
    return (
      <Project5StickyNoteCard
        preview={preview}
        editing={editing}
        editingSeed={editingSeed}
        text={node.text}
        onTextChange={onTextChange}
        onCommandEnter={onCommandEnter}
      />
    );
  }

  return (
    <Project5ShapeTextNode
      node={node}
      preview={preview}
      editing={editing}
      editingSeed={editingSeed}
      onTextChange={onTextChange}
      onCommandEnter={onCommandEnter}
    />
  );
}
