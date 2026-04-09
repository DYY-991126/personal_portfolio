export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  year: string;
  client?: string;
  role: string;
  coverImage: string;
  description?: string;
}

export const PROJECTS: Project[] = [
  {
    id: "project-1",
    title: "产品里程碑定义与落地拆解",
    year: "2025.12 – 2026.02",
    role: "Goal Definition & Team Alignment",
    coverImage: "/projects/project-1/cover.jpg",
  },
  {
    id: "project-2",
    title: "首次生成网站符合预期",
    subtitle: "生成前沟通系统的设计与落地",
    year: "2025.12 – 2026.02",
    role: "项目负责人 & 产品设计师",
    coverImage: "/projects/project-2/cover.jpg",
  },
  {
    id: "project-3",
    title: "Agent 架构下的 0 到 1 产品设计",
    year: "2025.12 – 2026.02",
    role: "产品设计师 & 架构参与",
    coverImage: "/projects/project-3/cover.jpg",
  },
  {
    id: "project-4",
    title: "LLM 生成高质量网页",
    subtitle: "如何把 AI 建站从能用，做成可交付",
    category: "AI Website Generation",
    year: "2025.09 – 2025.10",
    client: "Wegic",
    role: "项目负责人",
    coverImage: "/project_cover/logo animation motion design 3D cinema 4d Concert opening.jpg",
    description: "Claude 4.5 视觉未达预期时 Gemini 3 同期上线；小范围验证后扩样、立项双轨并推动产线上线，主线收敛 Gemini 3。正文说明 Website Design 主/子技能、联网基建、交付门禁与端到端链路。",
  },
  {
    id: "project-5",
    title: "白板内的对象创建交互体系",
    subtitle: "白板编辑器中的快速创建与连接系统",
    category: "编辑器交互系统",
    year: "2024",
    client: "即时设计",
    role: "产品设计师（交互专项）",
    coverImage: "/project_cover/图像.jpg",
  },
  {
    id: "project-7",
    title: "构建 AI 生成设计稿 - Ugic",
    subtitle: "利用 Figma Design System 生成原型与设计稿",
    category: "Figma Plugin / AI Design Workflow",
    year: "2024.06 – 2024.09",
    client: "Figma 平台产品",
    role: "产品设计师 / AI 能力调试 / 商业化",
    coverImage: "/project_cover/图像3.jpg",
  },
];
