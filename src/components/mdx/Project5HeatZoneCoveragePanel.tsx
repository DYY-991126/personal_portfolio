"use client";

import { useMemo, useState } from "react";

import Project5ControlPoint from "./Project5ControlPoint";
import { PROJECT5_CANVAS_STYLE } from "./Project5DemoFrame";
import Project5ShapeTextNode from "./Project5ShapeTextNode";
import type { Project5CanvasNode, Project5Direction } from "./Project5CanvasNodeTypes";

const BOARD_WIDTH = 760;
const BOARD_HEIGHT = 340;

export default function Project5HeatZoneCoveragePanel() {
  const [active, setActive] = useState(false);

  const node = useMemo<Project5CanvasNode>(
    () => ({
      id: 1,
      type: "shape-text",
      shapeKind: "process",
      x: BOARD_WIDTH / 2,
      y: BOARD_HEIGHT / 2,
      width: 196,
      height: 82,
      text: "输入文本",
    }),
    [],
  );

  const left = node.x - node.width / 2;
  const top = node.y - node.height / 2;
  const horizontalThickness = 34;
  const verticalThickness = 42;

  return (
    <div
      className="relative overflow-hidden rounded-[24px] border border-border/20"
      style={{ ...PROJECT5_CANVAS_STYLE, width: "100%", minHeight: BOARD_HEIGHT }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <div className="absolute inset-0">
        <div
          className="absolute border border-[#ef4444]/35 bg-[#ef4444]/12"
          style={{ left, top: top - horizontalThickness, width: node.width, height: horizontalThickness }}
        />
        <div
          className="absolute border border-[#ef4444]/35 bg-[#ef4444]/12"
          style={{ left: left + node.width, top, width: verticalThickness, height: node.height }}
        />
        <div
          className="absolute border border-[#ef4444]/35 bg-[#ef4444]/12"
          style={{ left, top: top + node.height, width: node.width, height: horizontalThickness }}
        />
        <div
          className="absolute border border-[#ef4444]/35 bg-[#ef4444]/12"
          style={{ left: left - verticalThickness, top, width: verticalThickness, height: node.height }}
        />
        <div
          className="absolute border border-[#f97316]/28 bg-[#f97316]/08"
          style={{ left, top, width: node.width, height: node.height }}
        />
      </div>

      <div
        className="absolute"
        style={{ left, top, width: node.width, height: node.height }}
      >
        <Project5ShapeTextNode node={node} />

        {active
          ? (["top", "right", "bottom", "left"] as Project5Direction[]).map((direction) => (
              <Project5ControlPoint
                key={direction}
                direction={direction}
                iconVariant="arrow"
                top={
                  direction === "top"
                    ? -(16 + 28)
                    : direction === "bottom"
                      ? node.height + 16
                      : node.height / 2 - 14
                }
                left={
                  direction === "left"
                    ? -(16 + 28)
                    : direction === "right"
                      ? node.width + 16
                      : node.width / 2 - 14
                }
                onHoverStart={() => {}}
                onHoverEnd={() => {}}
              />
            ))
          : null}
      </div>
    </div>
  );
}
