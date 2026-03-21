"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import Project5ConnectionLayer from "./Project5ConnectionLayer";
import type { Project5ConnectionLine } from "./Project5ConnectionLayer";
import Project5ControlPoint from "./Project5ControlPoint";
import type { Project5CanvasNode, Project5CreateOption } from "./Project5CanvasNodeTypes";
import { PROJECT5_CANVAS_STYLE } from "./Project5DemoFrame";
import Project5HeatZone from "./Project5HeatZone";
import Project5ShapeCreatePanel from "./Project5ShapeCreatePanel";
import Project5ShapeTextNode from "./Project5ShapeTextNode";

const BOARD_WIDTH = 760;
const BOARD_HEIGHT = 340;
const ARROW_POINTER_HOTSPOT_X = 7;
const ARROW_POINTER_HOTSPOT_Y = 5;
const HAND_POINTER_HOTSPOT_X = 16;
const HAND_POINTER_HOTSPOT_Y = 8;
const POINTER_SIZE = 32;

const IDLE_END = 420;
const ZONE_END = 940;
const HOVER_END = 1480;
const DRAG_END = 2700;
const SETTLE_END = 2920;
const PANEL_END = 3140;
const ICON_MOVE_END = 3520;
const ICON_HOVER_END = 3780;
const ICON_PRESS_END = 3920;
const CREATED_END = 4300;
const EXIT_END = 5200;
const CYCLE_DURATION = 5600;

const CREATE_OPTIONS: Project5CreateOption[] = [
  { type: "shape-text", shapeKind: "process" },
  { type: "shape-text", shapeKind: "start" },
  { type: "shape-text", shapeKind: "decision" },
  { type: "shape-text", shapeKind: "database" },
  { type: "sticky-note" },
];

type Point = {
  x: number;
  y: number;
};

