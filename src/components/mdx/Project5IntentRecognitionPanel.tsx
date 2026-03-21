"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import Project5ConnectionLayer from "./Project5ConnectionLayer";
import type { Project5ConnectionLine } from "./Project5ConnectionLayer";
import { PROJECT5_CANVAS_STYLE } from "./Project5DemoFrame";
import Project5CanvasNodeView from "./Project5CanvasNodeView";
import { createStickyNoteNode, type Project5CanvasNode } from "./Project5CanvasNodeTypes";

const BOARD_WIDTH = 760;
const BOARD_HEIGHT = 320;
const POINTER_SIZE = 32;
const ARROW_POINTER_HOTSPOT_X = 7;
const ARROW_POINTER_HOTSPOT_Y = 5;
const HAND_POINTER_HOTSPOT_X = 16;
const HAND_POINTER_HOTSPOT_Y = 8;

const SOURCE_NODE: Project5CanvasNode = {
  id: 1,
  type: "shape-text",
  shapeKind: "process",
  x: 220,
  y: 160,
  width: 196,
  height: 82,
  text: "当前对象",
};

const TARGET_NODE: Project5CanvasNode = {
  id: 2,
  type: "shape-text",
  shapeKind: "process",
  x: 540,
  y: 160,
  width: 196,
  height: 82,
  text: "已有对象",
};

const OFF_AXIS_NODE: Project5CanvasNode = {
  id: 3,
  type: "shape-text",
  shapeKind: "process",
  x: 220,
  y: 42,
  width: 196,
  height: 82,
  text: "其他对象",
};

const NEW_NODE: Project5CanvasNode = {
  id: 4,
  type: "shape-text",
  shapeKind: "process",
  x: 540,
  y: 160,
  width: 196,
  height: 82,
  text: "新建对象",
};

const MULTI_CANDIDATE_PRIMARY_NODE: Project5CanvasNode = {
  id: 11,
  type: "shape-text",
  shapeKind: "process",
  x: 532,
  y: 144,
  width: 196,
  height: 82,
  text: "候选对象 A",
};

const MULTI_CANDIDATE_SECONDARY_NODE: Project5CanvasNode = {
  id: 12,
  type: "shape-text",
  shapeKind: "process",
  x: 598,
  y: 252,
  width: 196,
  height: 82,
  text: "候选对象 B",
};

const TIE_BREAK_TOP_NODE: Project5CanvasNode = {
  id: 13,
  type: "shape-text",
  shapeKind: "process",
  x: 564,
  y: 108,
  width: 196,
  height: 82,
  text: "候选对象 A",
};

const TIE_BREAK_BOTTOM_NODE: Project5CanvasNode = {
  id: 14,
  type: "shape-text",
  shapeKind: "process",
  x: 564,
  y: 212,
  width: 196,
  height: 82,
  text: "候选对象 B",
};

const STICKY_TARGET_NODE = createStickyNoteNode(5, 590, 160, "已有便签");

const COLLISION_NEW_NODE: Project5CanvasNode = {
  id: 6,
  type: "shape-text",
  shapeKind: "process",
  x: 640,
  y: 278,
  width: 196,
  height: 82,
  text: "新建对象",
};

const OFFSCREEN_TARGET_NODE: Project5CanvasNode = {
  id: 7,
  type: "shape-text",
  shapeKind: "process",
  x: 686,
  y: 160,
  width: 196,
  height: 82,
  text: "已有对象",
};

const OFFSCREEN_SOURCE_NODE: Project5CanvasNode = {
  id: 9,
  type: "shape-text",
  shapeKind: "process",
  x: 332,
  y: 160,
  width: 196,
  height: 82,
  text: "当前对象",
};

const OFFSCREEN_NEW_NODE: Project5CanvasNode = {
  id: 8,
  type: "shape-text",
  shapeKind: "process",
  x: 686,
  y: 258,
  width: 196,
  height: 82,
  text: "新建对象",
};

type Point = {
  x: number;
  y: number;
};

