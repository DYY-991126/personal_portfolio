"use client";

import Mermaid from "./Mermaid";

/** 与 MDX 解耦：避免 RSC→Client 边界上 chart/children 序列化丢失 */
const PROJECT_3_AGENT_ARCHITECTURE_CHART = `flowchart LR
  U[用户输入] --> E[主 Agent 评估]
  subgraph LOOP[Agent Loop]
    direction LR
    E -->|调用工具| RT[Researcher Tool]
    RT -->|摘要回传| E
  end
  E -->|无工具调用| F[最终回复]
`;

export default function Project3AgentArchitectureMermaid() {
  return <Mermaid chart={PROJECT_3_AGENT_ARCHITECTURE_CHART} />;
}
