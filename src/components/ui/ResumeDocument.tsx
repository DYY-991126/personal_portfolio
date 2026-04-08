"use client";

import Image from "next/image";

/**
 * 简历正文：编辑此文件即可更新「关于我」中展示的简历。
 * 作品集链接请在下方 PORTFOLIO_URL 填写。
 * Home 页 AI 的简历要点来自 `src/lib/digital-persona-knowledge.ts` 中的 RESUME_PLAIN_FOR_LLM，请一并维护。
 */

const PORTFOLIO_URL = ""; // 例：https://yoursite.com

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-12 mb-4 border-b border-black/88 pb-2 text-[11pt] font-bold tracking-wide text-black first:mt-0">
      {children}
    </h2>
  );
}

function ContactItem({ label, value }: { label: string; value: string }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Ignore clipboard failures; the text remains visible.
    }
  };

  const content = (
    <button
      type="button"
      onClick={handleCopy}
      className="text-left transition-opacity hover:opacity-70"
      title={`点击复制${label}`}
    >
      <span className="text-[#1f1f1f]">{label}：</span>
      <span className="text-[#1f1f1f]">{value}</span>
    </button>
  );

  return <div>{content}</div>;
}

function ExperienceTitle({
  src,
  alt,
  title,
  role,
  subtitle,
}: {
  src: string;
  alt: string;
  title: string;
  role: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Image src={src} alt={alt} width={18} height={18} className="h-[18px] w-[18px] object-contain" />
      <div className="leading-[1.35]">
        <p className="text-[10.5pt] font-bold text-black">
          {title} · {role}
        </p>
        <p className="mt-0.5 text-[10pt] text-[#2f2f2f]">{subtitle}</p>
      </div>
    </div>
  );
}

