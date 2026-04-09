"use client";

import { useState } from "react";

type RowMode = "upload" | "ai";

const rows = [
  {
    asset: "首页主视觉作品",
    type: "upload" as const,
    hint: "上传一张最能代表你摄影风格的精选作品 (高清大图)",
    aiLabel: "还没有素材，点击让AI帮我生成",
  },
  {
    asset: "作品集照片",
    type: "upload" as const,
    hint: "上传你的摄影作品 (人像、风光、商业等，建议 8-15 张)",
    aiLabel: "还没有素材，点击让AI帮我生成",
  },
  {
    asset: "摄影师信息",
    type: "text" as const,
    hint: "例如: 张三 | 用镜头捕捉生活中的诗意瞬间",
    aiLabel: "还没有想好，点击让AI帮我生成",
  },
];

export default function AssetFormMockup() {
  const [modes, setModes] = useState<RowMode[]>(rows.map(() => "upload"));

  const toggleMode = (i: number) => {
    setModes((prev) => {
      const next = [...prev];
      next[i] = prev[i] === "upload" ? "ai" : "upload";
      return next;
    });
  };

  return (
    <div className="my-12 max-w-md rounded-2xl border border-foreground/[0.12] overflow-hidden bg-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
      {/* Header */}
      <div className="grid grid-cols-[0.9fr_2fr] border-b border-foreground/[0.08]">
        <div className="px-5 py-3.5 text-xs font-medium text-foreground/90 tracking-wide bg-white/[0.02]">
          资产
        </div>
        <div className="px-5 py-3.5 text-xs font-medium text-foreground/90 tracking-wide bg-white/[0.02] border-l border-foreground/[0.08]">
          您的输入
        </div>
      </div>
      {/* Rows */}
      {rows.map((row, i) => (
        <div
          key={i}
          className="grid grid-cols-[0.9fr_2fr] border-b border-foreground/[0.06] last:border-b-0"
        >
          <div className="px-5 py-5 text-xs text-foreground/85 flex items-start pt-6 leading-relaxed">
            {row.asset}
          </div>
          <div className="px-5 py-5 pt-5 pb-5 border-l border-foreground/[0.08] space-y-4">
            {modes[i] === "upload" ? (
              <>
                {row.type === "upload" ? (
                  <div className="rounded-xl border border-dashed border-foreground/15 bg-white/[0.04] px-5 py-8 flex flex-col items-center justify-center gap-3">
                    <span className="text-2xl text-foreground/50 font-light">+</span>
                    <span className="text-xs text-muted-foreground text-center leading-relaxed max-w-[85%]">
                      {row.hint}
                    </span>
                  </div>
                ) : (
                  <div className="rounded-xl border border-foreground/15 bg-white/[0.04] px-5 py-4">
                    <span className="text-xs text-muted-foreground leading-relaxed">{row.hint}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => toggleMode(i)}
                  className="text-xs text-foreground/55 hover:text-foreground/85 transition-colors duration-200 block"
                >
                  ♦ {row.aiLabel}
                </button>
              </>
            ) : (
              <>
                <div className="rounded-xl border border-foreground/12 bg-white/[0.06] px-5 py-6 flex flex-col items-center justify-center gap-2">
                  <span className="text-xs text-foreground/85 font-medium tracking-wide">
                    AI 会帮你生成素材
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleMode(i)}
                  className="text-xs text-muted-foreground hover:text-foreground/85 transition-colors duration-200"
                >
                  手动上传
                </button>
              </>
            )}
          </div>
        </div>
      ))}
      {/* Buttons */}
      <div className="px-5 py-5 flex justify-end gap-4 border-t border-foreground/[0.08] bg-white/[0.02]">
        <button
          type="button"
          className="px-5 py-2.5 text-xs rounded-xl border border-foreground/20 text-foreground/90 bg-transparent hover:bg-white/[0.04] transition-colors duration-200"
        >
          暂时跳过
        </button>
        <button
          type="button"
          className="px-5 py-2.5 text-xs rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity duration-200"
        >
          提交
        </button>
      </div>
    </div>
  );
}
