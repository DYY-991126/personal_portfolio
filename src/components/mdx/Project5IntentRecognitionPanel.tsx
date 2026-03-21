"use client";

import { useState } from "react";

import Project5ConnectionLayer from "./Project5ConnectionLayer";
import type { Project5ConnectionLine } from "./Project5ConnectionLayer";
import { PROJECT5_CANVAS_STYLE, Project5ToggleButton } from "./Project5DemoFrame";
import Project5ShapeTextNode from "./Project5ShapeTextNode";
import type { Project5CanvasNode } from "./Project5CanvasNodeTypes";

type Mode = "blank" | "existing";

const BOARD_WIDTH = 760;
const BOARD_HEIGHT = 340;

export default function Project5IntentRecognitionPanel() {
  const [mode, setMode] = useState<Mode>("blank");

  const sourceNode: Project5CanvasNode = {
    id: 1,
    type: "shape-text",
    shapeKind: "process",
    x: 210,
    y: 160,
    width: 196,
    height: 82,
    text: "输入文本",
  };

  const targetNode: Project5CanvasNode = {
    id: 2,
    type: "shape-text",
    shapeKind: "process",
    x: 540,
    y: 150,
    width: 196,
    height: 82,
    text: "输入文本",
  };

  const lines: Project5ConnectionLine[] = [
    {
      id: "intent-line",
      sourceX: sourceNode.x + sourceNode.width / 2,
      sourceY: sourceNode.y,
      sourceDirection: "right",
      targetX: mode === "blank" ? 520 : targetNode.x - targetNode.width / 2,
      targetY: mode === "blank" ? 92 : targetNode.y,
      targetDirection: "left",
      dashed: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Project5ToggleButton active={mode === "blank"} onClick={() => setMode("blank")}>
          拖到空白处
        </Project5ToggleButton>
        <Project5ToggleButton active={mode === "existing"} onClick={() => setMode("existing")}>
          拖到已有对象
        </Project5ToggleButton>
      </div>

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

        {mode === "blank" ? (
          <div className="absolute left-[436px] top-[54px] rounded-[18px] border border-black/10 bg-white/96 px-4 py-3 text-sm text-black/72 shadow-sm">
            新增内容
          </div>
        ) : (
          <div
            className="absolute"
            style={{
              left: targetNode.x - targetNode.width / 2,
              top: targetNode.y - targetNode.height / 2,
              width: targetNode.width,
              height: targetNode.height,
            }}
          >
            <Project5ShapeTextNode node={targetNode} />
          </div>
        )}
      </div>
    </div>
  );
}
