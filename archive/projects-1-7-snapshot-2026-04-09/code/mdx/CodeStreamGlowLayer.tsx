"use client";

import { useId, useState, useEffect } from "react";

/**
 * 迷幻光效层 - 贴合父容器的圆角边框，产生呼吸 + 色相旋转动画。
 * 使用内联 SVG，rect 与容器完全重合，保证「贴着框体四周」。
 * 仅在客户端挂载后渲染 SVG，避免 useId 在服务端/客户端生成的 ID 不一致导致 hydration 错误。
 */
const GRADIENT_STOPS: Record<number, string[]> = {
  0: ["#FFB6F9", "#DEF6E2", "#AEFF35", "#DDFFF8", "#7598FF", "#F9D6FF", "#FF5D8B", "#FFEEEA", "#FFB350"],
  1: ["#B6F5FF", "#DEF6E2", "#35FF7C", "#DDFFF8", "#75FFEF", "#F9D6FF", "#FF5DFC", "#FFEEEA", "#FF6250"],
  2: ["#3CFF35", "#DEF6E2", "#E3F11D", "#DDFFF8", "#75FA41", "#F9D6FF", "#FF362F", "#FFEEEA", "#5C50FF"],
  3: ["#3CFF35", "#D8FF56", "#F11D1D", "#DDFFF8", "#FA9741", "#F9D6FF", "#3EA3E7", "#FFEEEA", "#FF50E2"],
};

export default function CodeStreamGlowLayer({ variant = 0 }: { variant?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const id = useId().replace(/:/g, "");
  const filterId = `glow-blur-${id}`;
  const gradientId = `glow-gradient-${id}`;
  const stops = GRADIENT_STOPS[variant % 4] ?? GRADIENT_STOPS[0]!;

  if (!mounted) {
    return (
      <div
        className="pointer-events-none absolute inset-0 z-1 overflow-hidden rounded-xl"
        aria-hidden
      />
    );
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-1 overflow-hidden rounded-xl"
      aria-hidden
    >
      <svg
        className="code-stream-glow-svg h-full w-full"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        style={{
          animation: "code-stream-glow-breathe 4s ease-in-out infinite, code-stream-glow-colorShift 10s linear infinite",
        }}
      >
        <defs>
          <filter id={filterId} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.06" />
          </filter>
          <radialGradient
            id={gradientId}
            cx="50%"
            cy="50%"
            r="70%"
            gradientUnits="objectBoundingBox"
          >
            {stops.map((color, i) => (
              <stop key={i} offset={i / (stops.length - 1)} stopColor={color} />
            ))}
          </radialGradient>
        </defs>
        {/* rect 与容器完全重合，stroke 形成边框光晕 */}
        <rect
          x="0"
          y="0"
          width="1"
          height="1"
          rx="0.09"
          ry="0.09"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="0.16"
          strokeOpacity="0.25"
          filter={`url(#${filterId})`}
        />
      </svg>
    </div>
  );
}
