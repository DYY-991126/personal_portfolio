"use client";

import type {
  Project5CreateOption,
  Project5Direction,
} from "./Project5CanvasNodeTypes";

interface Project5ConnectionLine {
  id: string | number;
  sourceId?: number;
  targetId?: number;
  sourceX: number;
  sourceY: number;
  sourceDirection: Project5Direction;
  targetX: number;
  targetY: number;
  targetDirection: Project5Direction;
  dashed?: boolean;
}

interface Project5ConnectionLayerProps {
  width: number;
  height: number;
  lines: Project5ConnectionLine[];
}

export default function Project5ConnectionLayer({
  width,
  height,
  lines,
}: Project5ConnectionLayerProps) {
  const bundledGroups = buildBundledGroups(lines);

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[2] overflow-visible"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <defs>
        <marker
          id="project5-connection-arrow"
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
      {lines.map((line) => (
        <path
          key={line.id}
          d={buildConnectionPath(line, bundledGroups)}
          fill="none"
          stroke="#111111"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={line.dashed ? "10 8" : undefined}
          markerEnd="url(#project5-connection-arrow)"
          opacity={line.dashed ? 0.52 : 1}
        />
      ))}
    </svg>
  );
}

function buildConnectionPath(
  line: Project5ConnectionLine,
  bundledGroups: Map<string, Project5ConnectionLine[]>,
) {
  const groupKey = getBundledGroupKey(line);
  const bundledGroup = groupKey ? bundledGroups.get(groupKey) : null;

  if (bundledGroup && bundledGroup.length > 1) {
    return buildBundledPath(line, bundledGroup);
  }

  return buildStandardPath(line);
}

function buildStandardPath(line: Project5ConnectionLine) {
  const stubLength = 22;
  const cornerRadius = 26;
  const startStub = offsetPoint(line.sourceX, line.sourceY, line.sourceDirection, stubLength);
  const endStub = offsetPoint(line.targetX, line.targetY, line.targetDirection, stubLength);
  const dx = endStub.x - startStub.x;
  const dy = endStub.y - startStub.y;

  if (Math.abs(dx) < 1 || Math.abs(dy) < 1) {
    return `M ${line.sourceX} ${line.sourceY} L ${startStub.x} ${startStub.y} L ${endStub.x} ${endStub.y} L ${line.targetX} ${line.targetY}`;
  }

  if (Math.abs(dx) >= Math.abs(dy)) {
    const midX = startStub.x + dx / 2;
    const firstTurn = {
      x: midX,
      y: startStub.y,
    };
    const secondTurn = {
      x: midX,
      y: endStub.y,
    };

    return buildRoundedPath(
      [
        { x: line.sourceX, y: line.sourceY },
        startStub,
        firstTurn,
        secondTurn,
        endStub,
        { x: line.targetX, y: line.targetY },
      ],
      cornerRadius,
    );
  }

  const midY = startStub.y + dy / 2;

  return buildRoundedPath(
    [
      { x: line.sourceX, y: line.sourceY },
      startStub,
      { x: startStub.x, y: midY },
      { x: endStub.x, y: midY },
      endStub,
      { x: line.targetX, y: line.targetY },
    ],
    cornerRadius,
  );
}

