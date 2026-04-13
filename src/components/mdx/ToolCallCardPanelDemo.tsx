"use client";

import { useCallback, useEffect, useState } from "react";
import ProgressBarDemo from "./ProgressBarDemo";
import ToolCallCardPanel from "./ToolCallCardPanel";
import ToolCallCardBase from "./ToolCallCardBase";
import WorkProductTodoCard from "./WorkProductTodoCard";
import WorkProductDiagnosticsFiles from "./WorkProductDiagnosticsFiles";
import WorkProductImageGrid from "./WorkProductImageGrid";
import WorkProductVideoGrid from "./WorkProductVideoGrid";
import WorkProductResearchChips from "./WorkProductResearchChips";
import WorkProductCodeStream from "./WorkProductCodeStream";

export const CARD_DELAY_MS = 2500;
export const DONE_DELAY_MS = 1200;

export const ALL_CARDS: Array<{
  taskTitle: string;
  avatar: string;
  description: string;
  status: "todo" | "doing" | "loading" | "done";
  children: React.ReactNode;
}> = [
  {
    taskTitle: "做计划",
    avatar: "kimmy",
    description: "已为你的宠物烘焙工作室排好上线路线：先完成产品拍摄，再落页面与质检。",
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
    description: "已核对运行日志与诊断项，当前未检出阻塞性问题，结账流程可继续验证。",
    status: "done",
    children: <WorkProductDiagnosticsFiles items={[{ label: "Diagnostics", count: 3 }]} />,
  },
  {
    taskTitle: "找文件",
    avatar: "turi",
    description: "正在在站点配置目录里查找运费规则 shipping rate 是在哪个文件里定义的。",
    status: "doing",
    children: <WorkProductDiagnosticsFiles items={[{ label: "Founded", count: 1 }]} />,
  },
  {
    taskTitle: "生成图片",
    avatar: "kimmy",
    description: "正在按「手作、温暖」调性生成你的产品陈列主图，用于首页首屏。",
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
    description: "正在生成你的产品宣传视频。",
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
    description: "已把首页 Hero 的文案与按钮样式写入页面，并同步到线上预览。",
    status: "done",
    children: <WorkProductCodeStream />,
  },
  {
    taskTitle: "调研",
    avatar: "turi",
    description: "已整理多家同城烘焙店的套餐结构与价位，供你对比定价与活动形式。",
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

export interface ToolCallCardPanelDemoProps {
  /** false：先展示进度卡片，点击底部展开 Wegic Studio 面板（与 Agent Looping 小节一致） */
  initialShowPanel?: boolean;
}

/** 面板演示：模拟 AI 运行过程，7 种任务类型渐进式出现；支持 Back 返回进度条卡片 */
export default function ToolCallCardPanelDemo({
  initialShowPanel = true,
}: ToolCallCardPanelDemoProps) {
  const [showPanel, setShowPanel] = useState(initialShowPanel);
  const [visibleCount, setVisibleCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const openPanel = useCallback(() => {
    setVisibleCount(0);
    setCompletedCount(0);
    setShowPanel(true);
  }, []);

  useEffect(() => {
    if (!showPanel) return;

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
  }, [showPanel]);

  return (
    <div
      className="my-10 flex h-[780px] justify-center items-center bg-[#f3f4f6] py-10"
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
          <ProgressBarDemo embedded onExpandClick={openPanel} />
        </div>
      )}
    </div>
  );
}
