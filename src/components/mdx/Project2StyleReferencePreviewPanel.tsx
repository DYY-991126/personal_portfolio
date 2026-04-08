"use client";

import { Project2UIToolCard } from "./Project2AIToolCards";
import Project2PreviewAssistantMessage from "./Project2PreviewAssistantMessage";

const TOOL = {
  type: "show_style_references" as const,
  payload: {
    title: "风格参考图",
    referenceImages: [
      { id: "style-1", title: "温暖简洁", description: "强调产品展示与柔和氛围" },
      { id: "style-2", title: "轻盈清新", description: "更明亮，更适合生活方式类表达" },
      { id: "style-3", title: "克制质感", description: "突出品牌感与可信度" },
      { id: "style-4", title: "亲和手作感", description: "更贴近宠物烘焙工作室的个性" },
      { id: "style-5", title: "安静极简", description: "减少装饰，把重点放在内容" },
      { id: "style-6", title: "柔和品牌感", description: "在统一气质下做另一种变体" },
    ],
  },
};

export default function Project2StyleReferencePreviewPanel() {
  return (
    <div className="my-10 rounded-[28px] bg-[#f7f4ee] p-8 md:p-10">
      <div className="mx-auto flex w-full max-w-[980px] flex-col gap-5 overflow-visible">
        <Project2PreviewAssistantMessage
          content={"基于刚刚确认的内容结构，我先整理了几组风格参考图。\n你可以直接看感觉，告诉我更接近你想要的是哪一张。"}
        />
        <div className="flex items-center justify-center overflow-visible">
          <div className="h-[520px] w-full overflow-visible">
            <Project2UIToolCard tool={TOOL} onQuickReply={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
}
