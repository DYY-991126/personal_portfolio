export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  /** 省略时不展示年份（列表、画廊等同理） */
  year?: string;
  product?: string;
  role: string;
  coverImage: string;
  /** 为 true 时不渲染详情页大封面（列表/索引仍用 coverImage） */
  hideDetailCover?: boolean;
  description?: string;
}

export const PROJECTS: Project[] = [
  {
    id: "project-1",
    title: "AI 建站产品里程碑规划和拆解",
    product: "Wegic",
    year: "2025",
    role: "目标定义&路径拆解",
    coverImage: "/project_cover/1.png",
    hideDetailCover: true,
  },
  {
    id: "project-2",
    title: "生成网站前沟通体系设计",
    product: "Wegic",
    year: "2026",
    role: "项目负责人",
    coverImage: "/project_cover/2.png",
    hideDetailCover: true,
  },
  {
    id: "project-4",
    title: "Agentic 驱动的高质量网页生成",
    product: "Wegic",
    year: "2025",
    role: "项目负责人",
    coverImage: "/project_cover/4.png",
    hideDetailCover: true,
  },
  {
    id: "project-3",
    title: "AI Agent 建站产品设计升级",
    product: "Wegic",
    year: "2025",
    role: "产品设计师",
    coverImage: "/project_cover/3.png",
    hideDetailCover: true,
  },
  {
    id: "project-7",
    title: "全球首创 Design System 生成 UI: 从产品到商业化",
    product: "Ugic",
    year: "2024",
    role: "产品负责人",
    coverImage: "/project_cover/6.png",
    hideDetailCover: true,
  },
  {
    id: "project-5",
    title: "画布编辑器内的复杂交互设计",
    category: "编辑器交互系统",
    product: "即时设计",
    year: "2023",
    role: "产品设计师",
    coverImage: "/project_cover/5.png",
    hideDetailCover: true,
  },
];
