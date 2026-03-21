"use client";

interface Project5HeatZonePreviewProps {
  boardWidth?: number;
  boardHeight?: number;
  nodeWidth: number;
  nodeHeight: number;
  topBottomThickness: number;
  leftRightThickness: number;
  showOuterZones?: boolean;
  showInnerArea?: boolean;
  showControls?: boolean;
}

export default function Project5HeatZonePreview({
  boardWidth = 520,
  boardHeight = 280,
  nodeWidth,
  nodeHeight,
  topBottomThickness,
  leftRightThickness,
  showOuterZones = true,
  showInnerArea = true,
  showControls = true,
}: Project5HeatZonePreviewProps) {
  const centerX = boardWidth / 2;
  const centerY = boardHeight / 2;
  const left = centerX - nodeWidth / 2;
  const top = centerY - nodeHeight / 2;
  const pointSize = 14;

  return (
    <div
      className="relative overflow-hidden rounded-[24px] border border-border/20"
      style={{ width: boardWidth, height: boardHeight }}
    >
      {showOuterZones ? (
        <>
          <div
            className="absolute border border-[#ef4444]/35 bg-[#ef4444]/14"
            style={{ left, top: top - topBottomThickness, width: nodeWidth, height: topBottomThickness }}
          />
          <div
            className="absolute border border-[#ef4444]/35 bg-[#ef4444]/14"
            style={{ left: left + nodeWidth, top, width: leftRightThickness, height: nodeHeight }}
          />
          <div
            className="absolute border border-[#ef4444]/35 bg-[#ef4444]/14"
            style={{ left, top: top + nodeHeight, width: nodeWidth, height: topBottomThickness }}
          />
          <div
            className="absolute border border-[#ef4444]/35 bg-[#ef4444]/14"
            style={{ left: left - leftRightThickness, top, width: leftRightThickness, height: nodeHeight }}
          />
        </>
      ) : null}

      {showInnerArea ? (
        <div
          className="absolute border border-[#f97316]/30 bg-[#f97316]/10"
          style={{ left, top, width: nodeWidth, height: nodeHeight }}
        />
      ) : null}

      <div
        className="absolute border border-[#111827]/12 bg-white text-[#111827] shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
        style={{
          left,
          top,
          width: nodeWidth,
          height: nodeHeight,
        }}
      >
        <div className="flex h-full items-center justify-center text-lg font-medium">
          输入文本
        </div>
      </div>

      {showControls ? (
        <>
          <div
            className="absolute rounded-full border-2 border-white bg-[#2563eb]"
            style={{
              left: centerX - pointSize / 2,
              top: top - topBottomThickness / 2 - pointSize / 2,
              width: pointSize,
              height: pointSize,
            }}
          />
          <div
            className="absolute rounded-full border-2 border-white bg-[#2563eb]"
            style={{
              left: left + nodeWidth + leftRightThickness / 2 - pointSize / 2,
              top: centerY - pointSize / 2,
              width: pointSize,
              height: pointSize,
            }}
          />
          <div
            className="absolute rounded-full border-2 border-white bg-[#2563eb]"
            style={{
              left: centerX - pointSize / 2,
              top: top + nodeHeight + topBottomThickness / 2 - pointSize / 2,
              width: pointSize,
              height: pointSize,
            }}
          />
          <div
            className="absolute rounded-full border-2 border-white bg-[#2563eb]"
            style={{
              left: left - leftRightThickness / 2 - pointSize / 2,
              top: centerY - pointSize / 2,
              width: pointSize,
              height: pointSize,
            }}
          />
        </>
      ) : null}
    </div>
  );
}
