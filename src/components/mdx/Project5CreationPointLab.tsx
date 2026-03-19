"use client";

import { useMemo, useState } from "react";
import {
  PROJECT5_CANVAS_STYLE,
  Project5DemoFrame,
  Project5MiniStat,
  Project5ToggleButton,
} from "./Project5DemoFrame";

type ObjectType = "note" | "text" | "image" | "shape";

const OBJECT_CONFIG: Record<
  ObjectType,
  {
    label: string;
    width: number;
    height: number;
    nodeClass: string;
    createMode: "plus" | "arrow";
    heatZoneFollowsRotation: boolean;
  }
> = {
  note: {
    label: "便签",
    width: 124,
    height: 138,
    nodeClass: "bg-[#ffd95f] text-[#5e4a08]",
    createMode: "plus",
    heatZoneFollowsRotation: false,
  },
  text: {
    label: "文本",
    width: 184,
    height: 56,
    nodeClass: "bg-white text-[#111827] border border-[#111827]/10",
    createMode: "arrow",
    heatZoneFollowsRotation: false,
  },
  image: {
    label: "图片",
    width: 156,
    height: 110,
    nodeClass:
      "bg-[linear-gradient(135deg,#3b82f6_0%,#38bdf8_48%,#f59e0b_100%)] text-white",
    createMode: "arrow",
    heatZoneFollowsRotation: false,
  },
  shape: {
    label: "图形节点",
    width: 122,
    height: 122,
    nodeClass: "bg-[#1f8ef1] text-white",
    createMode: "arrow",
    heatZoneFollowsRotation: true,
  },
};

const DIRECTION_ICON = {
  top: "↑",
  right: "→",
  bottom: "↓",
  left: "←",
} as const;

