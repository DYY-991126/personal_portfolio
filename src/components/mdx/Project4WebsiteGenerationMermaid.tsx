"use client";

import Mermaid from "./Mermaid";

/** 整站生成链路示意（不含模型指令细节） */
const PROJECT_4_WEBSITE_GENERATION_CHART = `flowchart TB
  subgraph IN[输入侧]
    U[用户诉求与参考]
    X[业务侧前置结论可选]
  end
  IN --> G[Website Design 主技能]
  G --> W[站点设计策略与前端实现]
  G --> I[图片生成与路由]
  G --> V[开场与 Hero 视频]
  W --> MERGE[代码与资源合并为单次交付]
  I --> MERGE
  V --> MERGE
  MERGE --> T[自动化测试]
  T --> L[全量关键资源加载完成]
  L --> D[向用户呈现完整站点]
`;

export default function Project4WebsiteGenerationMermaid() {
  return <Mermaid chart={PROJECT_4_WEBSITE_GENERATION_CHART} />;
}
