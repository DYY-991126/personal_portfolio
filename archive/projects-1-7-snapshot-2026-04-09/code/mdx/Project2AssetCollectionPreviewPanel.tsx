"use client";

import { Project2UIToolCard } from "./Project2AIToolCards";
import Project2PreviewAssistantMessage from "./Project2PreviewAssistantMessage";

const TOOL = {
  type: "show_asset_collection_form" as const,
  payload: {
    title: "资料收集表单",
    submitLabel: "提交",
    skipLabel: "暂时跳过",
    items: [
      {
        id: "contact",
        name: "联系方式",
        description: "填写微信、电话或邮箱",
        type: "text" as const,
        placeholder: "例如：微信 / 手机号 / 邮箱",
      },
      {
        id: "logo",
        name: "Logo",
        description: "上传品牌 Logo，若没有也可以让 AI 先生成",
        type: "file" as const,
      },
      {
        id: "product-images",
        name: "产品图",
        description: "上传产品实拍图或包装图",
        type: "file" as const,
      },
    ],
  },
};

export default function Project2AssetCollectionPreviewPanel() {
  return (
    <div className="my-10 rounded-[28px] bg-[#f7f4ee] p-8 md:p-10">
      <div className="mx-auto flex w-full max-w-[980px] flex-col gap-5 overflow-visible">
        <Project2PreviewAssistantMessage
          content={"大方向已经确定了，接下来我需要再收集一些真正会影响网站落地的资料。\n你有的先上传，没有的也可以先跳过，我会继续帮你往下推进。"}
        />
        <div className="flex justify-start">
          <div className="shrink-0">
            <Project2UIToolCard tool={TOOL} onQuickReply={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
}
