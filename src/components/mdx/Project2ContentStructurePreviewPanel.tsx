"use client";

import { Project2UIToolCard } from "./Project2AIToolCards";
import Project2PreviewAssistantMessage from "./Project2PreviewAssistantMessage";

const TOOL = {
  type: "design_content_structure" as const,
  payload: {
    siteName: "宠物烘焙工作室官网",
    pages: [
      {
        id: "home",
        name: "首页",
        modules: [
          { id: "hero", name: "首屏介绍", purpose: "先讲清做什么、适合谁" },
          { id: "products", name: "产品展示", purpose: "展示主打产品与卖点" },
          { id: "ordering", name: "订购方式", purpose: "说明下单流程和规则" },
          { id: "trust", name: "用户反馈", purpose: "建立信任，降低决策成本" },
        ],
      },
    ],
  },
};

export default function Project2ContentStructurePreviewPanel() {
  return (
    <div className="my-10 rounded-[28px] bg-[#f7f4ee] p-8 md:p-10">
      <div className="mx-auto flex w-full max-w-[980px] flex-col gap-5 overflow-visible">
        <Project2PreviewAssistantMessage
          content={"我先把刚刚聊到的信息整理成一个内容结构草图。\n你先看整体方向对不对，如果需要，我可以继续一起调整模块和顺序。"}
        />
        <div className="flex justify-start">
          <Project2UIToolCard tool={TOOL} onQuickReply={() => {}} />
        </div>
      </div>
    </div>
  );
}
