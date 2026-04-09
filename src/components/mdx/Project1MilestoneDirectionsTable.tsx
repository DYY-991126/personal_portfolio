/**
 * 里程碑方向 × 具体需求表（project-1）：首列加宽避免折行
 */
export default function Project1MilestoneDirectionsTable() {
  return (
    <div className="my-12 overflow-x-auto rounded-none border border-[#333333] bg-[#141414]">
      <table className="w-full table-fixed border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-[32%] min-w-48 max-w-none border-b border-[#333333] bg-[#1c1c1c] px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap">
              方向
            </th>
            <th className="border-b border-[#333333] bg-[#1c1c1c] px-4 py-3 text-left font-semibold text-foreground">
              具体需求
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="align-top whitespace-nowrap border-b border-[#333333] px-4 py-3 font-medium text-foreground">
              产品稳定性
            </td>
            <td className="border-b border-[#333333] px-4 py-3 text-muted-foreground leading-relaxed">
              修复代码报错、白屏、AI 卡住、生成失败等
            </td>
          </tr>
          <tr>
            <td className="align-top whitespace-nowrap border-b border-[#333333] px-4 py-3 font-medium text-foreground">
              必要功能补齐
            </td>
            <td className="border-b border-[#333333] px-4 py-3 text-muted-foreground leading-relaxed">
              提供后端能力，满足表单收集、日历预约等留咨场景
            </td>
          </tr>
          <tr>
            <td className="align-top whitespace-nowrap px-4 py-3 font-medium text-foreground">
              提高交付效率
            </td>
            <td className="px-4 py-3 text-muted-foreground leading-relaxed">
              <div className="flex flex-col gap-2">
                <span>生成前对齐内容/视觉/功能层需求，减少首轮偏差</span>
                <span>生成后为用户制定最短可发布的修改路径</span>
                <span>模型与上下文优化</span>
                <span>用户与 AI 的交互效率（多模态输入、圈绘、语音等）</span>
                <span>当 AI 修改失败时降低修改成本（撤回/版本管理、暂停）</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
