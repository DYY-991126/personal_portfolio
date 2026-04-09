import { ReactNode } from "react";

export interface ProcessStep {
  title: string;
  description?: ReactNode;
  detail?: string;
}

const PRESETS: Record<string, ProcessStep[]> = {
  design: [
    { title: "需求沟通", description: "明确目标与业务逻辑，2-3 轮对话形成雏形" },
    { title: "内容结构确认", description: "页面规划 + 模块构成（内容层面 + 功能层面）" },
    { title: "视觉风格确认", description: "基于内容结构生成 6 种 9:16 参考图，供用户选择" },
    { title: "资料上传", description: "分门别类的信息收集表单，填入真实业务资料" },
  ],
};

interface ProcessFlowProps {
  variant?: keyof typeof PRESETS;
  steps?: ProcessStep[];
}

export default function ProcessFlow({ variant, steps }: ProcessFlowProps) {
  const flowSteps = steps ?? (variant ? PRESETS[variant] : PRESETS.design) ?? [];
  if (!flowSteps.length) return null;

  return (
    <div className="my-12">
      <div className="flex flex-col md:flex-row md:items-stretch gap-6 md:gap-3">
        {flowSteps.map((step, index) => (
          <div key={index} className="flex flex-col md:flex-row md:flex-1">
            {/* Step card */}
            <div className="flex-1 flex flex-col p-5 rounded-xl border border-border/40 bg-muted/20 min-h-[110px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-foreground/10 text-foreground text-sm font-semibold shrink-0">
                  {index + 1}
                </span>
                <span className="text-base font-semibold text-foreground">
                  {step.title}
                </span>
              </div>
              {step.description && (
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </div>
              )}
              {step.detail && (
                <p className="text-xs text-muted-foreground/80 mt-2 pt-2 border-t border-border/30">
                  {step.detail}
                </p>
              )}
            </div>
            {/* Arrow */}
            {index < flowSteps.length - 1 && (
              <div className="flex md:flex-col items-center justify-center py-2 md:py-0 md:px-1">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted-foreground/40 rotate-90 md:rotate-0"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
