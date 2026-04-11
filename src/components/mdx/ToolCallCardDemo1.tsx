"use client";

import ToolCallCardBase from "./ToolCallCardBase";
import WorkProductDiagnosticsFiles from "./WorkProductDiagnosticsFiles";
import WorkProductTodoCard from "./WorkProductTodoCard";
import WorkProductImageGrid from "./WorkProductImageGrid";
import WorkProductVideoGrid from "./WorkProductVideoGrid";
import WorkProductResearchChips from "./WorkProductResearchChips";
import WorkProductCodeStream from "./WorkProductCodeStream";

/** 卡片演示：置于最外层容器，响应式平铺 */
export default function ToolCallCardDemo1() {
  return (
    <div className="my-10 flex justify-center bg-[#f3f4f6] py-10">
      <div
        className="w-full max-w-4xl px-4 [&>*]:break-inside-avoid [&>*]:mb-3"
        style={{ columns: 2, columnGap: 12 }}
      >
        {/* 做计划 */}
        <ToolCallCardBase
          taskTitle="做计划"
          avatar="kimmy"
          description="已为你的宠物烘焙工作室排好上线路线：先完成产品拍摄，再落页面与质检。"
          status="done"
        >
          <WorkProductTodoCard
            items={[
              { label: "Preliminary Research", status: "done" },
              { label: "Defining the Visual Style", status: "done" },
              { label: "Designing the Site Framework", status: "in_progress" },
              { label: "Design&Building the Pages", status: "pending" },
              { label: "Final Quality Check", status: "pending" },
            ]}
          />
        </ToolCallCardBase>

        {/* 做测试 */}
        <ToolCallCardBase
          taskTitle="测试"
          avatar="timmy"
          description="已核对运行日志与诊断项，当前未检出阻塞性问题，结账流程可继续验证。"
          status="done"
        >
          <WorkProductDiagnosticsFiles
            items={[{ label: "Diagnostics", count: 3 }]}
          />
        </ToolCallCardBase>

        {/* 找文件 */}
        <ToolCallCardBase
          taskTitle="找文件"
          avatar="turi"
          description="正在在站点配置目录里查找运费规则 shipping rate 是在哪个文件里定义的。"
          status="doing"
        >
          <WorkProductDiagnosticsFiles
            items={[{ label: "Founded", count: 1 }]}
          />
        </ToolCallCardBase>

        {/* 生成图片 */}
        <ToolCallCardBase
          taskTitle="生成图片"
          avatar="kimmy"
          description="正在按「手作、温暖」调性生成你的产品陈列主图，用于首页首屏。"
          status="doing"
        >
          <WorkProductImageGrid
            images={[
              { src: "/projects/project-1/cover.jpg", alt: "生成图 1" },
              { src: "/projects/project-2/cover.jpg", alt: "生成图 2" },
              { src: "/projects/project-3/cover.jpg", alt: "生成图 3" },
              { src: "/projects/project-1/structural-analysis.png", alt: "生成图 4" },
            ]}
          />
        </ToolCallCardBase>

        {/* 生成视频 */}
        <ToolCallCardBase
          taskTitle="生成视频"
          avatar="kimmy"
          description="正在生成你的产品宣传视频。"
          status="doing"
        >
          <WorkProductVideoGrid
            videos={[
              { src: "/projects/project-3/做设计4.mp4" },
              { src: "/projects/project-3/做设计1.mp4" },
            ]}
          />
        </ToolCallCardBase>

        {/* 做设计 */}
        <ToolCallCardBase
          taskTitle="做设计"
          avatar="kimmy"
          description="已把首页 Hero 的文案与按钮样式写入页面，并同步到线上预览。"
          status="done"
        >
          <WorkProductCodeStream />
        </ToolCallCardBase>

        {/* 调研 */}
        <ToolCallCardBase
          taskTitle="调研"
          avatar="turi"
          description="已整理多家同城烘焙店的套餐结构与价位，供你对比定价与活动形式。"
          status="done"
        >
          <WorkProductResearchChips
            items={[
              { name: "Apple.com" },
              { name: "Github.com" },
              { name: "Google.com" },
              { name: "Youtube.com" },
              { name: "Facebook.com" },
            ]}
          />
        </ToolCallCardBase>
      </div>
    </div>
  );
}
