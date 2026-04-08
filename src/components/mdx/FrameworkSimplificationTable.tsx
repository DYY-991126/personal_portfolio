"use client";

const ROWS: { category: string; items: string[]; followUp: string }[] = [
  {
    category: "可 AI 替代的 GUI 操作",
    items: [
      "模块上移 / 下移",
      "新增模块",
      "删除模块",
      "复制模块",
      "字体修改",
      "全站颜色修改",
      "页面切换选择器",
      "当前位置索引",
      "批量上传图片",
      "上传参考图",
      "上传手绘",
      "上传附件 / 内嵌 weights",
      "选中对象弹出相关功能指令面板",
    ],
    followUp: "1. 移除；2. 通过增强用户多模态输入来解决",
  },
  {
    category: "新架构下无法迁移功能",
    items: ["留咨表单", "支付功能"],
    followUp: "在新架构下重做产品设计方案，因体量大不在 MVP 做",
  },
  {
    category: "新架构下不需要功能",
    items: ["绿色定位器"],
    followUp: "直接移除",
  },
  {
    category: "早期不完善且上线后长期未迭代",
    items: [
      "圈绘（且有多处存在）",
      "信息同步",
      "AI 客服",
      "智能建议（是写死的建议）",
    ],
    followUp: "记录到需求池内，上线后按优先级判断是否重做方案",
  },
  {
    category: "必要性不足在一级页面的信息 / UI 入口",
    items: ["积分剩余", "域名", "网站状态", "网站设置"],
    followUp: "若信息在其他地方可见则移除；独立 UI 入口收纳到二级页面",
  },
  {
    category: "界面简化后不必要的引导",
    items: [
      "界面教程的引导",
      "商业化增长为目标的 onboarding 流程、付费弹窗",
    ],
    followUp: "移除",
  },
];

export default function FrameworkSimplificationTable() {
  return (
    <div className="my-14 overflow-hidden rounded-xl border-2 border-border/50 bg-muted/40 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr>
              <th className="w-[28%] min-w-[180px] border-b border-border/40 bg-muted/30 px-6 py-4 text-left font-semibold text-foreground">
                分类
              </th>
              <th className="border-b border-border/40 bg-muted/30 px-6 py-4 text-left font-semibold text-foreground">
                具体项
              </th>
              <th className="w-[22%] min-w-[140px] border-b border-border/40 bg-muted/30 px-6 py-4 text-left font-semibold text-foreground">
                处理方式
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border/20 last:border-b-0 hover:bg-muted/20 transition-colors"
              >
                <td className="border-r border-border/30 px-6 py-4 align-top font-medium text-foreground">
                  {row.category}
                </td>
                <td className="border-r border-border/30 px-6 py-4 text-muted-foreground leading-relaxed">
                  <ul className="list-disc space-y-1.5 pl-4 marker:text-muted-foreground/60">
                    {row.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4 text-muted-foreground leading-relaxed align-top break-words whitespace-normal min-w-0 max-w-[280px]">
                  {row.followUp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
