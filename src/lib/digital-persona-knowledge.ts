import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { PROJECTS } from "@/app/data";

/**
 * 与 ResumeDocument 保持一致的简历要点，供 Home 页「数字分身」AI 使用。
 * 若你更新了简历组件，请同步更新本段文字。
 */
export const RESUME_PLAIN_FOR_LLM = `
【邓毅洋 / DYY — 简历要点】
求职意向：AI 产品设计师（3 到 5 年行业经验，26）
联系方式：手机 17623066004 | 邮箱 dyyisgod@gmail.com | 微信 _DYYYYYD_

个人摘要：
聚焦 AI 产品与工具类设计，擅长在高不确定性阶段完成目标定义、关键链路设计与跨职能推进，兼顾体验质量、系统落地与商业结果。

工作经历 — 北京即设科技有限公司（3 年 10 个月）
· Wegic｜AI 产品设计师｜2024.12 – 2026.03｜面向全球用户的 AI 建站工具，用户量超过 10 万
  - 主导 Wegic 2.0 里程碑目标定义与跨团队拆解，围绕“生成到发布”关键链路推进产品迭代，推动用户发布率从 10% 提升至 50%。
  - 从 0 到 1 设计网站生成前沟通体系，推动首次付费率从 4% 提升至 8%，并支撑用户更高效地完成网站发布。
  - 主导 Agent 架构下的建站体验重设计，使用户进入编辑页后进入对话编辑的时间较 1.0 显著缩短，推动 Wegic 2.0 订阅转化较 1.0 提升 1 倍。
  - 推动 Agentic 高质量整站生成能力上线，建立可复用的网页生成方法，生成网页满意度达到 80%，并使网站视觉质量在同类产品中形成明显优势。
· Ugic｜产品负责人｜2024.06 – 2024.11｜面向全球用户的 AI 生成 UI 工具，用户量超过 2 万
  - 主导全球第一款基于 Design System 生成 UI 的产品从 0 到 1 上线与商业化落地，首月实现 $3,000 收入，付费率达到 3.48%，登上 Product Hunt #3，并获得社媒传播与用户好评。
  - 主导产品 workflow 架构设计与优化、核心交互链路和界面设计，并输出关键功能模块 PRD；推动生成成本降低 90%。
· 即时设计｜UX｜2022.05 – 2024.06｜国内 UI 设计工具，累计服务超过 400 万用户
  - 负责 UI 设计工具的核心模块体验设计/用户调研/产品调研报告工作。覆盖元素创建交互体系构建、图层面板、工作台搜索、颜色选择器等核心模块
  - 参与底层重构阶段的设计系统建设，整理并沉淀 token、图标、基础组件与复合界面模块。

实习经历
· 上海溥励 / 汽车街｜UE 设计师｜2021.08 – 2022.02｜独立负责 B2B 二手车交易平台车辆物流模块的流程梳理、交互方案与 UI 设计，并结合走查、用户反馈与竞品分析持续推进体验迭代。
· 网信中心 / 指尖移通｜设计组负责人｜2020.08 – 2021.07｜负责校园生活一体化工具的核心页面改版与 0–1 功能模块设计，覆盖流程、交互、UI 与上线协同；推动团队由 PS 迁移至 Figma，提升设计产出与协作效率。

教育：重庆邮电大学移通学院 · 软件工程 · 本科｜2018.09 – 2022.06｜CET-4｜驾驶证 C1
`.trim();

/** 按需读取单篇 MDX 时允许的最大字符数（压缩后），避免单次 tool 结果过大 */
const MAX_ON_DEMAND_PROJECT_CHARS = 28_000;

function compressMdxBody(raw: string, maxLen: number): string {
  const s = raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[A-Za-z][A-Za-z0-9]*[\s\S]*?\/>/g, " ")
    .replace(/<[A-Za-z][A-Za-z0-9]*[\s\S]*?<\/[A-Za-z][A-Za-z0-9]*>/g, " ")
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, " ")
    .replace(/^import\s+.+$/gm, "")
    .replace(/\s+/g, " ")
    .trim();

  if (s.length <= maxLen) {
    return s;
  }

  const cut = s.slice(0, maxLen);
  const lastBreak = Math.max(
    cut.lastIndexOf("。"),
    cut.lastIndexOf("？"),
    cut.lastIndexOf("！"),
    cut.lastIndexOf("\n")
  );
  const head = lastBreak > maxLen * 0.65 ? cut.slice(0, lastBreak + 1) : cut;
  return `${head}…（正文已截断；更完整的排版与嵌入组件请让用户打开站内项目页）`;
}

/**
 * 系统提示用的轻量上下文：简历 + 项目索引（含 data 里的一句话简介）。
 * 各项目长篇案例正文不预载，由模型通过 read_project_case 工具按需读取。
 */
export function getPersonaBaselineContext(): string {
  const index = PROJECTS.map((p) => {
    const parts = [
      `${p.id}`,
      p.title,
      p.subtitle,
      p.year,
      p.role,
      p.category,
      p.product,
      p.description ? `简介：${p.description}` : "",
    ].filter(Boolean);
    return `· ${parts.join("｜")}`;
  }).join("\n");

  return [
    "═══ 简历（经历与数据以本节为准）═══",
    RESUME_PLAIN_FOR_LLM,
    "\n═══ 项目一览（详细案例正文勿臆测；需要时调用 read_project_case(projectId)）═══\n",
    index,
  ].join("\n");
}

/**
 * 读取单个项目的 MDX 正文（去掉大部分组件标签），供聊天工具 read_project_case 使用。
 */
export function loadProjectCasePlainText(projectId: string): string {
  const p = PROJECTS.find((x) => x.id === projectId);
  if (!p) {
    return `【错误】未知 projectId "${projectId}"。有效 id：${PROJECTS.map((x) => x.id).join(", ")}`;
  }

  const filePath = path.join(process.cwd(), "src/content/projects", `${projectId}.mdx`);
  if (!fs.existsSync(filePath)) {
    return `【错误】未找到文件 ${projectId}.mdx`;
  }

  const file = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(file);
  const period =
    typeof data.year === "string" && data.year.trim()
      ? data.year
      : p.year?.trim();
  const fmBits = [
    `标题: ${typeof data.title === "string" ? data.title : p.title}`,
    typeof data.subtitle === "string" ? `副标题: ${data.subtitle}` : "",
    period ? `周期: ${period}` : "",
    `角色: ${typeof data.role === "string" ? data.role : p.role}`,
  ]
    .filter(Boolean)
    .join("\n");

  const body = compressMdxBody(content, MAX_ON_DEMAND_PROJECT_CHARS);
  return `【${p.id}｜${p.title} — 案例正文摘录（服务端按需读取）】\n${fmBits}\n\n${body}`;
}