export function ResumeDocument() {
  return (
    <article className="font-sans text-[10.5pt] leading-[1.75] text-[#101010] subpixel-antialiased selection:bg-neutral-300/60">
      <header className="mb-2 pb-8">
        <h1 className="text-[22pt] font-bold tracking-tight text-black">邓毅洋</h1>
        <p className="mt-2 text-[11pt] font-medium text-[#141414]">求职意向：AI 产品设计师 / 设计负责人（6 年行业经验，26）</p>
        <div className="mt-4 grid grid-cols-3 gap-x-8 gap-y-2 text-[10.5pt] leading-[1.8] text-[#1f1f1f]">
          <ContactItem label="手机" value="176 2306 6004" />
          <ContactItem label="邮箱" value="dyyisgod@gmail.com" />
          <ContactItem label="微信" value="_DYYYYYD_" />
        </div>
        {PORTFOLIO_URL ? (
          <p className="mt-2 text-[10.5pt] leading-[1.8] text-[#1f1f1f]">
            作品集：
            <a href={PORTFOLIO_URL} className="ml-1 text-[#0d47a1] underline underline-offset-2 hover:text-[#0a3d8c]">
              {PORTFOLIO_URL}
            </a>
          </p>
        ) : null}
      </header>

      <p className="mb-8 text-[10.5pt] leading-[1.8] text-[#111111]">
        持续负责 AI 产品与复杂系统设计工作。推动 AI 建站关键链路上线并实现首次付费率翻倍；作为产品负责人推动 AI 生成 UI 产品从 0 到 1 构建，并在冷启动阶段实现盈利。
      </p>

      <SectionTitle>工作经历</SectionTitle>

      <div className="space-y-10">
        <div className="flex items-baseline justify-between gap-6">
          <p className="text-[11pt] font-bold text-black">北京即设科技有限公司</p>
          <p className="text-[10pt] tabular-nums text-[#2f2f2f]">4 年</p>
        </div>

        <div className="ml-3 border-l border-neutral-300 pl-5">
          <div className="flex items-baseline justify-between gap-6">
            <ExperienceTitle
              src="/wegic_logo.svg"
              alt="Wegic logo"
              title="Wegic"
              role="AI 产品设计师"
              subtitle="面向全球用户的 AI 建站工具 · 用户量超过 10 万"
            />
            <p className="text-[10pt] tabular-nums text-[#2f2f2f]">2024.12 – 2026.03</p>
          </div>
          <ul className="mt-4 list-disc space-y-3 pl-[1.15em] text-[10pt] leading-[1.72] text-[#111111] marker:text-[#2f2f2f]">
            <li>定义里程碑目标并拆解实现路径，推动团队于 2026.02.10 达成“<strong className="font-bold text-black">50% 首次建站用户在 1 小时内完成发布</strong>”的里程碑。</li>
            <li>主导生成前沟通体系从 0 到 1 落地，将产品从工具逻辑推进为服务逻辑，实现<strong className="font-bold text-black">首次付费率由 4% 提升至 8%</strong>。</li>
            <li>负责 Agent 架构下的 0 - 1 产品设计，并推动 Gemini 3 成为正式生成方案，使网页生成质量与同类产品形成显性差距，同时推动产品订阅率由 <strong className="font-bold text-black">0.2% 提升至 0.4%</strong>。</li>
          </ul>
        </div>

        <div className="ml-3 border-l border-neutral-300 pl-5">
          <div className="flex items-baseline justify-between gap-6">
            <ExperienceTitle
              src="/ugic_logo.svg"
              alt="Ugic logo"
              title="Ugic"
              role="产品负责人"
              subtitle="面向全球用户的 AI 生成 UI 工具 · 用户量超过 2 万"
            />
            <p className="text-[10pt] tabular-nums text-[#2f2f2f]">2024.06 – 2024.11</p>
          </div>
          <ul className="mt-4 list-disc space-y-3 pl-[1.15em] text-[10pt] leading-[1.72] text-[#111111] marker:text-[#2f2f2f]">
            <li>推动产品从 0 到 1 构建，以及上线商业化方案；在冷启动阶段，实现 <strong className="font-bold text-black">3.48% 的付费率</strong>，ROI &gt; 1，产品持续盈利。</li>
            <li>AI 层：负责 AI workflow 架构设计，以及架构下相关模块的实现定义。</li>
            <li>产品层：负责核心功能、界面结构与交互流程设计；建立数据、生成产物与成本监控；制定商业化策略，包括成本测算与预估、定价与权益设计。</li>
            <li>冷启动及上线后：推进 GTM、用户答疑、反馈收集与迭代计划。</li>
          </ul>
        </div>

        <div className="ml-3 border-l border-neutral-300 pl-5">
          <div className="flex items-baseline justify-between gap-6">
            <ExperienceTitle
              src="/js_logo.svg"
              alt="即时设计 logo"
              title="即时设计"
              role="UX"
              subtitle="国内 UI 设计工具 · 累计服务超过 400 万用户"
            />
            <p className="text-[10pt] tabular-nums text-[#2f2f2f]">2022.05 – 2024.06</p>
          </div>
          <ul className="mt-4 list-disc space-y-3 pl-[1.15em] text-[10pt] leading-[1.72] text-[#111111] marker:text-[#2f2f2f]">
            <li>长期负责 UI 设计工具与 canvas 类编辑器的产品设计工作，通过用户研究与反馈分析定位关键问题，覆盖编辑器左侧面板、工作台搜索、白板创建对象等核心模块，形成操作类交互与复杂系统设计能力。</li>
            <li>参与设计系统构建与多平台一致性建设，支持产品能力扩展与研发协作效率提升。</li>
          </ul>
        </div>

      </div>

      <SectionTitle>实习经历</SectionTitle>
      <div className="space-y-10">
        <div className="flex items-baseline justify-between gap-6">
          <p className="text-[11pt] font-bold text-black">上海溥励电子商务有限公司</p>
          <p className="text-[10pt] tabular-nums text-[#2f2f2f]">半年</p>
        </div>

        <div className="ml-3 border-l border-neutral-300 pl-5">
          <div className="flex items-baseline justify-between gap-6">
            <div className="leading-[1.35]">
              <p className="text-[10.5pt] font-bold text-black">汽车街 · UE 设计师</p>
              <p className="mt-0.5 text-[10pt] text-[#2f2f2f]">B2B 汽车交易平台</p>
            </div>
            <p className="text-[10pt] tabular-nums text-[#2f2f2f]">2021.08 – 2022.02</p>
          </div>
          <ul className="mt-4 list-disc space-y-3 pl-[1.15em] text-[10pt] leading-[1.72] text-[#111111] marker:text-[#2f2f2f]">
            <li>负责 B 端二手车交易平台体验设计，基于体验走查、用户反馈与业务沟通识别关键问题，结合用户行为与业务场景输出优化方案。</li>
            <li>独立负责车辆物流模块设计，完成用户流程图、交互文档及 UI 方案输出，推动复杂业务场景下的产品体验优化。</li>
            <li>围绕视觉表现、交互逻辑、产品结构与业务逻辑开展竞品分析，提炼差异化设计策略，支持产品持续迭代。</li>
          </ul>
        </div>

        <div className="flex items-baseline justify-between gap-6">
          <p className="text-[11pt] font-bold text-black">重庆邮电大学移通学院网信中心</p>
          <p className="text-[10pt] tabular-nums text-[#2f2f2f]">1 年</p>
        </div>

        <div className="ml-3 border-l border-neutral-300 pl-5">
          <div className="flex items-baseline justify-between gap-6">
            <div className="leading-[1.35]">
              <p className="text-[10.5pt] font-bold text-black">指尖移通 · 设计组负责人</p>
              <p className="mt-0.5 text-[10pt] text-[#2f2f2f]">学生在校生活一体化工具</p>
            </div>
            <p className="text-[10pt] tabular-nums text-[#2f2f2f]">2020.08 – 2021.07</p>
          </div>
          <ul className="mt-4 list-disc space-y-3 pl-[1.15em] text-[10pt] leading-[1.72] text-[#111111] marker:text-[#2f2f2f]">
            <li>负责产品一级页面及核心功能改版，通过用户访谈挖掘深层使用场景，制定改版方向并完成体验升级。</li>
            <li>负责从 0 到 1 新功能模块设计，梳理业务规则并独立输出用户流程图、交互文档和 UI 方案，协同开发按期上线。</li>
            <li>推动设计工具由 PS 迁移至 Figma，提升设计产出效率并降低设计与开发协作成本。</li>
          </ul>
        </div>
      </div>

      <SectionTitle>教育背景</SectionTitle>
      <div className="mt-1">
        <div className="flex items-baseline justify-between gap-6">
          <p className="text-[10.5pt] font-bold text-black">重庆邮电大学 - 移通学院 · 软件工程 · 本科</p>
          <p className="text-[10pt] tabular-nums text-[#2f2f2f]">2018.09 – 2022.06</p>
        </div>
        <p className="mt-2 text-[10pt] text-[#1f1f1f]">CET 4 ｜ 驾驶证 C1</p>
      </div>

    </article>
  );
}
