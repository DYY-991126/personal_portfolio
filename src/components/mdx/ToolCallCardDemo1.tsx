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
          description="Roadmap is ready. I've set the priority on getting the product photos done first."
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
          description="Timmy has finished the check-up and reviewed the logs. Everything looks stable and good to go. No issues found."
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
          description="I'm scanning through the site's config files to find where the 'shipping rate' is set."
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
          description="I'm designing the product shot for your new perfume right now—focusing on that elegant, floral vibe we discussed."
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
          description="I'm putting together a short 15-second teaser clip for your Instagram story."
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
          description="I'm designing the product shot for your new perfume right now—focusing on that elegant, floral vibe we discussed."
          status="done"
        >
          <WorkProductCodeStream />
        </ToolCallCardBase>

        {/* 调研 */}
        <ToolCallCardBase
          taskTitle="调研"
          avatar="turi"
          description="I'm checking out the top perfume blogs and competitor sites to see how they're pricing their summer scents right now."
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
