"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import { Minus, Plus } from "lucide-react";
import {
  PROJECT5_CANVAS_STYLE,
  PROJECT5_PREVIEW_BLOCK_MARGIN_CLASS,
} from "./Project5DemoFrame";

interface Project5CanvasBoardProps {
  children: ReactNode;
  overlay?: ReactNode;
  floatingToolbar?: ReactNode;
  onClick: () => void;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerLeave?: () => void;
  zoom: number;
  baseWidth: number;
  baseHeight: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  rootRef?: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  viewportRef: RefObject<HTMLDivElement | null>;
}

export default function Project5CanvasBoard({
  children,
  overlay,
  floatingToolbar,
  onClick,
  onPointerDown,
  onPointerMove,
  onPointerLeave,
  zoom,
  baseWidth,
  baseHeight,
  onZoomIn,
  onZoomOut,
  rootRef,
  contentRef,
  viewportRef,
}: Project5CanvasBoardProps) {
  return (
    <div
      ref={rootRef}
      className={`relative ${PROJECT5_PREVIEW_BLOCK_MARGIN_CLASS} overflow-hidden rounded-[32px] border border-border/30 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]`}
    >
      <div
        ref={viewportRef}
        className="relative h-[560px] overflow-auto rounded-[32px]"
        style={PROJECT5_CANVAS_STYLE as CSSProperties}
        onClick={onClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.78),transparent_42%)]" />
        <div
          className="relative"
          style={{
            width: baseWidth * zoom,
            height: baseHeight * zoom,
            minWidth: baseWidth * zoom,
          }}
        >
          <div
            ref={contentRef}
            data-canvas-content="true"
            className="absolute left-0 top-0"
            style={{
              width: baseWidth,
              height: baseHeight,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
          >
            {children}
          </div>
        </div>
      </div>

      <div
        data-canvas-zoom-ui="true"
        className="absolute bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-black/10 bg-white/92 p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-sm"
      >
        <button
          type="button"
          aria-label="缩小画布"
          className="flex h-9 w-9 items-center justify-center rounded-full text-black/70 transition-colors hover:bg-black/5"
          onClick={(event) => {
            event.stopPropagation();
            onZoomOut();
          }}
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="min-w-[56px] text-center text-sm font-medium text-black/70">
          {Math.round(zoom * 100)}%
        </div>
        <button
          type="button"
          aria-label="放大画布"
          className="flex h-9 w-9 items-center justify-center rounded-full text-black/70 transition-colors hover:bg-black/5"
          onClick={(event) => {
            event.stopPropagation();
            onZoomIn();
          }}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {floatingToolbar}

      {overlay ? (
        <div className="pointer-events-none absolute inset-0 z-40">
          {overlay}
        </div>
      ) : null}
    </div>
  );
}
