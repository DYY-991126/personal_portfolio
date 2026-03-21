"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";

import Project5ConnectionLayer from "./Project5ConnectionLayer";
import type { Project5ConnectionLine } from "./Project5ConnectionLayer";
import Project5ControlPoint from "./Project5ControlPoint";
import { PROJECT5_CANVAS_STYLE } from "./Project5DemoFrame";
import Project5CanvasNodeView from "./Project5CanvasNodeView";
import Project5StrokeLayer from "./Project5StrokeLayer";
import { createStickyNoteNode, type Project5CanvasNode } from "./Project5CanvasNodeTypes";

const BOARD_WIDTH = 760;
const BOARD_HEIGHT = 340;
const LOOP_DURATION = 3600;
const CONTENT_SCALE = 0.66;
const POINTER_SIZE = 32;
const ARROW_POINTER_HOTSPOT_X = 7;
const ARROW_POINTER_HOTSPOT_Y = 5;
const HAND_POINTER_HOTSPOT_X = 16;
const HAND_POINTER_HOTSPOT_Y = 8;

const SOURCE_NODE: Project5CanvasNode = {
  id: 1,
  type: "shape-text",
  shapeKind: "process",
  x: 200,
  y: 170,
  width: 196,
  height: 82,
  text: "当前对象",
};

const STICKY_BLOCKER_NODE = createStickyNoteNode(3, 520, 170, "已有便签");

const COLLISION_RESOLVED_NODE: Project5CanvasNode = {
  id: 4,
  type: "shape-text",
  shapeKind: "process",
  x: 520,
  y: 286,
  width: 196,
  height: 82,
  text: "新建对象",
};

const NON_COLLISION_NODE: Project5CanvasNode = {
  id: 5,
  type: "shape-text",
  shapeKind: "process",
  x: 520,
  y: 170,
  width: 196,
  height: 82,
  text: "新建对象",
};

type Point = {
  x: number;
  y: number;
};

type CreateSequence = {
  pointer: Point;
  usesHandPointer: boolean;
  showControlPoint: boolean;
  controlPointHovered: boolean;
  controlPointPressed: boolean;
  showPreview: boolean;
  showCommitted: boolean;
};

export function Project5CollisionParticipatingPanel() {
  return <CollisionParticipatingCaseBoard blocker={STICKY_BLOCKER_NODE} />;
}

export function Project5CollisionNonParticipatingPanel() {
  const elapsed = useLoopElapsed();
  const sequence = getCreateSequence(elapsed);
  const sourceRight = SOURCE_NODE.x + SOURCE_NODE.width / 2;
  const targetLeft = NON_COLLISION_NODE.x - NON_COLLISION_NODE.width / 2;

  const lines: Project5ConnectionLine[] = [];

  if (sequence.showPreview) {
    lines.push({
      id: "collision-non-preview",
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: targetLeft,
      targetY: NON_COLLISION_NODE.y,
      targetDirection: "left",
      dashed: true,
    });
  }

  if (sequence.showCommitted) {
    lines.push({
      id: "collision-non-final",
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: targetLeft,
      targetY: NON_COLLISION_NODE.y,
      targetDirection: "left",
    });
  }

  return (
    <CollisionBoard lines={lines} pointer={sequence.pointer} usesHandPointer={sequence.usesHandPointer}>
      <Project5StrokeLayer
        width={BOARD_WIDTH}
        height={BOARD_HEIGHT}
        strokes={[
          {
            id: 1,
            tool: "highlighter",
            points: [
              { x: 334, y: 164 },
              { x: 448, y: 156 },
              { x: 612, y: 166 },
            ],
          },
          {
            id: 2,
            tool: "pencil",
            points: [
              { x: 350, y: 214 },
              { x: 444, y: 244 },
              { x: 620, y: 222 },
            ],
          },
        ]}
      />
      <SourceNodeWithControlPoint
        node={SOURCE_NODE}
        showControlPoint={sequence.showControlPoint}
        controlPointHovered={sequence.controlPointHovered}
        controlPointPressed={sequence.controlPointPressed}
      />
      {sequence.showPreview ? <Node node={NON_COLLISION_NODE} preview={!sequence.showCommitted} /> : null}
    </CollisionBoard>
  );
}

export default function Project5CollisionLogicPanel() {
  return <Project5CollisionParticipatingPanel />;
}

function CollisionParticipatingCaseBoard({
  blocker,
}: {
  blocker: Project5CanvasNode;
}) {
  const elapsed = useLoopElapsed();
  const sequence = getCreateSequence(elapsed);
  const sourceRight = SOURCE_NODE.x + SOURCE_NODE.width / 2;
  const targetLeft = COLLISION_RESOLVED_NODE.x - COLLISION_RESOLVED_NODE.width / 2;

  const lines: Project5ConnectionLine[] = [];

  if (sequence.showPreview) {
    lines.push({
      id: `collision-preview-${blocker.id}`,
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: targetLeft,
      targetY: COLLISION_RESOLVED_NODE.y,
      targetDirection: "left",
      dashed: true,
    });
  }

  if (sequence.showCommitted) {
    lines.push({
      id: `collision-final-${blocker.id}`,
      sourceX: sourceRight,
      sourceY: SOURCE_NODE.y,
      sourceDirection: "right",
      targetX: targetLeft,
      targetY: COLLISION_RESOLVED_NODE.y,
      targetDirection: "left",
    });
  }

  return (
    <CollisionBoard lines={lines} pointer={sequence.pointer} usesHandPointer={sequence.usesHandPointer}>
      <SourceNodeWithControlPoint
        node={SOURCE_NODE}
        showControlPoint={sequence.showControlPoint}
        controlPointHovered={sequence.controlPointHovered}
        controlPointPressed={sequence.controlPointPressed}
      />
      <Node node={blocker} />
      {sequence.showPreview ? <Node node={COLLISION_RESOLVED_NODE} preview={!sequence.showCommitted} /> : null}
    </CollisionBoard>
  );
}

