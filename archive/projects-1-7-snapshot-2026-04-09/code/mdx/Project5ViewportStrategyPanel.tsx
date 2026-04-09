"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import Project5ConnectionLayer from "./Project5ConnectionLayer";
import type { Project5ConnectionLine } from "./Project5ConnectionLayer";
import Project5ControlPoint from "./Project5ControlPoint";
import { PROJECT5_CANVAS_STYLE } from "./Project5DemoFrame";
import Project5ShapeTextNode from "./Project5ShapeTextNode";
import type { Project5CanvasNode } from "./Project5CanvasNodeTypes";

const BOARD_HEIGHT = 340;
const CYCLE_DURATION = 3600;
const SCENE_WIDTH = 1180;
const SCENE_HEIGHT = 1560;
const POINTER_SIZE = 32;
const ARROW_POINTER_HOTSPOT_X = 7;
const ARROW_POINTER_HOTSPOT_Y = 5;
const HAND_POINTER_HOTSPOT_X = 16;
const HAND_POINTER_HOTSPOT_Y = 8;
const POINTER_MOVE_START = 420;
const POINTER_MOVE_END = 920;
const POINTER_PRESS_END = 1080;
const CREATE_PREVIEW_END = 1300;
const CREATE_COMMIT_END = 1500;
const VIEWPORT_PAN_END = 2100;
const VIEWPORT_ZOOM_END = 2660;

const SOURCE_NODE: Project5CanvasNode = {
  id: 1,
  type: "shape-text",
  shapeKind: "process",
  x: 150,
  y: 288,
  width: 196,
  height: 82,
  text: "原节点 A",
};

const CHILD_A: Project5CanvasNode = {
  id: 2,
  type: "shape-text",
  shapeKind: "process",
  x: 540,
  y: 60,
  width: 196,
  height: 82,
  text: "子节点 B",
};

const CHILD_B: Project5CanvasNode = {
  id: 3,
  type: "shape-text",
  shapeKind: "process",
  x: 540,
  y: 172,
  width: 196,
  height: 82,
  text: "子节点 C",
};

const CHILD_C: Project5CanvasNode = {
  id: 4,
  type: "shape-text",
  shapeKind: "process",
  x: 540,
  y: 284,
  width: 196,
  height: 82,
  text: "子节点 D",
};

const CHILD_D: Project5CanvasNode = {
  id: 5,
  type: "shape-text",
  shapeKind: "process",
  x: 540,
  y: 396,
  width: 196,
  height: 82,
  text: "子节点 E",
};

const NEW_NODE: Project5CanvasNode = {
  id: 6,
  type: "shape-text",
  shapeKind: "process",
  x: 540,
  y: 508,
  width: 196,
  height: 82,
  text: "新节点 F",
};

export function Project5ViewportAllNodesPanel() {
  const sequence = useViewportCreateSequence();
  const panProgress = getProgress(sequence.elapsed, CREATE_COMMIT_END, VIEWPORT_PAN_END);
  const zoomProgress = getProgress(sequence.elapsed, VIEWPORT_PAN_END - 180, VIEWPORT_ZOOM_END);
  const scale = lerp(1, 0.62, zoomProgress);
  const translateX = lerp(0, 8, panProgress);
  const translateY = lerp(0, -12, panProgress);
  const zoomPercent = Math.round(scale * 100);

  const lines: Project5ConnectionLine[] = [
    createLine(SOURCE_NODE, CHILD_A, "all-ab"),
    createLine(SOURCE_NODE, CHILD_B, "all-ac"),
    createLine(SOURCE_NODE, CHILD_C, "all-ad"),
    createLine(SOURCE_NODE, CHILD_D, "all-ae"),
  ];

  if (sequence.showNewPreview || sequence.showNewCommitted) {
    lines.push({
      ...createLine(SOURCE_NODE, NEW_NODE, "all-af"),
      dashed: !sequence.showNewCommitted,
    });
  }

  return (
    <ViewportBoard>
      <div className="absolute left-5 top-5 z-20 rounded-full bg-white/94 px-3 py-1.5 text-xs text-black/62 shadow-sm">
        画布缩放 {zoomPercent}%
      </div>

      <div
        className="absolute left-0 top-0 origin-top-left transition-transform duration-300 ease-out"
        style={{
          width: SCENE_WIDTH,
          height: SCENE_HEIGHT,
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
        }}
      >
        <Project5ConnectionLayer width={SCENE_WIDTH} height={SCENE_HEIGHT} lines={lines} />

        <SourceNodeWithControlPoint
          showControlPoint={sequence.showControlPoint}
          controlPointHovered={sequence.controlPointHovered}
          controlPointPressed={sequence.controlPointPressed}
        />

        <Node node={CHILD_A} />
        <Node node={CHILD_B} />
        <Node node={CHILD_C} />
        <Node node={CHILD_D} />
        {sequence.showNewPreview ? (
          <Node node={NEW_NODE} preview opacity={0.22 + sequence.previewProgress * 0.56} />
        ) : null}
        {sequence.showNewCommitted ? (
          <Node node={NEW_NODE} opacity={0.28 + sequence.commitProgress * 0.72} />
        ) : null}
      </div>

      <ViewportPointer sequence={sequence} />
    </ViewportBoard>
  );
}

