"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Project5CanvasBoard from "./Project5CanvasBoard";
import Project5CanvasNodeView from "./Project5CanvasNodeView";
import Project5ConnectionLayer from "./Project5ConnectionLayer";
import Project5ControlPoint from "./Project5ControlPoint";
import Project5HeatZone from "./Project5HeatZone";
import Project5MarqueeSelection from "./Project5MarqueeSelection";
import Project5SelectionFrame, {
  type Project5ResizeHandle,
} from "./Project5SelectionFrame";
import Project5ShapeCreatePanel from "./Project5ShapeCreatePanel";
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

type InteractionState =
  | MoveInteraction
  | ResizeInteraction
  | MarqueeInteraction
  | ConnectionInteraction;

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
  const [canvasZoom, setCanvasZoom] = useState(1);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

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
      const collidingNodes = nodes.filter((node) => node.id !== sourceNode.id);

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

  const ensureNodesVisible = useCallback((visibleNodes: Project5CanvasNode[]) => {
    const viewport = viewportRef.current;

    if (!viewport || visibleNodes.length === 0) {
      return;
    }

    const left = Math.min(...visibleNodes.map((node) => node.x - node.width / 2));
    const top = Math.min(...visibleNodes.map((node) => node.y - node.height / 2));
    const right = Math.max(...visibleNodes.map((node) => node.x + node.width / 2));
    const bottom = Math.max(...visibleNodes.map((node) => node.y + node.height / 2));

    const scaledLeft = left * canvasZoom;
    const scaledTop = top * canvasZoom;
    const scaledRight = right * canvasZoom;
    const scaledBottom = bottom * canvasZoom;

    const visibleLeft = viewport.scrollLeft + VIEWPORT_PADDING;
    const visibleTop = viewport.scrollTop + VIEWPORT_PADDING;
    const visibleRight = viewport.scrollLeft + viewport.clientWidth - VIEWPORT_PADDING;
    const visibleBottom = viewport.scrollTop + viewport.clientHeight - VIEWPORT_PADDING;

    let nextScrollLeft = viewport.scrollLeft;
    let nextScrollTop = viewport.scrollTop;

    if (scaledLeft < visibleLeft) {
      nextScrollLeft = Math.max(0, scaledLeft - VIEWPORT_PADDING);
    } else if (scaledRight > visibleRight) {
      nextScrollLeft = scaledRight - viewport.clientWidth + VIEWPORT_PADDING;
    }

    if (scaledTop < visibleTop) {
      nextScrollTop = Math.max(0, scaledTop - VIEWPORT_PADDING);
    } else if (scaledBottom > visibleBottom) {
      nextScrollTop = scaledBottom - viewport.clientHeight + VIEWPORT_PADDING;
    }

    if (nextScrollLeft !== viewport.scrollLeft || nextScrollTop !== viewport.scrollTop) {
      viewport.scrollTo({ left: nextScrollLeft, top: nextScrollTop, behavior: "smooth" });
    }
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
    setPrimarySelectedId(newNode.id);
    setControlsVisible(false);
    setHoveredControlDirection(null);
    setEditingNodeId(newNode.id);
    setPendingEditSeed(null);
    setShapePicker(null);
    setNextId((currentId) => currentId + 1);
    window.requestAnimationFrame(() => ensureNodesVisible([sourceNode, newNode]));
  }, [addConnection, ensureNodesVisible, getCreateCenterForDirection, nextId]);

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
      event.stopPropagation();

      if (event.ctrlKey) {
        event.preventDefault();
        const scaleFactor = Math.exp(-event.deltaY * 0.0015);
        applyCanvasZoom(zoomTargetRef.current * scaleFactor, event.clientX, event.clientY);
        return;
      }

      event.preventDefault();
      viewport.scrollLeft += event.deltaX;
      viewport.scrollTop += event.deltaY;
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

      if ((event.key !== "Delete" && event.key !== "Backspace") || selectedIds.length === 0) {
        return;
      }

      event.preventDefault();

      setNodes((currentNodes) => {
        const remainingNodes = currentNodes.filter((node) => !selectedIdSet.has(node.id));
        const nextSelectedNode = remainingNodes[remainingNodes.length - 1] ?? null;

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
    selectedIds,
    selectedIdSet,
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
  }, [editingNodeId, interaction, primarySelectedId, selectedIds.length, shapePicker]);

  useEffect(() => {
    if (!interaction) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      const worldPoint = getWorldPoint(event.clientX, event.clientY);

      if (!worldPoint) {
        return;
      }

      if (interaction.mode === "move") {
        setNodes((currentNodes) =>
          currentNodes.map((currentNode) => {
            if (!interaction.nodeIds.includes(currentNode.id)) {
              return currentNode;
            }

            const initialPosition = interaction.initialPositions.find((position) => position.id === currentNode.id);
            const nextX = (initialPosition?.x ?? currentNode.x) + (worldPoint.x - interaction.pointerStartX);
            const nextY = (initialPosition?.y ?? currentNode.y) + (worldPoint.y - interaction.pointerStartY);
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

      if (interaction.mode === "marquee") {
        const left = Math.min(interaction.startX, worldPoint.x);
        const right = Math.max(interaction.startX, worldPoint.x);
        const top = Math.min(interaction.startY, worldPoint.y);
        const bottom = Math.max(interaction.startY, worldPoint.y);
        const nextSelectedIds = getIntersectingNodeIds(nodes, left, top, right, bottom);

        setSelectedIds(nextSelectedIds);
        setPrimarySelectedId(nextSelectedIds[0] ?? null);
        setControlsVisible(false);
        setHoveredControlDirection(null);
        setEditingNodeId(null);
        setShapePicker(null);
        setInteraction({
          ...interaction,
          currentX: worldPoint.x,
          currentY: worldPoint.y,
        });
        return;
      }

      if (interaction.mode === "connection") {
        const hasMoved =
          interaction.hasMoved ||
          Math.hypot(worldPoint.x - interaction.startX, worldPoint.y - interaction.startY) * canvasZoom >=
            CONNECTION_DRAG_THRESHOLD;

        setInteraction({
          ...interaction,
          currentX: worldPoint.x,
          currentY: worldPoint.y,
          hasMoved,
          snappedTarget: findSnapTarget(nodes, interaction.sourceId, worldPoint, canvasZoom),
        });
        return;
      }

      setNodes((currentNodes) =>
        currentNodes.map((currentNode) => {
          if (currentNode.id !== interaction.id) {
            return currentNode;
          }

          const width = Math.max(MIN_NODE_WIDTH, Math.abs(worldPoint.x - interaction.anchorX));
          const targetHeight = width / interaction.aspectRatio;
          const height = Math.max(MIN_NODE_HEIGHT, targetHeight);
          const adjustedWidth = Math.max(MIN_NODE_WIDTH, height * interaction.aspectRatio);

          const centerX =
            interaction.handle === "top-left" || interaction.handle === "bottom-left"
              ? interaction.anchorX - adjustedWidth / 2
              : interaction.anchorX + adjustedWidth / 2;
          const centerY =
            interaction.handle === "top-left" || interaction.handle === "top-right"
              ? interaction.anchorY - height / 2
              : interaction.anchorY + height / 2;
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
      if (interaction.mode === "marquee") {
        ignoreNextCanvasClickRef.current = true;
        setInteraction(null);
        return;
      }

      if (interaction.mode === "connection") {
        ignoreNextCanvasClickRef.current = true;

        const sourceNode = nodes.find((node) => node.id === interaction.sourceId);

        if (sourceNode) {
          if (!interaction.hasMoved) {
            createConnectedNode(
              sourceNode,
              interaction.sourceDirection,
              sourceNode.type === "sticky-note" ? { type: "sticky-note" } : getDefaultShapeOption(sourceNode),
              undefined,
              sourceNode.type === "shape-text",
              false,
            );
          } else if (interaction.snappedTarget) {
            addConnection(
              sourceNode.id,
              interaction.sourceDirection,
              interaction.snappedTarget.nodeId,
              interaction.snappedTarget.direction,
            );
            setControlsVisible(true);
            setHoveredControlDirection(null);
            setShapePicker(null);
          } else {
            openShapePicker(
              sourceNode,
              interaction.sourceDirection,
              {
                x: interaction.currentX,
                y: interaction.currentY,
              },
              event.clientX,
              event.clientY,
            );
          }
        }

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
    canvasZoom,
    createConnectedNode,
    getWorldPoint,
    interaction,
    nodes,
    openShapePicker,
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

  const connectionLines = useMemo(() => {
    const persistedLines = connections
      .map((connection) => {
        const sourceNode = nodes.find((node) => node.id === connection.sourceId);
        const targetNode = nodes.find((node) => node.id === connection.targetId);

        if (!sourceNode || !targetNode) {
          return null;
        }

        const sourceAnchor = getNodeConnectionPoint(sourceNode, connection.sourceDirection);
        const targetAnchor = getNodeConnectionPoint(targetNode, connection.targetDirection);

        return {
          id: connection.id,
          sourceId: connection.sourceId,
          targetId: connection.targetId,
          sourceX: sourceAnchor.x,
          sourceY: sourceAnchor.y,
          sourceDirection: connection.sourceDirection,
          targetX: targetAnchor.x,
          targetY: targetAnchor.y,
          targetDirection: connection.targetDirection,
        };
      })
      .filter(Boolean);

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
        const previewCenter = getCreateCenterForDirection(
          sourceNode,
          hoveredControlDirection,
          sourceNode.width,
          sourceNode.height,
        );
        const previewNode = {
          ...sourceNode,
          x: previewCenter.x,
          y: previewCenter.y,
        };
        const sourceAnchor = getNodeConnectionPoint(sourceNode, hoveredControlDirection);
        const targetDirection = getOppositeDirection(hoveredControlDirection);
        const targetAnchor = getNodeConnectionPoint(previewNode, targetDirection);

        persistedLines.push({
          id: "hover-preview",
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
  }, [connections, getCreateCenterForDirection, hoveredControlDirection, interaction, nodes, pickerPreviewNode, primarySelectedId, shapePicker]);

  function handleResizeStart(
    node: Project5CanvasNode,
    handle: Project5ResizeHandle,
    event: React.PointerEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation();
    event.preventDefault();
    setSelectedIds([node.id]);
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

    if (
      target.closest(
        "[data-note-body='true'], [data-create-handle], [data-heat-zone], [data-resize-handle], [data-canvas-zoom-ui='true'], [contenteditable='true']",
      )
    ) {
      return;
    }

    const worldPoint = getWorldPoint(event.clientX, event.clientY);

    if (!worldPoint) {
      return;
    }

    setSelectedIds([]);
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

  return (
    <Project5CanvasBoard
      rootRef={rootRef}
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

        setSelectedIds([]);
        setPrimarySelectedId(null);
        setControlsVisible(false);
        setHoveredControlDirection(null);
        setEditingNodeId(null);
        setPendingEditSeed(null);
        setShapePicker(null);
      }}
    >
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

      {nodes.map((node, index) => {
        const isSelected = selectedIdSet.has(node.id);
        const isPrimarySelected = node.id === primarySelectedId;
        const isShapeNode = node.type === "shape-text";
        const isConnectionSource =
          interaction?.mode === "connection" && interaction.sourceId === node.id;
        const isPickerSource = shapePicker?.sourceId === node.id;
        const showPrimaryControls =
          isPrimarySelected && (controlsVisible || isConnectionSource || isPickerSource);
        const previewDirection =
          hoveredControlDirection &&
          isPrimarySelected &&
          !isConnectionSource &&
          !shapePicker
            ? hoveredControlDirection
            : null;
        const previewNode =
          previewDirection && isShapeNode
            ? {
                ...node,
                ...getCreateCenterForDirection(node, previewDirection, node.width, node.height),
                text: "输入文本",
              }
            : previewDirection
              ? node
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
              event.stopPropagation();
              setSelectedIds([node.id]);
              setPrimarySelectedId(node.id);
              setControlsVisible(true);
              setHoveredControlDirection(null);
              setEditingNodeId(null);
              setPendingEditSeed(null);
              setShapePicker(null);
            }}
            onDoubleClick={(event) => {
              event.stopPropagation();
              setSelectedIds([node.id]);
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
                editing={editingNodeId === node.id}
                editingSeed={pendingEditSeed?.nodeId === node.id ? pendingEditSeed.value : null}
                onTextChange={(value) => {
                  handleNodeTextChange(node.id, value);
                  setEditingNodeId(null);
                  setPendingEditSeed(null);
                }}
                onCommandEnter={(value) => handleCommandEnterCreate(node, value)}
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
                  showResizeHandles={isPrimarySelected}
                />

                {isPrimarySelected
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