export function Project5ManualConnectionPanel() {
  const elapsed = useLoopElapsed();

  const sourceRight = SOURCE_NODE.x + SOURCE_NODE.width / 2;
  const targetLeft = TARGET_NODE.x - TARGET_NODE.width / 2;
  const idlePointer = { x: 384, y: 224 };
  const controlPoint = { x: sourceRight + 18, y: SOURCE_NODE.y };
  const dragPath = [
    controlPoint,
    { x: 356, y: 160 },
    { x: 416, y: 160 },
    { x: 470, y: 160 },
    { x: targetLeft + 10, y: TARGET_NODE.y },
  ];

  const pointer = getManualPointer(elapsed, idlePointer, controlPoint, dragPath);
  const usesHandPointer = elapsed >= 860 && elapsed < 2720;
  const draftTarget =
    elapsed < 2720
      ? samplePath(dragPath, getSegmentProgress(elapsed, 860, 2720))
      : dragPath[dragPath.length - 1];
  const showPreviewLine = elapsed >= 860 && elapsed < 2720;
  const showConnectedLine = elapsed >= 2720;
  const highlightTarget = elapsed >= 1760;
  const lines: Project5ConnectionLine[] = [];

  if (showPreviewLine) {
    lines.push({
      id: "manual-preview",
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: draftTarget.x,
      targetY: draftTarget.y,
      targetDirection: "left",
      dashed: true,
    });
  }

  if (showConnectedLine) {
    lines.push({
      id: "manual-connected",
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: targetLeft,
      targetY: TARGET_NODE.y,
      targetDirection: "left",
    });
  }

  return (
    <ConnectionBoard lines={lines} pointer={pointer} usesHandPointer={usesHandPointer} label={null}>
      <Node node={SOURCE_NODE} />
      <Node node={TARGET_NODE} highlighted={highlightTarget} />
    </ConnectionBoard>
  );
}

export function Project5AutoConnectionPanel({ contentScale = 1 }: { contentScale?: number } = {}) {
  const elapsed = useLoopElapsed();

  const sourceRight = SOURCE_NODE.x + SOURCE_NODE.width / 2;
  const targetLeft = TARGET_NODE.x - TARGET_NODE.width / 2;
  const idlePointer = { x: 382, y: 224 };
  const controlPoint = { x: sourceRight + 18, y: SOURCE_NODE.y };
  const pointer = getAutoPointer(elapsed, idlePointer, controlPoint);
  const usesHandPointer = elapsed >= 820 && elapsed < 2140;
  const showPreviewConnect = elapsed >= 1180 && elapsed < 1880;
  const showConnectedLine = elapsed >= 1880;
  const highlightExisting = elapsed >= 1180;

  const lines: Project5ConnectionLine[] = [];

  if (showPreviewConnect) {
    lines.push({
      id: "auto-connect-preview",
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: targetLeft,
      targetY: TARGET_NODE.y,
      targetDirection: "left",
      dashed: true,
    });
  }

  if (showConnectedLine) {
    lines.push({
      id: "auto-connected",
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: targetLeft,
      targetY: TARGET_NODE.y,
      targetDirection: "left",
    });
  }

  return (
    <ConnectionBoard
      lines={lines}
      pointer={pointer}
      usesHandPointer={usesHandPointer}
      label={null}
      contentScale={contentScale}
    >
      <Node node={SOURCE_NODE} />
      <Node node={TARGET_NODE} highlighted={highlightExisting} />
    </ConnectionBoard>
  );
}

