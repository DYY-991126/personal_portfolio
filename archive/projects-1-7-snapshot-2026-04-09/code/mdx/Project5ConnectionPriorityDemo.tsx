"use client";

import { useMemo, useState } from "react";
import {
  PROJECT5_CANVAS_STYLE,
  Project5DemoFrame,
  Project5MiniStat,
  Project5ToggleButton,
} from "./Project5DemoFrame";

type Mode = "new" | "existing" | "tie";
type Direction = "right" | "left" | "top" | "bottom";

const DIRECTION_LABEL: Record<Direction, string> = {
  right: "向右创建",
  left: "向左创建",
  top: "向上创建",
  bottom: "向下创建",
};

interface Candidate {
  id: string;
  x: number;
  y: number;
  label: string;
}

function zoneRect(direction: Direction) {
  if (direction === "right") return { x: 336, y: 104, w: 180, h: 152 };
  if (direction === "left") return { x: 28, y: 104, w: 180, h: 152 };
  if (direction === "top") return { x: 182, y: 8, w: 168, h: 130 };
  return { x: 182, y: 236, w: 168, h: 130 };
}

function tieBreakLabel(direction: Direction) {
  if (direction === "right" || direction === "left") {
    return "距离相同，左右创建时优先从上到下选择。";
  }
  return "距离相同，上下创建时优先从左到右选择。";
}

