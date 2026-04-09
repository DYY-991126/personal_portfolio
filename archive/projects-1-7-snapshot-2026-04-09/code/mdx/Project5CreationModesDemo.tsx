"use client";

import { useMemo, useState } from "react";
import {
  PROJECT5_CANVAS_STYLE,
  Project5DemoFrame,
  Project5MiniStat,
  Project5ToggleButton,
} from "./Project5DemoFrame";

type Mode = "click" | "drag" | "shortcut";
type Direction = "right" | "left" | "top" | "bottom";

const DIRECTION_LABEL: Record<Direction, string> = {
  right: "向右",
  left: "向左",
  top: "向上",
  bottom: "向下",
};

function offsetByDirection(direction: Direction, distance: number) {
  if (direction === "right") return { x: distance, y: 0 };
  if (direction === "left") return { x: -distance, y: 0 };
  if (direction === "top") return { x: 0, y: -distance };
  return { x: 0, y: distance };
}

export default function Project5CreationModesDemo() {
  const [mode, setMode] = useState<Mode>("click");
  const [direction, setDirection] = useState<Direction>("right");

  const source = { x: 175, y: 150, w: 132, h: 140 };
  const clickOffset = offsetByDirection(direction, 188);
  const clickTarget = {
    x: source.x + clickOffset.x,
    y: source.y + clickOffset.y,
  };

  const dragTarget = useMemo(() => {
    if (direction === "right") return { x: 430, y: 202 };
    if (direction === "left") return { x: 42, y: 214 };
    if (direction === "top") return { x: 228, y: 28 };
    return { x: 246, y: 236 };
  }, [direction]);

  const shortcutTarget = { x: source.x + 188, y: source.y + 12 };

  const headline =
    mode === "click"
      ? "点击创建强调固定方向与固定距离。"
      : mode === "drag"
        ? "Press + Drag 把落点交还给用户，但仍保留创建语法。"
        : "快捷键创建用于高频连续操作，减少手部往返。";

  return (
    <Project5DemoFrame
      title="创建模式切换"
      description="点击创建、Press + Drag 创建、快捷键创建看起来像 3 条路径，但用户感受到的应该是一套连续的创建系统。"
      controls={
        <>
          {([
            ["click", "点击创建"],
            ["drag", "Press + Drag"],
            ["shortcut", "快捷键创建"],
          ] as Array<[Mode, string]>).map(([value, label]) => (
            <Project5ToggleButton
              key={value}
              active={mode === value}
              onClick={() => setMode(value)}
            >
              {label}
            </Project5ToggleButton>
          ))}
        </>
      }
      footer={
        <div className="grid gap-3 md:grid-cols-3">
          <Project5MiniStat label="当前模式" value={mode === "click" ? "点击创建" : mode === "drag" ? "Press + Drag" : "快捷键创建"} />
          <Project5MiniStat label="创建方向" value={DIRECTION_LABEL[direction]} />
          <Project5MiniStat label="共同目标" value="创建完成后，顺着当前对象继续下一步" />
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="overflow-x-auto">
          <div
            className="relative min-h-[380px] min-w-[560px] overflow-hidden rounded-[24px] border border-border/20"
            style={PROJECT5_CANVAS_STYLE}
          >
            <div className="absolute left-6 top-6 flex flex-wrap gap-2">
              {(["right", "left", "top", "bottom"] as Direction[]).map((value) => (
                <Project5ToggleButton
                  key={value}
                  active={direction === value}
                  onClick={() => setDirection(value)}
                >
                  {DIRECTION_LABEL[value]}
                </Project5ToggleButton>
              ))}
            </div>

          <svg viewBox="0 0 560 380" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <path
              d={
                mode === "drag"
                  ? `M ${source.x + source.w} ${source.y + source.h / 2} C ${source.x + 220} ${source.y + 70}, ${dragTarget.x - 50} ${dragTarget.y - 30}, ${dragTarget.x + 58} ${dragTarget.y + 58}`
                  : `M ${source.x + source.w} ${source.y + source.h / 2} L ${mode === "shortcut" ? shortcutTarget.x + 56 : clickTarget.x + 56} ${mode === "shortcut" ? shortcutTarget.y + 56 : clickTarget.y + 56}`
              }
              fill="none"
              stroke="#111827"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={mode === "drag" ? "0" : "8 10"}
              opacity="0.72"
            />
          </svg>

          <div className="absolute rounded-[24px] border border-[#1f8ef1]/30 bg-[#1f8ef1] text-white shadow-[0_24px_60px_rgba(31,142,241,0.24)]"
            style={{ left: source.x, top: source.y, width: source.w, height: source.h }}
          >
            <div className="flex h-full flex-col justify-between p-4">
              <p className="text-sm font-semibold tracking-[0.18em]">原对象</p>
              <p className="text-xs text-white/70">继续从这里做下一步</p>
            </div>
          </div>

          <div
            className="absolute flex h-10 w-10 items-center justify-center rounded-full border border-[#1f8ef1] bg-[#1f8ef1] text-base font-semibold text-white shadow-sm"
            style={{
              left:
                direction === "left"
                  ? source.x - 20
                  : direction === "right"
                    ? source.x + source.w - 20
                    : source.x + source.w / 2 - 20,
              top:
                direction === "top"
                  ? source.y - 20
                  : direction === "bottom"
                    ? source.y + source.h - 20
                    : source.y + source.h / 2 - 20,
            }}
          >
            {direction === "top" ? "↑" : direction === "right" ? "→" : direction === "bottom" ? "↓" : "←"}
          </div>

          {mode === "click" && (
            <div
              className="absolute rounded-[24px] border border-[#ffd95f]/60 bg-[#ffd95f] text-[#5e4a08] shadow-[0_18px_40px_rgba(245,158,11,0.16)]"
              style={{ left: clickTarget.x, top: clickTarget.y, width: 132, height: 140 }}
            >
              <div className="flex h-full flex-col justify-between p-4">
                <p className="text-sm font-semibold tracking-[0.18em]">新便签</p>
                <p className="text-xs text-[#5e4a08]/70">固定方向 · 64px 节奏</p>
              </div>
            </div>
          )}

          {mode === "drag" && (
            <>
              <div
                className="absolute rounded-[24px] border border-[#1f8ef1]/30 bg-[#1f8ef1]/16 text-[#1f8ef1]"
                style={{ left: dragTarget.x, top: dragTarget.y, width: 116, height: 116 }}
              />
              <div className="absolute rounded-2xl border border-border/30 bg-white/95 p-3 shadow-[0_18px_32px_rgba(15,23,42,0.12)]"
                style={{ left: dragTarget.x - 18, top: dragTarget.y - 96 }}
              >
                <div className="grid grid-cols-4 gap-2">
                  {["□", "△", "○", "T"].map((icon) => (
                    <div
                      key={icon}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/40 text-sm text-foreground"
                    >
                      {icon}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

            {mode === "shortcut" && (
              <>
                <div className="absolute left-12 top-[300px] flex items-center gap-3 rounded-2xl bg-white/92 px-4 py-3 text-sm shadow-sm">
                  <span className="rounded-xl border border-border/40 px-3 py-2 font-medium">cmd</span>
                  <span className="rounded-xl border border-border/40 px-3 py-2 font-medium">enter</span>
                </div>
                <div
                  className="absolute rounded-[24px] border border-[#ffd95f]/60 bg-[#ffd95f] text-[#5e4a08] shadow-[0_18px_40px_rgba(245,158,11,0.16)]"
                  style={{ left: shortcutTarget.x, top: shortcutTarget.y, width: 132, height: 140 }}
                >
                  <div className="flex h-full flex-col justify-between p-4">
                    <p className="text-sm font-semibold tracking-[0.18em]">新便签</p>
                    <p className="text-xs text-[#5e4a08]/70">自动聚焦并进入输入态</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-border/30 bg-muted/20 p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">
              当前讲解
            </p>
            <p className="mt-3 text-sm leading-7 text-foreground">{headline}</p>
          </div>
          <div className="rounded-[24px] border border-border/30 bg-white p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">
              统一体验
            </p>
            <ul className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <li>1. 创建点仍然是入口，不同模式只是“从入口走出的动作”不同。</li>
              <li>2. 用户应该感到自己始终围绕当前对象在继续创作，而不是切换了另一套工具。</li>
              <li>3. 创建后自动聚焦、进入输入态或延续距离，是连续性的关键。</li>
            </ul>
          </div>
        </div>
      </div>
    </Project5DemoFrame>
  );
}