export default function Project5DragCreatePanel() {
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
    x: 210,
    y: 170,
    width: 196,
    height: 82,
    text: "输入文本",
  };

  const createdNode: Project5CanvasNode = {
    id: 2,
    type: "shape-text",
    shapeKind: "process",
    x: 548,
    y: 124,
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
  const dragPath: Point[] = [
    controlCenter,
    { x: 322, y: 156 },
    { x: 388, y: 142 },
    { x: 440, y: 128 },
    { x: 480, y: 120 },
  ];
  const dragEnd = dragPath[dragPath.length - 1];
  const pickerLeft = 430;
  const pickerTop = 170;
  const optionCenter: Point = {
    x: pickerLeft + 12 + 21.6,
    y: pickerTop + 12 + 22,
  };
  const exitPointer: Point = {
    x: createdNode.x + createdNode.width / 2 + 96,
    y: createdNode.y + createdNode.height / 2 + 48,
  };

  const isOverControlPoint = elapsed >= ZONE_END && elapsed < HOVER_END;
  const showHeatZone = elapsed >= IDLE_END && elapsed < HOVER_END;
  const showControls = elapsed >= IDLE_END && elapsed < HOVER_END;
  const showDraftLine = elapsed >= HOVER_END && elapsed < ICON_PRESS_END;
  const showPicker = elapsed >= SETTLE_END && elapsed < ICON_PRESS_END;
  const showCreatedNode = elapsed >= ICON_PRESS_END;
  const pickerOpacity = elapsed < PANEL_END ? getSegmentProgress(elapsed, SETTLE_END, PANEL_END) : 1;
  const createdOpacity = showCreatedNode ? getSegmentProgress(elapsed, ICON_PRESS_END, CREATED_END) : 0;
  const hoveredOption = elapsed >= ICON_MOVE_END && elapsed < ICON_PRESS_END ? CREATE_OPTIONS[0] : null;
  const previewNode = hoveredOption ? createdNode : null;
  const usesHandPointer = elapsed >= ZONE_END && elapsed < DRAG_END;

  const pointerTarget = getPointerTarget(
    elapsed,
    idlePointer,
    heatZoneTarget,
    controlCenter,
    dragPath,
    optionCenter,
    exitPointer,
  );
  const draftTarget =
    elapsed < DRAG_END
      ? samplePath(dragPath, getSegmentProgress(elapsed, HOVER_END, DRAG_END))
      : dragEnd;

  const pointerLeft =
    pointerTarget.x - (usesHandPointer ? HAND_POINTER_HOTSPOT_X : ARROW_POINTER_HOTSPOT_X);
  const pointerTop =
    pointerTarget.y - (usesHandPointer ? HAND_POINTER_HOTSPOT_Y : ARROW_POINTER_HOTSPOT_Y);

  const lines: Project5ConnectionLine[] = [];

  if (showDraftLine) {
    lines.push({
      id: "drag-draft",
      sourceX: sourceNode.x + sourceNode.width / 2,
      sourceY: sourceNode.y,
      sourceDirection: "right",
      targetX: draftTarget.x,
      targetY: draftTarget.y,
      targetDirection: "left",
      dashed: true,
    });
  }

  if (showCreatedNode) {
    lines.push({
      id: "drag-created",
      sourceX: sourceNode.x + sourceNode.width / 2,
      sourceY: sourceNode.y,
      sourceDirection: "right",
      targetX: createdNode.x - createdNode.width / 2,
      targetY: createdNode.y,
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

      {showPicker ? (
        <div
          className="absolute inset-0 z-10 transition-opacity duration-150 ease-out"
          style={{ opacity: pickerOpacity }}
        >
          <Project5ShapeCreatePanel
            left={pickerLeft}
            top={pickerTop}
            options={CREATE_OPTIONS}
            hoveredOption={hoveredOption}
            previewNode={previewNode}
            onHoverOption={() => {}}
            onSelect={() => {}}
          />
        </div>
      ) : null}

      {showCreatedNode ? (
        <div
          className="absolute transition-opacity duration-200 ease-out"
          style={{
            left: createdNode.x - createdNode.width / 2,
            top: createdNode.y - createdNode.height / 2,
            width: createdNode.width,
            height: createdNode.height,
            opacity: createdOpacity,
          }}
        >
          <Project5ShapeTextNode node={createdNode} />
        </div>
      ) : null}

      <div
        className="pointer-events-none absolute z-20"
        style={{
          left: pointerLeft,
          top: pointerTop,
          transform:
            elapsed >= ICON_HOVER_END && elapsed < ICON_PRESS_END
              ? "scale(0.94)"
              : elapsed >= HOVER_END && elapsed < DRAG_END
                ? "scale(0.96)"
                : "scale(1)",
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
  dragPath: Point[],
  optionCenter: Point,
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

  if (elapsed < DRAG_END) {
    return samplePath(dragPath, getSegmentProgress(elapsed, HOVER_END, DRAG_END));
  }

  const dragEnd = dragPath[dragPath.length - 1];

  if (elapsed < PANEL_END) {
    return dragEnd;
  }

  if (elapsed < ICON_MOVE_END) {
    return interpolatePoint(
      dragEnd,
      optionCenter,
      getSegmentProgress(elapsed, PANEL_END, ICON_MOVE_END),
    );
  }

  if (elapsed < CREATED_END) {
    return optionCenter;
  }

  if (elapsed < EXIT_END) {
    return interpolatePoint(
      optionCenter,
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

function samplePath(points: Point[], progress: number) {
  if (points.length === 0) {
    return { x: 0, y: 0 };
  }

  if (points.length === 1) {
    return points[0];
  }

  const distances = points.slice(1).map((point, index) => {
    const previous = points[index];
    return Math.hypot(point.x - previous.x, point.y - previous.y);
  });
  const total = distances.reduce((sum, distance) => sum + distance, 0);

  if (total === 0) {
    return points[points.length - 1];
  }

  const targetDistance = total * clamp01(progress);
  let accumulated = 0;

  for (let index = 0; index < distances.length; index += 1) {
    const segmentLength = distances[index];

    if (accumulated + segmentLength >= targetDistance) {
      const localProgress = (targetDistance - accumulated) / segmentLength;
      return interpolatePoint(points[index], points[index + 1], localProgress);
    }

    accumulated += segmentLength;
  }

  return points[points.length - 1];
}
