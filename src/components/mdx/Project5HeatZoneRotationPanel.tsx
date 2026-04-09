"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import Project5ControlPoint from "./Project5ControlPoint";
import {
  PROJECT5_CANVAS_STYLE,
  PROJECT5_PREVIEW_BLOCK_MARGIN_CLASS,
} from "./Project5DemoFrame";
import Project5ShapeTextNode from "./Project5ShapeTextNode";
import type { Project5CanvasNode, Project5Direction } from "./Project5CanvasNodeTypes";

const BOARD_HEIGHT = 340;
const POINTER_SIZE = 32;
const ARROW_POINTER_HOTSPOT_X = 7;
const ARROW_POINTER_HOTSPOT_Y = 5;
const CYCLE_DURATION = 4200;

type Point = {
  x: number;
  y: number;
};

type SlotKey = "top" | "right" | "bottom" | "left";

type ControlPointSlot = {
  key: SlotKey;
  anchor: Point;
  direction: Project5Direction;
};

export default function Project5HeatZoneRotationPanel() {
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

  return (
    <SingleRotationBoard
      angle={28}
      elapsed={elapsed}
      usePhysicalDirection
      hoveredSlot="right"
    />
  );
}

export function Project5HeatZoneRotationDirectionComparePanel() {
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

  return (
    <div
      className={`grid gap-4 md:grid-cols-2 ${PROJECT5_PREVIEW_BLOCK_MARGIN_CLASS}`}
    >
      <SingleRotationBoard
        angle={getAnimatedRotation(elapsed, -90)}
        elapsed={elapsed}
        hoveredSlot="left"
        usePhysicalDirection={false}
        embedded
      />
      <SingleRotationBoard
        angle={getAnimatedRotation(elapsed, -90)}
        elapsed={elapsed}
        hoveredSlot="left"
        usePhysicalDirection
        embedded
      />
    </div>
  );
}

