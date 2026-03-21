"use client";

import { useMemo, useState } from "react";

import Project5ControlPoint from "./Project5ControlPoint";
import { PROJECT5_CANVAS_STYLE } from "./Project5DemoFrame";
import Project5ShapeTextNode from "./Project5ShapeTextNode";
import type { Project5CanvasNode, Project5Direction } from "./Project5CanvasNodeTypes";

const BOARD_WIDTH = 760;
const BOARD_HEIGHT = 360;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export default function Project5HeatZoneAdaptivePanel() {
  const [canvasZoom, setCanvasZoom] = useState(100);
  const [nodeScale, setNodeScale] = useState(100);
  const [active, setActive] = useState(true);

  const zoom = canvasZoom / 100;
  const scale = nodeScale / 100;
  const width = 196 * scale;
  const height = 82 * scale;
  const topBottomThickness = clamp(height * 0.28, 28 / zoom, 52 / zoom);
  const leftRightThickness = clamp(width * 0.22, 28 / zoom, 52 / zoom);

  const node = useMemo<Project5CanvasNode>(
    () => ({
      id: 1,
      type: "shape-text",
      shapeKind: "process",
      x: BOARD_WIDTH / 2,
      y: BOARD_HEIGHT / 2 - 12,
      width,
      height,
      text: "输入文本",
    }),
    [height, width],
  );

  const left = node.x - node.width / 2;
  const top = node.y - node.height / 2;

  return (
    <div className="space-y-4">
      <div
        className="relative overflow-hidden rounded-[24px] border border-border/20"
        style={{ ...PROJECT5_CANVAS_STYLE, width: "100%", minHeight: BOARD_HEIGHT }}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
      >
        <div
          className="absolute left-1/2 top-1/2 origin-center"
          style={{
            width: BOARD_WIDTH,
            height: BOARD_HEIGHT,
            transform: `translate(-50%, -50%) scale(${zoom})`,
          }}
        >
          <div
            className="absolute border border-[#ef4444]/35 bg-[#ef4444]/12"
            style={{ left, top: top - topBottomThickness, width: node.width, height: topBottomThickness }}
          />
          <div
            className="absolute border border-[#ef4444]/35 bg-[#ef4444]/12"
            style={{ left: left + node.width, top, width: leftRightThickness, height: node.height }}
          />
          <div
            className="absolute border border-[#ef4444]/35 bg-[#ef4444]/12"
            style={{ left, top: top + node.height, width: node.width, height: topBottomThickness }}
          />
          <div
            className="absolute border border-[#ef4444]/35 bg-[#ef4444]/12"
            style={{ left: left - leftRightThickness, top, width: leftRightThickness, height: node.height }}
          />
          <div
            className="absolute border border-[#f97316]/28 bg-[#f97316]/08"
            style={{ left, top, width: node.width, height: node.height }}
          />

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
                        ? -(16 / zoom + 28)
                        : direction === "bottom"
                          ? node.height + 16 / zoom
                          : node.height / 2 - 14
                    }
                    left={
                      direction === "left"
                        ? -(16 / zoom + 28)
                        : direction === "right"
                          ? node.width + 16 / zoom
                          : node.width / 2 - 14
                    }
                    onHoverStart={() => {}}
                    onHoverEnd={() => {}}
                  />
                ))
              : null}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="rounded-[18px] border border-black/12 bg-white px-4 py-3">
          <div className="mb-2 flex items-center justify-between text-xs tracking-[0.18em] text-black/55">
            <span>CANVAS ZOOM</span>
            <span>{canvasZoom}%</span>
          </div>
          <input
            type="range"
            min="70"
            max="140"
            value={canvasZoom}
            onChange={(event) => setCanvasZoom(Number(event.target.value))}
            className="w-full accent-black"
          />
        </label>

        <label className="rounded-[18px] border border-black/12 bg-white px-4 py-3">
          <div className="mb-2 flex items-center justify-between text-xs tracking-[0.18em] text-black/55">
            <span>OBJECT SIZE</span>
            <span>{nodeScale}%</span>
          </div>
          <input
            type="range"
            min="70"
            max="150"
            value={nodeScale}
            onChange={(event) => setNodeScale(Number(event.target.value))}
            className="w-full accent-black"
          />
        </label>
      </div>
    </div>
  );
}