export function Project5ViewportParentChildPanel() {
  const sequence = useViewportCreateSequence();
  const panProgress = getProgress(sequence.elapsed, CREATE_COMMIT_END, VIEWPORT_PAN_END);
  const zoomProgress = getProgress(sequence.elapsed, VIEWPORT_PAN_END - 180, VIEWPORT_ZOOM_END);
  const scale = lerp(1, 0.58, zoomProgress);
  const translateX = lerp(0, 2, panProgress);
  const translateY = lerp(0, -78, panProgress);
  const zoomPercent = Math.round(scale * 100);
  const extraChildA: Project5CanvasNode = {
    id: 7,
    type: "shape-text",
    shapeKind: "process",
    x: 540,
    y: -52,
    width: 196,
    height: 82,
    text: "子节点 B1",
  };
  const extraChildB: Project5CanvasNode = {
    id: 8,
    type: "shape-text",
    shapeKind: "process",
    x: 540,
    y: 620,
    width: 196,
    height: 82,
    text: "子节点 E1",
  };
  const siblings = [
    extraChildA,
    CHILD_A,
    CHILD_B,
    CHILD_C,
    CHILD_D,
    extraChildB,
  ];

  const lines: Project5ConnectionLine[] = siblings.map((node) =>
    createLine(SOURCE_NODE, node, `pair-${node.id}`),
  );

  if (sequence.showNewPreview || sequence.showNewCommitted) {
    lines.push({
      ...createLine(SOURCE_NODE, NEW_NODE, "pair-af"),
      dashed: !sequence.showNewCommitted,
    });
  }

  return (
    <ViewportBoard>
      <div className="absolute left-5 top-5 z-20 rounded-full bg-white/94 px-3 py-1.5 text-xs text-black/62 shadow-sm">
        画布缩放 {zoomPercent}%
      </div>

      <div
        className="absolute left-0 top-0 origin-top-left transition-transform duration-300 ease-out"
        style={{
          width: SCENE_WIDTH,
          height: SCENE_HEIGHT,
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
        }}
      >
        <Project5ConnectionLayer width={SCENE_WIDTH} height={SCENE_HEIGHT} lines={lines} />

        <SourceNodeWithControlPoint
          showControlPoint={sequence.showControlPoint}
          controlPointHovered={sequence.controlPointHovered}
          controlPointPressed={sequence.controlPointPressed}
        />

        {siblings.map((node) => (
          <Node key={node.id} node={node} />
        ))}
        {sequence.showNewPreview ? (
          <Node node={NEW_NODE} preview opacity={0.22 + sequence.previewProgress * 0.56} />
        ) : null}
        {sequence.showNewCommitted ? (
          <Node node={NEW_NODE} opacity={0.28 + sequence.commitProgress * 0.72} />
        ) : null}
      </div>

      <ViewportPointer sequence={sequence} />
    </ViewportBoard>
  );
}

