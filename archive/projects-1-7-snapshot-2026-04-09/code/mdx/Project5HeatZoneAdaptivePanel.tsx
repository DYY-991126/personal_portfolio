"use client";

import { useEffect, useMemo, useState } from "react";

import Project5ControlPoint from "./Project5ControlPoint";
import { PROJECT5_CANVAS_STYLE } from "./Project5DemoFrame";
import Project5ShapeTextNode from "./Project5ShapeTextNode";
import type { Project5CanvasNode, Project5Direction } from "./Project5CanvasNodeTypes";

const BOARD_WIDTH = 760;
const BOARD_HEIGHT = 340;
const CYCLE_DURATION = 4200;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export default function Project5HeatZoneAdaptivePanel() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      setElapsed((now - start) % CYCLE_DURATION);
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const progress = ((Math.sin((elapsed / CYCLE_DURATION) * Math.PI * 2 - Math.PI / 2) + 1) / 2);
  const canvasZoom = Math.round(lerp(72, 136, progress));
  const nodeScale = Math.round(lerp(76, 146, progress));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <AdaptiveColumn
        label="OBJECT SIZE"
        value={nodeScale}
        min={70}
        max={150}
        mode="object"
      />
      <AdaptiveColumn
        label="CANVAS ZOOM"
        value={canvasZoom}
        min={70}
        max={140}
        mode="canvas"
      />
    </div>
  );
}

function AdaptiveColumn({
  label,
  value,
  min,
  max,
  mode,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  mode: "object" | "canvas";
}) {
  const zoom = mode === "canvas" ? value / 100 : 1;
  const scale = mode === "object" ? value / 100 : 1;
  const width = 196 * scale;
  const height = 82 * scale;
  const topBottomThickness = clamp(height * 0.28, 28 / zoom, 52 / zoom);
  const leftRightThickness = clamp(width * 0.22, 28 / zoom, 52 / zoom);

  const node = useMemo<Project5CanvasNode>(
    () => ({
      id: 1,
      type: "shape-text",
      shapeKind: "process",
      x: BOARD_WIDTH / 2,
      y: BOARD_HEIGHT / 2,
      width,
      height,
      text: "当前对象",
    }),
    [height, width],
  );

  const left = node.x - node.width / 2;
  const top = node.y - node.height / 2;

  return (
    <div className="space-y-3">
      <div
        className="relative overflow-hidden rounded-[24px] border border-border/20"
        style={{ ...PROJECT5_CANVAS_STYLE, width: "100%", minHeight: BOARD_HEIGHT }}
      >
        <div
          className="absolute left-1/2 top-1/2 origin-center"
          style={{
            width: BOARD_WIDTH,
            height: BOARD_HEIGHT,
            transform: `translate(-50%, -50%) scale(${zoom})`,
          }}
        >
          <HeatZoneRect
            left={left}
            top={top - topBottomThickness}
            width={node.width}
            height={topBottomThickness}
          />
          <HeatZoneRect
            left={left + node.width}
            top={top}
            width={leftRightThickness}
            height={node.height}
          />
          <HeatZoneRect
            left={left}
            top={top + node.height}
            width={node.width}
            height={topBottomThickness}
          />
          <HeatZoneRect
            left={left - leftRightThickness}
            top={top}
            width={leftRightThickness}
            height={node.height}
          />
          <div
            className="absolute border border-[#f97316]/28 bg-[#f97316]/08"
            style={{ left, top, width: node.width, height: node.height }}
          />

          <div
            className="absolute"
            style={{ left, top, width: node.width, height: node.height }}
          >
            <Project5ShapeTextNode node={node} />

            {(["top", "right", "bottom", "left"] as Project5Direction[]).map((direction) => (
              <Project5ControlPoint
                key={direction}
                direction={direction}
                iconVariant="arrow"
                top={
                  direction === "top"
                    ? -(16 / zoom + 28)
                    : direction === "bottom"
                      ? node.height + 16 / zoom
                      : node.height / 2 - 14
                }
                left={
                  direction === "left"
                    ? -(16 / zoom + 28)
                    : direction === "right"
                      ? node.width + 16 / zoom
                      : node.width / 2 - 14
                }
                onHoverStart={() => {}}
                onHoverEnd={() => {}}
              />
            ))}
          </div>
        </div>
      </div>

      <label className="block rounded-[18px] border border-black/12 bg-white px-4 py-3">
        <div className="mb-2 flex items-center justify-between text-xs tracking-[0.18em] text-black/55">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={() => {}}
          className="w-full accent-black"
        />
      </label>
    </div>
  );
}

function HeatZoneRect({
  left,
  top,
  width,
  height,
}: {
  left: number;
  top: number;
  width: number;
  height: number;
}) {
  return (
    <div
      className="absolute border border-[#ef4444]/35 bg-[#ef4444]/12"
      style={{ left, top, width, height }}
    />
  );
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}