function buildBundledPath(line: Project5ConnectionLine, group: Project5ConnectionLine[]) {
  const sortedGroup = [...group].sort((left, right) => {
    if (line.sourceDirection === "left" || line.sourceDirection === "right") {
      return left.targetY - right.targetY;
    }

    return left.targetX - right.targetX;
  });

  const primarySign =
    line.sourceDirection === "right" || line.sourceDirection === "bottom" ? 1 : -1;
  const startStub = offsetPoint(line.sourceX, line.sourceY, line.sourceDirection, 24);
  const endStub = offsetPoint(line.targetX, line.targetY, line.targetDirection, 24);

  if (line.sourceDirection === "left" || line.sourceDirection === "right") {
    const horizontalDistances = sortedGroup.map((item) => Math.abs(item.targetX - line.sourceX));
    const minDistance = Math.max(72, Math.min(...horizontalDistances));
    const spineX = line.sourceX + primarySign * Math.max(72, minDistance * 0.42);
    const targetLaneX = line.targetX - primarySign * 34;

    return buildRoundedPath(
      [
        { x: line.sourceX, y: line.sourceY },
        startStub,
        { x: spineX, y: startStub.y },
        { x: spineX, y: line.targetY },
        { x: targetLaneX, y: line.targetY },
        endStub,
        { x: line.targetX, y: line.targetY },
      ],
      22,
    );
  }

  const verticalDistances = sortedGroup.map((item) => Math.abs(item.targetY - line.sourceY));
  const minDistance = Math.max(72, Math.min(...verticalDistances));
  const spineY = line.sourceY + primarySign * Math.max(72, minDistance * 0.42);
  const targetLaneY = line.targetY - primarySign * 34;

  return buildRoundedPath(
    [
      { x: line.sourceX, y: line.sourceY },
      startStub,
      { x: startStub.x, y: spineY },
      { x: line.targetX, y: spineY },
      { x: line.targetX, y: targetLaneY },
      endStub,
      { x: line.targetX, y: line.targetY },
    ],
    22,
  );
}

function offsetPoint(x: number, y: number, direction: Project5Direction, distance: number) {
  if (direction === "top") {
    return { x, y: y - distance };
  }

  if (direction === "right") {
    return { x: x + distance, y };
  }

  if (direction === "bottom") {
    return { x, y: y + distance };
  }

  return { x: x - distance, y };
}

function buildRoundedPath(points: Array<{ x: number; y: number }>, radius: number) {
  if (points.length < 2) {
    return "";
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length - 1; index += 1) {
    const prev = points[index - 1];
    const current = points[index];
    const next = points[index + 1];
    const prevDistance = Math.hypot(current.x - prev.x, current.y - prev.y);
    const nextDistance = Math.hypot(next.x - current.x, next.y - current.y);
    const effectiveRadius = Math.min(radius, prevDistance / 2, nextDistance / 2);

    if (effectiveRadius < 1) {
      path += ` L ${current.x} ${current.y}`;
      continue;
    }

    const start = moveToward(current, prev, effectiveRadius);
    const end = moveToward(current, next, effectiveRadius);

    path += ` L ${start.x} ${start.y}`;
    path += ` Q ${current.x} ${current.y} ${end.x} ${end.y}`;
  }

  const lastPoint = points[points.length - 1];
  path += ` L ${lastPoint.x} ${lastPoint.y}`;

  return path;
}

function moveToward(from: { x: number; y: number }, to: { x: number; y: number }, distance: number) {
  const total = Math.hypot(to.x - from.x, to.y - from.y);

  if (total === 0) {
    return from;
  }

  const ratio = distance / total;

  return {
    x: from.x + (to.x - from.x) * ratio,
    y: from.y + (to.y - from.y) * ratio,
  };
}

function getBundledGroupKey(line: Project5ConnectionLine) {
  if (line.dashed || line.sourceId === undefined) {
    return null;
  }

  return `${line.sourceId}:${line.sourceDirection}`;
}

function buildBundledGroups(lines: Project5ConnectionLine[]) {
  const groups = new Map<string, Project5ConnectionLine[]>();

  lines.forEach((line) => {
    const key = getBundledGroupKey(line);

    if (!key) {
      return;
    }

    const existingGroup = groups.get(key) ?? [];
    existingGroup.push(line);
    groups.set(key, existingGroup);
  });

  return groups;
}

export function getCreateOptionLabel(option: Project5CreateOption) {
  if (option.type === "sticky-note") {
    return "便签";
  }

  if (option.shapeKind === "start") {
    return "开始";
  }

  if (option.shapeKind === "decision") {
    return "判断";
  }

  if (option.shapeKind === "database") {
    return "数据库";
  }

  return "流程";
}