export function Project5ViewportNewNodeFocusPanel() {
  const sequence = useViewportCreateSequence();
  const panProgress = getProgress(sequence.elapsed, CREATE_COMMIT_END, VIEWPORT_PAN_END);
  const zoomProgress = getProgress(sequence.elapsed, VIEWPORT_PAN_END - 180, VIEWPORT_ZOOM_END);
  const scale = lerp(1, 0.92, zoomProgress);
  const translateX = lerp(0, -236, panProgress);
  const translateY = lerp(0, -1036, panProgress);
  const zoomPercent = Math.round(scale * 100);
  const farChildA: Project5CanvasNode = {
    id: 11,
    type: "shape-text",
    shapeKind: "process",
    x: 760,
    y: -280,
    width: 196,
    height: 82,
    text: "子节点 B1",
  };
  const farChildB: Project5CanvasNode = {
    id: 12,
    type: "shape-text",
    shapeKind: "process",
    x: 760,
    y: -20,
    width: 196,
    height: 82,
    text: "子节点 B2",
  };
  const farChildC: Project5CanvasNode = {
    id: 13,
    type: "shape-text",
    shapeKind: "process",
    x: 760,
    y: 240,
    width: 196,
    height: 82,
    text: "子节点 C",
  };
  const farChildD: Project5CanvasNode = {
    id: 14,
    type: "shape-text",
    shapeKind: "process",
    x: 760,
    y: 500,
    width: 196,
    height: 82,
    text: "子节点 D",
  };
  const farChildE: Project5CanvasNode = {
    id: 15,
    type: "shape-text",
    shapeKind: "process",
    x: 760,
    y: 760,
    width: 196,
    height: 82,
    text: "子节点 E",
  };
  const farNewNode: Project5CanvasNode = {
    id: 16,
    type: "shape-text",
    shapeKind: "process",
    x: 760,
    y: 1320,
    width: 196,
    height: 82,
    text: "新节点 F",
  };
  const farSiblings = [farChildA, farChildB, farChildC, farChildD, farChildE];

  const lines: Project5ConnectionLine[] = farSiblings.map((node) =>
    createLine(SOURCE_NODE, node, `focus-${node.id}`),
  );

  if (sequence.showNewPreview || sequence.showNewCommitted) {
    lines.push({
      ...createLine(SOURCE_NODE, farNewNode, "focus-af"),
      dashed: !sequence.showNewCommitted,
    });
  }

  return (
    <ViewportBoard>
      <div className="absolute left-5 top-5 z-20 rounded-full bg-white/94 px-3 py-1.5 text-xs text-black/62 shadow-sm">
        画布缩放 {zoomPercent}%
      </div>

      <div
        className="absolute left-0 top-0 origin-top-left transition-transform duration-300 ease-out"
        style={{
          width: SCENE_WIDTH,
          height: SCENE_HEIGHT,
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
        }}
      >
        <Project5ConnectionLayer width={SCENE_WIDTH} height={SCENE_HEIGHT} lines={lines} />

        <SourceNodeWithControlPoint
          showControlPoint={sequence.showControlPoint}
          controlPointHovered={sequence.controlPointHovered}
          controlPointPressed={sequence.controlPointPressed}
        />

        {farSiblings.map((node) => (
          <Node key={node.id} node={node} />
        ))}
        <Node node={SOURCE_NODE} />
        {sequence.showNewPreview ? (
          <Node node={farNewNode} preview opacity={0.22 + sequence.previewProgress * 0.56} />
        ) : null}
        {sequence.showNewCommitted ? (
          <Node node={farNewNode} opacity={0.28 + sequence.commitProgress * 0.72} />
        ) : null}
      </div>

      <ViewportPointer sequence={sequence} />
    </ViewportBoard>
  );
}

export default function Project5ViewportStrategyPanel() {
  return <Project5ViewportAllNodesPanel />;
}

function ViewportBoard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[24px] border border-border/20"
      style={{ ...PROJECT5_CANVAS_STYLE, width: "100%", minHeight: BOARD_HEIGHT }}
    >
      {children}
    </div>
  );
}

