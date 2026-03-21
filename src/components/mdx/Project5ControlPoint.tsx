"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
} from "lucide-react";

import type { Project5Direction } from "./Project5CanvasNodeTypes";

interface Project5ControlPointProps {
  direction: Project5Direction;
  left: number;
  top: number;
  iconVariant?: "plus" | "arrow";
  forcedHovered?: boolean;
  onClick?: () => void;
  onPointerDown?: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

const CONTROL_POINT_VISUAL_SIZE = 28;
export default function Project5ControlPoint({
  direction,
  left,
  top,
  iconVariant = "plus",
  forcedHovered = false,
  onClick,
  onPointerDown,
  onHoverStart,
  onHoverEnd,
}: Project5ControlPointProps) {
  const ArrowIcon =
    direction === "top"
      ? ArrowUp
      : direction === "right"
        ? ArrowRight
        : direction === "bottom"
          ? ArrowDown
          : ArrowLeft;

  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{
        left,
        top,
        width: CONTROL_POINT_VISUAL_SIZE,
        height: CONTROL_POINT_VISUAL_SIZE,
      }}
    >
      <button
        type="button"
        data-create-handle="true"
        aria-label={`${direction} control point`}
        className="group pointer-events-auto absolute left-1/2 top-1/2 flex h-[40px] w-[40px] -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-transparent"
        onClick={(event) => {
          if (!onClick) {
            return;
          }

          event.stopPropagation();
          onClick();
        }}
        onPointerDown={(event) => {
          if (!onPointerDown) {
            return;
          }

          event.stopPropagation();
          event.preventDefault();
          onPointerDown(event);
        }}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        <span className="absolute h-[40px] w-[40px] rounded-full bg-transparent" />
        <span
          className={`absolute rounded-full border-[2px] transition-[width,height,background-color,border-color] duration-150 ease-out ${
            forcedHovered
              ? "h-[28px] w-[28px] border-[#2563eb] bg-white"
              : "h-[14px] w-[14px] border-white bg-[#2563eb] group-hover:h-[28px] group-hover:w-[28px] group-hover:border-[#2563eb] group-hover:bg-white"
          }`}
        />
        {iconVariant === "plus" ? (
          <span className={`absolute text-[15px] font-medium leading-none text-[#2563eb] transition-opacity duration-100 ${
            forcedHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}>
            +
          </span>
        ) : (
          <ArrowIcon className={`absolute h-4 w-4 text-[#2563eb] transition-opacity duration-100 ${
            forcedHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`} />
        )}
      </button>
    </div>
  );
}
