"use client";

import Mermaid from "./Mermaid";

/** Ugic 成本优化的三阶段 workflow 示意（Mermaid）。拆成三个无 props 组件，避免 MDX/RSC 不把数字属性传到 client 组件导致 chart 为空。 */

/** 阶段 1：与参考图一致 — AI-1 → json（模块1–5）→ 每路 AI-2 + 全量组件库 → DSL → 二次渲染引擎 → Canvas */
const STAGE_1 = `flowchart TB
  subgraph json_wrap["json"]
    direction TB
    M1["模块1"]
    M2["模块2"]
    M3["模块3"]
    M4["模块4"]
    M5["模块5"]
  end
  A1["AI - 1"] --> M1 & M2 & M3 & M4 & M5

  LIB[("全量组件库信息")]

  M1 --> A21["AI - 2"]
  M2 --> A22["AI - 2"]
  M3 --> A23["AI - 2"]
  M4 --> A24["AI - 2"]
  M5 --> A25["AI - 2"]

  LIB --> A21
  LIB --> A22
  LIB --> A23
  LIB --> A24
  LIB --> A25

  A21 --> D1["模块1 - DSL 代码"]
  A22 --> D2["模块2 - DSL 代码"]
  A23 --> D3["模块3 - DSL 代码"]
  A24 --> D4["模块4 - DSL 代码"]
  A25 --> D5["模块5 - DSL 代码"]

  D1 --> REND["二次渲染引擎<br/>渲染至 Canvas"]
  D2 --> REND
  D3 --> REND
  D4 --> REND
  D5 --> REND

  subgraph cv["画布呈现"]
    direction TB
    F1["模块1"]
    F2["模块2"]
    F3["模块3"]
    F4["模块4"]
    F5["模块5"]
  end

  REND --> F1
  sum["成本：单页约 1 USD<br/>多路 AI-2 × 每次全量组件库上下文"]
  LIB -.-> sum`;

const STAGE_2 = `flowchart TB
  subgraph page["单页 · 仍按模块多次调用"]
    m1["模块 1"]
    m2["模块 2"]
    mn["模块 n"]
  end
  s1[("与子集 A 相关的组件")]
  s2[("与子集 B 相关的组件")]
  sn[("与子集 n 相关的组件")]
  m1 --> a1["LLM 生成"]
  m2 --> a2["LLM 生成"]
  mn --> a3["LLM 生成"]
  s1 --> a1
  s2 --> a2
  sn --> a3
  sum["结果：单页约 0.4-0.6 USD<br/>调用次数仍多 · 单次上下文变小"]
  a1 --> sum
  a2 --> sum
  a3 --> sum`;

const STAGE_3 = `flowchart TB
  req["需求 + Design System 元信息"] --> plan["页面级结构整理与组件筛选"]
  plan --> once["每页仅 1 次生成调用"]
  inj[("仅注入本页实际用到的组件")] --> once
  once --> out["DSL 校验后写入 Figma"]
  sum["结果：单页约 0.1 USD<br/>调用次数与重复上下文同时下降"]
  once --> sum`;

export function Project7CostWorkflowStage1() {
  return <Mermaid chart={STAGE_1} />;
}

export function Project7CostWorkflowStage2() {
  return <Mermaid chart={STAGE_2} />;
}

export function Project7CostWorkflowStage3() {
  return <Mermaid chart={STAGE_3} />;
}
