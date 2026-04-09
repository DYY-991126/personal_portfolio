"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import Project5ControlPoint from "./Project5ControlPoint";
import {
  PROJECT5_CANVAS_STYLE,
  PROJECT5_PREVIEW_BLOCK_MARGIN_CLASS,
} from "./Project5DemoFrame";
import Project5ShapeTextNode from "./Project5ShapeTextNode";
import type { Project5CanvasNode, Project5Direction } from "./Project5CanvasNodeTypes";

const BOARD_HEIGHT = 340;
const POINTER_SIZE = 32;
const ARROW_POINTER_HOTSPOT_X = 7;
const ARROW_POINTER_HOTSPOT_Y = 5;
const CYCLE_DURATION = 4200;

type Point = {
  x: number;
  y: number;
};

type Project5HeatZoneCoveragePanelProps = {
  /** 仅展示一种场景；不传则左右并排展示外层热区与内部热区。 */
  focus?: "outer" | "inner";
};

export default function Project5HeatZoneCoveragePanel({
  focus,
}: Project5HeatZoneCoveragePanelProps = {}) {
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

  const node = useMemo<Project5CanvasNode>(
    () => ({
      id: 1,
      type: "shape-text",
      shapeKind: "process",
      x: 0,
      y: 0,
      width: 196,
      height: 82,
      text: "当前对象",
    }),
    [],
  );

  const gridClass = focus
    ? PROJECT5_PREVIEW_BLOCK_MARGIN_CLASS
    : `grid gap-4 md:grid-cols-2 ${PROJECT5_PREVIEW_BLOCK_MARGIN_CLASS}`;

  return (
    <div className={gridClass}>
      {focus === "inner" ? (
        <HeatZoneColumn
          node={node}
          elapsed={elapsed}
          mode="inner"
        />
      ) : focus === "outer" ? (
        <HeatZoneColumn
          node={node}
          elapsed={elapsed}
          mode="outer"
        />
      ) : (
        <>
          <HeatZoneColumn
            node={node}
            elapsed={elapsed}
            mode="outer"
          />
          <HeatZoneColumn
            node={node}
            elapsed={elapsed}
            mode="inner"
          />
        </>
      )}
    </div>
  );
}