export function Project5AutoCreatePanel({ contentScale = 1 }: { contentScale?: number } = {}) {
  const elapsed = useLoopElapsed();

  const sourceRight = SOURCE_NODE.x + SOURCE_NODE.width / 2;
  const newNodeLeft = NEW_NODE.x - NEW_NODE.width / 2;
  const idlePointer = { x: 382, y: 224 };
  const controlPoint = { x: sourceRight + 18, y: SOURCE_NODE.y };
  const pointer = getAutoPointer(elapsed, idlePointer, controlPoint);
  const usesHandPointer = elapsed >= 820 && elapsed < 2140;
  const showPreviewCreate = elapsed >= 1180 && elapsed < 1880;
  const showCreatedLine = elapsed >= 1880;
  const showPreviewNode = elapsed >= 1180;
  const showCommittedNode = elapsed >= 1880;

  const lines: Project5ConnectionLine[] = [];

  if (showPreviewCreate) {
    lines.push({
      id: "auto-create-preview",
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: newNodeLeft,
      targetY: NEW_NODE.y,
      targetDirection: "left",
      dashed: true,
    });
  }

  if (showCreatedLine) {
    lines.push({
      id: "auto-created",
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: newNodeLeft,
      targetY: NEW_NODE.y,
      targetDirection: "left",
    });
  }

  return (
    <ConnectionBoard
      lines={lines}
      pointer={pointer}
      usesHandPointer={usesHandPointer}
      label={null}
      contentScale={contentScale}
    >
      <Node node={SOURCE_NODE} />
      <Node node={OFF_AXIS_NODE} />
      {showPreviewNode ? <Node node={NEW_NODE} preview={!showCommittedNode} /> : null}
    </ConnectionBoard>
  );
}

export function Project5AutoDirectionComparePanel() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Project5AutoCreatePanel contentScale={0.66} />
      <Project5AutoConnectionPanel contentScale={0.66} />
    </div>
  );
}

export function Project5AutoMultiCandidatePanel() {
  const elapsed = useLoopElapsed();
  const sourceRight = SOURCE_NODE.x + SOURCE_NODE.width / 2;
  const primaryLeft = MULTI_CANDIDATE_PRIMARY_NODE.x - MULTI_CANDIDATE_PRIMARY_NODE.width / 2;
  const idlePointer = { x: 382, y: 224 };
  const controlPoint = { x: sourceRight + 18, y: SOURCE_NODE.y };
  const pointer = getAutoPointer(elapsed, idlePointer, controlPoint);
  const usesHandPointer = elapsed >= 820 && elapsed < 2140;
  const showPreviewConnect = elapsed >= 1180 && elapsed < 1880;
  const showConnectedLine = elapsed >= 1880;
  const highlightPrimary = elapsed >= 1180;

  const lines: Project5ConnectionLine[] = [];

  if (showPreviewConnect) {
    lines.push({
      id: "auto-multi-preview",
      sourceId: SOURCE_NODE.id,
      targetId: MULTI_CANDIDATE_PRIMARY_NODE.id,
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: primaryLeft,
      targetY: MULTI_CANDIDATE_PRIMARY_NODE.y,
      targetDirection: "left",
      dashed: true,
    });
  }

  if (showConnectedLine) {
    lines.push({
      id: "auto-multi-connected",
      sourceId: SOURCE_NODE.id,
      targetId: MULTI_CANDIDATE_PRIMARY_NODE.id,
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: primaryLeft,
      targetY: MULTI_CANDIDATE_PRIMARY_NODE.y,
      targetDirection: "left",
    });
  }

  return (
    <ConnectionBoard
      lines={lines}
      pointer={pointer}
      usesHandPointer={usesHandPointer}
      label={null}
      overlayChildren={
        <RightHeatZoneOverlay left={sourceRight + 12} top={72} width={310} height={176} />
      }
    >
      <Node node={SOURCE_NODE} />
      <Node node={MULTI_CANDIDATE_PRIMARY_NODE} highlighted={highlightPrimary} />
      <Node node={MULTI_CANDIDATE_SECONDARY_NODE} />
    </ConnectionBoard>
  );
}

