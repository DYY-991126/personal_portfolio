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
    coverImage: "/project_cover/@ayushsoni_io super early explorations.jpg",
  },
  {
    id: "project-2",
    title: "首次生成符合用户预期",
    subtitle: "生成前沟通系统的设计与落地",
    year: "2025.12 – 2026.02",
    role: "项目负责人 & 产品设计师",
    coverImage: "/project_cover/图像2.jpg",
  },
  {
    id: "project-3",
    title: "Lumina Data Vis",
    category: "Web Application",
    year: "2023",
    client: "Lumina Analytics",
    role: "Frontend & UI",
    coverImage: "/project_cover/Macintosh.jpg",
    description: "Interactive data visualization dashboard translating complex datasets into intuitive and actionable insights.",
  },
  {
    id: "project-4",
    title: "Minimalist E-commerce",
    category: "E-commerce",
    year: "2022",
    client: "Studio K",
    role: "Full-stack Developer",
    coverImage: "/project_cover/logo animation motion design 3D cinema 4d Concert opening.jpg",
    description: "A high-end, brutalist e-commerce experience for an independent fashion studio.",
  },
  {
    id: "project-5",
    title: "Nexus Design System",
    category: "Design System",
    year: "2024",
    client: "Global Finance",
    role: "Design Lead",
    coverImage: "/project_cover/图像.jpg",
    description: "A comprehensive and scalable design system to unify dozens of internal tools and client-facing platforms.",
  },
  {
    id: "project-6",
    title: "Stellar AI Copilot",
    category: "AI & Tools",
    year: "2024",
    client: "Stellar Labs",
    role: "Product Designer",
    coverImage: "/project_cover/图像2.jpg",
    description: "An AI-powered contextual assistant that seamlessly integrates into developers' workflow to boost productivity.",
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
