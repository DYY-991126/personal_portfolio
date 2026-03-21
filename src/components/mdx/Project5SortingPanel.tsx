"use client";

import type { ReactNode } from "react";

import type { Project5ConnectionLine } from "./Project5ConnectionLayer";
import Project5ConnectionLayer from "./Project5ConnectionLayer";
import { PROJECT5_CANVAS_STYLE } from "./Project5DemoFrame";
import Project5ShapeTextNode from "./Project5ShapeTextNode";
import type { Project5CanvasNode } from "./Project5CanvasNodeTypes";

const BOARD_WIDTH = 760;
const BOARD_HEIGHT = 400;
const CONTENT_SCALE = 0.68;

const SOURCE_NODE: Project5CanvasNode = {
  id: 1,
  type: "shape-text",
  shapeKind: "process",
  x: 170,
  y: 200,
  width: 196,
  height: 82,
  text: "当前对象",
};

const CHILDREN: Project5CanvasNode[] = [
  {
    id: 2,
    type: "shape-text",
    shapeKind: "process",
    x: 520,
    y: 56,
    width: 196,
    height: 82,
    text: "子节点 B",
  },
  {
    id: 3,
    type: "shape-text",
    shapeKind: "process",
    x: 520,
    y: 154,
    width: 196,
    height: 82,
    text: "子节点 C",
  },
  {
    id: 4,
    type: "shape-text",
    shapeKind: "process",
    x: 520,
    y: 252,
    width: 196,
    height: 82,
    text: "子节点 D",
  },
  {
    id: 5,
    type: "shape-text",
    shapeKind: "process",
    x: 520,
    y: 350,
    width: 196,
    height: 82,
    text: "子节点 E",
  },
] as const;

export function Project5SortingInsertPanel() {
  return <Project5SortingMessyPanel />;
}

export function Project5SortingSpacingPanel() {
  return <Project5SortingNeatPanel />;
}

export function Project5SortingOrderPanel() {
  return <Project5SortingNeatPanel />;
}

export default function Project5SortingPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Project5SortingMessyPanel />
      <Project5SortingNeatPanel />
    </div>
  );
}

function Project5SortingMessyPanel() {
  const sourceRight = SOURCE_NODE.x + SOURCE_NODE.width / 2;
  const targetLeft = CHILDREN[0].x - CHILDREN[0].width / 2;
  const sourceY = SOURCE_NODE.y;
  const messyPaths = [
    `M ${sourceRight} ${sourceY} L 304 ${sourceY} L 304 30 L 392 30 L 392 ${CHILDREN[0].y} L ${targetLeft} ${CHILDREN[0].y}`,
    `M ${sourceRight} ${sourceY} L 332 ${sourceY} L 332 286 L 372 286 L 372 ${CHILDREN[1].y} L ${targetLeft} ${CHILDREN[1].y}`,
    `M ${sourceRight} ${sourceY} L 294 ${sourceY} L 294 110 L 350 110 L 350 ${CHILDREN[2].y} L ${targetLeft} ${CHILDREN[2].y}`,
    `M ${sourceRight} ${sourceY} L 318 ${sourceY} L 318 382 L 406 382 L 406 ${CHILDREN[3].y} L ${targetLeft} ${CHILDREN[3].y}`,
  ];

  return (
    <SortingBoard
      lines={[]}
      overlay={
        <svg
          className="pointer-events-none absolute inset-0 z-[2] overflow-visible"
          width={BOARD_WIDTH}
          height={BOARD_HEIGHT}
          viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
          aria-hidden="true"
        >
          <defs>
            <marker
              id="project5-sorting-arrow"
              markerWidth="12"
              markerHeight="12"
              refX="9.5"
              refY="6"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M 1 1 L 10 6 L 1 11" fill="none" stroke="#111111" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>
          {messyPaths.map((path, index) => (
            <path
              key={`messy-${index}`}
              d={path}
              fill="none"
              stroke="#111111"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd="url(#project5-sorting-arrow)"
            />
          ))}
        </svg>
      }
    >
      <Node node={SOURCE_NODE} />
      {CHILDREN.map((node) => (
        <Node key={node.id} node={node} />
      ))}
    </SortingBoard>
  );
}

function Project5SortingNeatPanel() {
  const lines: Project5ConnectionLine[] = CHILDREN.map((node) => ({
    id: `neat-${node.id}`,
    sourceId: String(SOURCE_NODE.id),
    targetId: String(node.id),
    sourceX: SOURCE_NODE.x + SOURCE_NODE.width / 2,
    sourceY: SOURCE_NODE.y,
    sourceDirection: "right",
    targetX: node.x - node.width / 2,
    targetY: node.y,
    targetDirection: "left",
  }));

  return (
    <SortingBoard lines={lines}>
      <Node node={SOURCE_NODE} />
      {CHILDREN.map((node) => (
        <Node key={node.id} node={node} />
      ))}
    </SortingBoard>
  );
}

function SortingBoard({
  children,
  lines,
  overlay,
}: {
  children: ReactNode;
  lines: Project5ConnectionLine[];
  overlay?: ReactNode;
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
        {overlay ?? <Project5ConnectionLayer width={BOARD_WIDTH} height={BOARD_HEIGHT} lines={lines} />}
        {children}
      </div>
    </div>
  );
}

function Node({ node }: { node: Project5CanvasNode }) {
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
      <Project5ShapeTextNode node={node} />
    </div>
  );
}