function CollisionBoard({
  children,
  lines,
  pointer,
  usesHandPointer,
}: {
  children: ReactNode;
  lines: Project5ConnectionLine[];
  pointer: Point;
  usesHandPointer: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[24px] border border-border/20"
      style={{
        ...PROJECT5_CANVAS_STYLE,
        width: "100%",
        minHeight: Math.max(240, BOARD_HEIGHT * CONTENT_SCALE + 44),
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 origin-center"
        style={{
          width: BOARD_WIDTH,
          height: BOARD_HEIGHT,
          transform: `translate(-50%, -50%) scale(${CONTENT_SCALE})`,
        }}
      >
        <Project5ConnectionLayer width={BOARD_WIDTH} height={BOARD_HEIGHT} lines={lines} />
        {children}
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

function SourceNodeWithControlPoint({
  node,
  showControlPoint,
  controlPointHovered,
  controlPointPressed,
}: {
  node: Project5CanvasNode;
  showControlPoint: boolean;
  controlPointHovered: boolean;
  controlPointPressed: boolean;
}) {
  return (
    <div
      className="absolute"
      style={{
        left: node.x - node.width / 2,
        top: node.y - node.height / 2,
        width: node.width,
        height: node.height,
      }}
    >
      <Project5CanvasNodeView node={node} />
      {showControlPoint ? (
        <div
          className="transition-transform duration-150 ease-out"
          style={{
            transform: controlPointPressed ? "scale(0.94)" : "scale(1)",
            transformOrigin: `${node.width + 30}px ${node.height / 2}px`,
          }}
        >
          <Project5ControlPoint
            direction="right"
            iconVariant="arrow"
            left={node.width + 16}
            top={node.height / 2 - 14}
            forcedHovered={controlPointHovered}
            onHoverStart={() => {}}
            onHoverEnd={() => {}}
          />
        </div>
      ) : null}
    </div>
  );
}

function Node({
  node,
  preview = false,
}: {
  node: Project5CanvasNode;
  preview?: boolean;
}) {
  return (
    <div
      className="absolute"
      style={{
        left: node.x - node.width / 2,
        top: node.y - node.height / 2,
        width: node.width,
        height: node.height,
      }}
    >
      <Project5CanvasNodeView node={node} preview={preview} />
    </div>
  );
}

function useLoopElapsed(duration = LOOP_DURATION) {
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

function getCreateSequence(elapsed: number): CreateSequence {
  const sourceRight = SOURCE_NODE.x + SOURCE_NODE.width / 2;
  const controlPoint = { x: sourceRight + 30, y: SOURCE_NODE.y };
  const idlePointer = { x: 378, y: 252 };
  const exitPointer = { x: 664, y: 286 };

  if (elapsed < 420) {
    return {
      pointer: idlePointer,
      usesHandPointer: false,
      showControlPoint: false,
      controlPointHovered: false,
      controlPointPressed: false,
      showPreview: false,
      showCommitted: false,
    };
  }

  if (elapsed < 880) {
    return {
      pointer: interpolatePoint(idlePointer, controlPoint, getProgress(elapsed, 420, 880)),
      usesHandPointer: false,
      showControlPoint: true,
      controlPointHovered: false,
      controlPointPressed: false,
      showPreview: false,
      showCommitted: false,
    };
  }

  if (elapsed < 1340) {
    return {
      pointer: controlPoint,
      usesHandPointer: true,
      showControlPoint: true,
      controlPointHovered: true,
      controlPointPressed: false,
      showPreview: false,
      showCommitted: false,
    };
  }

  if (elapsed < 1540) {
    return {
      pointer: controlPoint,
      usesHandPointer: true,
      showControlPoint: true,
      controlPointHovered: true,
      controlPointPressed: true,
      showPreview: false,
      showCommitted: false,
    };
  }

  if (elapsed < 2140) {
    return {
      pointer: controlPoint,
      usesHandPointer: true,
      showControlPoint: true,
      controlPointHovered: true,
      controlPointPressed: false,
      showPreview: true,
      showCommitted: false,
    };
  }

  if (elapsed < 2780) {
    return {
      pointer: interpolatePoint(controlPoint, exitPointer, getProgress(elapsed, 2140, 2780)),
      usesHandPointer: false,
      showControlPoint: false,
      controlPointHovered: false,
      controlPointPressed: false,
      showPreview: true,
      showCommitted: true,
    };
  }

  return {
    pointer: exitPointer,
    usesHandPointer: false,
    showControlPoint: false,
    controlPointHovered: false,
    controlPointPressed: false,
    showPreview: true,
    showCommitted: true,
  };
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