function SourceNodeWithControlPoint({
  showControlPoint,
  controlPointHovered,
  controlPointPressed,
}: {
  showControlPoint: boolean;
  controlPointHovered: boolean;
  controlPointPressed: boolean;
}) {
  return (
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
  );
}

function ViewportPointer({
  sequence,
}: {
  sequence: ReturnType<typeof useViewportCreateSequence>;
}) {
  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{
        left:
          sequence.pointer.x -
          (sequence.usesHandPointer ? HAND_POINTER_HOTSPOT_X : ARROW_POINTER_HOTSPOT_X),
        top:
          sequence.pointer.y -
          (sequence.usesHandPointer ? HAND_POINTER_HOTSPOT_Y : ARROW_POINTER_HOTSPOT_Y),
        transform: sequence.controlPointPressed
          ? `scale(${1 - sequence.pressProgress * 0.06})`
          : "scale(1)",
      }}
    >
      <Image
        src={sequence.usesHandPointer ? "/cursor/Pointer.png" : "/cursor/Arrow.png"}
        alt=""
        aria-hidden="true"
        width={POINTER_SIZE}
        height={POINTER_SIZE}
        draggable={false}
        priority
      />
    </div>
  );
}

function Node({
  node,
  preview = false,
  faded = false,
  opacity = 1,
}: {
  node: Project5CanvasNode;
  preview?: boolean;
  faded?: boolean;
  opacity?: number;
}) {
  return (
    <div
      className="absolute transition-all duration-300 ease-out"
      style={{
        left: node.x - node.width / 2,
        top: node.y - node.height / 2,
        width: node.width,
        height: node.height,
        opacity: faded ? opacity * 0.55 : opacity,
        transform: preview ? "scale(0.99)" : "scale(1)",
      }}
    >
      <Project5ShapeTextNode node={node} preview={preview} />
    </div>
  );
}

function useLoopedElapsed() {
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

  return elapsed;
}

function useViewportCreateSequence() {
  const elapsed = useLoopedElapsed();
  const idlePointer = { x: 346, y: 372 };
  const controlPoint = {
    x: SOURCE_NODE.x + SOURCE_NODE.width / 2 + 18,
    y: SOURCE_NODE.y,
  };
  const moveProgress = getProgress(elapsed, POINTER_MOVE_START, POINTER_MOVE_END);
  const pressProgress = getProgress(elapsed, POINTER_MOVE_END, POINTER_PRESS_END);
  const previewProgress = getProgress(elapsed, POINTER_PRESS_END, CREATE_PREVIEW_END);
  const commitProgress = getProgress(elapsed, CREATE_PREVIEW_END, CREATE_COMMIT_END);

  return {
    elapsed,
    pressProgress,
    previewProgress,
    commitProgress,
    pointer: interpolatePoint(idlePointer, controlPoint, moveProgress),
    usesHandPointer: elapsed >= POINTER_MOVE_START && elapsed < POINTER_PRESS_END,
    showControlPoint: elapsed >= 520,
    controlPointHovered: elapsed >= 760 && elapsed < POINTER_PRESS_END,
    controlPointPressed: elapsed >= POINTER_MOVE_END && elapsed < POINTER_PRESS_END,
    showNewPreview: elapsed >= POINTER_PRESS_END && elapsed < CREATE_PREVIEW_END,
    showNewCommitted: elapsed >= CREATE_PREVIEW_END,
  };
}

function getProgress(elapsed: number, start: number, end: number) {
  if (end <= start) return 1;
  return Math.max(0, Math.min(1, (elapsed - start) / (end - start)));
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function interpolatePoint(
  from: { x: number; y: number },
  to: { x: number; y: number },
  progress: number,
) {
  return {
    x: lerp(from.x, to.x, progress),
    y: lerp(from.y, to.y, progress),
  };
}

function createLine(source: Project5CanvasNode, target: Project5CanvasNode, id: string) {
  return {
    id,
    sourceId: source.id,
    targetId: target.id,
    sourceX: source.x + source.width / 2,
    sourceY: source.y,
    sourceDirection: "right" as const,
    targetX: target.x - target.width / 2,
    targetY: target.y,
    targetDirection: "left" as const,
  };
}
