"use client";

import type { Project5CanvasNode, Project5CreateOption } from "./Project5CanvasNodeTypes";
import Project5CanvasNodeView from "./Project5CanvasNodeView";
import { getCreateOptionLabel } from "./Project5ConnectionLayer";

interface Project5ShapeCreatePanelProps {
  left: number;
  top: number;
  options: Project5CreateOption[];
  hoveredOption: Project5CreateOption | null;
  previewNode: Project5CanvasNode | null;
  onHoverOption: (option: Project5CreateOption) => void;
  onSelect: (option: Project5CreateOption) => void;
}

export default function Project5ShapeCreatePanel({
  left,
  top,
  options,
  hoveredOption,
  previewNode,
  onHoverOption,
  onSelect,
}: Project5ShapeCreatePanelProps) {
  const previewScale = previewNode
    ? Math.min(104 / previewNode.width, 62 / previewNode.height, 1)
    : 1;

  return (
    <div
      data-shape-picker="true"
      className="pointer-events-auto absolute w-[272px] overflow-hidden rounded-[20px] border border-black/10 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.14)]"
      style={{ left, top }}
    >
      <div className="grid grid-cols-5 gap-2 px-3 py-3">
        {options.map((option) => {
          const isActive = isSameOption(option, hoveredOption);

          return (
            <button
              key={getOptionKey(option)}
              type="button"
              data-shape-picker-option="true"
              className={`flex h-[44px] items-center justify-center rounded-[14px] transition-colors ${
                isActive ? "bg-black/[0.04]" : "hover:bg-black/[0.03]"
              }`}
              onMouseEnter={() => onHoverOption(option)}
              onFocus={() => onHoverOption(option)}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(option);
              }}
            >
              <ShapePickerIcon option={option} />
            </button>
          );
        })}
      </div>

      <div className="border-t border-black/6 bg-[#f6f4ee] px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[64px] w-[104px] items-center justify-center overflow-hidden rounded-[12px] bg-white/78">
            {previewNode ? (
              <div
                className="relative"
                style={{
                  width: previewNode.width,
                  height: previewNode.height,
                  transform: `scale(${previewScale})`,
                  transformOrigin: "center center",
                }}
              >
                <Project5CanvasNodeView node={previewNode} preview />
              </div>
            ) : null}
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-[0.16em] text-black/35">
              Preview
            </p>
            <p className="mt-1 text-[18px] font-medium tracking-tight text-black/82">
              {hoveredOption ? getCreateOptionLabel(hoveredOption) : "选择图形"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShapePickerIcon({ option }: { option: Project5CreateOption }) {
  if (option.type === "sticky-note") {
    return (
      <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
        <path
          d="M11 10 H30 L37 17 V37 H11 Z"
          fill="none"
          stroke="#111111"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M30 10 V17 H37"
          fill="none"
          stroke="#111111"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (option.shapeKind === "start") {
    return (
      <div className="h-5.5 w-8 rounded-[10px] border-2 border-black" />
    );
  }

  if (option.shapeKind === "decision") {
    return (
      <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
        <polygon
          points="24,8 40,24 24,40 8,24"
          fill="none"
          stroke="#111111"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (option.shapeKind === "database") {
    return (
      <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
        <ellipse
          cx="24"
          cy="14"
          rx="12"
          ry="5"
          fill="none"
          stroke="#111111"
          strokeWidth="2.4"
        />
        <path
          d="M12 14 V31 C12 36 36 36 36 31 V14"
          fill="none"
          stroke="#111111"
          strokeWidth="2.4"
        />
        <path
          d="M12 31 C12 36 36 36 36 31"
          fill="none"
          stroke="#111111"
          strokeWidth="2.4"
        />
      </svg>
    );
  }

  return (
    <div className="h-5.5 w-8 border-2 border-black" />
  );
}

function isSameOption(option: Project5CreateOption, candidate: Project5CreateOption | null) {
  if (!candidate || option.type !== candidate.type) {
    return false;
  }

  if (option.type === "sticky-note") {
    return true;
  }

  return option.shapeKind === candidate.shapeKind;
}

function getOptionKey(option: Project5CreateOption) {
  if (option.type === "sticky-note") {
    return option.type;
  }

  return `${option.type}-${option.shapeKind}`;
}