export function Project5AutoTieBreakPanel() {
  const elapsed = useLoopElapsed();
  const sourceRight = SOURCE_NODE.x + SOURCE_NODE.width / 2;
  const topLeft = TIE_BREAK_TOP_NODE.x - TIE_BREAK_TOP_NODE.width / 2;
  const idlePointer = { x: 382, y: 224 };
  const controlPoint = { x: sourceRight + 18, y: SOURCE_NODE.y };
  const pointer = getAutoPointer(elapsed, idlePointer, controlPoint);
  const usesHandPointer = elapsed >= 820 && elapsed < 2140;
  const showPreviewConnect = elapsed >= 1180 && elapsed < 1880;
  const showConnectedLine = elapsed >= 1880;
  const highlightTop = elapsed >= 1180;

  const lines: Project5ConnectionLine[] = [];

  if (showPreviewConnect) {
    lines.push({
      id: "auto-tie-preview",
      sourceId: SOURCE_NODE.id,
      targetId: TIE_BREAK_TOP_NODE.id,
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: topLeft,
      targetY: TIE_BREAK_TOP_NODE.y,
      targetDirection: "left",
      dashed: true,
    });
  }

  if (showConnectedLine) {
    lines.push({
      id: "auto-tie-connected",
      sourceId: SOURCE_NODE.id,
      targetId: TIE_BREAK_TOP_NODE.id,
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: topLeft,
      targetY: TIE_BREAK_TOP_NODE.y,
      targetDirection: "left",
    });
  }

  return (
    <ConnectionBoard
      lines={lines}
      pointer={pointer}
      usesHandPointer={usesHandPointer}
      label={null}
      overlayChildren={
        <RightHeatZoneOverlay left={sourceRight + 12} top={56} width={284} height={208} />
      }
    >
      <Node node={SOURCE_NODE} />
      <Node node={TIE_BREAK_TOP_NODE} highlighted={highlightTop} />
      <Node node={TIE_BREAK_BOTTOM_NODE} />
    </ConnectionBoard>
  );
}

export function Project5AutoOffscreenFallbackPanel() {
  const elapsed = useLoopElapsed();
  const sourceRight = OFFSCREEN_SOURCE_NODE.x + OFFSCREEN_SOURCE_NODE.width / 2;
  const idlePointer = { x: 468, y: 216 };
  const controlPoint = { x: sourceRight + 18, y: OFFSCREEN_SOURCE_NODE.y };
  const pointer = getAutoPointer(elapsed, idlePointer, controlPoint);
  const usesHandPointer = elapsed >= 820 && elapsed < 2140;
  const showPreviewCreate = elapsed >= 1180 && elapsed < 1540;
  const showCreatedLine = elapsed >= 1540;
  const showPreviewNode = elapsed >= 1180;
  const showCommittedNode = elapsed >= 1540;
  const viewportProgress = easeOutCubic(getSegmentProgress(elapsed, 1220, 1760));
  const viewportLeft = lerp(0, 84, viewportProgress);
  const viewportTop = 18;
  const viewportWidth = 736;
  const viewportHeight = 304;

  const lines: Project5ConnectionLine[] = [];

  if (showPreviewCreate) {
    lines.push({
      id: "auto-offscreen-preview",
      sourceX: sourceRight,
      sourceY: OFFSCREEN_SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: OFFSCREEN_NEW_NODE.x - OFFSCREEN_NEW_NODE.width / 2,
      targetY: OFFSCREEN_NEW_NODE.y,
      targetDirection: "left",
      dashed: true,
    });
  }

  if (showCreatedLine) {
    lines.push({
      id: "auto-offscreen-created",
      sourceX: sourceRight,
      sourceY: OFFSCREEN_SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: OFFSCREEN_NEW_NODE.x - OFFSCREEN_NEW_NODE.width / 2,
      targetY: OFFSCREEN_NEW_NODE.y,
      targetDirection: "left",
    });
  }

  return (
    <ConnectionBoard
      lines={lines}
      pointer={pointer}
      usesHandPointer={usesHandPointer}
      label={null}
      overlayChildren={
        <>
          <div
            className="absolute rounded-[28px] border-2 border-[#1f8ef1]/28"
            style={{
              left: `calc(50% - ${BOARD_WIDTH / 2}px + ${viewportLeft}px)`,
              top: `calc(50% - ${BOARD_HEIGHT / 2}px + ${viewportTop}px)`,
              width: viewportWidth,
              height: viewportHeight,
            }}
          />
          <div
            className="absolute rounded-full bg-white/94 px-3 py-1.5 text-xs text-black/68 shadow-sm"
            style={{
              left: `calc(50% - ${BOARD_WIDTH / 2}px + ${viewportLeft}px)`,
              top: `calc(50% - ${BOARD_HEIGHT / 2}px + ${viewportTop}px)`,
            }}
          >
            当前可视区域
          </div>
        </>
      }
    >
      <Node node={OFFSCREEN_SOURCE_NODE} />
      <Node node={OFFSCREEN_TARGET_NODE} />
      {showPreviewNode ? <Node node={OFFSCREEN_NEW_NODE} preview={!showCommittedNode} /> : null}
    </ConnectionBoard>
  );
}

