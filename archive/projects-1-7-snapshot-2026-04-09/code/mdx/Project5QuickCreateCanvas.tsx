"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Project5CanvasBoard from "./Project5CanvasBoard";
import Project5CanvasNodeView from "./Project5CanvasNodeView";
import Project5ConnectionLayer from "./Project5ConnectionLayer";
import type { Project5ConnectionLine } from "./Project5ConnectionLayer";
import Project5ControlPoint from "./Project5ControlPoint";
import Project5FloatingToolbar from "./Project5FloatingToolbar";
import Project5HeatZone from "./Project5HeatZone";
import Project5MarqueeSelection from "./Project5MarqueeSelection";
import Project5SelectionFrame, {
  type Project5ResizeHandle,
} from "./Project5SelectionFrame";
import Project5ShapeCreatePanel from "./Project5ShapeCreatePanel";
import Project5StrokeLayer, { type Project5Stroke } from "./Project5StrokeLayer";
import {
  PROJECT5_SHAPE_DEFAULT_SIZE,
  PROJECT5_STICKY_NOTE_SIZE,
  createShapeTextNode,
  createStickyNoteNode,
  type Project5CanvasNode,
  type Project5CreateOption,
  type Project5Direction,
} from "./Project5CanvasNodeTypes";

interface MoveInteraction {
  mode: "move";
  nodeIds: number[];
  pointerStartX: number;
  pointerStartY: number;
  initialPositions: Array<{
    id: number;
    x: number;
    y: number;
  }>;
}

interface ResizeInteraction {
  mode: "resize";
  id: number;
  handle: Project5ResizeHandle;
  anchorX: number;
  anchorY: number;
  aspectRatio: number;
}

interface MarqueeInteraction {
  mode: "marquee";
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface ConnectionTarget {
  nodeId: number;
  direction: Project5Direction;
  x: number;
  y: number;
}

interface ConnectionInteraction {
  mode: "connection";
  sourceId: number;
  sourceDirection: Project5Direction;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  hasMoved: boolean;
  snappedTarget: ConnectionTarget | null;
}

interface DrawInteraction {
  mode: "draw";
  strokeId: number;
  tool: "pencil" | "highlighter";
}

interface Project5Connection {
  id: number;
  sourceId: number;
  sourceDirection: Project5Direction;
  targetId: number;
  targetDirection: Project5Direction;
}

interface ShapePickerState {
  sourceId: number;
  sourceDirection: Project5Direction;
  worldX: number;
  worldY: number;
  panelLeft: number;
  panelTop: number;
  hoveredOption: Project5CreateOption;
}

interface AutoConnectTarget {
  node: Project5CanvasNode;
  targetDirection: Project5Direction;
  anchorX: number;
  anchorY: number;
  score: number;
}

type InteractionState =
  | MoveInteraction
  | ResizeInteraction
  | MarqueeInteraction
  | ConnectionInteraction
  | DrawInteraction;

const CANVAS_HEIGHT = 3200;
const CANVAS_WIDTH = 4800;
const CREATE_GAP = 32;
const CONTROL_POINT_OFFSET = 16;
const MIN_NODE_WIDTH = 120;
const MIN_NODE_HEIGHT = 72;
const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.7;
const MAX_ZOOM = 1.8;
const VIEWPORT_PADDING = 32;
const CONNECTION_SNAP_DISTANCE = 26;
const CONNECTION_DRAG_THRESHOLD = 8;
const PANEL_WIDTH = 272;
const PANEL_HEIGHT = 152;
const GROUP_VISIBILITY_MIN_ZOOM = 0.84;
const PAIR_VISIBILITY_MIN_ZOOM = 0.74;
const AUTO_CONNECT_MAX_DISTANCE = 360;

const SHAPE_PICKER_OPTIONS: Project5CreateOption[] = [
  { type: "shape-text", shapeKind: "process" },
  { type: "shape-text", shapeKind: "start" },
  { type: "shape-text", shapeKind: "decision" },
  { type: "shape-text", shapeKind: "database" },
  { type: "sticky-note" },
];

type PendingEditSeed = {
  nodeId: number;
  value: string;
};

type InheritedCreateTargets = Record<string, number>;
type CanvasToolbarTool = "sticky-note" | "shape-text" | "pencil" | "highlighter";
type Project5StrokeBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function clampNodeCenter(x: number, y: number, width: number, height: number) {
  return {
    x: clamp(x, width / 2 + 24, CANVAS_WIDTH - width / 2 - 24),
    y: clamp(y, height / 2 + 24, CANVAS_HEIGHT - height / 2 - 24),
  };
}

function isNodeOverlapping(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  otherNode: Project5CanvasNode,
  gap = CREATE_GAP,
) {
  const horizontalDistance = Math.abs(centerX - otherNode.x);
  const verticalDistance = Math.abs(centerY - otherNode.y);
  const minimumHorizontal = width / 2 + otherNode.width / 2 + gap;
  const minimumVertical = height / 2 + otherNode.height / 2 + gap;

  return horizontalDistance < minimumHorizontal && verticalDistance < minimumVertical;
}

function isTextEditableNode(node: Project5CanvasNode) {
  return node.type === "sticky-note" || node.type === "shape-text";
}

function supportsCollisionAvoidance(node: Project5CanvasNode) {
  return node.type === "sticky-note" || node.type === "shape-text";
}

function supportsQuickCreateControls(node: Project5CanvasNode) {
  return node.type === "sticky-note" || node.type === "shape-text";
}

function getToolbarCreateOption(tool: CanvasToolbarTool): Project5CreateOption | null {
  if (tool === "sticky-note") {
    return { type: "sticky-note" };
  }

  if (tool === "shape-text") {
    return { type: "shape-text", shapeKind: "process" };
  }

  return null;
}

function getIntersectingNodeIds(
  nodes: Project5CanvasNode[],
  left: number,
  top: number,
  right: number,
  bottom: number,
) {
  return nodes
    .filter((node) => {
      const nodeLeft = node.x - node.width / 2;
      const nodeRight = node.x + node.width / 2;
      const nodeTop = node.y - node.height / 2;
      const nodeBottom = node.y + node.height / 2;

      return !(
        nodeRight < left ||
        nodeLeft > right ||
        nodeBottom < top ||
        nodeTop > bottom
      );
    })
    .map((node) => node.id);
}

function getStrokeScreenWidth(stroke: Project5Stroke) {
  return stroke.tool === "highlighter" ? 22 : 3.2;
}

function getStrokeBounds(stroke: Project5Stroke): Project5StrokeBounds {
  const strokeWidth = getStrokeScreenWidth(stroke);
  const padding = strokeWidth / 2 + 8;
  const xs = stroke.points.map((point) => point.x);
  const ys = stroke.points.map((point) => point.y);
  const fallbackPoint = stroke.points[0] ?? { x: 0, y: 0 };
  const minX = xs.length > 0 ? Math.min(...xs) : fallbackPoint.x;
  const maxX = xs.length > 0 ? Math.max(...xs) : fallbackPoint.x;
  const minY = ys.length > 0 ? Math.min(...ys) : fallbackPoint.y;
  const maxY = ys.length > 0 ? Math.max(...ys) : fallbackPoint.y;

  return {
    left: minX - padding,
    top: minY - padding,
    right: maxX + padding,
    bottom: maxY + padding,
  };
}

function isStrokeIntersectingRect(
  stroke: Project5Stroke,
  left: number,
  top: number,
  right: number,
  bottom: number,
) {
  const bounds = getStrokeBounds(stroke);

  return !(
    bounds.right < left ||
    bounds.left > right ||
    bounds.bottom < top ||
    bounds.top > bottom
  );
}

function isPointInStrokeBounds(stroke: Project5Stroke, point: { x: number; y: number }) {
  const bounds = getStrokeBounds(stroke);

  return (
    point.x >= bounds.left &&
    point.x <= bounds.right &&
    point.y >= bounds.top &&
    point.y <= bounds.bottom
  );
}

function getBranchVisibilityNodes(
  sourceNode: Project5CanvasNode,
  newNode: Project5CanvasNode,
  nodes: Project5CanvasNode[],
  connections: Project5Connection[],
) {
  const visibleNodes = new Map<number, Project5CanvasNode>();

  visibleNodes.set(sourceNode.id, sourceNode);
  visibleNodes.set(newNode.id, newNode);

  connections.forEach((connection) => {
    if (connection.sourceId !== sourceNode.id) {
      return;
    }

    const targetNode = nodes.find((node) => node.id === connection.targetId);

    if (targetNode) {
      visibleNodes.set(targetNode.id, targetNode);
    }
  });

  return Array.from(visibleNodes.values());
}

function getNodesBounds(visibleNodes: Project5CanvasNode[]) {
  return {
    left: Math.min(...visibleNodes.map((node) => node.x - node.width / 2)),
    top: Math.min(...visibleNodes.map((node) => node.y - node.height / 2)),
    right: Math.max(...visibleNodes.map((node) => node.x + node.width / 2)),
    bottom: Math.max(...visibleNodes.map((node) => node.y + node.height / 2)),
  };
}

function getNodeConnectionPoint(node: Project5CanvasNode, direction: Project5Direction) {
  if (direction === "top") {
    return { x: node.x, y: node.y - node.height / 2 };
  }

  if (direction === "right") {
    return { x: node.x + node.width / 2, y: node.y };
  }

  if (direction === "bottom") {
    return { x: node.x, y: node.y + node.height / 2 };
  }

  return { x: node.x - node.width / 2, y: node.y };
}

function getOppositeDirection(direction: Project5Direction): Project5Direction {
  if (direction === "top") {
    return "bottom";
  }

  if (direction === "right") {
    return "left";
  }

  if (direction === "bottom") {
    return "top";
  }

  return "right";
}

function getDominantDirection(fromX: number, fromY: number, toX: number, toY: number): Project5Direction {
  const dx = toX - fromX;
  const dy = toY - fromY;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? "right" : "left";
  }

