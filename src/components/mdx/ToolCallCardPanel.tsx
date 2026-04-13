"use client";

import { type ReactNode } from "react";

const SEND_BUTTON_STYLE = {
  boxShadow:
    "inset 0 20px 20px 0 rgba(0,0,0,0.02), inset 0 -2px 1px 1px rgba(0,0,0,0.06), inset 0 1px 4px 1px rgba(255,255,255,0.2), inset 0 -1px 1px 0 rgba(255,255,255,0.2), inset 0 1px 0 0 #fff, 0 1px 1px 0 rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.08)",
} as const;

/** Back 按钮，纯文字，复用 Send 按钮的材质与质感 */
function BackButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 shrink-0 items-center justify-center rounded-lg bg-white px-4 transition-all duration-150 hover:scale-[0.99] hover:bg-black/2 hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.08)] active:scale-[0.98] active:bg-black/3"
      style={SEND_BUTTON_STYLE}
      aria-label="返回"
    >
      <span className="text-sm font-medium text-black/90">Back</span>
    </button>
  );
}

export interface ToolCallCardPanelProps {
  /** 面板内容：任务卡片等 */
  children?: ReactNode;
  /** Back 按钮点击回调 */
  onBack?: () => void;
  /** 为 true 时不展示 Back（用于并排预览等只读场景） */
  hideBack?: boolean;
}

/** 任务面板：Header (80px) + 卡片容器，卡片间距 16，左右边距 20 */
export default function ToolCallCardPanel({
  children,
  onBack,
  hideBack = false,
}: ToolCallCardPanelProps) {
  return (
    <div
      className="flex h-full w-full flex-col"
      style={{
        fontFamily: "var(--font-sans), Inter, sans-serif",
      }}
    >
      {/* Header：80px，logo + 文案 | Back 按钮 */}
      <header
        className={`flex shrink-0 w-full items-center px-5 ${hideBack ? "justify-start" : "justify-between"}`}
        style={{ height: 80 }}
      >
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <img
              src="/projects/project-3/wegicLogo.svg"
              alt="Wegic"
              width={28}
              height={28}
              className="shrink-0"
            />
            <span className="text-base font-semibold text-black">Wegic Studio</span>
          </div>
          <span className="text-sm text-black/50">Say what everyone is up to.</span>
        </div>
        {!hideBack && <BackButton onClick={onBack} />}
      </header>

      {/* 容器：单列，卡片从上往下堆叠，间距紧凑 */}
      <div
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden overscroll-contain"
        style={{
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 20,
        }}
      >
        {children}
      </div>
    </div>
  );
}
