"use client";

import Project5ConnectionLayer from "./Project5ConnectionLayer";
import type { Project5ConnectionLine } from "./Project5ConnectionLayer";
import { PROJECT5_CANVAS_STYLE } from "./Project5DemoFrame";
import Project5ShapeTextNode from "./Project5ShapeTextNode";
import type { Project5CanvasNode } from "./Project5CanvasNodeTypes";

const BOARD_WIDTH = 760;
const BOARD_HEIGHT = 360;

export default function Project5SortingPanel() {
  const sourceNode: Project5CanvasNode = {
    id: 1,
    type: "shape-text",
    shapeKind: "process",
    x: 170,
    y: 180,
    width: 196,
    height: 82,
    text: "输入文本",
  };

  const siblings: Project5CanvasNode[] = [
    {
      id: 2,
      type: "shape-text",
      shapeKind: "process",
      x: 516,
      y: 86,
      width: 196,
      height: 82,
      text: "输入文本",
    },
    {
      id: 3,
      type: "shape-text",
      shapeKind: "process",
      x: 516,
      y: 160,
      width: 196,
      height: 82,
      text: "输入文本",
    },
    {
      id: 4,
      type: "shape-text",
      shapeKind: "process",
      x: 516,
      y: 234,
      width: 196,
      height: 82,
      text: "输入文本",
    },
    {
      id: 5,
      type: "shape-text",
      shapeKind: "process",
      x: 516,
      y: 308,
      width: 196,
      height: 82,
      text: "输入文本",
    },
  ];

  const lines: Project5ConnectionLine[] = siblings.map((node, index) => ({
    id: `sort-${node.id}`,
    sourceX: sourceNode.x + sourceNode.width / 2,
    sourceY: sourceNode.y,
    sourceDirection: "right",
    targetX: node.x - node.width / 2,
    targetY: node.y,
    targetDirection: "left",
    dashed: index === siblings.length - 1,
  }));

  return (
    <div
      className="relative overflow-hidden rounded-[24px] border border-border/20"
      style={{ ...PROJECT5_CANVAS_STYLE, width: "100%", minHeight: BOARD_HEIGHT }}
    >
      <Project5ConnectionLayer width={BOARD_WIDTH} height={BOARD_HEIGHT} lines={lines} />

      <div
        className="absolute"
        style={{
          left: sourceNode.x - sourceNode.width / 2,
          top: sourceNode.y - sourceNode.height / 2,
          width: sourceNode.width,
          height: sourceNode.height,
        }}
      >
        <Project5ShapeTextNode node={sourceNode} />
      </div>

      {siblings.map((node, index) => (
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
          <Project5ShapeTextNode node={node} preview={index === siblings.length - 1} />
        </div>
      ))}

      <div className="absolute left-[302px] top-[26px] rounded-full bg-white/94 px-3 py-1.5 text-xs text-black/68 shadow-sm">
        新节点加入后，系统按同层级重新排布
      </div>
    </div>
  );
}