  return dy >= 0 ? "bottom" : "top";
}

function getQuickCreateCenter(source: Project5CanvasNode, direction: Project5Direction, width: number, height: number) {
  const rawX =
    direction === "left"
      ? source.x - source.width / 2 - CREATE_GAP - width / 2
      : direction === "right"
        ? source.x + source.width / 2 + CREATE_GAP + width / 2
        : source.x;
  const rawY =
    direction === "top"
      ? source.y - source.height / 2 - CREATE_GAP - height / 2
      : direction === "bottom"
        ? source.y + source.height / 2 + CREATE_GAP + height / 2
        : source.y;

  return clampNodeCenter(rawX, rawY, width, height);
}

function createNodeFromOption(
  id: number,
  centerX: number,
  centerY: number,
  option: Project5CreateOption,
  sourceNode?: Project5CanvasNode,
) {
  if (option.type === "sticky-note") {
    return createStickyNoteNode(id, centerX, centerY, "输入文本");
  }

  const baseNode = createShapeTextNode(id, centerX, centerY, option.shapeKind, "输入文本");

  if (
    sourceNode &&
    sourceNode.type === "shape-text" &&
    sourceNode.shapeKind === option.shapeKind
  ) {
    return {
      ...baseNode,
      width: sourceNode.width,
      height: sourceNode.height,
    };
  }

  return baseNode;
}

function getNodeSizeForOption(option: Project5CreateOption, sourceNode?: Project5CanvasNode) {
  if (option.type === "sticky-note") {
    return PROJECT5_STICKY_NOTE_SIZE;
  }

  if (
    sourceNode &&
    sourceNode.type === "shape-text" &&
    sourceNode.shapeKind === option.shapeKind
  ) {
    return {
      width: sourceNode.width,
      height: sourceNode.height,
    };
  }

  return PROJECT5_SHAPE_DEFAULT_SIZE[option.shapeKind];
}

function getDefaultShapeOption(node: Project5CanvasNode): Project5CreateOption {
  if (node.type === "shape-text") {
    return {
      type: "shape-text",
      shapeKind: node.shapeKind ?? "process",
    };
  }

  return { type: "shape-text", shapeKind: "process" };
}

function normalizeNodeText(value: string) {
  return value.trim() || "输入文本";
}

function getInheritedTargetKey(sourceId: number, direction: Project5Direction) {
  return `${sourceId}:${direction}`;
}

function isTypingShortcutCandidate(event: KeyboardEvent) {
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return false;
  }

  return event.key.length === 1;
}

function isPairAlreadyConnected(
  connections: Project5Connection[],
  sourceId: number,
  targetId: number,
) {
  return connections.some(
    (connection) =>
      (connection.sourceId === sourceId && connection.targetId === targetId) ||
      (connection.sourceId === targetId && connection.targetId === sourceId),
  );
}

function findSnapTarget(
  nodes: Project5CanvasNode[],
  sourceId: number,
  worldPoint: { x: number; y: number },
  canvasZoom: number,
) {
  const maxDistance = CONNECTION_SNAP_DISTANCE / canvasZoom;
  let bestTarget: ConnectionTarget | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  nodes.forEach((node) => {
    if (node.id === sourceId) {
      return;
    }

    (["top", "right", "bottom", "left"] as Project5Direction[]).forEach((direction) => {
      const anchor = getNodeConnectionPoint(node, direction);
      const distance = Math.hypot(anchor.x - worldPoint.x, anchor.y - worldPoint.y);

      if (distance <= maxDistance && distance < bestDistance) {
        bestTarget = {
          nodeId: node.id,
          direction,
          x: anchor.x,
          y: anchor.y,
        };
        bestDistance = distance;
      }
    });
  });

  return bestTarget;
}

