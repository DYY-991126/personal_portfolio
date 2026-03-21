"use client";

interface Project5StrokePoint {
  x: number;
  y: number;
}

export interface Project5Stroke {
  id: number;
  tool: "pencil" | "highlighter";
  points: Project5StrokePoint[];
}

interface Project5StrokeLayerProps {
  width: number;
  height: number;
  strokes: Project5Stroke[];
  selectedStrokeIds?: number[];
}

function buildStrokePath(points: Project5StrokePoint[]) {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    const point = points[0];
    return `M ${point.x} ${point.y} L ${point.x + 0.01} ${point.y + 0.01}`;
  }

  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

export default function Project5StrokeLayer({
  width,
  height,
  strokes,
  selectedStrokeIds = [],
}: Project5StrokeLayerProps) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[1] overflow-visible"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      {strokes.map((stroke) => {
        const isSelected = selectedStrokeIds.includes(stroke.id);

        return (
          <g key={stroke.id}>
            {isSelected ? (
              <path
                d={buildStrokePath(stroke.points)}
                fill="none"
                stroke="rgba(37, 99, 235, 0.24)"
                strokeWidth={stroke.tool === "highlighter" ? 30 : 10}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
            <path
              d={buildStrokePath(stroke.points)}
              fill="none"
              stroke={stroke.tool === "highlighter" ? "rgba(250, 204, 21, 0.34)" : "#111111"}
              strokeWidth={stroke.tool === "highlighter" ? 22 : 3.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );
      })}
    </svg>
  );
}
