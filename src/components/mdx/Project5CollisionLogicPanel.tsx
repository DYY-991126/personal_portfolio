"use client";

import { PROJECT5_CANVAS_STYLE } from "./Project5DemoFrame";
import Project5ShapeTextNode from "./Project5ShapeTextNode";
import Project5StickyNoteCard from "./Project5StickyNoteCard";
import Project5StrokeLayer from "./Project5StrokeLayer";
import type { Project5CanvasNode } from "./Project5CanvasNodeTypes";

export default function Project5CollisionLogicPanel() {
  const processNode: Project5CanvasNode = {
    id: 1,
    type: "shape-text",
    shapeKind: "process",
    x: 240,
    y: 122,
    width: 196,
    height: 82,
    text: "输入文本",
  };

  const noteNode: Project5CanvasNode = {
    id: 2,
    type: "sticky-note",
    x: 520,
    y: 126,
    width: 168,
    height: 132,
    text: "输入文本",
  };

  return (
    <div className="space-y-4">
      <div
        className="relative overflow-hidden rounded-[24px] border border-border/20"
        style={{ ...PROJECT5_CANVAS_STYLE, width: "100%", minHeight: 340 }}
      >
        <Project5StrokeLayer
          width={760}
          height={340}
          strokes={[
            {
              id: 1,
              tool: "highlighter",
              points: [
                { x: 160, y: 248 },
                { x: 286, y: 236 },
                { x: 420, y: 252 },
              ],
            },
            {
              id: 2,
              tool: "pencil",
              points: [
                { x: 450, y: 220 },
                { x: 518, y: 258 },
                { x: 616, y: 224 },
              ],
            },
          ]}
        />

        <div
          className="absolute"
          style={{
            left: processNode.x - processNode.width / 2,
            top: processNode.y - processNode.height / 2,
            width: processNode.width,
            height: processNode.height,
          }}
        >
          <Project5ShapeTextNode node={processNode} />
        </div>

        <div
          className="absolute"
          style={{
            left: noteNode.x - noteNode.width / 2,
            top: noteNode.y - noteNode.height / 2,
            width: noteNode.width,
            height: noteNode.height,
          }}
        >
          <Project5StickyNoteCard text="输入文本" />
        </div>

        <div className="absolute left-[120px] top-[40px] rounded-full bg-white/94 px-3 py-1.5 text-xs text-black/68 shadow-sm">
          图形文本、便签参与碰撞
        </div>
        <div className="absolute left-[130px] top-[286px] rounded-full bg-white/94 px-3 py-1.5 text-xs text-black/68 shadow-sm">
          铅笔、高亮笔不参与碰撞
        </div>
      </div>
    </div>
  );
}