function HeatZoneColumn({
  node,
  elapsed,
  mode,
}: {
  node: Project5CanvasNode;
  elapsed: number;
  mode: "outer" | "inner";
}) {
  const horizontalThickness = 34;
  const verticalThickness = 42;
  const sceneWidth = node.width + verticalThickness * 2;
  const sceneHeight = node.height + horizontalThickness * 2;
  const left = verticalThickness;
  const top = horizontalThickness;
  const centerX = sceneWidth / 2;
  const centerY = sceneHeight / 2;
  const active = mode === "outer" ? elapsed >= 1080 && elapsed < 3200 : elapsed >= 520 && elapsed < 3400;
  const pointer = getPointerTarget(mode, elapsed, {
    x: centerX + 118,
    y: centerY + 82,
  }, {
    x: mode === "outer" ? left + node.width + verticalThickness * 0.5 : centerX - 24,
    y: mode === "outer" ? centerY : centerY + 2,
  }, {
    x: centerX + 26,
    y: centerY + 2,
  });

  return (
    <div
      className="relative overflow-hidden rounded-[24px] border border-border/20"
      style={{ ...PROJECT5_CANVAS_STYLE, width: "100%", minHeight: BOARD_HEIGHT }}
    >
      <div
        className="absolute"
        style={{
          left: `calc(50% - ${sceneWidth / 2}px)`,
          top: `calc(50% - ${sceneHeight / 2}px)`,
          width: sceneWidth,
          height: sceneHeight,
        }}
      >
        <div
          className="absolute border border-[#ef4444]/35 bg-[#ef4444]/12 transition-opacity duration-300"
          style={{
            left,
            top: top - horizontalThickness,
            width: node.width,
            height: horizontalThickness,
            opacity: mode === "outer" ? 1 : active ? 0.72 : 0.3,
          }}
        />
        <div
          className="absolute border border-[#ef4444]/35 bg-[#ef4444]/12 transition-opacity duration-300"
          style={{
            left: left + node.width,
            top,
            width: verticalThickness,
            height: node.height,
            opacity: mode === "outer" ? 1 : active ? 0.72 : 0.3,
          }}
        />
        <div
          className="absolute border border-[#ef4444]/35 bg-[#ef4444]/12 transition-opacity duration-300"
          style={{
            left,
            top: top + node.height,
            width: node.width,
            height: horizontalThickness,
            opacity: mode === "outer" ? 1 : active ? 0.72 : 0.3,
          }}
        />
        <div
          className="absolute border border-[#ef4444]/35 bg-[#ef4444]/12 transition-opacity duration-300"
          style={{
            left: left - verticalThickness,
            top,
            width: verticalThickness,
            height: node.height,
            opacity: mode === "outer" ? 1 : active ? 0.72 : 0.3,
          }}
        />
        <div
          className="absolute border border-[#f97316]/30 bg-[#f97316]/10 transition-opacity duration-300"
          style={{
            left,
            top,
            width: node.width,
            height: node.height,
            opacity: mode === "inner" ? (active ? 1 : 0.78) : active ? 0.42 : 0.2,
          }}
        />

        <div
          className="absolute"
          style={{ left, top, width: node.width, height: node.height }}
        >
          <Project5ShapeTextNode
            node={{
              ...node,
              x: centerX,
              y: centerY,
            }}
          />

          {active
            ? (["top", "right", "bottom", "left"] as Project5Direction[]).map((direction) => (
                <Project5ControlPoint
                  key={direction}
                  direction={direction}
                  iconVariant="arrow"
                  top={
                    direction === "top"
                      ? -(16 + 28)
                      : direction === "bottom"
                        ? node.height + 16
                        : node.height / 2 - 14
                  }
                  left={
                    direction === "left"
                      ? -(16 + 28)
                      : direction === "right"
                        ? node.width + 16
                        : node.width / 2 - 14
                  }
                  forcedHovered={mode === "outer" && direction === "right"}
                  onHoverStart={() => {}}
                  onHoverEnd={() => {}}
                />
              ))
            : null}
        </div>

        <div
          className="pointer-events-none absolute z-20"
          style={{
            left: pointer.x - ARROW_POINTER_HOTSPOT_X,
            top: pointer.y - ARROW_POINTER_HOTSPOT_Y,
          }}
        >
          <Image
            src="/cursor/Arrow.png"
            alt=""
            aria-hidden="true"
            width={POINTER_SIZE}
            height={POINTER_SIZE}
            draggable={false}
            priority
          />
        </div>
      </div>
    </div>
  );
}

function getPointerTarget(
  mode: "outer" | "inner",
  elapsed: number,
  idle: Point,
  active: Point,
  drift: Point,
) {
  if (mode === "outer") {
    if (elapsed < 420) {
      return idle;
    }

    if (elapsed < 1080) {
      return interpolatePoint(idle, active, getProgress(elapsed, 420, 1080));
    }

    if (elapsed < 3200) {
      return active;
    }

    return interpolatePoint(active, idle, getProgress(elapsed, 3200, CYCLE_DURATION));
  }

  if (elapsed < 520) {
    return idle;
  }

  if (elapsed < 1120) {
    return interpolatePoint(idle, active, getProgress(elapsed, 520, 1120));
  }

  if (elapsed < 3400) {
    const swing = Math.sin(((elapsed - 1120) / 760) * Math.PI) * 0.5 + 0.5;
    return interpolatePoint(active, drift, swing);
  }

  return interpolatePoint(drift, idle, getProgress(elapsed, 3400, CYCLE_DURATION));
}

function getProgress(elapsed: number, start: number, end: number) {
  if (end <= start) return 1;
  return Math.max(0, Math.min(1, (elapsed - start) / (end - start)));
}

function interpolatePoint(from: Point, to: Point, progress: number) {
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
  };
}
