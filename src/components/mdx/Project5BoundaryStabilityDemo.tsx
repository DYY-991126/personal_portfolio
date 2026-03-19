"use client";

import { useState } from "react";
import {
  PROJECT5_CANVAS_STYLE,
  Project5DemoFrame,
  Project5MiniStat,
  Project5ToggleButton,
} from "./Project5DemoFrame";

type Scenario = "pan" | "zoom" | "collision" | "snap";

export default function Project5BoundaryStabilityDemo() {
  const [scenario, setScenario] = useState<Scenario>("pan");

  const footerValue =
    scenario === "pan"
      ? "创建区域出屏时，优先平移视角"
      : scenario === "zoom"
        ? "包围盒过大时，缩放到保留最小边距"
        : scenario === "collision"
          ? "有碰撞时重新计算新建落点"
          : "吸附开启时继承既有对齐节奏";

  return (
    <Project5DemoFrame
      title="边界、碰撞与视角稳定性"
      description="真正决定系统质感的不是顺畅情况，而是复杂情况：创建区域出屏、候选位置发生碰撞、视角不足、吸附开启，这些时候系统仍然要表现得像一套稳定的规则。"
      controls={
        <>
          {([
            ["pan", "出屏平移"],
            ["zoom", "视角缩放"],
            ["collision", "碰撞避让"],
            ["snap", "吸附继承"],
          ] as Array<[Scenario, string]>).map(([value, label]) => (
            <Project5ToggleButton
              key={value}
              active={scenario === value}
              onClick={() => setScenario(value)}
            >
              {label}
            </Project5ToggleButton>
          ))}
        </>
      }
      footer={
        <div className="grid gap-3 md:grid-cols-3">
          <Project5MiniStat label="当前场景" value={scenario === "pan" ? "出屏平移" : scenario === "zoom" ? "视角缩放" : scenario === "collision" ? "碰撞避让" : "吸附继承"} />
          <Project5MiniStat label="处理目标" value="保证创建动作继续成立，而不是让系统卡住" />
          <Project5MiniStat label="当前策略" value={footerValue} />
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="overflow-x-auto">
          <div
            className="relative min-h-[380px] min-w-[560px] overflow-hidden rounded-[24px] border border-border/20"
            style={PROJECT5_CANVAS_STYLE}
          >
          {scenario === "pan" && (
            <>
              <div className="absolute left-[72px] top-[54px] h-[260px] w-[430px] rounded-[28px] border border-[#ef4444]/18 bg-[#ef4444]/6" />
              <div className="absolute left-[40px] top-[54px] h-[260px] w-[430px] rounded-[28px] border-2 border-[#1f8ef1]/35 bg-transparent" />
              <div className="absolute left-[300px] top-[144px] h-[116px] w-[116px] rounded-[24px] bg-[#1f8ef1] text-white shadow-[0_20px_50px_rgba(31,142,241,0.25)]">
                <div className="flex h-full flex-col justify-between p-4">
                  <p className="text-sm font-semibold tracking-[0.18em]">源节点</p>
                  <p className="text-xs text-white/70">原本靠近右边界</p>
                </div>
              </div>
              <div className="absolute left-[446px] top-[152px] h-[116px] w-[116px] rounded-[24px] bg-[#f3c6ff] text-[#6e2478] shadow-sm">
                <div className="flex h-full flex-col justify-between p-4">
                  <p className="text-sm font-semibold tracking-[0.12em]">新节点</p>
                  <p className="text-xs text-[#6e2478]/70">通过平移视角纳入可见区</p>
                </div>
              </div>
              <svg viewBox="0 0 560 380" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <path d="M 410 205 L 446 205" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
                <path d="M 148 40 L 104 40" stroke="#1f8ef1" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 104 40 L 120 28" stroke="#1f8ef1" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 104 40 L 120 52" stroke="#1f8ef1" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </>
          )}

          {scenario === "zoom" && (
            <>
              <div className="absolute left-[72px] top-[46px] h-[280px] w-[432px] rounded-[28px] border border-[#ef4444]/18 bg-[#ef4444]/6" />
              <div className="absolute left-[132px] top-[74px] h-[212px] w-[308px] rounded-[28px] border-2 border-[#1f8ef1]/35 bg-transparent" />
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="absolute left-[88px] h-[82px] w-[108px] rounded-[20px] bg-[#f3c6ff] text-[#6e2478] shadow-sm"
                  style={{ top: 76 + index * 68 }}
                />
              ))}
              <div className="absolute left-[284px] top-[76px] h-[108px] w-[108px] rounded-[24px] bg-[#1f8ef1] text-white shadow-[0_20px_50px_rgba(31,142,241,0.25)]">
                <div className="flex h-full flex-col justify-between p-4">
                  <p className="text-sm font-semibold tracking-[0.18em]">源节点</p>
                  <p className="text-xs text-white/70">缩小视角以保留边距</p>
                </div>
              </div>
              <div className="absolute left-[286px] top-[210px] h-[108px] w-[108px] rounded-[24px] bg-[#ffd95f] text-[#5e4a08] shadow-sm" />
            </>
          )}

          {scenario === "collision" && (
            <>
              <div className="absolute left-[232px] top-[42px] h-[108px] w-[108px] rounded-[24px] bg-[#1f8ef1] text-white shadow-[0_20px_50px_rgba(31,142,241,0.25)]">
                <div className="flex h-full flex-col justify-between p-4">
                  <p className="text-sm font-semibold tracking-[0.18em]">源节点</p>
                  <p className="text-xs text-white/70">默认向下创建</p>
                </div>
              </div>
              <div className="absolute left-[94px] top-[214px] h-[112px] w-[112px] rounded-[24px] bg-[#ffd95f] text-[#5e4a08] shadow-sm" />
              <div className="absolute left-[354px] top-[214px] h-[112px] w-[112px] rounded-[24px] bg-[#ffd95f] text-[#5e4a08] shadow-sm" />
              <div className="absolute left-[232px] top-[216px] h-[112px] w-[112px] rounded-[24px] border-2 border-dashed border-[#1f8ef1]/35 bg-[#1f8ef1]/12" />
              <svg viewBox="0 0 560 380" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <path
                  d="M 286 150 C 286 180, 286 196, 286 216"
                  fill="none"
                  stroke="#111827"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute left-[228px] top-[334px] rounded-full bg-white/92 px-4 py-2 text-xs text-muted-foreground shadow-sm">
                间距足够时落在中间；不足时继续避让
              </div>
            </>
          )}

            {scenario === "snap" && (
              <>
                <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(to right, rgba(31,142,241,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(31,142,241,0.14) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
                <div className="absolute left-[170px] top-[100px] h-[116px] w-[116px] rounded-[24px] bg-[#1f8ef1] text-white shadow-[0_20px_50px_rgba(31,142,241,0.25)]">
                  <div className="flex h-full flex-col justify-between p-4">
                    <p className="text-sm font-semibold tracking-[0.18em]">源节点</p>
                    <p className="text-xs text-white/70">已对齐网格</p>
                  </div>
                </div>
                <div className="absolute left-[334px] top-[100px] h-[116px] w-[116px] rounded-[24px] bg-[#ffd95f] text-[#5e4a08] shadow-sm">
                  <div className="flex h-full flex-col justify-between p-4">
                    <p className="text-sm font-semibold tracking-[0.12em]">新节点</p>
                    <p className="text-xs text-[#5e4a08]/80">继承同一网格节奏</p>
                  </div>
                </div>
                <svg viewBox="0 0 560 380" className="absolute inset-0 h-full w-full" aria-hidden="true">
                  <path d="M 286 158 L 334 158" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-border/30 bg-muted/20 p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">
              当前场景
            </p>
            <p className="mt-3 text-sm leading-7 text-foreground">
              {scenario === "pan"
                ? "当新创建对象超出当前可视范围时，系统优先平移视角，保持最小可读边距。"
                : scenario === "zoom"
                  ? "如果平移还不够，系统会基于创建前后对象的包围盒缩放视角，让整体仍然留在可视区内。"
                  : scenario === "collision"
                    ? "默认落点与现有对象发生碰撞时，系统需要重新计算位置，而不是硬塞进去。"
                    : "吸附开启时，新对象应该继承原对象的对齐节奏，而不是突然偏出一格。"}
            </p>
          </div>
          <div className="rounded-[24px] border border-border/30 bg-white p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">
              为什么这部分重要
            </p>
            <ul className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <li>1. 用户在简单场景里几乎感觉不到这些规则，但一旦它们缺失，系统马上会变得粗糙。</li>
              <li>2. 视角与空间连续性决定了用户会不会丢失方位感。</li>
              <li>3. 边界规则越稳定，用户越敢连续使用快速创建。</li>
            </ul>
          </div>
        </div>
      </div>
    </Project5DemoFrame>
  );
}
