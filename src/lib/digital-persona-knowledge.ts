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
持续负责 AI 产品与复杂系统设计工作。推动 AI 建站关键链路上线并实现首次付费率翻倍；作为产品负责人推动 AI 生成 UI 产品从 0 到 1 构建，并在冷启动阶段实现盈利。

工作经历 — 北京即设科技有限公司（3 年 10 个月）
· Wegic｜AI 产品设计师｜2024.12 – 2026.03｜面向全球用户的 AI 建站工具，用户量超过 10 万
  - 定义里程碑并拆解路径，推动团队于 2026.02.10 达成「50% 首次建站用户在 1 小时内完成发布」。
  - 主导生成前沟通体系从 0 到 1，将产品从工具逻辑推进为服务逻辑，首次付费率由 4% 提升至 8%。
  - 负责 Agent 架构下的 0–1 产品设计，推动 Gemini 3 成为正式生成方案；订阅率由 0.2% 提升至 0.4%。
· Ugic｜产品负责人｜2024.06 – 2024.11｜面向全球用户的 AI 生成 UI 工具，用户量超过 2 万
  - 推动 0–1 与商业化上线，冷启动阶段付费率 3.48%，ROI > 1，产品持续盈利。
  - AI 层：workflow 架构与模块定义；产品层：核心功能、界面与流程、数据/产物/成本监控、定价与权益；冷启动与 GTM、答疑与迭代。
· 即时设计｜UX｜2022.05 – 2024.06｜国内 UI 设计工具，累计服务超过 400 万用户
  - 负责 UI 工具与 canvas 类编辑器设计，覆盖左侧面板、工作台搜索、白板创建对象等；参与设计系统与多平台一致性。

实习经历
· 上海溥励 / 汽车街｜UE 设计师｜2021.08 – 2022.02｜B2B 二手车交易 UE，物流模块全流程与体验迭代。
· 网信中心 / 指尖移通｜设计组负责人｜2020.08 – 2021.07｜核心改版、0–1 模块与 Figma 迁移。

教育：重庆邮电大学移通学院 · 软件工程 · 本科｜2018.09 – 2022.06｜CET-4｜驾驶证 C1
`.trim();

/** 按需读取单篇 MDX 时允许的最大字符数（压缩后），避免单次 tool 结果过大 */
const MAX_ON_DEMAND_PROJECT_CHARS = 28_000;

function compressMdxBody(raw: string, maxLen: number): string {
  let s = raw
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
