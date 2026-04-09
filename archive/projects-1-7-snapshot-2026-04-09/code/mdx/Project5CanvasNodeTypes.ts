export type Project5Direction = "top" | "right" | "bottom" | "left";

export type Project5ToolType = "pencil" | "highlighter";

export type Project5NodeType = "sticky-note" | "shape-text" | Project5ToolType;

export type Project5ShapeKind = "start" | "process" | "decision" | "database";

export type Project5CreateOption =
  | {
      type: "sticky-note";
    }
  | {
      type: "shape-text";
      shapeKind: Project5ShapeKind;
    };

export interface Project5CanvasNode {
  id: number;
  type: Project5NodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  shapeKind?: Project5ShapeKind;
}

export const PROJECT5_STICKY_NOTE_SIZE = {
  width: 168,
  height: 132,
} as const;

export const PROJECT5_SHAPE_DEFAULT_SIZE: Record<Project5ShapeKind, { width: number; height: number }> = {
  start: { width: 184, height: 72 },
  process: { width: 196, height: 82 },
  decision: { width: 168, height: 112 },
  database: { width: 184, height: 94 },
};

export const PROJECT5_TOOL_SIZE: Record<Project5ToolType, { width: number; height: number }> = {
  pencil: { width: 196, height: 36 },
  highlighter: { width: 176, height: 44 },
};

export function createStickyNoteNode(id: number, x: number, y: number, text = "输入文本"): Project5CanvasNode {
  return {
    id,
    type: "sticky-note",
    x,
    y,
    width: PROJECT5_STICKY_NOTE_SIZE.width,
    height: PROJECT5_STICKY_NOTE_SIZE.height,
    text,
  };
}

export function createShapeTextNode(
  id: number,
  x: number,
  y: number,
  shapeKind: Project5ShapeKind,
  text?: string,
): Project5CanvasNode {
  const size = PROJECT5_SHAPE_DEFAULT_SIZE[shapeKind];

  return {
    id,
    type: "shape-text",
    shapeKind,
    x,
    y,
    width: size.width,
    height: size.height,
    text: text ?? "输入文本",
  };
}

export function createToolNode(
  id: number,
  x: number,
  y: number,
  toolType: Project5ToolType,
): Project5CanvasNode {
  const size = PROJECT5_TOOL_SIZE[toolType];

  return {
    id,
    type: toolType,
    x,
    y,
    width: size.width,
    height: size.height,
    text: "",
  };
}
