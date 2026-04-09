"use client";

import { useEffect, useState } from "react";
import ProgressBarDemo from "./ProgressBarDemo";
import ToolCallCardPanel from "./ToolCallCardPanel";
import ToolCallCardBase from "./ToolCallCardBase";
import WorkProductTodoCard from "./WorkProductTodoCard";
import WorkProductDiagnosticsFiles from "./WorkProductDiagnosticsFiles";
import WorkProductImageGrid from "./WorkProductImageGrid";
import WorkProductVideoGrid from "./WorkProductVideoGrid";
import WorkProductResearchChips from "./WorkProductResearchChips";
import WorkProductCodeStream from "./WorkProductCodeStream";

const CARD_DELAY_MS = 2500;
const DONE_DELAY_MS = 1200;

const ALL_CARDS: Array<{
  taskTitle: string;
  avatar: string;
  description: string;
  status: "todo" | "doing" | "loading" | "done";
  children: React.ReactNode;
}> = [
  {
    taskTitle: "做计划",
    avatar: "kimmy",
    description: "Roadmap is ready. I've set the priority on getting the product photos done first.",
    status: "done",
    children: (
      <WorkProductTodoCard
        items={[
          { label: "Preliminary Research", status: "done" },
          { label: "Defining the Visual Style", status: "done" },
          { label: "Designing the Site Framework", status: "in_progress" },
          { label: "Design&Building the Pages", status: "pending" },
          { label: "Final Quality Check", status: "pending" },
        ]}
      />
    ),
  },
  {
    taskTitle: "测试",
    avatar: "timmy",
    description: "Timmy has finished the check-up and reviewed the logs. Everything looks stable and good to go. No issues found.",
    status: "done",
    children: <WorkProductDiagnosticsFiles items={[{ label: "Diagnostics", count: 3 }]} />,
  },
  {
    taskTitle: "找文件",
    avatar: "turi",
    description: "I'm scanning through the site's config files to find where the 'shipping rate' is set.",
    status: "doing",
    children: <WorkProductDiagnosticsFiles items={[{ label: "Founded", count: 1 }]} />,
  },
  {
    taskTitle: "生成图片",
    avatar: "kimmy",
    description: "I'm designing the product shot for your new perfume right now—focusing on that elegant, floral vibe we discussed.",
    status: "doing",
    children: (
      <WorkProductImageGrid
        images={[
          { src: "/projects/project-1/cover.jpg", alt: "生成图 1" },
          { src: "/projects/project-2/cover.jpg", alt: "生成图 2" },
          { src: "/projects/project-3/cover.jpg", alt: "生成图 3" },
          { src: "/projects/project-1/structural-analysis.png", alt: "生成图 4" },
        ]}
      />
    ),
  },
  {
    taskTitle: "生成视频",
    avatar: "kimmy",
    description: "I'm putting together a short 15-second teaser clip for your Instagram story.",
    status: "done",
    children: (
      <WorkProductVideoGrid
        videos={[
          { src: "/projects/project-3/做设计4.mp4" },
          { src: "/projects/project-3/做设计1.mp4" },
        ]}
      />
    ),
  },
  {
    taskTitle: "做设计",
    avatar: "kimmy",
    description: "I'm designing the product shot for your new perfume right now—focusing on that elegant, floral vibe we discussed.",
    status: "done",
    children: <WorkProductCodeStream />,
  },
  {
    taskTitle: "调研",
    avatar: "turi",
    description: "I'm checking out the top perfume blogs and competitor sites to see how they're pricing their summer scents right now.",
    status: "done",
    children: (
      <WorkProductResearchChips
        items={[
          { name: "Apple.com" },
          { name: "Github.com" },
          { name: "Google.com" },
          { name: "Youtube.com" },
          { name: "Facebook.com" },
        ]}
      />
    ),
  },
];

/** 工具调用面板的卡片内容：7 张卡片全部展示，用于从进度卡片展开时显示 */
export function ToolCallCardPanelCards() {
  return (
    <>
      {ALL_CARDS.map((card, i) => (
        <ToolCallCardBase
          key={i}
          avatar={card.avatar}
          description={card.description}
          status={card.status}
        >
          {card.children}
        </ToolCallCardBase>
      ))}
    </>
  );
}

/** 面板演示：模拟 AI 运行过程，7 种任务类型渐进式出现；支持 Back 返回进度条卡片 */
export default function ToolCallCardPanelDemo() {
  const [showPanel, setShowPanel] = useState(true);
  const [visibleCount, setVisibleCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const addCard = () => {
      setVisibleCount((v) => {
        if (v >= ALL_CARDS.length) return v;
        setTimeout(() => setCompletedCount((c) => c + 1), DONE_DELAY_MS);
        return v + 1;
      });
    };
    const initial = setTimeout(addCard, 500);
    const interval = setInterval(addCard, CARD_DELAY_MS);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="my-10 flex justify-center items-center bg-[#f3f4f6] py-10 min-h-[780px]"
      onWheel={(e) => e.stopPropagation()}
    >
      {showPanel ? (
        <div
          className="h-[700px] w-full max-w-md overflow-hidden rounded-2xl bg-white shrink-0"
          style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.06)" }}
        >
          <ToolCallCardPanel onBack={() => setShowPanel(false)}>
            {ALL_CARDS.slice(0, visibleCount).map((card, i) => (
              <ToolCallCardBase
                key={i}
                avatar={card.avatar}
                description={card.description}
                status={i < completedCount ? "done" : "loading"}
              >
                {card.children}
              </ToolCallCardBase>
            ))}
          </ToolCallCardPanel>
        </div>
      ) : (
        <div className="w-[340px] shrink-0">
          <ProgressBarDemo embedded onExpandClick={() => setShowPanel(true)} />
        </div>
      )}
    </div>
  );
}
