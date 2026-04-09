"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import Project5ConnectionLayer from "./Project5ConnectionLayer";
import type { Project5ConnectionLine } from "./Project5ConnectionLayer";
import Project5ControlPoint from "./Project5ControlPoint";
import {
  PROJECT5_CANVAS_STYLE,
  PROJECT5_PREVIEW_BLOCK_MARGIN_CLASS,
} from "./Project5DemoFrame";
import Project5ShapeTextNode from "./Project5ShapeTextNode";
import type { Project5CanvasNode } from "./Project5CanvasNodeTypes";

const BOARD_WIDTH = 760;
const BOARD_HEIGHT = 340;
const POINTER_SIZE = 32;
const ARROW_POINTER_HOTSPOT_X = 7;
const ARROW_POINTER_HOTSPOT_Y = 5;
const HAND_POINTER_HOTSPOT_X = 16;
const HAND_POINTER_HOTSPOT_Y = 8;
const CYCLE_DURATION = 3600;

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

const FIRST_DEFAULT_CHILD: Project5CanvasNode = {
  id: 2,
  type: "shape-text",
  shapeKind: "process",
  x: 468,
  y: 108,
  width: 196,
  height: 82,
  text: "默认创建",
};

const SECOND_DEFAULT_CHILD: Project5CanvasNode = {
  id: 3,
  type: "shape-text",
  shapeKind: "process",
  x: 468,
  y: 242,
  width: 196,
  height: 82,
  text: "再次默认创建",
};

type Point = {
  x: number;
  y: number;
};

export default function Project5DefaultDistancePanel() {
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
  const firstTargetLeft = FIRST_DEFAULT_CHILD.x - FIRST_DEFAULT_CHILD.width / 2;
  const secondTargetLeft = SECOND_DEFAULT_CHILD.x - SECOND_DEFAULT_CHILD.width / 2;
  const idlePointer = { x: 352, y: 234 };
  const controlPoint = { x: sourceRight + 18, y: SOURCE_NODE.y };
  const usesHandPointer = (elapsed >= 760 && elapsed < 1840) || (elapsed >= 2480 && elapsed < 3560);
  const showControlPoint = elapsed >= 520;
  const controlPointHovered =
    (elapsed >= 760 && elapsed < 1600) || (elapsed >= 2480 && elapsed < 3320);
  const controlPointPressed =
    (elapsed >= 1600 && elapsed < 1720) || (elapsed >= 3320 && elapsed < 3440);
  const showFirstPreview = elapsed >= 1320 && elapsed < 1720;
  const showFirstCreated = elapsed >= 1720;
  const showSecondPreview = elapsed >= 3040 && elapsed < 3440;
  const showSecondCreated = elapsed >= 3440;
  const firstCreatedOpacity = showFirstCreated ? getSegmentProgress(elapsed, 1720, 2140) : 0;
  const secondCreatedOpacity = showSecondCreated ? getSegmentProgress(elapsed, 3440, 3860) : 0;

  const lines: Project5ConnectionLine[] = [];

  if (showFirstPreview) {
    lines.push({
      id: "default-distance-preview-first",
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: firstTargetLeft,
      targetY: FIRST_DEFAULT_CHILD.y,
      targetDirection: "left",
      dashed: true,
    });
  }

  if (showFirstCreated) {
    lines.push({
      id: "default-distance-created-first",
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: firstTargetLeft,
      targetY: FIRST_DEFAULT_CHILD.y,
      targetDirection: "left",
    });
  }

  if (showSecondPreview) {
    lines.push({
      id: "default-distance-preview-second",
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: secondTargetLeft,
      targetY: SECOND_DEFAULT_CHILD.y,
      targetDirection: "left",
      dashed: true,
    });
  }

  if (showSecondCreated) {
    lines.push({
      id: "default-distance-created-second",
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: secondTargetLeft,
      targetY: SECOND_DEFAULT_CHILD.y,
      targetDirection: "left",
    });
  }

  const pointer = getPointerTarget(elapsed, idlePointer, controlPoint);

  return (
    <div
      className={`${PROJECT5_PREVIEW_BLOCK_MARGIN_CLASS} relative overflow-hidden rounded-[24px] border border-border/20`}
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

      {showFirstPreview ? (
        <div
          className="absolute"
          style={{
            left: FIRST_DEFAULT_CHILD.x - FIRST_DEFAULT_CHILD.width / 2,
            top: FIRST_DEFAULT_CHILD.y - FIRST_DEFAULT_CHILD.height / 2,
            width: FIRST_DEFAULT_CHILD.width,
            height: FIRST_DEFAULT_CHILD.height,
            opacity: 0.72,
          }}
        >
          <Project5ShapeTextNode node={FIRST_DEFAULT_CHILD} preview />
        </div>
      ) : null}

      {showFirstCreated ? (
        <div
          className="absolute"
          style={{
            left: FIRST_DEFAULT_CHILD.x - FIRST_DEFAULT_CHILD.width / 2,
            top: FIRST_DEFAULT_CHILD.y - FIRST_DEFAULT_CHILD.height / 2,
            width: FIRST_DEFAULT_CHILD.width,
            height: FIRST_DEFAULT_CHILD.height,
            opacity: firstCreatedOpacity,
          }}
        >
          <Project5ShapeTextNode node={FIRST_DEFAULT_CHILD} />
        </div>
      ) : null}

      {showSecondPreview ? (
        <div
          className="absolute"
          style={{
            left: SECOND_DEFAULT_CHILD.x - SECOND_DEFAULT_CHILD.width / 2,
            top: SECOND_DEFAULT_CHILD.y - SECOND_DEFAULT_CHILD.height / 2,
            width: SECOND_DEFAULT_CHILD.width,
            height: SECOND_DEFAULT_CHILD.height,
            opacity: 0.72,
          }}
        >
          <Project5ShapeTextNode node={SECOND_DEFAULT_CHILD} preview />
        </div>
      ) : null}

      {showSecondCreated ? (
        <div
          className="absolute"
          style={{
            left: SECOND_DEFAULT_CHILD.x - SECOND_DEFAULT_CHILD.width / 2,
            top: SECOND_DEFAULT_CHILD.y - SECOND_DEFAULT_CHILD.height / 2,
            width: SECOND_DEFAULT_CHILD.width,
            height: SECOND_DEFAULT_CHILD.height,
            opacity: secondCreatedOpacity,
          }}
        >
          <Project5ShapeTextNode node={SECOND_DEFAULT_CHILD} />
        </div>
      ) : null}

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

function getPointerTarget(elapsed: number, idlePointer: Point, controlPoint: Point) {
  if (elapsed < 420) return idlePointer;
  if (elapsed < 760) {
    return interpolatePoint(idlePointer, controlPoint, getSegmentProgress(elapsed, 420, 760));
  }
  if (elapsed < 2160) {
    return controlPoint;
  }
  if (elapsed < 2480) {
    return interpolatePoint(controlPoint, idlePointer, getSegmentProgress(elapsed, 2160, 2480));
  }
  if (elapsed < 2800) {
    return interpolatePoint(idlePointer, controlPoint, getSegmentProgress(elapsed, 2480, 2800));
  }
  if (elapsed < 3560) {
    return controlPoint;
  }
  return interpolatePoint(
    controlPoint,
    { x: 580, y: 232 },
    getSegmentProgress(elapsed, 3560, CYCLE_DURATION),
  );
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
