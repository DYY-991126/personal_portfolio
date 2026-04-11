import type { Project } from "@/app/data";

/** 与项目详情页 Hero 一致：主标题 + 副标题（用于无障碍、图片 alt、数据标签）。 */
export function projectHeroLabel(project: Project): string {
  return project.subtitle ? `${project.title} ${project.subtitle}` : project.title;
}

/** 卡片顶栏标签：优先分类，否则产品名（无则省略不渲染空徽章）。 */
export function projectCardBadgeLabel(project: Project): string | undefined {
  return project.category?.trim() || project.product?.trim() || undefined;
}
