"use client";

import Project5ConnectionLayer from "./Project5ConnectionLayer";
import type { Project5ConnectionLine } from "./Project5ConnectionLayer";
import { PROJECT5_CANVAS_STYLE } from "./Project5DemoFrame";
import Project5ShapeTextNode from "./Project5ShapeTextNode";
import type { Project5CanvasNode } from "./Project5CanvasNodeTypes";

const BOARD_WIDTH = 760;
const BOARD_HEIGHT = 340;

export default function Project5DistanceMemoryPanel() {
  const sourceNode: Project5CanvasNode = {
    id: 1,
    type: "shape-text",
    shapeKind: "process",
    x: 160,
    y: 170,
    width: 196,
    height: 82,
    text: "输入文本",
  };

  const firstChild: Project5CanvasNode = {
    id: 2,
    type: "shape-text",
    shapeKind: "process",
    x: 500,
    y: 114,
    width: 196,
    height: 82,
    text: "输入文本",
  };

  const secondChild: Project5CanvasNode = {
    id: 3,
    type: "shape-text",
    shapeKind: "process",
    x: 500,
    y: 238,
    width: 196,
    height: 82,
    text: "输入文本",
  };

  const lines: Project5ConnectionLine[] = [
    {
      id: "distance-a",
      sourceX: sourceNode.x + sourceNode.width / 2,
      sourceY: sourceNode.y,
      sourceDirection: "right",
      targetX: firstChild.x - firstChild.width / 2,
      targetY: firstChild.y,
      targetDirection: "left",
    },
    {
      id: "distance-b",
      sourceX: sourceNode.x + sourceNode.width / 2,
      sourceY: sourceNode.y,
      sourceDirection: "right",
      targetX: secondChild.x - secondChild.width / 2,
      targetY: secondChild.y,
      targetDirection: "left",
      dashed: true,
    },
  ];

  return (
    <div
      className="relative overflow-hidden rounded-[24px] border border-border/20"
      style={{ ...PROJECT5_CANVAS_STYLE, width: "100%", minHeight: BOARD_HEIGHT }}
    >
      <Project5ConnectionLayer width={BOARD_WIDTH} height={BOARD_HEIGHT} lines={lines} />

      {[sourceNode, firstChild, secondChild].map((node) => (
        <div
          key={node.id}
          className="absolute"
          style={{
            left: node.x - node.width / 2,
            top: node.y - node.height / 2,
            width: node.width,
            height: node.height,
          }}
        >
          <Project5ShapeTextNode node={node} preview={node.id === 3} />
        </div>
      ))}

      <div className="absolute left-[344px] top-[60px] rounded-full bg-white/94 px-3 py-1.5 text-xs text-black/60 shadow-sm">
        第一次拖拽确定距离
      </div>
      <div className="absolute left-[344px] top-[280px] rounded-full bg-white/94 px-3 py-1.5 text-xs text-black/60 shadow-sm">
        后续创建继承相同长度
      </div>
    </div>
  );
}
