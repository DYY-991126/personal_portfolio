"use client";

export type Project5ResizeHandle = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface Project5SelectionFrameProps {
  onResizeStart: (handle: Project5ResizeHandle, event: React.PointerEvent<HTMLButtonElement>) => void;
  showResizeHandles?: boolean;
}

const RESIZE_HANDLE_STYLE: Record<Project5ResizeHandle, string> = {
  "top-left": "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize",
  "top-right": "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize",
  "bottom-left": "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize",
  "bottom-right": "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize",
};

export default function Project5SelectionFrame({
  onResizeStart,
  showResizeHandles = true,
}: Project5SelectionFrameProps) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-10 border-2 border-[#2563eb]/80" />
      {showResizeHandles
        ? (["top-left", "top-right", "bottom-left", "bottom-right"] as Project5ResizeHandle[]).map((handle) => (
            <button
              key={handle}
              type="button"
              data-resize-handle="true"
              aria-label={`${handle} resize handle`}
              className={`absolute z-20 h-3.5 w-3.5 rounded-[3px] border-2 border-[#2563eb] bg-white shadow-sm ${RESIZE_HANDLE_STYLE[handle]}`}
              onPointerDown={(event) => onResizeStart(handle, event)}
            />
          ))
        : null}
    </>
  );
}
