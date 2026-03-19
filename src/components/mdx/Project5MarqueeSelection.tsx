"use client";

interface Project5MarqueeSelectionProps {
  left: number;
  top: number;
  width: number;
  height: number;
}

export default function Project5MarqueeSelection({
  left,
  top,
  width,
  height,
}: Project5MarqueeSelectionProps) {
  return (
    <div
      className="pointer-events-none absolute z-30 border border-[#2563eb]/70 bg-[#2563eb]/12"
      style={{ left, top, width, height }}
    />
  );
}