function SingleRotationBoard({
  angle,
  elapsed,
  hoveredSlot,
  usePhysicalDirection,
  embedded = false,
}: {
  angle: number;
  elapsed: number;
  hoveredSlot: SlotKey;
  usePhysicalDirection: boolean;
  embedded?: boolean;
}) {
  const workspaceWidth = 420;
  const workspaceHeight = 250;
  const heatPadding = 40;
  const heatThickness = 34;
  const width = 220;
  const height = 92;
  const sceneWidth = width + heatPadding * 2;
  const sceneHeight = height + heatPadding * 2;
  const sceneX = (workspaceWidth - sceneWidth) / 2;
  const sceneY = (workspaceHeight - sceneHeight) / 2;
  const objectLeft = heatPadding;
  const objectTop = heatPadding;
  const objectCenterX = sceneX + heatPadding + width / 2;
  const objectCenterY = sceneY + heatPadding + height / 2;
  const showControlPoints = elapsed >= 900 && elapsed < 3600;
  const hovered = elapsed >= 1800 && elapsed < 3200;

  const node = useMemo<Project5CanvasNode>(
    () => ({
      id: 1,
      type: "shape-text",
      shapeKind: "process",
      x: objectCenterX,
      y: objectCenterY,
      width,
      height,
      text: "当前对象",
    }),
    [height, objectCenterX, objectCenterY, width],
  );

  const slots = useMemo<ControlPointSlot[]>(
    () =>
      ([
        {
          key: "top",
          base: {
            x: sceneX + heatPadding + width / 2,
            y: sceneY + heatPadding - heatPadding / 2,
          },
          logicalDirection: "top",
        },
        {
          key: "right",
          base: {
            x: sceneX + heatPadding + width + heatPadding / 2,
            y: sceneY + heatPadding + height / 2,
          },
          logicalDirection: "right",
        },
        {
          key: "bottom",
          base: {
            x: sceneX + heatPadding + width / 2,
            y: sceneY + heatPadding + height + heatPadding / 2,
          },
          logicalDirection: "bottom",
        },
        {
          key: "left",
          base: {
            x: sceneX + heatPadding - heatPadding / 2,
            y: sceneY + heatPadding + height / 2,
          },
          logicalDirection: "left",
        },
      ] as const).map((slot) => {
        const anchor = rotatePoint(
          slot.base,
          { x: objectCenterX, y: objectCenterY },
          angle,
        );

        return {
          key: slot.key,
          anchor,
          direction: usePhysicalDirection
            ? getPhysicalDirection(anchor, { x: objectCenterX, y: objectCenterY })
            : slot.logicalDirection,
        };
      }),
    [angle, height, objectCenterX, objectCenterY, sceneX, sceneY, usePhysicalDirection, width],
  );

  const targetSlot = slots.find((slot) => slot.key === hoveredSlot) ?? slots[0];
  const pointerTarget = {
    x: targetSlot.anchor.x + 14,
    y: targetSlot.anchor.y + 10,
  };
  const pointer = getPointerPosition(elapsed, { x: workspaceWidth - 62, y: workspaceHeight - 26 }, pointerTarget);

  return (
    <div
      className={`${embedded ? "" : `${PROJECT5_PREVIEW_BLOCK_MARGIN_CLASS} `}relative overflow-hidden rounded-[24px] border border-border/20`}
      style={{ ...PROJECT5_CANVAS_STYLE, width: "100%", minHeight: BOARD_HEIGHT }}
    >
      <div
        className="absolute"
        style={{
          left: `calc(50% - ${workspaceWidth / 2}px)`,
          top: `calc(50% - ${workspaceHeight / 2}px)`,
          width: workspaceWidth,
          height: workspaceHeight,
        }}
      >
        <div
          className="absolute left-0 top-0"
          style={{
            width: sceneWidth,
            height: sceneHeight,
            transform: `translate(${sceneX}px, ${sceneY}px) rotate(${angle}deg)`,
            transformOrigin: `${sceneWidth / 2}px ${sceneHeight / 2}px`,
          }}
        >
          <HeatZoneRect left={objectLeft} top={objectTop - heatThickness} width={width} height={heatThickness} />
          <HeatZoneRect left={objectLeft + width} top={objectTop} width={heatPadding} height={height} />
          <HeatZoneRect left={objectLeft} top={objectTop + height} width={width} height={heatThickness} />
          <HeatZoneRect left={objectLeft - heatPadding} top={objectTop} width={heatPadding} height={height} />

          <div
            className="absolute"
            style={{ left: objectLeft, top: objectTop, width, height }}
          >
            <Project5ShapeTextNode node={node} />
          </div>
        </div>

        {showControlPoints
          ? slots.map((slot) => (
              <Project5ControlPoint
                key={`${slot.key}-${slot.direction}`}
                direction={slot.direction}
                iconVariant="arrow"
                left={slot.anchor.x - 14}
                top={slot.anchor.y - 14}
                forcedHovered={slot.key === hoveredSlot && hovered}
                onHoverStart={() => {}}
                onHoverEnd={() => {}}
              />
            ))
          : null}

        <div
          className="pointer-events-none absolute z-20"
          style={{
            left: pointer.x - ARROW_POINTER_HOTSPOT_X,
            top: pointer.y - ARROW_POINTER_HOTSPOT_Y,
          }}
        >
          <Image
            src="/cursor/Arrow.png"
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

function HeatZoneRect({
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
      className="absolute border border-[#ef4444]/35 bg-[#ef4444]/12"
      style={{ left, top, width, height }}
    />
  );
}

function rotatePoint(point: Point, center: Point, degree: number) {
  const radian = (degree * Math.PI) / 180;
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * Math.cos(radian) - dy * Math.sin(radian),
    y: center.y + dx * Math.sin(radian) + dy * Math.cos(radian),
  };
}

function getPhysicalDirection(point: Point, center: Point): Project5Direction {
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx >= 0 ? "right" : "left";
  }

  return dy >= 0 ? "bottom" : "top";
}

function getPointerPosition(elapsed: number, idle: Point, target: Point) {
  if (elapsed < 900) {
    return idle;
  }

  if (elapsed < 1800) {
    return interpolatePoint(idle, target, easeInOut(getProgress(elapsed, 900, 1800)));
  }

  if (elapsed < 3200) {
    return target;
  }

  return interpolatePoint(target, idle, easeInOut(getProgress(elapsed, 3200, CYCLE_DURATION)));
}

function getProgress(elapsed: number, start: number, end: number) {
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

function easeInOut(progress: number) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function getAnimatedRotation(elapsed: number, targetAngle: number) {
  if (elapsed < 1100) {
    return lerp(0, targetAngle, easeInOut(getProgress(elapsed, 0, 1100)));
  }

  if (elapsed < 3200) {
    return targetAngle;
  }

  return lerp(targetAngle, 0, easeInOut(getProgress(elapsed, 3200, CYCLE_DURATION)));
}
