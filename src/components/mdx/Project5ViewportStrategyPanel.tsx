"use client";

import { useState } from "react";

import { PROJECT5_CANVAS_STYLE, Project5ToggleButton } from "./Project5DemoFrame";
import Project5ShapeTextNode from "./Project5ShapeTextNode";
import type { Project5CanvasNode } from "./Project5CanvasNodeTypes";

type Mode = "group" | "pair" | "single";

export default function Project5ViewportStrategyPanel() {
  const [mode, setMode] = useState<Mode>("group");

  const sourceNode: Project5CanvasNode = {
    id: 1,
    type: "shape-text",
    shapeKind: "process",
    x: 170,
    y: 170,
    width: 196,
    height: 82,
    text: "输入文本",
  };

  const siblingA: Project5CanvasNode = {
    id: 2,
    type: "shape-text",
    shapeKind: "process",
    x: 504,
    y: 96,
    width: 196,
    height: 82,
    text: "输入文本",
  };

  const siblingB: Project5CanvasNode = {
    id: 3,
    type: "shape-text",
    shapeKind: "process",
    x: 504,
    y: 170,
    width: 196,
    height: 82,
    text: "输入文本",
  };

  const newNode: Project5CanvasNode = {
    id: 4,
    type: "shape-text",
    shapeKind: "process",
    x: 504,
    y: 244,
    width: 196,
    height: 82,
    text: "输入文本",
  };

  const focusBox =
    mode === "group"
      ? { left: 48, top: 38, width: 620, height: 254 }
      : mode === "pair"
        ? { left: 70, top: 112, width: 542, height: 156 }
        : { left: 360, top: 188, width: 236, height: 118 };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Project5ToggleButton active={mode === "group"} onClick={() => setMode("group")}>
          整体视图
        </Project5ToggleButton>
        <Project5ToggleButton active={mode === "pair"} onClick={() => setMode("pair")}>
          父子视图
        </Project5ToggleButton>
        <Project5ToggleButton active={mode === "single"} onClick={() => setMode("single")}>
          新节点视图
        </Project5ToggleButton>
      </div>

      <div
        className="relative overflow-hidden rounded-[24px] border border-border/20"
        style={{ ...PROJECT5_CANVAS_STYLE, width: "100%", minHeight: 340 }}
      >
        <div
          className="absolute rounded-[28px] border-2 border-[#1f8ef1]/40 bg-[#1f8ef1]/08"
          style={focusBox}
        />

        {[sourceNode, siblingA, siblingB, newNode].map((node) => (
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
            <Project5ShapeTextNode node={node} preview={node.id !== 1 && mode === "single" && node.id !== 4} />
          </div>
        ))}
      </div>
    </div>
  );
}
