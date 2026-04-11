const FIXED_FLOW = `用户输入
  |
需求理解
  |
内容结构
  |
风格确认
  |
资料设计
  |
进入生成`;

const FLEX_FLOW = `用户输入
  |
当前信息判断
  |
需求理解 / 内容结构 / 风格确认 / 资料设计
  ↺ 按需要回看与补充
  |
进入生成`;

const preClass =
  "overflow-x-auto rounded-lg border border-border/40 bg-muted/30 p-4 text-[13px] leading-relaxed font-mono text-foreground/90 whitespace-pre";

/** project-2：固定流程 vs 灵活流程，左右排版（窄屏上下堆叠）。 */
export default function Project2FlowComparison() {
  return (
    <div className="not-prose my-8 grid min-w-0 grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
      <div className="min-w-0">
        <p className="mb-3 text-sm font-semibold text-foreground">固定流程</p>
        <pre className={preClass}>{FIXED_FLOW}</pre>
      </div>
      <div className="min-w-0">
        <p className="mb-3 text-sm font-semibold text-foreground">灵活流程</p>
        <pre className={preClass}>{FLEX_FLOW}</pre>
      </div>
    </div>
  );
}
