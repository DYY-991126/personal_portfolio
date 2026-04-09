import { Project5DemoFrame, Project5MiniStat } from "./Project5DemoFrame";

const MODULES = [
  {
    title: "创建点系统",
    body: "定义控制点、连接点、创建点，以及热区何时被激活。",
    position: "left-0 top-8",
  },
  {
    title: "创建模式系统",
    body: "统一点击创建、Press + Drag 创建与快捷键创建的节奏。",
    position: "right-0 top-8",
  },
  {
    title: "连接与优先级",
    body: "判断优先连接谁、什么时候新建、什么时候连接已有对象。",
    position: "left-10 bottom-6",
  },
  {
    title: "边界与稳定性",
    body: "处理碰撞、边界、视角平移 / 缩放、吸附和旋转。",
    position: "right-10 bottom-6",
  },
];

export default function Project5SystemMap() {
  return (
    <Project5DemoFrame
      title="系统地图"
      description="这一页不是在讲某一个按钮，而是在讲白板内的对象创建交互体系。下面这 4 个模块共同决定了它能不能顺畅、稳定、可预测。"
      footer={
        <div className="grid gap-3 md:grid-cols-3">
          <Project5MiniStat label="入口" value="创建点由热区激活，不常驻屏幕" />
          <Project5MiniStat label="动作" value="点击、拖拽、快捷键遵循同一套规则" />
          <Project5MiniStat label="复杂场景" value="边界、碰撞、视角变化仍保持稳定" />
        </div>
      }
    >
      <div className="overflow-x-auto">
        <div className="relative min-h-[560px] min-w-[900px] overflow-hidden rounded-[24px] border border-border/20 bg-[linear-gradient(180deg,#fbfaf5_0%,#f8f5ee_100%)] px-6 py-8">
        <svg
          viewBox="0 0 900 560"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="project5-map-line" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#1f8ef1" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#1f8ef1" stopOpacity="0.45" />
            </linearGradient>
          </defs>
          <path
            d="M450 280 L220 145"
            stroke="url(#project5-map-line)"
            strokeWidth="2.5"
            strokeDasharray="8 10"
            fill="none"
          />
          <path
            d="M450 280 L680 145"
            stroke="url(#project5-map-line)"
            strokeWidth="2.5"
            strokeDasharray="8 10"
            fill="none"
          />
          <path
            d="M450 280 L260 420"
            stroke="url(#project5-map-line)"
            strokeWidth="2.5"
            strokeDasharray="8 10"
            fill="none"
          />
          <path
            d="M450 280 L640 420"
            stroke="url(#project5-map-line)"
            strokeWidth="2.5"
            strokeDasharray="8 10"
            fill="none"
          />
        </svg>

        <div className="relative mx-auto mt-36 flex h-[180px] max-w-[360px] flex-col items-center justify-center rounded-[36px] border border-[#1f8ef1]/30 bg-[#1f8ef1] px-8 text-center text-white shadow-[0_28px_80px_rgba(31,142,241,0.3)]">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/18 text-xl">
            +
          </div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/65">
            Core Interaction
          </p>
          <h4 className="mt-2 text-2xl font-semibold tracking-tight">
            白板内的对象创建交互体系
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-white/72">
            让对象本身成为下一步操作的起点，而不是让用户回到工具栏重新开始。
          </p>
        </div>

          {MODULES.map((module) => (
            <div
              key={module.title}
              className={`absolute w-full max-w-[280px] rounded-[28px] border border-border/30 bg-white/92 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] ${module.position}`}
            >
              <div className="inline-flex rounded-full bg-[#eff7ff] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[#1f8ef1]">
                module
              </div>
              <h5 className="mt-3 text-lg font-semibold text-foreground">{module.title}</h5>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {module.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Project5DemoFrame>
  );
}
