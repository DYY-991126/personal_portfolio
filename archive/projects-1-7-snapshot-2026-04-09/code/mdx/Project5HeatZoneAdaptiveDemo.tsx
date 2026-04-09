"use client";

import { useMemo, useState } from "react";
import { PROJECT5_CANVAS_STYLE, Project5DemoFrame } from "./Project5DemoFrame";
import Project5HeatZonePreview from "./Project5HeatZonePreview";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export default function Project5HeatZoneAdaptiveDemo() {
  const [canvasZoom, setCanvasZoom] = useState(100);
  const [nodeScale, setNodeScale] = useState(100);

  const zoomPreview = useMemo(() => {
    const zoom = canvasZoom / 100;
    const nodeWidth = 188 * zoom;
    const nodeHeight = 84 * zoom;

    return {
      nodeWidth,
      nodeHeight,
      topBottomThickness: clamp(84 * 0.28 * zoom, 28, 52),
      leftRightThickness: clamp(188 * 0.22 * zoom, 28, 52),
    };
  }, [canvasZoom]);

  const nodeResizePreview = useMemo(() => {
    const scale = nodeScale / 100;
    const nodeWidth = 188 * scale;
    const nodeHeight = 84 * scale;

    return {
      nodeWidth,
      nodeHeight,
      topBottomThickness: clamp(nodeHeight * 0.28, 28, 52),
      leftRightThickness: clamp(nodeWidth * 0.22, 28, 52),
    };
  }, [nodeScale]);

  return (
    <Project5DemoFrame title="热区尺寸自适应">
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">画布缩放</p>
            <input
              type="range"
              min="70"
              max="150"
              step="1"
              value={canvasZoom}
              onChange={(event) => setCanvasZoom(Number(event.target.value))}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">{canvasZoom}%</p>
          </div>

          <div
            className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-[24px] border border-border/20"
            style={PROJECT5_CANVAS_STYLE}
          >
            <Project5HeatZonePreview {...zoomPreview} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">对象缩放</p>
            <input
              type="range"
              min="70"
              max="155"
              step="1"
              value={nodeScale}
              onChange={(event) => setNodeScale(Number(event.target.value))}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">{nodeScale}%</p>
          </div>

          <div
            className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-[24px] border border-border/20"
            style={PROJECT5_CANVAS_STYLE}
          >
            <Project5HeatZonePreview {...nodeResizePreview} />
          </div>
        </div>
      </div>
    </Project5DemoFrame>
  );
}