export default function Project5ConnectionPriorityDemo() {
  const [mode, setMode] = useState<Mode>("existing");
  const [direction, setDirection] = useState<Direction>("right");

  const source = { x: 224, y: 122, w: 128, h: 128 };
  const zone = zoneRect(direction);

  const candidates = useMemo<Candidate[]>(() => {
    if (mode === "new") return [];

    if (mode === "existing") {
      if (direction === "right") {
        return [
          { id: "a", x: 390, y: 92, label: "最近对象" },
          { id: "b", x: 458, y: 190, label: "更远对象" },
        ];
      }
      if (direction === "left") {
        return [
          { id: "a", x: 46, y: 110, label: "最近对象" },
          { id: "b", x: 78, y: 202, label: "更远对象" },
        ];
      }
      if (direction === "top") {
        return [
          { id: "a", x: 170, y: 18, label: "最近对象" },
          { id: "b", x: 278, y: 32, label: "更远对象" },
        ];
      }
      return [
        { id: "a", x: 176, y: 256, label: "最近对象" },
        { id: "b", x: 284, y: 272, label: "更远对象" },
      ];
    }

    if (direction === "right") {
      return [
        { id: "a", x: 438, y: 76, label: "上方对象" },
        { id: "b", x: 438, y: 188, label: "下方对象" },
      ];
    }
    if (direction === "left") {
      return [
        { id: "a", x: 54, y: 76, label: "上方对象" },
        { id: "b", x: 54, y: 188, label: "下方对象" },
      ];
    }
    if (direction === "top") {
      return [
        { id: "a", x: 148, y: 14, label: "左侧对象" },
        { id: "b", x: 280, y: 14, label: "右侧对象" },
      ];
    }
    return [
      { id: "a", x: 148, y: 266, label: "左侧对象" },
      { id: "b", x: 280, y: 266, label: "右侧对象" },
    ];
  }, [direction, mode]);

  const selectedCandidate = useMemo(() => {
    if (mode === "new") return null;
    return candidates[0] ?? null;
  }, [candidates, mode]);

  const ghostNode = useMemo(() => {
    if (direction === "right") return { x: 446, y: 126 };
    if (direction === "left") return { x: 48, y: 126 };
    if (direction === "top") return { x: 224, y: 18 };
    return { x: 224, y: 264 };
  }, [direction]);

  const message =
    mode === "new"
      ? "当前方向没有可优先连接的对象，因此系统按默认距离创建一个新节点。"
      : mode === "existing"
        ? "如果热区里已经出现可连接对象，系统优先连接最近对象，而不是盲目新建。"
        : tieBreakLabel(direction);

  return (
    <Project5DemoFrame
      title="连接与优先级"
      description="一旦“创建”和“连接”同时存在，系统就必须稳定地判断：新建，还是连接已有对象；如果有多个候选对象，又该先连谁。"
      controls={
        <>
          {([
            ["new", "创建新节点"],
            ["existing", "连接已有对象"],
            ["tie", "同距规则"],
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
          <Project5MiniStat label="当前方向" value={DIRECTION_LABEL[direction]} />
          <Project5MiniStat label="优先逻辑" value={mode === "new" ? "默认新建" : mode === "existing" ? "优先连接最近对象" : "按方位稳定 tie-break"} />
          <Project5MiniStat label="连接目标" value={selectedCandidate ? selectedCandidate.label : "新建节点"} />
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

          <div
            className="absolute rounded-[24px] border border-dashed border-[#1f8ef1]/45 bg-[#1f8ef1]/10"
            style={{ left: zone.x, top: zone.y, width: zone.w, height: zone.h }}
          />

          <div
            className="absolute rounded-[24px] border border-[#1f8ef1]/30 bg-[#1f8ef1] text-white shadow-[0_24px_60px_rgba(31,142,241,0.24)]"
            style={{ left: source.x, top: source.y, width: source.w, height: source.h }}
          >
            <div className="flex h-full flex-col justify-between p-4">
              <p className="text-sm font-semibold tracking-[0.18em]">源节点</p>
              <p className="text-xs text-white/70">hover 创建点</p>
            </div>
          </div>

          {mode === "new" ? (
            <div
              className="absolute rounded-[24px] border border-[#1f8ef1]/35 bg-[#1f8ef1]/16"
              style={{ left: ghostNode.x, top: ghostNode.y, width: 128, height: 128 }}
            />
          ) : (
            candidates.map((candidate, index) => {
              const active = selectedCandidate?.id === candidate.id;
              return (
                <div
                  key={candidate.id}
                  className={`absolute rounded-[24px] border text-[#7a4d00] shadow-sm ${
                    active
                      ? "border-[#f4b453] bg-[#ffc56d]"
                      : "border-[#ffc56d]/35 bg-[#ffc56d]/55"
                  }`}
                  style={{
                    left: candidate.x,
                    top: candidate.y,
                    width: 108,
                    height: 108,
                    opacity: active ? 1 : index === 1 ? 0.75 : 0.88,
                  }}
                >
                  <div className="flex h-full flex-col justify-between p-4">
                    <p className="text-sm font-semibold tracking-[0.12em]">候选对象</p>
                    <p className="text-xs text-[#7a4d00]/80">{candidate.label}</p>
                  </div>
                </div>
              );
            })
          )}

            <svg viewBox="0 0 560 380" className="absolute inset-0 h-full w-full" aria-hidden="true">
              {selectedCandidate ? (
                <path
                  d={`M ${source.x + source.w / 2} ${source.y + source.h / 2} C ${source.x + source.w / 2 + (selectedCandidate.x - source.x) / 2} ${source.y + source.h / 2}, ${selectedCandidate.x + 10} ${selectedCandidate.y + 22}, ${selectedCandidate.x + 54} ${selectedCandidate.y + 54}`}
                  fill="none"
                  stroke="#111827"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d={`M ${source.x + source.w / 2} ${source.y + source.h / 2} L ${ghostNode.x + 64} ${ghostNode.y + 64}`}
                  fill="none"
                  stroke="#111827"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="8 10"
                />
              )}
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-border/30 bg-muted/20 p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">
              当前判断
            </p>
            <p className="mt-3 text-sm leading-7 text-foreground">{message}</p>
          </div>
          <div className="rounded-[24px] border border-border/30 bg-white p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">
              这个 demo 在讲什么
            </p>
            <ul className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <li>1. 创建点不只是“新建”的入口，它也可能成为“优先连接已有对象”的入口。</li>
              <li>2. 只要优先级不稳定，系统就会显得随机；一旦稳定，用户会很快学会它。</li>
              <li>3. 同距时采用固定 tie-break，是为了避免每次 hover 都出现不同结果。</li>
            </ul>
          </div>
        </div>
      </div>
    </Project5DemoFrame>
  );
}
