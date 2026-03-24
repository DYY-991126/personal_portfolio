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
    title: "Wegic 2.0",
    subtitle: "上线后目标定义与路径拆解",
    year: "2025.12 – 2026.02",
    role: "Goal Definition & Team Alignment",
    coverImage: "/projects/project-1/cover.jpg",
  },
  {
    id: "project-2",
    title: "首次生成符合用户预期",
    subtitle: "生成前沟通系统的设计与落地",
    year: "2025.12 – 2026.02",
    role: "项目负责人 & 产品设计师",
    coverImage: "/projects/project-2/cover.jpg",
  },
  {
    id: "project-3",
    title: "Agent 架构下的 0 到 1 产品设计",
    subtitle: "技术架构升级后的产品框架与对话流设计",
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
    role: "产品设计师 & 生成质量探索",
    coverImage: "/project_cover/logo animation motion design 3D cinema 4d Concert opening.jpg",
    description: "在 Wegic 网站生成质量探索阶段，我参与推动团队从“硬约束 prompt”转向“原则性生成框架”，并在发现 Gemini 机会点后，通过低成本验证与快速推进，在 3 天内把新方案接入产品生成流程。",
  },
  {
    id: "project-5",
    title: "围绕对象继续创作",
    subtitle: "白板编辑器中的快速创建与连接系统",
    category: "编辑器交互系统",
    year: "2024",
    client: "即时设计",
    role: "产品设计师（交互专项）",
    coverImage: "/project_cover/图像.jpg",
    description: "我在即时设计的白板 / 编辑器场景中，设计了一套围绕创建点展开的快速创建与连接系统，让用户在高频操作里更快地产生内容、建立关系，并在复杂画布中始终保持空间感与可控感。",
  },
  {
    id: "project-6",
    title: "构建设计系统",
    subtitle: "作为主要参与者，搭建设计规范与基础模块",
    category: "Design System",
    year: "2024",
    client: "内部项目",
    role: "产品设计师（主要参与）",
    coverImage: "/project_cover/图像.jpg",
    description: "我主要参与了设计系统的搭建工作，包括颜色、字体、布局、阴影、动效与图标等基础模块的整理与沉淀。",
  },
  {
    id: "project-7",
    title: "Oasis Mindfulness",
    category: "Mobile App",
    year: "2022",
    client: "Oasis Health",
    role: "UI/UX Designer",
    coverImage: "/project_cover/图像3.jpg",
    description: "A serene, calming mobile application designed to help users track and improve their mental wellbeing.",
  },
];
