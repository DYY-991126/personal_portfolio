"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import Project5ConnectionLayer from "./Project5ConnectionLayer";
import type { Project5ConnectionLine } from "./Project5ConnectionLayer";
import Project5ControlPoint from "./Project5ControlPoint";
import { PROJECT5_CANVAS_STYLE } from "./Project5DemoFrame";
import Project5HeatZone from "./Project5HeatZone";
import Project5ShapeTextNode from "./Project5ShapeTextNode";
import type { Project5CanvasNode } from "./Project5CanvasNodeTypes";

const BOARD_WIDTH = 760;
const BOARD_HEIGHT = 320;
const ARROW_POINTER_HOTSPOT_X = 7;
const ARROW_POINTER_HOTSPOT_Y = 5;
const HAND_POINTER_HOTSPOT_X = 16;
const HAND_POINTER_HOTSPOT_Y = 8;
const POINTER_SIZE = 32;

const IDLE_END = 420;
const ZONE_END = 920;
const HOVER_END = 1520;
const PRESS_END = 1700;
const CREATED_END = 2160;
const EXIT_END = 3080;
const CYCLE_DURATION = 3440;

type Point = {
  x: number;
  y: number;
};

export default function Project5ClickCreatePanel() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      setElapsed((now - start) % CYCLE_DURATION);
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const sourceNode: Project5CanvasNode = {
    id: 1,
    type: "shape-text",
    shapeKind: "process",
    x: 220,
    y: 160,
    width: 196,
    height: 82,
    text: "输入文本",
  };

  const nextNode: Project5CanvasNode = {
    id: 2,
    type: "shape-text",
    shapeKind: "process",
    x: 470,
    y: 160,
    width: 196,
    height: 82,
    text: "输入文本",
  };

  const sourceLeft = sourceNode.x - sourceNode.width / 2;
  const sourceTop = sourceNode.y - sourceNode.height / 2;
  const controlLeft = sourceNode.width + 16;
  const controlTop = sourceNode.height / 2 - 14;
  const controlCenter: Point = {
    x: sourceLeft + controlLeft + 14,
    y: sourceTop + controlTop + 14,
  };
  const heatZoneWidth = 43.12;
  const heatZoneTarget: Point = {
    x: sourceLeft + sourceNode.width + heatZoneWidth * 0.48,
    y: sourceTop + sourceNode.height * 0.56,
  };
  const idlePointer: Point = {
    x: sourceLeft + sourceNode.width + 118,
    y: sourceTop + sourceNode.height + 46,
  };
  const exitPointer: Point = {
    x: nextNode.x + nextNode.width / 2 + 70,
    y: nextNode.y + nextNode.height / 2 + 18,
  };

  const isOverControlPoint = elapsed >= ZONE_END && elapsed < PRESS_END;
  const usesHandPointer = elapsed >= ZONE_END && elapsed < PRESS_END;
  const showHeatZone = elapsed >= IDLE_END && elapsed < HOVER_END;
  const showControls = elapsed >= IDLE_END && elapsed < PRESS_END;
  const showDraftResult = elapsed >= HOVER_END && elapsed < PRESS_END;
  const showCreatedNode = elapsed >= PRESS_END;
  const createdOpacity = showCreatedNode ? getSegmentProgress(elapsed, PRESS_END, CREATED_END) : 0;

  const pointerTarget = getPointerTarget(
    elapsed,
    idlePointer,
    heatZoneTarget,
    controlCenter,
    exitPointer,
  );

  const pointerLeft =
    pointerTarget.x - (usesHandPointer ? HAND_POINTER_HOTSPOT_X : ARROW_POINTER_HOTSPOT_X);
  const pointerTop =
    pointerTarget.y - (usesHandPointer ? HAND_POINTER_HOTSPOT_Y : ARROW_POINTER_HOTSPOT_Y);

  const lines: Project5ConnectionLine[] = [];

  if (showDraftResult) {
    lines.push({
      id: "click-preview",
      sourceX: sourceNode.x + sourceNode.width / 2,
      sourceY: sourceNode.y,
      sourceDirection: "right",
      targetX: nextNode.x - nextNode.width / 2,
      targetY: nextNode.y,
      targetDirection: "left",
      dashed: true,
    });
  }

  if (showCreatedNode) {
    lines.push({
      id: "click-created",
      sourceX: sourceNode.x + sourceNode.width / 2,
      sourceY: sourceNode.y,
      sourceDirection: "right",
      targetX: nextNode.x - nextNode.width / 2,
      targetY: nextNode.y,
      targetDirection: "left",
    });
  }

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

        {showHeatZone ? (
          <Project5HeatZone
            direction="right"
            noteWidth={sourceNode.width}
            noteHeight={sourceNode.height}
            canvasZoom={1}
            showOverlay={false}
            onActivate={() => {}}
            onDeactivate={() => {}}
          />
        ) : null}

        {showControls ? (
          <Project5ControlPoint
            direction="right"
            iconVariant="arrow"
            left={controlLeft}
            top={controlTop}
            forcedHovered={isOverControlPoint}
            onHoverStart={() => {}}
            onHoverEnd={() => {}}
          />
        ) : null}
      </div>

      {showDraftResult ? (
        <div
          className="absolute"
          style={{
            left: nextNode.x - nextNode.width / 2,
            top: nextNode.y - nextNode.height / 2,
            width: nextNode.width,
            height: nextNode.height,
            opacity: 0.72,
          }}
        >
          <Project5ShapeTextNode node={nextNode} preview />
        </div>
      ) : null}

      {showCreatedNode ? (
        <div
          className="absolute transition-opacity duration-200 ease-out"
          style={{
            left: nextNode.x - nextNode.width / 2,
            top: nextNode.y - nextNode.height / 2,
            width: nextNode.width,
            height: nextNode.height,
            opacity: createdOpacity,
          }}
        >
          <Project5ShapeTextNode node={nextNode} />
        </div>
      ) : null}

      <div
        className="pointer-events-none absolute z-20"
        style={{
          left: pointerLeft,
          top: pointerTop,
          transform: elapsed >= HOVER_END && elapsed < PRESS_END ? "scale(0.94)" : "scale(1)",
        }}
      >
        <Image
          src={usesHandPointer ? "/cursor/Pointer.png" : "/cursor/Arrow.png"}
          alt=""
          aria-hidden="true"
          width={POINTER_SIZE}
          height={POINTER_SIZE}
          draggable={false}
          priority
        />
      </div>
    </div>
  );
}

function getPointerTarget(
  elapsed: number,
  idlePointer: Point,
  heatZoneTarget: Point,
  controlCenter: Point,
  exitPointer: Point,
) {
  if (elapsed < IDLE_END) {
    return idlePointer;
  }

  if (elapsed < ZONE_END) {
    return interpolatePoint(
      idlePointer,
      heatZoneTarget,
      getSegmentProgress(elapsed, IDLE_END, ZONE_END),
    );
  }

  if (elapsed < HOVER_END) {
    return interpolatePoint(
      heatZoneTarget,
      controlCenter,
      getSegmentProgress(elapsed, ZONE_END, HOVER_END),
    );
  }

  if (elapsed < CREATED_END) {
    return controlCenter;
  }

  if (elapsed < EXIT_END) {
    return interpolatePoint(
      controlCenter,
      exitPointer,
      getSegmentProgress(elapsed, CREATED_END, EXIT_END),
    );
  }

  return exitPointer;
}

function getSegmentProgress(elapsed: number, start: number, end: number) {
  if (end <= start) {
    return 1;
  }

  return clamp01((elapsed - start) / (end - start));
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function interpolatePoint(from: Point, to: Point, progress: number) {
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
  };
}