export function Project5AutoTypeComparePanel() {
  const elapsed = useLoopElapsed();
  const sourceRight = SOURCE_NODE.x + SOURCE_NODE.width / 2;
  const idlePointer = { x: 382, y: 224 };
  const controlPoint = { x: sourceRight + 18, y: SOURCE_NODE.y };
  const pointer = getAutoPointer(elapsed, idlePointer, controlPoint);
  const usesHandPointer = elapsed >= 820 && elapsed < 2140;
  const showPreviewCreate = elapsed >= 1180 && elapsed < 1880;
  const showCreatedLine = elapsed >= 1880;
  const showPreviewNode = elapsed >= 1180;
  const showCommittedNode = elapsed >= 1880;
  const viewportProgress = getSegmentProgress(elapsed, 1880, 2600);
  const mismatchViewportScale = lerp(1, 0.9, viewportProgress);
  const mismatchViewportTranslateX = lerp(0, -64, viewportProgress);
  const mismatchViewportTranslateY = lerp(0, -18, viewportProgress);

  const mismatchLines: Project5ConnectionLine[] = [];

  if (showPreviewCreate) {
    mismatchLines.push({
      id: "auto-type-mismatch-preview",
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: COLLISION_NEW_NODE.x - COLLISION_NEW_NODE.width / 2,
      targetY: COLLISION_NEW_NODE.y,
      targetDirection: "left",
      dashed: true,
    });
  }

  if (showCreatedLine) {
    mismatchLines.push({
      id: "auto-type-mismatch-created",
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: COLLISION_NEW_NODE.x - COLLISION_NEW_NODE.width / 2,
      targetY: COLLISION_NEW_NODE.y,
      targetDirection: "left",
    });
  }

  const matchLines: Project5ConnectionLine[] = [];

  if (elapsed >= 1180 && elapsed < 1880) {
    matchLines.push({
      id: "auto-type-match-preview",
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: TARGET_NODE.x - TARGET_NODE.width / 2,
      targetY: TARGET_NODE.y,
      targetDirection: "left",
      dashed: true,
    });
  }

  if (elapsed >= 1880) {
    matchLines.push({
      id: "auto-type-match-connected",
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: TARGET_NODE.x - TARGET_NODE.width / 2,
      targetY: TARGET_NODE.y,
      targetDirection: "left",
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ConnectionBoard
        lines={mismatchLines}
        pointer={pointer}
        usesHandPointer={usesHandPointer}
        label={null}
        contentScale={0.66}
        viewportScale={mismatchViewportScale}
        viewportTranslateX={mismatchViewportTranslateX}
        viewportTranslateY={mismatchViewportTranslateY}
      >
        <Node node={SOURCE_NODE} />
        <Node node={STICKY_TARGET_NODE} />
        {showPreviewNode ? (
          <Node
            node={COLLISION_NEW_NODE}
            preview={!showCommittedNode}
          />
        ) : null}
      </ConnectionBoard>

      <ConnectionBoard
        lines={matchLines}
        pointer={pointer}
        usesHandPointer={usesHandPointer}
        label={null}
        contentScale={0.66}
      >
        <Node node={SOURCE_NODE} />
        <Node node={TARGET_NODE} highlighted={elapsed >= 1180} />
      </ConnectionBoard>
    </div>
  );
}

export default function Project5IntentRecognitionPanel() {
  return <Project5AutoConnectionPanel />;
}

function ConnectionBoard({
  children,
  lines,
  pointer,
  usesHandPointer,
  label,
  contentScale = 1,
  viewportScale = 1,
  viewportTranslateX = 0,
  viewportTranslateY = 0,
  overlayChildren = null,
}: {
  children: ReactNode;
  lines: Project5ConnectionLine[];
  pointer: Point;
  usesHandPointer: boolean;
  label: { x: number; y: number; text: string } | null;
  contentScale?: number;
  viewportScale?: number;
  viewportTranslateX?: number;
  viewportTranslateY?: number;
  overlayChildren?: ReactNode;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[24px] border border-border/20"
      style={{
        ...PROJECT5_CANVAS_STYLE,
        width: "100%",
        minHeight: Math.max(220, BOARD_HEIGHT * contentScale + 44),
      }}
    >
      {overlayChildren}
      <div
        className="absolute left-1/2 top-1/2 origin-center"
        style={{
          width: BOARD_WIDTH,
          height: BOARD_HEIGHT,
          transform: `translate(calc(-50% + ${viewportTranslateX}px), calc(-50% + ${viewportTranslateY}px)) scale(${contentScale * viewportScale})`,
        }}
      >
        <Project5ConnectionLayer width={BOARD_WIDTH} height={BOARD_HEIGHT} lines={lines} />

        {children}

        {label ? (
          <div
            className="absolute rounded-[18px] border border-black/10 bg-white/96 px-4 py-3 text-sm text-black/72 shadow-sm"
            style={{ left: label.x, top: label.y }}
          >
            {label.text}
          </div>
        ) : null}

        <div
          className="pointer-events-none absolute z-20"
          style={{
            left: pointer.x - (usesHandPointer ? HAND_POINTER_HOTSPOT_X : ARROW_POINTER_HOTSPOT_X),
            top: pointer.y - (usesHandPointer ? HAND_POINTER_HOTSPOT_Y : ARROW_POINTER_HOTSPOT_Y),
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
    </div>
  );
}

function Node({
  node,
  highlighted = false,
  preview = false,
}: {
  node: Project5CanvasNode;
  highlighted?: boolean;
  preview?: boolean;
}) {
  return (
    <div
      className="absolute transition-all duration-200 ease-out"
      style={{
        left: node.x - node.width / 2,
        top: node.y - node.height / 2,
        width: node.width,
        height: node.height,
        transform: highlighted ? "scale(1.02)" : "scale(1)",
        filter: "none",
      }}
    >
      <Project5CanvasNodeView node={node} preview={preview} />
    </div>
  );
}

function RightHeatZoneOverlay({
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
      className="pointer-events-none absolute rounded-[28px] border border-dashed border-[#1f8ef1]/42 bg-[#1f8ef1]/8"
      style={{
        left: `calc(50% - ${BOARD_WIDTH / 2}px + ${left}px)`,
        top: `calc(50% - ${BOARD_HEIGHT / 2}px + ${top}px)`,
        width,
        height,
      }}
    />
  );
}

function useLoopElapsed(duration = 3600) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      setElapsed((now - start) % duration);
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [duration]);

  return elapsed;
}

function getManualPointer(
  elapsed: number,
  idlePointer: Point,
  controlPoint: Point,
  dragPath: Point[],
) {
  if (elapsed < 480) return idlePointer;
  if (elapsed < 860) {
    return interpolatePoint(idlePointer, controlPoint, getSegmentProgress(elapsed, 480, 860));
  }
  if (elapsed < 2720) {
    return samplePath(dragPath, getSegmentProgress(elapsed, 860, 2720));
  }
  if (elapsed < 3220) {
    return dragPath[dragPath.length - 1];
  }
  return interpolatePoint(
    dragPath[dragPath.length - 1],
    { x: 654, y: 230 },
    getSegmentProgress(elapsed, 3220, 3600),
  );
}

function getAutoPointer(
  elapsed: number,
  idlePointer: Point,
  controlPoint: Point,
) {
  if (elapsed < 440) return idlePointer;
  if (elapsed < 780) {
    return interpolatePoint(idlePointer, controlPoint, getSegmentProgress(elapsed, 440, 780));
  }
  if (elapsed < 2140) {
    return controlPoint;
  }
  return interpolatePoint(
    controlPoint,
    { x: 654, y: 230 },
    getSegmentProgress(elapsed, 2140, 3600),
  );
}

function getSegmentProgress(elapsed: number, start: number, end: number) {
  if (end <= start) return 1;
  return Math.max(0, Math.min(1, (elapsed - start) / (end - start)));
}

function interpolatePoint(from: Point, to: Point, progress: number) {
  return {
    x: lerp(from.x, to.x, progress),
    y: lerp(from.y, to.y, progress),
  };
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3;
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