export default function Project5QuickCreateCanvas() {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasCenteredInitialViewRef = useRef(false);
  const ignoreNextCanvasClickRef = useRef(false);
  const zoomTargetRef = useRef(1);
  const zoomAnimationRef = useRef<number | null>(null);

  const [nodes, setNodes] = useState<Project5CanvasNode[]>([
    createStickyNoteNode(1, CANVAS_WIDTH / 2 - 360, CANVAS_HEIGHT / 2, "输入文本"),
    createShapeTextNode(2, CANVAS_WIDTH / 2 + 10, CANVAS_HEIGHT / 2 - 170, "start", "输入文本"),
    createShapeTextNode(3, CANVAS_WIDTH / 2 + 30, CANVAS_HEIGHT / 2 + 4, "process", "输入文本"),
    createShapeTextNode(4, CANVAS_WIDTH / 2 + 280, CANVAS_HEIGHT / 2 + 6, "decision", "输入文本"),
    createShapeTextNode(5, CANVAS_WIDTH / 2 + 34, CANVAS_HEIGHT / 2 + 200, "database", "输入文本"),
  ]);
  const [connections, setConnections] = useState<Project5Connection[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([1]);
  const [selectedStrokeIds, setSelectedStrokeIds] = useState<number[]>([]);
  const [primarySelectedId, setPrimarySelectedId] = useState<number | null>(1);
  const [interaction, setInteraction] = useState<InteractionState | null>(null);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [hoveredControlDirection, setHoveredControlDirection] = useState<Project5Direction | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<number | null>(null);
  const [pendingEditSeed, setPendingEditSeed] = useState<PendingEditSeed | null>(null);
  const [shapePicker, setShapePicker] = useState<ShapePickerState | null>(null);
  const [inheritedCreateTargets, setInheritedCreateTargets] = useState<InheritedCreateTargets>({});
  const [nextId, setNextId] = useState(6);
  const [nextConnectionId, setNextConnectionId] = useState(1);
  const [nextStrokeId, setNextStrokeId] = useState(1);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [activeToolbarTool, setActiveToolbarTool] = useState<CanvasToolbarTool | null>(null);
  const [toolbarPointerWorldPoint, setToolbarPointerWorldPoint] = useState<{ x: number; y: number } | null>(null);
  const [strokes, setStrokes] = useState<Project5Stroke[]>([]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedStrokeIdSet = useMemo(() => new Set(selectedStrokeIds), [selectedStrokeIds]);
  const primarySelectedNode = useMemo(
    () => nodes.find((node) => node.id === primarySelectedId) ?? null,
    [nodes, primarySelectedId],
  );

  const findAutoConnectTarget = useCallback((
    sourceNode: Project5CanvasNode,
    sourceDirection: Project5Direction,
  ) => {
    if (sourceNode.type !== "shape-text") {
      return null;
    }

    const sourceAnchor = getNodeConnectionPoint(sourceNode, sourceDirection);
    const targetDirection = getOppositeDirection(sourceDirection);
    const candidates = nodes
      .filter((node) => node.id !== sourceNode.id && node.type === "shape-text")
      .filter((node) => !isPairAlreadyConnected(connections, sourceNode.id, node.id))
      .map((node) => {
        const targetAnchor = getNodeConnectionPoint(node, targetDirection);
        const forwardDistance =
          sourceDirection === "right"
            ? targetAnchor.x - sourceAnchor.x
            : sourceDirection === "left"
              ? sourceAnchor.x - targetAnchor.x
              : sourceDirection === "bottom"
                ? targetAnchor.y - sourceAnchor.y
                : sourceAnchor.y - targetAnchor.y;
        const alignmentOffset =
          sourceDirection === "right" || sourceDirection === "left"
            ? Math.abs(targetAnchor.y - sourceAnchor.y)
            : Math.abs(targetAnchor.x - sourceAnchor.x);
        const alignmentLimit =
          sourceDirection === "right" || sourceDirection === "left"
            ? Math.max(sourceNode.height, node.height) / 2 + 48
            : Math.max(sourceNode.width, node.width) / 2 + 48;

        if (
          forwardDistance < 0 ||
          forwardDistance > AUTO_CONNECT_MAX_DISTANCE ||
          alignmentOffset > alignmentLimit
        ) {
          return null;
        }

        return {
          node,
          targetDirection,
          anchorX: targetAnchor.x,
          anchorY: targetAnchor.y,
          score: alignmentOffset * 2 + forwardDistance,
        } satisfies AutoConnectTarget;
      })
      .filter((candidate): candidate is AutoConnectTarget => candidate !== null)
      .sort((candidateA, candidateB) => {
        const scoreDifference = candidateA.score - candidateB.score;

        if (scoreDifference !== 0) {
          return scoreDifference;
        }

        if (sourceDirection === "right" || sourceDirection === "left") {
          const verticalDifference = candidateA.anchorY - candidateB.anchorY;

          if (verticalDifference !== 0) {
            return verticalDifference;
          }
        } else {
          const horizontalDifference = candidateA.anchorX - candidateB.anchorX;

          if (horizontalDifference !== 0) {
            return horizontalDifference;
          }
        }

        return candidateA.node.id - candidateB.node.id;
      });

    return candidates[0] ?? null;
  }, [connections, nodes]);

  const getCreateCenterForDirection = useCallback((
    sourceNode: Project5CanvasNode,
    direction: Project5Direction,
    width: number,
    height: number,
  ) => {
    const inheritedTargetId = inheritedCreateTargets[getInheritedTargetKey(sourceNode.id, direction)];
    const inheritedTargetNode = inheritedTargetId
      ? nodes.find((node) => node.id === inheritedTargetId)
      : null;

    if (inheritedTargetNode) {
      const baseCenter = clampNodeCenter(
        sourceNode.x + (inheritedTargetNode.x - sourceNode.x),
        sourceNode.y + (inheritedTargetNode.y - sourceNode.y),
        width,
        height,
      );
      const collidingNodes = nodes.filter((node) => node.id !== sourceNode.id && supportsCollisionAvoidance(node));

      if (!collidingNodes.some((node) => isNodeOverlapping(baseCenter.x, baseCenter.y, width, height, node))) {
        return baseCenter;
      }

      const shouldStackVertically = direction === "left" || direction === "right";
      const axisStep = shouldStackVertically
        ? Math.max(height, inheritedTargetNode.height) + CREATE_GAP
        : Math.max(width, inheritedTargetNode.width) + CREATE_GAP;

      for (let slotIndex = 1; slotIndex <= 24; slotIndex += 1) {
        const directionSign = slotIndex % 2 === 1 ? 1 : -1;
        const distanceMultiplier = Math.ceil(slotIndex / 2);
        const candidateCenter = clampNodeCenter(
          shouldStackVertically
            ? baseCenter.x
            : baseCenter.x + axisStep * distanceMultiplier * directionSign,
          shouldStackVertically
            ? baseCenter.y + axisStep * distanceMultiplier * directionSign
            : baseCenter.y,
          width,
          height,
        );

        if (!collidingNodes.some((node) => isNodeOverlapping(candidateCenter.x, candidateCenter.y, width, height, node))) {
          return candidateCenter;
        }
      }

      return baseCenter;
    }

    return getQuickCreateCenter(sourceNode, direction, width, height);
  }, [inheritedCreateTargets, nodes]);

  const getPreviewNodeForDirection = useCallback((
    sourceNode: Project5CanvasNode,
    direction: Project5Direction,
  ) => {
    const option = sourceNode.type === "sticky-note"
      ? { type: "sticky-note" as const }
      : getDefaultShapeOption(sourceNode);
    const size = getNodeSizeForOption(option, sourceNode);
    const previewCenter = getCreateCenterForDirection(
      sourceNode,
      direction,
      size.width,
      size.height,
    );

    return createNodeFromOption(
      -1000,
      previewCenter.x,
      previewCenter.y,
      option,
      sourceNode,
    );
  }, [getCreateCenterForDirection]);

  const getWorldPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = contentRef.current;

    if (!canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();

    return {
      x: (clientX - rect.left) / canvasZoom,
      y: (clientY - rect.top) / canvasZoom,
    };
  }, [canvasZoom]);

  const applyCanvasZoom = useCallback((nextZoom: number, clientX?: number, clientY?: number) => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    const clampedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);

    if (!viewport || !content) {
      zoomTargetRef.current = clampedZoom;
      setCanvasZoom(clampedZoom);
      return;
    }

    const viewportRect = viewport.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    const focusClientX = clientX ?? viewportRect.left + viewportRect.width / 2;
    const focusClientY = clientY ?? viewportRect.top + viewportRect.height / 2;
    const worldX = (focusClientX - contentRect.left) / canvasZoom;
    const worldY = (focusClientY - contentRect.top) / canvasZoom;
    const anchorOffsetX = focusClientX - viewportRect.left;
    const anchorOffsetY = focusClientY - viewportRect.top;

    zoomTargetRef.current = clampedZoom;

    if (zoomAnimationRef.current !== null) {
      return;
    }

    const animate = () => {
      setCanvasZoom((currentZoom) => {
        const targetZoom = zoomTargetRef.current;
        const nextAnimatedZoom =
          Math.abs(targetZoom - currentZoom) < 0.002
            ? targetZoom
            : currentZoom + (targetZoom - currentZoom) * 0.22;

        viewport.scrollLeft = Math.max(0, worldX * nextAnimatedZoom - anchorOffsetX);
        viewport.scrollTop = Math.max(0, worldY * nextAnimatedZoom - anchorOffsetY);

        if (nextAnimatedZoom === targetZoom) {
          zoomAnimationRef.current = null;
        } else {
          zoomAnimationRef.current = window.requestAnimationFrame(animate);
        }

        return nextAnimatedZoom;
      });
    };

    zoomAnimationRef.current = window.requestAnimationFrame(animate);
  }, [canvasZoom]);

  const focusNodesWithAdaptiveVisibility = useCallback((
    branchNodes: Project5CanvasNode[],
    pairNodes: Project5CanvasNode[],
    primaryNode: Project5CanvasNode,
  ) => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const getBoundsSize = (nodesToFit: Project5CanvasNode[]) => {
      const { left, top, right, bottom } = getNodesBounds(nodesToFit);

      return {
        width: Math.max(1, right - left),
        height: Math.max(1, bottom - top),
      };
    };

    const getFitZoom = (nodesToFit: Project5CanvasNode[]) => {
      const { width, height } = getBoundsSize(nodesToFit);
      const availableWidth = Math.max(1, viewport.clientWidth - VIEWPORT_PADDING * 2);
      const availableHeight = Math.max(1, viewport.clientHeight - VIEWPORT_PADDING * 2);

      return clamp(
        Math.min(availableWidth / width, availableHeight / height),
        MIN_ZOOM,
        MAX_ZOOM,
      );
    };

    const canFitAtZoom = (nodesToFit: Project5CanvasNode[], zoom: number) => {
      const { width, height } = getBoundsSize(nodesToFit);
      const availableWidth = Math.max(1, viewport.clientWidth - VIEWPORT_PADDING * 2);
      const availableHeight = Math.max(1, viewport.clientHeight - VIEWPORT_PADDING * 2);

      return width * zoom <= availableWidth && height * zoom <= availableHeight;
    };

    let nodesToFocus = branchNodes;
    let nextZoom = canvasZoom;

    if (!canFitAtZoom(branchNodes, canvasZoom)) {
      const branchFitZoom = Math.min(canvasZoom, getFitZoom(branchNodes));

      if (branchFitZoom >= GROUP_VISIBILITY_MIN_ZOOM) {
        nextZoom = branchFitZoom;
      } else {
        nodesToFocus = pairNodes;

        if (!canFitAtZoom(pairNodes, canvasZoom)) {
          const pairFitZoom = Math.min(canvasZoom, getFitZoom(pairNodes));

          if (pairFitZoom >= PAIR_VISIBILITY_MIN_ZOOM) {
            nextZoom = pairFitZoom;
          } else {
            nodesToFocus = [primaryNode];
            nextZoom = canvasZoom;

            if (!canFitAtZoom([primaryNode], canvasZoom)) {
              nextZoom = Math.min(canvasZoom, getFitZoom([primaryNode]));
            }
          }
        }
      }
    }

    const { left, top, right, bottom } = getNodesBounds(nodesToFocus);
    const nextScrollLeft = Math.max(0, ((left + right) / 2) * nextZoom - viewport.clientWidth / 2);
    const nextScrollTop = Math.max(0, ((top + bottom) / 2) * nextZoom - viewport.clientHeight / 2);

    if (zoomAnimationRef.current !== null) {
      window.cancelAnimationFrame(zoomAnimationRef.current);
      zoomAnimationRef.current = null;
    }

    zoomTargetRef.current = nextZoom;
    setCanvasZoom(nextZoom);
    viewport.scrollTo({
      left: nextScrollLeft,
      top: nextScrollTop,
      behavior: "smooth",
    });
  }, [canvasZoom]);

  const addConnection = useCallback((
    sourceId: number,
    sourceDirection: Project5Direction,
    targetId: number,
    targetDirection: Project5Direction,
  ) => {
    const connectionId = nextConnectionId;

    setConnections((currentConnections) => {
      const hasDuplicate = currentConnections.some(
        (connection) =>
          connection.sourceId === sourceId &&
          connection.sourceDirection === sourceDirection &&
          connection.targetId === targetId &&
          connection.targetDirection === targetDirection,
      );

      if (hasDuplicate) {
        return currentConnections;
      }

      return [
        ...currentConnections,
        {
          id: connectionId,
          sourceId,
          sourceDirection,
          targetId,
          targetDirection,
        },
      ];
    });

    setNextConnectionId((currentId) => currentId + 1);
  }, [nextConnectionId]);

  const createConnectedNode = useCallback((
    sourceNode: Project5CanvasNode,
    sourceDirection: Project5Direction,
    option: Project5CreateOption,
    targetWorldPoint?: { x: number; y: number },
    shouldConnect = true,
    rememberInheritedLength = false,
  ) => {
    const nodeSize = getNodeSizeForOption(option, sourceNode);
    const centeredPoint = targetWorldPoint
      ? clampNodeCenter(targetWorldPoint.x, targetWorldPoint.y, nodeSize.width, nodeSize.height)
      : getCreateCenterForDirection(sourceNode, sourceDirection, nodeSize.width, nodeSize.height);
    const newNode = createNodeFromOption(nextId, centeredPoint.x, centeredPoint.y, option, sourceNode);
    const targetDirection = targetWorldPoint
      ? getOppositeDirection(getDominantDirection(sourceNode.x, sourceNode.y, newNode.x, newNode.y))
      : getOppositeDirection(sourceDirection);

    setNodes((currentNodes) => [...currentNodes, newNode]);
    if (rememberInheritedLength) {
      setInheritedCreateTargets((currentTargets) => ({
        ...currentTargets,
        [getInheritedTargetKey(sourceNode.id, sourceDirection)]: newNode.id,
      }));
    }
    if (shouldConnect) {
      addConnection(sourceNode.id, sourceDirection, newNode.id, targetDirection);
    }
    setSelectedIds([newNode.id]);
    setSelectedStrokeIds([]);
    setPrimarySelectedId(newNode.id);
    setControlsVisible(false);
    setHoveredControlDirection(null);
    setEditingNodeId(newNode.id);
    setPendingEditSeed(null);
    setShapePicker(null);
    setNextId((currentId) => currentId + 1);
    window.requestAnimationFrame(() => {
      focusNodesWithAdaptiveVisibility(
        getBranchVisibilityNodes(sourceNode, newNode, nodes, connections),
        [sourceNode, newNode],
        newNode,
      );
    });
  }, [addConnection, connections, focusNodesWithAdaptiveVisibility, getCreateCenterForDirection, nextId, nodes]);

  const findCanvasToolPlacement = useCallback((
    option: Project5CreateOption,
    worldPoint: { x: number; y: number },
  ) => {
    const size = getNodeSizeForOption(option);
    const baseCenter = clampNodeCenter(worldPoint.x, worldPoint.y, size.width, size.height);
    const collidingNodes = nodes.filter((node) => supportsCollisionAvoidance(node));

    if (!collidingNodes.some((node) => isNodeOverlapping(baseCenter.x, baseCenter.y, size.width, size.height, node, 20))) {
      return baseCenter;
    }

    const radialStep = Math.max(size.width, size.height) + 28;

    for (let slotIndex = 1; slotIndex <= 24; slotIndex += 1) {
      const angle = (slotIndex * Math.PI) / 4;
      const distance = radialStep * Math.ceil(slotIndex / 4);
      const candidateCenter = clampNodeCenter(
        baseCenter.x + Math.cos(angle) * distance,
        baseCenter.y + Math.sin(angle) * distance,
        size.width,
        size.height,
      );

      if (!collidingNodes.some((node) => isNodeOverlapping(candidateCenter.x, candidateCenter.y, size.width, size.height, node, 20))) {
        return candidateCenter;
      }
    }

    return baseCenter;
  }, [nodes]);

  const createCanvasToolNodeAt = useCallback((
    option: Project5CreateOption,
    worldPoint: { x: number; y: number },
  ) => {
    const centeredPoint = findCanvasToolPlacement(option, worldPoint);
    const newNode = createNodeFromOption(nextId, centeredPoint.x, centeredPoint.y, option);

    setNodes((currentNodes) => [...currentNodes, newNode]);
    setSelectedIds([newNode.id]);
    setSelectedStrokeIds([]);
    setPrimarySelectedId(newNode.id);
    setControlsVisible(false);
    setHoveredControlDirection(null);
    setEditingNodeId(null);
    setPendingEditSeed(null);
    setShapePicker(null);
    setInteraction(null);
    setNextId((currentId) => currentId + 1);

    window.requestAnimationFrame(() => {
      focusNodesWithAdaptiveVisibility([newNode], [newNode], newNode);
    });
  }, [findCanvasToolPlacement, focusNodesWithAdaptiveVisibility, nextId]);

  const startStroke = useCallback((
    tool: "pencil" | "highlighter",
    worldPoint: { x: number; y: number },
  ) => {
    const strokeId = nextStrokeId;

    setStrokes((currentStrokes) => [
      ...currentStrokes,
      {
        id: strokeId,
        tool,
        points: [worldPoint],
      },
    ]);
    setSelectedStrokeIds([strokeId]);
    setInteraction({
      mode: "draw",
      strokeId,
      tool,
    });
    setNextStrokeId((currentId) => currentId + 1);
  }, [nextStrokeId]);

  const appendStrokePoint = useCallback((strokeId: number, worldPoint: { x: number; y: number }) => {
    setStrokes((currentStrokes) =>
      currentStrokes.map((stroke) => {
        if (stroke.id !== strokeId) {
          return stroke;
        }

        const lastPoint = stroke.points[stroke.points.length - 1];

        if (lastPoint && Math.hypot(lastPoint.x - worldPoint.x, lastPoint.y - worldPoint.y) < 1.5) {
          return stroke;
        }

        return {
          ...stroke,
          points: [...stroke.points, worldPoint],
        };
      }),
    );
  }, []);

  const openShapePicker = useCallback((
    sourceNode: Project5CanvasNode,
    sourceDirection: Project5Direction,
    worldPoint: { x: number; y: number },
    clientX: number,
    clientY: number,
  ) => {
    const root = rootRef.current;
    const rootRect = root?.getBoundingClientRect();
    const localX = rootRect ? clientX - rootRect.left : clientX;
    const localY = rootRect ? clientY - rootRect.top : clientY;

    setShapePicker({
      sourceId: sourceNode.id,
      sourceDirection,
      worldX: worldPoint.x,
      worldY: worldPoint.y,
      panelLeft: clamp(localX - PANEL_WIDTH / 2, 18, (rootRect?.width ?? PANEL_WIDTH) - PANEL_WIDTH - 18),
      panelTop: clamp(localY - PANEL_HEIGHT / 2, 18, (rootRect?.height ?? PANEL_HEIGHT) - PANEL_HEIGHT - 18),
      hoveredOption: getDefaultShapeOption(sourceNode),
    });
    setControlsVisible(true);
  }, []);

  const handleNodeTextChange = useCallback((nodeId: number, value: string) => {
    const normalizedValue = normalizeNodeText(value);

    setNodes((currentNodes) =>
      currentNodes.map((currentNode) =>
        currentNode.id === nodeId
          ? { ...currentNode, text: normalizedValue }
          : currentNode,
      ),
    );
  }, []);

  const handleCommandEnterCreate = useCallback((node: Project5CanvasNode, value: string) => {
    handleNodeTextChange(node.id, value);

    createConnectedNode(
      node,
      "right",
      node.type === "sticky-note" ? { type: "sticky-note" } : getDefaultShapeOption(node),
      undefined,
      node.type === "shape-text",
    );
  }, [createConnectedNode, handleNodeTextChange]);

  useEffect(() => {
    return () => {
      if (zoomAnimationRef.current !== null) {
        window.cancelAnimationFrame(zoomAnimationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    const initialNode = nodes[0];

    if (!viewport || !initialNode || hasCenteredInitialViewRef.current) {
      return;
    }

    viewport.scrollLeft = initialNode.x * canvasZoom - viewport.clientWidth / 2;
    viewport.scrollTop = initialNode.y * canvasZoom - viewport.clientHeight / 2;
    hasCenteredInitialViewRef.current = true;
  }, [canvasZoom, nodes]);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    function handleViewportWheel(event: WheelEvent) {
      const currentViewport = viewportRef.current;

      if (!currentViewport) {
        return;
      }

      event.stopPropagation();

      if (event.ctrlKey) {
        event.preventDefault();
        const scaleFactor = Math.exp(-event.deltaY * 0.0015);
        applyCanvasZoom(zoomTargetRef.current * scaleFactor, event.clientX, event.clientY);
        return;
      }

      event.preventDefault();
      currentViewport.scrollLeft += event.deltaX;
      currentViewport.scrollTop += event.deltaY;
    }

    viewport.addEventListener("wheel", handleViewportWheel, { passive: false });

    return () => {
      viewport.removeEventListener("wheel", handleViewportWheel);
    };
  }, [applyCanvasZoom]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const activeElement = document.activeElement;

      if (
        activeElement instanceof HTMLElement &&
        (activeElement.isContentEditable ||
          activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        return;
      }

      if (
        editingNodeId === null &&
        primarySelectedId !== null &&
        primarySelectedNode !== null &&
        isTextEditableNode(primarySelectedNode) &&
        selectedIds.length === 1 &&
        interaction === null &&
        shapePicker === null &&
        isTypingShortcutCandidate(event)
      ) {
        event.preventDefault();
        handleNodeTextChange(primarySelectedId, event.key);
        setPendingEditSeed({
          nodeId: primarySelectedId,
          value: event.key,
        });
        setEditingNodeId(primarySelectedId);
        setControlsVisible(false);
        setHoveredControlDirection(null);
        return;
      }

      if (
        (event.key !== "Delete" && event.key !== "Backspace") ||
        (selectedIds.length === 0 && selectedStrokeIds.length === 0)
      ) {
        return;
      }

      event.preventDefault();

      setNodes((currentNodes) => {
        const remainingNodes = currentNodes.filter((node) => !selectedIdSet.has(node.id));
        const nextSelectedNode = remainingNodes[remainingNodes.length - 1] ?? null;

        setStrokes((currentStrokes) =>
          currentStrokes.filter((stroke) => !selectedStrokeIdSet.has(stroke.id)),
        );
        setConnections((currentConnections) =>
          currentConnections.filter(
            (connection) =>
              !selectedIdSet.has(connection.sourceId) &&
              !selectedIdSet.has(connection.targetId),
          ),
        );
        setInheritedCreateTargets((currentTargets) =>
          Object.fromEntries(
            Object.entries(currentTargets).filter(([, targetId]) => !selectedIdSet.has(targetId)),
          ),
        );
        setSelectedIds(nextSelectedNode ? [nextSelectedNode.id] : []);
        setSelectedStrokeIds([]);
        setPrimarySelectedId(nextSelectedNode?.id ?? null);
        setControlsVisible(false);
        setHoveredControlDirection(null);
        setEditingNodeId(null);
        setPendingEditSeed(null);
        setInteraction(null);
        setShapePicker(null);

        return remainingNodes;
      });
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    editingNodeId,
    handleNodeTextChange,
    interaction,
    primarySelectedId,
    primarySelectedNode,
    selectedIds,
    selectedIdSet,
    selectedStrokeIdSet,
    selectedStrokeIds.length,
    shapePicker,
  ]);

  useEffect(() => {
    function handleCompositionStart() {
      const activeElement = document.activeElement;

      if (
        activeElement instanceof HTMLElement &&
        (activeElement.isContentEditable ||
          activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        return;
      }

      if (
        editingNodeId !== null ||
        primarySelectedId === null ||
        primarySelectedNode === null ||
        !isTextEditableNode(primarySelectedNode) ||
        selectedIds.length !== 1 ||
        interaction !== null ||
        shapePicker !== null
      ) {
        return;
      }

      setPendingEditSeed({
        nodeId: primarySelectedId,
        value: "",
      });
      setEditingNodeId(primarySelectedId);
      setControlsVisible(false);
      setHoveredControlDirection(null);
    }

    window.addEventListener("compositionstart", handleCompositionStart);

    return () => {
      window.removeEventListener("compositionstart", handleCompositionStart);
    };
  }, [editingNodeId, interaction, primarySelectedId, primarySelectedNode, selectedIds.length, shapePicker]);

  useEffect(() => {
    if (!interaction) {
      return;
    }

    const activeInteraction: InteractionState = interaction;

    function handlePointerMove(event: PointerEvent) {
      const worldPoint = getWorldPoint(event.clientX, event.clientY);

      if (!worldPoint) {
        return;
      }

      if (activeInteraction.mode === "move") {
        const moveInteraction = activeInteraction;

        setNodes((currentNodes) =>
          currentNodes.map((currentNode) => {
            if (!moveInteraction.nodeIds.includes(currentNode.id)) {
              return currentNode;
            }

            const initialPosition = moveInteraction.initialPositions.find((position) => position.id === currentNode.id);
            const nextX = (initialPosition?.x ?? currentNode.x) + (worldPoint.x - moveInteraction.pointerStartX);
            const nextY = (initialPosition?.y ?? currentNode.y) + (worldPoint.y - moveInteraction.pointerStartY);
            const clampedPoint = clampNodeCenter(nextX, nextY, currentNode.width, currentNode.height);

            return {
              ...currentNode,
              x: clampedPoint.x,
              y: clampedPoint.y,
            };
          }),
        );
        return;
      }

      if (activeInteraction.mode === "marquee") {
        const marqueeInteraction = activeInteraction;
        const left = Math.min(marqueeInteraction.startX, worldPoint.x);
        const right = Math.max(marqueeInteraction.startX, worldPoint.x);
        const top = Math.min(marqueeInteraction.startY, worldPoint.y);
        const bottom = Math.max(marqueeInteraction.startY, worldPoint.y);
        const nextSelectedIds = getIntersectingNodeIds(nodes, left, top, right, bottom);
        const nextSelectedStrokeIds = strokes
          .filter((stroke) => isStrokeIntersectingRect(stroke, left, top, right, bottom))
          .map((stroke) => stroke.id);

        setSelectedIds(nextSelectedIds);
        setSelectedStrokeIds(nextSelectedStrokeIds);
        setPrimarySelectedId(nextSelectedIds[0] ?? null);
        setControlsVisible(false);
        setHoveredControlDirection(null);
        setEditingNodeId(null);
        setShapePicker(null);
        setInteraction({
          ...marqueeInteraction,
          currentX: worldPoint.x,
          currentY: worldPoint.y,
        });
        return;
      }

      if (activeInteraction.mode === "connection") {
        const connectionInteraction = activeInteraction;
        const hasMoved =
          connectionInteraction.hasMoved ||
          Math.hypot(worldPoint.x - connectionInteraction.startX, worldPoint.y - connectionInteraction.startY) * canvasZoom >=
            CONNECTION_DRAG_THRESHOLD;

        setInteraction({
          ...connectionInteraction,
          currentX: worldPoint.x,
          currentY: worldPoint.y,
          hasMoved,
          snappedTarget: findSnapTarget(nodes, connectionInteraction.sourceId, worldPoint, canvasZoom),
        });
        return;
      }

      if (activeInteraction.mode === "draw") {
        appendStrokePoint(activeInteraction.strokeId, worldPoint);
        return;
      }

      const resizeInteraction = activeInteraction;
      setNodes((currentNodes) =>
        currentNodes.map((currentNode) => {
          if (currentNode.id !== resizeInteraction.id) {
            return currentNode;
          }

          const width = Math.max(MIN_NODE_WIDTH, Math.abs(worldPoint.x - resizeInteraction.anchorX));
          const targetHeight = width / resizeInteraction.aspectRatio;
          const height = Math.max(MIN_NODE_HEIGHT, targetHeight);
          const adjustedWidth = Math.max(MIN_NODE_WIDTH, height * resizeInteraction.aspectRatio);

          const centerX =
            resizeInteraction.handle === "top-left" || resizeInteraction.handle === "bottom-left"
              ? resizeInteraction.anchorX - adjustedWidth / 2
              : resizeInteraction.anchorX + adjustedWidth / 2;
          const centerY =
            resizeInteraction.handle === "top-left" || resizeInteraction.handle === "top-right"
              ? resizeInteraction.anchorY - height / 2
              : resizeInteraction.anchorY + height / 2;
          const clampedPoint = clampNodeCenter(centerX, centerY, adjustedWidth, height);

          return {
            ...currentNode,
            width: adjustedWidth,
            height,
            x: clampedPoint.x,
            y: clampedPoint.y,
          };
        }),
      );
    }

    function handlePointerUp(event: PointerEvent) {
      if (activeInteraction.mode === "marquee") {
        ignoreNextCanvasClickRef.current = true;
        setInteraction(null);
        return;
      }

      if (activeInteraction.mode === "connection") {
        const connectionInteraction = activeInteraction;
        ignoreNextCanvasClickRef.current = true;

        const sourceNode = nodes.find((node) => node.id === connectionInteraction.sourceId);

        if (sourceNode) {
          if (!connectionInteraction.hasMoved) {
            const autoConnectTarget = findAutoConnectTarget(
              sourceNode,
              connectionInteraction.sourceDirection,
            );

            if (autoConnectTarget) {
              addConnection(
                sourceNode.id,
                connectionInteraction.sourceDirection,
                autoConnectTarget.node.id,
                autoConnectTarget.targetDirection,
              );
              setSelectedIds([sourceNode.id]);
              setSelectedStrokeIds([]);
              setPrimarySelectedId(sourceNode.id);
              setControlsVisible(true);
              setHoveredControlDirection(null);
              setShapePicker(null);
            } else {
              createConnectedNode(
                sourceNode,
                connectionInteraction.sourceDirection,
                sourceNode.type === "sticky-note" ? { type: "sticky-note" } : getDefaultShapeOption(sourceNode),
                undefined,
                sourceNode.type === "shape-text",
                false,
              );
            }
          } else if (connectionInteraction.snappedTarget) {
            addConnection(
              sourceNode.id,
              connectionInteraction.sourceDirection,
              connectionInteraction.snappedTarget.nodeId,
              connectionInteraction.snappedTarget.direction,
            );
            setControlsVisible(true);
            setHoveredControlDirection(null);
            setShapePicker(null);
          } else {
            openShapePicker(
              sourceNode,
              connectionInteraction.sourceDirection,
              {
                x: connectionInteraction.currentX,
                y: connectionInteraction.currentY,
              },
              event.clientX,
              event.clientY,
            );
          }
        }

        setInteraction(null);
        return;
      }

      if (activeInteraction.mode === "draw") {
        setSelectedIds([]);
        setSelectedStrokeIds([activeInteraction.strokeId]);
        setPrimarySelectedId(null);
        setControlsVisible(false);
        setHoveredControlDirection(null);
        setInteraction(null);
        return;
      }

      setInteraction(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [
    addConnection,
    appendStrokePoint,
    canvasZoom,
    createConnectedNode,
    findAutoConnectTarget,
    getWorldPoint,
    interaction,
    nodes,
    openShapePicker,
    strokes,
  ]);

  const pickerPreviewNode = useMemo(() => {
    if (!shapePicker) {
      return null;
    }

    const sourceNode = nodes.find((node) => node.id === shapePicker.sourceId);
    const size = getNodeSizeForOption(shapePicker.hoveredOption, sourceNode);
    const clampedCenter = clampNodeCenter(
      shapePicker.worldX,
      shapePicker.worldY,
      size.width,
      size.height,
    );

    return createNodeFromOption(
      -1000,
      clampedCenter.x,
      clampedCenter.y,
      shapePicker.hoveredOption,
      sourceNode,
    );
  }, [nodes, shapePicker]);

  const toolbarPreviewNode = useMemo(() => {
    if (!activeToolbarTool || !toolbarPointerWorldPoint) {
      return null;
    }

    const option = getToolbarCreateOption(activeToolbarTool);

    if (!option) {
      return null;
    }

    const placement = findCanvasToolPlacement(option, toolbarPointerWorldPoint);

    return createNodeFromOption(-2000, placement.x, placement.y, option);
  }, [activeToolbarTool, findCanvasToolPlacement, toolbarPointerWorldPoint]);

  const connectionLines = useMemo(() => {
    const persistedLines = connections.reduce<Project5ConnectionLine[]>((lines, connection) => {
        const sourceNode = nodes.find((node) => node.id === connection.sourceId);
        const targetNode = nodes.find((node) => node.id === connection.targetId);

        if (!sourceNode || !targetNode) {
          return lines;
        }

        const sourceAnchor = getNodeConnectionPoint(sourceNode, connection.sourceDirection);
        const targetAnchor = getNodeConnectionPoint(targetNode, connection.targetDirection);

        lines.push({
          id: connection.id,
          sourceId: connection.sourceId,
          targetId: connection.targetId,
          sourceX: sourceAnchor.x,
          sourceY: sourceAnchor.y,
          sourceDirection: connection.sourceDirection,
          targetX: targetAnchor.x,
          targetY: targetAnchor.y,
          targetDirection: connection.targetDirection,
        });

        return lines;
      }, []);

    if (interaction?.mode === "connection") {
      const sourceNode = nodes.find((node) => node.id === interaction.sourceId);

      if (sourceNode && (sourceNode.type === "shape-text" || interaction.hasMoved)) {
        const sourceAnchor = getNodeConnectionPoint(sourceNode, interaction.sourceDirection);
        const targetDirection = interaction.snappedTarget
          ? interaction.snappedTarget.direction
          : getOppositeDirection(
              getDominantDirection(sourceAnchor.x, sourceAnchor.y, interaction.currentX, interaction.currentY),
            );

        persistedLines.push({
          id: "draft-connection",
          sourceId: sourceNode.id,
          sourceX: sourceAnchor.x,
          sourceY: sourceAnchor.y,
          sourceDirection: interaction.sourceDirection,
          targetX: interaction.snappedTarget?.x ?? interaction.currentX,
          targetY: interaction.snappedTarget?.y ?? interaction.currentY,
          targetDirection,
          dashed: true,
        });
      }
    }

    if (shapePicker && pickerPreviewNode) {
      const sourceNode = nodes.find((node) => node.id === shapePicker.sourceId);

      if (sourceNode) {
        const sourceAnchor = getNodeConnectionPoint(sourceNode, shapePicker.sourceDirection);
        const targetDirection = getOppositeDirection(
          getDominantDirection(sourceNode.x, sourceNode.y, pickerPreviewNode.x, pickerPreviewNode.y),
        );
        const targetAnchor = getNodeConnectionPoint(pickerPreviewNode, targetDirection);

        persistedLines.push({
          id: "picker-preview",
          sourceId: sourceNode.id,
          sourceX: sourceAnchor.x,
          sourceY: sourceAnchor.y,
          sourceDirection: shapePicker.sourceDirection,
          targetX: targetAnchor.x,
          targetY: targetAnchor.y,
          targetDirection,
          dashed: true,
        });
      }
    }

    if (hoveredControlDirection && primarySelectedId !== null && interaction === null && !shapePicker) {
      const sourceNode = nodes.find((node) => node.id === primarySelectedId);

      if (sourceNode?.type === "shape-text") {
        const autoConnectTarget = findAutoConnectTarget(sourceNode, hoveredControlDirection);
        const sourceAnchor = getNodeConnectionPoint(sourceNode, hoveredControlDirection);
        const targetDirection = autoConnectTarget?.targetDirection ?? getOppositeDirection(hoveredControlDirection);
        const targetAnchor = autoConnectTarget
          ? { x: autoConnectTarget.anchorX, y: autoConnectTarget.anchorY }
          : getNodeConnectionPoint(
              getPreviewNodeForDirection(sourceNode, hoveredControlDirection),
              targetDirection,
            );

        persistedLines.push({
          id: "hover-preview",
          sourceId: sourceNode.id,
          sourceX: sourceAnchor.x,
          sourceY: sourceAnchor.y,
          sourceDirection: hoveredControlDirection,
          targetX: targetAnchor.x,
          targetY: targetAnchor.y,
          targetDirection,
          dashed: true,
        });
      }
    }

    return persistedLines;
  }, [connections, findAutoConnectTarget, getPreviewNodeForDirection, hoveredControlDirection, interaction, nodes, pickerPreviewNode, primarySelectedId, shapePicker]);

  function handleResizeStart(
    node: Project5CanvasNode,
    handle: Project5ResizeHandle,
    event: React.PointerEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation();
    event.preventDefault();
    setSelectedIds([node.id]);
    setSelectedStrokeIds([]);
    setPrimarySelectedId(node.id);
    setControlsVisible(true);
    setHoveredControlDirection(null);
    setEditingNodeId(null);
    setPendingEditSeed(null);
    setShapePicker(null);

    const anchorX =
      handle === "top-left" || handle === "bottom-left"
        ? node.x + node.width / 2
        : node.x - node.width / 2;
    const anchorY =
      handle === "top-left" || handle === "top-right"
        ? node.y + node.height / 2
        : node.y - node.height / 2;

    setInteraction({
      mode: "resize",
      id: node.id,
      handle,
      anchorX,
      anchorY,
      aspectRatio: node.width / node.height,
    });
  }

  function handleShapeControlPointerDown(
    node: Project5CanvasNode,
    direction: Project5Direction,
    event: React.PointerEvent<HTMLButtonElement>,
  ) {
    const worldPoint = getWorldPoint(event.clientX, event.clientY);
    const anchor = getNodeConnectionPoint(node, direction);

    setSelectedIds([node.id]);
    setSelectedStrokeIds([]);
    setPrimarySelectedId(node.id);
    setControlsVisible(true);
    setHoveredControlDirection(direction);
    setEditingNodeId(null);
    setPendingEditSeed(null);
    setShapePicker(null);

    setInteraction({
      mode: "connection",
      sourceId: node.id,
      sourceDirection: direction,
      startX: anchor.x,
      startY: anchor.y,
      currentX: worldPoint?.x ?? anchor.x,
      currentY: worldPoint?.y ?? anchor.y,
      hasMoved: false,
      snappedTarget: null,
    });
  }

  function handleStickyControlPointerDown(
    node: Project5CanvasNode,
    direction: Project5Direction,
    event: React.PointerEvent<HTMLButtonElement>,
  ) {
    const worldPoint = getWorldPoint(event.clientX, event.clientY);
    const anchor = getNodeConnectionPoint(node, direction);

    setSelectedIds([node.id]);
    setSelectedStrokeIds([]);
    setPrimarySelectedId(node.id);
    setControlsVisible(true);
    setHoveredControlDirection(direction);
    setEditingNodeId(null);
    setPendingEditSeed(null);
    setShapePicker(null);

    setInteraction({
      mode: "connection",
      sourceId: node.id,
      sourceDirection: direction,
      startX: anchor.x,
      startY: anchor.y,
      currentX: worldPoint?.x ?? anchor.x,
      currentY: worldPoint?.y ?? anchor.y,
      hasMoved: false,
      snappedTarget: null,
    });
  }

  function handleCanvasPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;

    const isCanvasUiTarget = target.closest(
      "[data-create-handle], [data-heat-zone], [data-resize-handle], [data-canvas-zoom-ui='true'], [data-canvas-toolbar='true'], [contenteditable='true'], [data-shape-picker='true']",
    );
    const isNodeBodyTarget = target.closest("[data-note-body='true']");

    if (isCanvasUiTarget || (!activeToolbarTool && isNodeBodyTarget)) {
      return;
    }

    const worldPoint = getWorldPoint(event.clientX, event.clientY);

    if (!worldPoint) {
      return;
    }

    const clickedStroke = [...strokes].reverse().find((stroke) =>
      isPointInStrokeBounds(stroke, worldPoint),
    );

    if (!activeToolbarTool && clickedStroke) {
      event.preventDefault();
      event.stopPropagation();
      ignoreNextCanvasClickRef.current = true;
      setSelectedIds([]);
      setSelectedStrokeIds([clickedStroke.id]);
      setPrimarySelectedId(null);
      setControlsVisible(false);
      setHoveredControlDirection(null);
      setEditingNodeId(null);
      setPendingEditSeed(null);
      setShapePicker(null);
      return;
    }

    if (activeToolbarTool === "sticky-note" || activeToolbarTool === "shape-text") {
      const option = getToolbarCreateOption(activeToolbarTool);

      if (option) {
        event.preventDefault();
        createCanvasToolNodeAt(option, worldPoint);
      }
      return;
    }

    if (activeToolbarTool === "pencil" || activeToolbarTool === "highlighter") {
      event.preventDefault();
      setSelectedIds([]);
      setSelectedStrokeIds([]);
      setPrimarySelectedId(null);
      setControlsVisible(false);
      setHoveredControlDirection(null);
      setEditingNodeId(null);
      setPendingEditSeed(null);
      setShapePicker(null);
      startStroke(activeToolbarTool, worldPoint);
      return;
    }

    setSelectedIds([]);
    setSelectedStrokeIds([]);
    setPrimarySelectedId(null);
    setControlsVisible(false);
    setHoveredControlDirection(null);
    setEditingNodeId(null);
    setPendingEditSeed(null);
    setShapePicker(null);
    setInteraction({
      mode: "marquee",
      startX: worldPoint.x,
      startY: worldPoint.y,
      currentX: worldPoint.x,
      currentY: worldPoint.y,
    });
  }

  function handleCanvasPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!activeToolbarTool) {
      return;
    }

    const worldPoint = getWorldPoint(event.clientX, event.clientY);

    if (!worldPoint) {
      return;
    }

    setToolbarPointerWorldPoint(worldPoint);
  }

  function handleCanvasPointerLeave() {
    setToolbarPointerWorldPoint(null);
  }

  return (
    <Project5CanvasBoard
      rootRef={rootRef}
      floatingToolbar={
        <Project5FloatingToolbar
          activeTool={activeToolbarTool}
          onSelect={(itemId) => {
            setActiveToolbarTool((currentTool) => currentTool === itemId ? null : itemId);
            setSelectedStrokeIds([]);
            setControlsVisible(false);
            setHoveredControlDirection(null);
            setShapePicker(null);
            setEditingNodeId(null);
            setPendingEditSeed(null);
          }}
        />
      }
      overlay={
        shapePicker ? (
          <Project5ShapeCreatePanel
            left={shapePicker.panelLeft}
            top={shapePicker.panelTop}
            options={SHAPE_PICKER_OPTIONS}
            hoveredOption={shapePicker.hoveredOption}
            previewNode={pickerPreviewNode}
            onHoverOption={(option) =>
              setShapePicker((currentPicker) =>
                currentPicker
                  ? {
                      ...currentPicker,
                      hoveredOption: option,
                    }
                  : currentPicker,
              )
            }
            onSelect={(option) => {
              const sourceNode = nodes.find((node) => node.id === shapePicker.sourceId);

              if (!sourceNode) {
                setShapePicker(null);
                return;
              }

              createConnectedNode(
                sourceNode,
                shapePicker.sourceDirection,
                option,
                {
                  x: shapePicker.worldX,
                  y: shapePicker.worldY,
                },
                true,
                true,
              );
            }}
          />
        ) : null
      }
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerLeave={handleCanvasPointerLeave}
      zoom={canvasZoom}
      baseWidth={CANVAS_WIDTH}
      baseHeight={CANVAS_HEIGHT}
      onZoomIn={() => applyCanvasZoom(canvasZoom + ZOOM_STEP)}
      onZoomOut={() => applyCanvasZoom(canvasZoom - ZOOM_STEP)}
      contentRef={contentRef}
      viewportRef={viewportRef}
      onClick={() => {
        if (ignoreNextCanvasClickRef.current) {
          ignoreNextCanvasClickRef.current = false;
          return;
        }

        if (activeToolbarTool) {
          return;
        }

        setSelectedIds([]);
        setSelectedStrokeIds([]);
        setPrimarySelectedId(null);
        setControlsVisible(false);
        setHoveredControlDirection(null);
        setEditingNodeId(null);
        setPendingEditSeed(null);
        setShapePicker(null);
      }}
    >
      <Project5StrokeLayer
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        strokes={strokes}
        selectedStrokeIds={selectedStrokeIds}
      />

      <Project5ConnectionLayer
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        lines={connectionLines}
      />

      {interaction?.mode === "marquee" ? (
        <Project5MarqueeSelection
          left={Math.min(interaction.startX, interaction.currentX)}
          top={Math.min(interaction.startY, interaction.currentY)}
          width={Math.abs(interaction.currentX - interaction.startX)}
          height={Math.abs(interaction.currentY - interaction.startY)}
        />
      ) : null}

      {pickerPreviewNode ? (
        <div
          className="pointer-events-none absolute z-[3]"
          style={{
            left: pickerPreviewNode.x - pickerPreviewNode.width / 2,
            top: pickerPreviewNode.y - pickerPreviewNode.height / 2,
            width: pickerPreviewNode.width,
            height: pickerPreviewNode.height,
          }}
        >
          <Project5CanvasNodeView node={pickerPreviewNode} preview />
        </div>
      ) : null}

      {toolbarPreviewNode ? (
        <div
          className="pointer-events-none absolute z-[3]"
          style={{
            left: toolbarPreviewNode.x - toolbarPreviewNode.width / 2,
            top: toolbarPreviewNode.y - toolbarPreviewNode.height / 2,
            width: toolbarPreviewNode.width,
            height: toolbarPreviewNode.height,
          }}
        >
          <Project5CanvasNodeView node={toolbarPreviewNode} preview />
        </div>
      ) : null}

      {nodes.map((node, index) => {
        const isSelected = selectedIdSet.has(node.id);
        const isPrimarySelected = node.id === primarySelectedId;
        const isTextNode = isTextEditableNode(node);
        const isShapeNode = node.type === "shape-text";
        const canShowQuickCreateControls = supportsQuickCreateControls(node);
        const isConnectionSource =
          interaction?.mode === "connection" && interaction.sourceId === node.id;
        const isPickerSource = shapePicker?.sourceId === node.id;
        const showPrimaryControls =
          isPrimarySelected &&
          canShowQuickCreateControls &&
          (controlsVisible || isConnectionSource || isPickerSource);
        const previewDirection =
          hoveredControlDirection &&
          isPrimarySelected &&
          canShowQuickCreateControls &&
          !isConnectionSource &&
          !shapePicker
            ? hoveredControlDirection
            : null;
        const autoConnectPreviewTarget =
          previewDirection && isShapeNode
            ? findAutoConnectTarget(node, previewDirection)
            : null;
        const previewNode =
          previewDirection && !autoConnectPreviewTarget
            ? getPreviewNodeForDirection(node, previewDirection)
            : null;
        const previewLeft =
          previewDirection === "left"
            ? previewNode
              ? previewNode.x - node.x + (node.width - previewNode.width) / 2
              : -(node.width + CREATE_GAP)
            : previewDirection === "right"
              ? previewNode
                ? previewNode.x - node.x + (node.width - previewNode.width) / 2
                : node.width + CREATE_GAP
              : 0;
        const previewTop =
          previewDirection === "top"
            ? previewNode
              ? previewNode.y - node.y + (node.height - previewNode.height) / 2
              : -(node.height + CREATE_GAP)
            : previewDirection === "bottom"
              ? previewNode
                ? previewNode.y - node.y + (node.height - previewNode.height) / 2
                : node.height + CREATE_GAP
              : 0;

        return (
          <div
            key={node.id}
            className="absolute"
            style={{
              left: node.x - node.width / 2,
              top: node.y - node.height / 2,
              width: node.width,
              height: node.height,
              zIndex: isSelected ? nodes.length + 20 : index + 1,
            }}
            onClick={(event) => {
              if (activeToolbarTool) {
                return;
              }

              event.stopPropagation();
              setSelectedIds([node.id]);
              setSelectedStrokeIds([]);
              setPrimarySelectedId(node.id);
              setControlsVisible(true);
              setHoveredControlDirection(null);
              setEditingNodeId(null);
              setPendingEditSeed(null);
              setShapePicker(null);
            }}
            onDoubleClick={(event) => {
              if (!isTextNode || activeToolbarTool) {
                return;
              }

              event.stopPropagation();
              setSelectedIds([node.id]);
              setSelectedStrokeIds([]);
              setPrimarySelectedId(node.id);
              setControlsVisible(false);
              setHoveredControlDirection(null);
              setEditingNodeId(node.id);
              setPendingEditSeed(null);
              setShapePicker(null);
            }}
            onMouseEnter={() => {
              if (isPrimarySelected) {
                setControlsVisible(true);
              }
            }}
            onMouseLeave={(event) => {
              if (!isPrimarySelected || isConnectionSource || isPickerSource) {
                return;
              }

              const nextTarget = event.relatedTarget;

              if (
                nextTarget instanceof Element &&
                nextTarget.closest("[data-create-handle], [data-heat-zone], [data-note-body='true']")
              ) {
                return;
              }

              setControlsVisible(false);
              setHoveredControlDirection(null);
            }}
            onPointerDown={(event) => {
              if (activeToolbarTool) {
                return;
              }

              const target = event.target as HTMLElement;
              const isHandle = target.closest("[data-create-handle]");
              const isHeatZone = target.closest("[data-heat-zone]");
              const isResizeHandle = target.closest("[data-resize-handle]");

              if (isHandle || isHeatZone || isResizeHandle || editingNodeId === node.id) {
                return;
              }

              const worldPoint = getWorldPoint(event.clientX, event.clientY);

              if (!worldPoint) {
                return;
              }

              event.stopPropagation();
              const moveSelection = isSelected ? selectedIds : [node.id];
              setSelectedIds(moveSelection);
              setSelectedStrokeIds([]);
              setPrimarySelectedId(node.id);
              setControlsVisible(moveSelection.length === 1);
              setHoveredControlDirection(null);
              setEditingNodeId(null);
              setPendingEditSeed(null);
              setShapePicker(null);
              setInteraction({
                mode: "move",
                nodeIds: moveSelection,
                pointerStartX: worldPoint.x,
                pointerStartY: worldPoint.y,
                initialPositions: nodes
                  .filter((currentNode) => moveSelection.includes(currentNode.id))
                  .map((currentNode) => ({
                    id: currentNode.id,
                    x: currentNode.x,
                    y: currentNode.y,
                  })),
              });
            }}
          >
            <div data-note-body="true" className="absolute inset-0">
              <Project5CanvasNodeView
                node={node}
                editing={isTextNode && editingNodeId === node.id}
                editingSeed={pendingEditSeed?.nodeId === node.id ? pendingEditSeed.value : null}
                onTextChange={(value) => {
                  handleNodeTextChange(node.id, value);
                  setEditingNodeId(null);
                  setPendingEditSeed(null);
                }}
                onCommandEnter={isTextNode ? (value) => handleCommandEnterCreate(node, value) : undefined}
              />
            </div>

            {isSelected ? (
              <>
                {previewNode ? (
                  <div
                    className="pointer-events-none absolute z-[5]"
                    style={{
                      left: previewLeft,
                      top: previewTop,
                      width: previewNode.width,
                      height: previewNode.height,
                    }}
                  >
                    <Project5CanvasNodeView node={previewNode} preview />
                  </div>
                ) : null}

                <Project5SelectionFrame
                  onResizeStart={(handle, event) => handleResizeStart(node, handle, event)}
                  showResizeHandles={isPrimarySelected && canShowQuickCreateControls}
                />

                {isPrimarySelected && canShowQuickCreateControls
                  ? (["top", "right", "bottom", "left"] as Project5Direction[]).map((direction) => (
                      <div key={direction} data-heat-zone="true">
                        <Project5HeatZone
                          direction={direction}
                          noteWidth={node.width}
                          noteHeight={node.height}
                          canvasZoom={canvasZoom}
                          onActivate={() => setControlsVisible(true)}
                          onDeactivate={() => {
                            if (interaction?.mode === "connection" || shapePicker?.sourceId === node.id) {
                              return;
                            }

                            setControlsVisible(false);
                          }}
                        />
                      </div>
                    ))
                  : null}

                {showPrimaryControls
                  ? (["top", "right", "bottom", "left"] as Project5Direction[]).map((direction) => (
                      <Project5ControlPoint
                        key={`control-${direction}`}
                        direction={direction}
                        iconVariant={isShapeNode ? "arrow" : "plus"}
                        top={
                          direction === "top"
                            ? -((CONTROL_POINT_OFFSET / canvasZoom) + 28)
                            : direction === "bottom"
                              ? node.height + (CONTROL_POINT_OFFSET / canvasZoom)
                              : node.height / 2 - 14
                        }
                        left={
                          direction === "left"
                            ? -((CONTROL_POINT_OFFSET / canvasZoom) + 28)
                            : direction === "right"
                              ? node.width + (CONTROL_POINT_OFFSET / canvasZoom)
                              : node.width / 2 - 14
                        }
                        onClick={
                          isShapeNode
                            ? undefined
                            : undefined
                        }
                        onPointerDown={
                          isShapeNode
                            ? (event) => handleShapeControlPointerDown(node, direction, event)
                            : (event) => handleStickyControlPointerDown(node, direction, event)
                        }
                        onHoverStart={() => setHoveredControlDirection(direction)}
                        onHoverEnd={() =>
                          setHoveredControlDirection((currentDirection) =>
                            currentDirection === direction ? null : currentDirection,
                          )
                        }
                      />
                    ))
                  : null}
              </>
            ) : null}
          </div>
        );
      })}
    </Project5CanvasBoard>
  );
}
