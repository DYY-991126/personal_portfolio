"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import Project5ConnectionLayer from "./Project5ConnectionLayer";
import type { Project5ConnectionLine } from "./Project5ConnectionLayer";
import Project5ControlPoint from "./Project5ControlPoint";
import { PROJECT5_CANVAS_STYLE } from "./Project5DemoFrame";
import Project5ShapeTextNode from "./Project5ShapeTextNode";
import type { Project5CanvasNode } from "./Project5CanvasNodeTypes";

const BOARD_WIDTH = 760;
const BOARD_HEIGHT = 340;
const POINTER_SIZE = 32;
const ARROW_POINTER_HOTSPOT_X = 7;
const ARROW_POINTER_HOTSPOT_Y = 5;
const HAND_POINTER_HOTSPOT_X = 16;
const HAND_POINTER_HOTSPOT_Y = 8;
const CYCLE_DURATION = 5600;

const SOURCE_NODE: Project5CanvasNode = {
  id: 1,
  type: "shape-text",
  shapeKind: "process",
  x: 170,
  y: 170,
  width: 196,
  height: 82,
  text: "当前对象",
};

const FIRST_CHILD: Project5CanvasNode = {
  id: 2,
  type: "shape-text",
  shapeKind: "process",
  x: 668,
  y: 108,
  width: 196,
  height: 82,
  text: "第一次拖拽",
};

const SECOND_CHILD: Project5CanvasNode = {
  id: 3,
  type: "shape-text",
  shapeKind: "process",
  x: 668,
  y: 242,
  width: 196,
  height: 82,
  text: "后续创建",
};

type Point = {
  x: number;
  y: number;
};

export default function Project5DistanceMemoryPanel() {
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

  const sourceRight = SOURCE_NODE.x + SOURCE_NODE.width / 2;
  const firstTargetLeft = FIRST_CHILD.x - FIRST_CHILD.width / 2;
  const secondTargetLeft = SECOND_CHILD.x - SECOND_CHILD.width / 2;
  const idlePointer = { x: 360, y: 238 };
  const controlPoint = { x: sourceRight + 18, y: SOURCE_NODE.y };
  const firstDragPath = [
    controlPoint,
    { x: 342, y: 160 },
    { x: 482, y: 132 },
    { x: 602, y: 116 },
    { x: firstTargetLeft + 10, y: FIRST_CHILD.y },
  ];
  const pointer = getPointerTarget(elapsed, idlePointer, controlPoint, firstDragPath);
  const usesHandPointer = elapsed >= 760 && elapsed < 2480;
  const showControlPoint = elapsed >= 3320;
  const controlPointHovered = elapsed >= 3440 && elapsed < 3880;
  const controlPointPressed = elapsed >= 3880 && elapsed < 4000;
  const firstPreviewTarget =
    elapsed < 2480
      ? samplePath(firstDragPath, getSegmentProgress(elapsed, 760, 2480))
      : firstDragPath[firstDragPath.length - 1];

  const showFirstPreview = elapsed >= 760 && elapsed < 2480;
  const showFirstCommitted = elapsed >= 2480;
  const showSecondPreview = elapsed >= 3600 && elapsed < 3920;
  const showSecondCommitted = elapsed >= 3920;

  const lines: Project5ConnectionLine[] = [];

  if (showFirstPreview) {
    lines.push({
      id: "distance-preview-first",
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: firstPreviewTarget.x,
      targetY: firstPreviewTarget.y,
      targetDirection: "left",
      dashed: true,
    });
  }

  if (showFirstCommitted) {
    lines.push({
      id: "distance-first",
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: firstTargetLeft,
      targetY: FIRST_CHILD.y,
      targetDirection: "left",
    });
  }

  if (showSecondPreview) {
    lines.push({
      id: "distance-preview-second",
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: secondTargetLeft,
      targetY: SECOND_CHILD.y,
      targetDirection: "left",
      dashed: true,
    });
  }

  if (showSecondCommitted) {
    lines.push({
      id: "distance-second",
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: secondTargetLeft,
      targetY: SECOND_CHILD.y,
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
          left: SOURCE_NODE.x - SOURCE_NODE.width / 2,
          top: SOURCE_NODE.y - SOURCE_NODE.height / 2,
          width: SOURCE_NODE.width,
          height: SOURCE_NODE.height,
        }}
      >
        <Project5ShapeTextNode node={SOURCE_NODE} />

        {showControlPoint ? (
          <Project5ControlPoint
            direction="right"
            iconVariant="arrow"
            left={SOURCE_NODE.width + 16}
            top={SOURCE_NODE.height / 2 - 14}
            forcedHovered={controlPointHovered || controlPointPressed}
            onHoverStart={() => {}}
            onHoverEnd={() => {}}
          />
        ) : null}
      </div>

      {showFirstCommitted ? <Node node={FIRST_CHILD} /> : null}
      {showSecondPreview ? <Node node={SECOND_CHILD} preview /> : null}
      {showSecondCommitted ? <Node node={SECOND_CHILD} /> : null}

      <div
        className="pointer-events-none absolute z-20"
        style={{
          left: pointer.x - (usesHandPointer ? HAND_POINTER_HOTSPOT_X : ARROW_POINTER_HOTSPOT_X),
          top: pointer.y - (usesHandPointer ? HAND_POINTER_HOTSPOT_Y : ARROW_POINTER_HOTSPOT_Y),
          transform: controlPointPressed ? "scale(0.94)" : "scale(1)",
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

function Node({ node, preview = false }: { node: Project5CanvasNode; preview?: boolean }) {
  return (
    <div
      className="absolute"
      style={{
        left: node.x - node.width / 2,
        top: node.y - node.height / 2,
        width: node.width,
        height: node.height,
        opacity: preview ? 0.72 : 1,
      }}
    >
      <Project5ShapeTextNode node={node} preview={preview} />
    </div>
  );
}

function getPointerTarget(
  elapsed: number,
  idlePointer: Point,
  controlPoint: Point,
  firstDragPath: Point[],
) {
  if (elapsed < 420) {
    return idlePointer;
  }

  if (elapsed < 760) {
    return interpolatePoint(idlePointer, controlPoint, getSegmentProgress(elapsed, 420, 760));
  }

  if (elapsed < 2480) {
    return samplePath(firstDragPath, getSegmentProgress(elapsed, 760, 2480));
  }

  if (elapsed < 2960) {
    return firstDragPath[firstDragPath.length - 1];
  }

  if (elapsed < 3440) {
    return interpolatePoint(firstDragPath[firstDragPath.length - 1], controlPoint, getSegmentProgress(elapsed, 2960, 3440));
  }

  if (elapsed < 3880) {
    return controlPoint;
  }

  if (elapsed < 4000) {
    return controlPoint;
  }

  return controlPoint;
}

function getSegmentProgress(elapsed: number, start: number, end: number) {
  if (end <= start) return 1;
  return Math.max(0, Math.min(1, (elapsed - start) / (end - start)));
}

function interpolatePoint(from: Point, to: Point, progress: number) {
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
  };
}

function samplePath(points: Point[], progress: number) {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];

  const distances = points.slice(1).map((point, index) => {
    const previous = points[index];
    return Math.hypot(point.x - previous.x, point.y - previous.y);
  });
  const total = distances.reduce((sum, distance) => sum + distance, 0);

  if (total === 0) return points[points.length - 1];

  const targetDistance = total * Math.max(0, Math.min(1, progress));
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
