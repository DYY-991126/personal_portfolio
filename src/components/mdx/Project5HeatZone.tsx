"use client";

import { type Project5Direction } from "./Project5CanvasNodeTypes";

interface Project5HeatZoneProps {
  direction: Project5Direction;
  noteWidth: number;
  noteHeight: number;
  canvasZoom: number;
  onActivate: () => void;
  onDeactivate: () => void;
}

export default function Project5HeatZone({
  direction,
  noteWidth,
  noteHeight,
  canvasZoom,
  onActivate,
  onDeactivate,
}: Project5HeatZoneProps) {
  const horizontalThickness = clampByZoom(noteHeight * 0.28, canvasZoom, 28, 52);
  const verticalThickness = clampByZoom(noteWidth * 0.22, canvasZoom, 28, 52);

  const wrapperStyle =
    direction === "top"
      ? {
          left: 0,
          top: -horizontalThickness,
          width: noteWidth,
          height: horizontalThickness,
        }
      : direction === "right"
        ? {
          left: noteWidth,
          top: 0,
          width: verticalThickness,
          height: noteHeight,
        }
        : direction === "bottom"
          ? {
              left: 0,
              top: noteHeight,
              width: noteWidth,
              height: horizontalThickness,
            }
          : {
              left: -verticalThickness,
              top: 0,
              width: verticalThickness,
              height: noteHeight,
            };

  return (
    <div
      className="absolute z-20"
      data-heat-zone="true"
      style={wrapperStyle}
      onMouseEnter={onActivate}
      onMouseLeave={(event) => {
        const nextTarget = event.relatedTarget;

        if (
          nextTarget instanceof Element &&
          nextTarget.closest("[data-create-handle], [data-heat-zone], [data-note-body='true']")
        ) {
          return;
        }

        onDeactivate();
      }}
    >
      <div className="pointer-events-none absolute inset-0 border border-[#ef4444]/45 bg-[#ef4444]/14" />
    </div>
  );
}

function clampByZoom(baseWorldSize: number, canvasZoom: number, minScreenSize: number, maxScreenSize: number) {
  const worldMin = minScreenSize / canvasZoom;
  const worldMax = maxScreenSize / canvasZoom;
  return Math.max(worldMin, Math.min(baseWorldSize, worldMax));
}