export default function Project5CreationPointLab() {
  const [objectType, setObjectType] = useState<ObjectType>("note");
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(18);
  const [showHeatZone, setShowHeatZone] = useState(true);

  const config = OBJECT_CONFIG[objectType];
  const scale = zoom / 100;
  const showCreatePoints = zoom >= 10;
  const width = config.width * scale;
  const height = config.height * scale;
  const centerX = 255;
  const centerY = 176;
  const left = centerX - width / 2;
  const top = centerY - height / 2;
  const heatPadding = Math.max(22, 22 * scale);
  const heatThickness = Math.max(18, 18 * scale);

  const summary = useMemo(() => {
    if (!showCreatePoints) {
      return "画布缩放小于 10% 时，快速创建点收起，避免在低缩放下干扰阅读。";
    }

    if (config.heatZoneFollowsRotation) {
      return "这类对象的热区会跟随对象一起旋转，因此创建方向仍然贴着对象的当前姿态。";
    }

    return "这类对象会保留固定方位热区，让创建入口始终保持上下左右的稳定方向感。";
  }, [config.heatZoneFollowsRotation, showCreatePoints]);

  return (
    <Project5DemoFrame
      title="创建点实验台"
      description="这部分先把创建入口讲清楚：创建点并非常驻，而是由热区激活；热区是否跟随旋转、创建点用加号还是箭头，都和对象类型有关。"
      controls={
        <>
          {(["note", "text", "image", "shape"] as ObjectType[]).map((type) => (
            <Project5ToggleButton
              key={type}
              active={objectType === type}
              onClick={() => setObjectType(type)}
            >
              {OBJECT_CONFIG[type].label}
            </Project5ToggleButton>
          ))}
        </>
      }
      footer={
        <div className="grid gap-3 lg:grid-cols-3">
          <Project5MiniStat
            label="当前对象"
            value={`${config.label} · ${config.createMode === "plus" ? "加号型创建点" : "箭头型创建点"}`}
          />
          <Project5MiniStat
            label="热区逻辑"
            value={config.heatZoneFollowsRotation ? "跟随对象旋转" : "保持固定方位"}
          />
          <Project5MiniStat
            label="缩放状态"
            value={showCreatePoints ? `${zoom}% · 创建点可见` : `${zoom}% · 创建点隐藏`}
          />
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="overflow-x-auto">
          <div
            className="relative min-h-[380px] min-w-[560px] overflow-hidden rounded-[24px] border border-border/20"
            style={PROJECT5_CANVAS_STYLE}
          >
            <div className="absolute left-6 top-6 rounded-full bg-white/90 px-3 py-1 text-xs text-muted-foreground shadow-sm">
              缩放低于 10% 时，隐藏快速创建点
            </div>

            {showHeatZone && (
              <div
                className="absolute"
                style={{
                  left,
                  top,
                  width,
                  height,
                  transform: `rotate(${config.heatZoneFollowsRotation ? rotation : 0}deg)`,
                  transformOrigin: `${width / 2}px ${height / 2}px`,
                }}
              >
              {[
                {
                  key: "top",
                  style: {
                    left: 0,
                    top: -heatPadding,
                    width,
                    height: heatThickness,
                  },
                },
                {
                  key: "right",
                  style: {
                    left: width,
                    top: 0,
                    width: heatPadding,
                    height,
                  },
                },
                {
                  key: "bottom",
                  style: {
                    left: 0,
                    top: height,
                    width,
                    height: heatPadding,
                  },
                },
                {
                  key: "left",
                  style: {
                    left: -heatPadding,
                    top: 0,
                    width: heatPadding,
                    height,
                  },
                },
              ].map((zone) => (
                <div
                  key={zone.key}
                  className="absolute rounded-xl border border-[#1f8ef1]/35 bg-[#1f8ef1]/8"
                  style={zone.style}
                />
              ))}

              {showCreatePoints &&
                (["top", "right", "bottom", "left"] as const).map((direction) => {
                  const pointBaseStyle =
                    direction === "top"
                      ? { left: width / 2, top: -heatPadding / 2 }
                      : direction === "right"
                        ? { left: width + heatPadding / 2, top: height / 2 }
                        : direction === "bottom"
                          ? { left: width / 2, top: height + heatPadding / 2 }
                          : { left: -heatPadding / 2, top: height / 2 };

                  return (
                    <div
                      key={direction}
                      className={`absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm ${
                        config.createMode === "plus"
                          ? "border-[#1f8ef1] bg-white text-[#1f8ef1]"
                          : "border-[#1f8ef1] bg-[#1f8ef1] text-white"
                      }`}
                      style={pointBaseStyle}
                    >
                      <span className="text-base font-semibold">
                        {config.createMode === "plus"
                          ? "+"
                          : DIRECTION_ICON[direction]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div
              className={`absolute flex items-center justify-center rounded-[24px] shadow-[0_18px_48px_rgba(15,23,42,0.15)] ${config.nodeClass}`}
              style={{
                left,
                top,
                width,
                height,
                transform: `rotate(${rotation}deg)`,
              }}
            >
              {objectType === "text" ? (
                <div className="w-full px-4 text-left text-sm leading-relaxed">
                  如何可以不上班
                </div>
              ) : objectType === "image" ? (
                <div className="rounded-full bg-white/20 px-3 py-1 text-xs tracking-[0.24em] text-white/90">
                  IMAGE
                </div>
              ) : (
                <span className="text-sm font-semibold tracking-[0.18em]">
                  {config.label}
                </span>
              )}
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-3">
              <label className="rounded-2xl bg-white/90 px-4 py-3 text-sm text-muted-foreground shadow-sm">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  Zoom
                </span>
                <input
                  type="range"
                  min="5"
                  max="140"
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="w-[180px]"
                />
              </label>
              <label className="rounded-2xl bg-white/90 px-4 py-3 text-sm text-muted-foreground shadow-sm">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  Rotation
                </span>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  value={rotation}
                  onChange={(event) => setRotation(Number(event.target.value))}
                  className="w-[180px]"
                />
              </label>
              <button
                type="button"
                onClick={() => setShowHeatZone((value) => !value)}
                className={`rounded-2xl px-4 py-3 text-sm shadow-sm transition-colors ${
                  showHeatZone
                    ? "bg-[#1f8ef1] text-white"
                    : "bg-white/90 text-muted-foreground"
                }`}
              >
                {showHeatZone ? "隐藏热区" : "显示热区"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-border/30 bg-muted/20 p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">
              当前规则
            </p>
            <p className="mt-3 text-sm leading-7 text-foreground">{summary}</p>
          </div>
          <div className="rounded-[24px] border border-border/30 bg-white p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">
              你在这里能看到什么
            </p>
            <ul className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <li>1. 对象类型改变后，创建点会从加号或箭头切换。</li>
              <li>2. 热区既要放大对象可操作面积，又不能污染整体视觉。</li>
              <li>3. 旋转对象时，并不是所有热区都应该跟着转。</li>
            </ul>
          </div>
        </div>
      </div>
    </Project5DemoFrame>
  );
}
