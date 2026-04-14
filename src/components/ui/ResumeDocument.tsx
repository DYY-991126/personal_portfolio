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
        <p className="mt-2 text-[11pt] font-medium text-[#141414]">求职意向：AI 产品设计师（3 到 5 年行业经验，26）</p>
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
        聚焦 AI 产品与工具类设计，擅长在高不确定性阶段完成目标定义、关键链路设计与跨职能推进，兼顾体验质量、系统落地与商业结果。
      </p>

      <SectionTitle>工作经历</SectionTitle>

      <div className="space-y-10">
        <div className="flex items-baseline justify-between gap-6">
          <p className="text-[11pt] font-bold text-black">北京即设科技有限公司</p>
          <p className="text-[10pt] tabular-nums text-[#2f2f2f]">3 年 10 个月</p>
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
            <li>主导 Wegic 2.0 里程碑目标定义与跨团队拆解，围绕“生成到发布”关键链路推进产品迭代，推动用户发布率从 <strong className="font-bold text-black">13.3% 提升至 50.3%</strong>。</li>
            <li>从 0 到 1 设计网站生成前沟通体系，推动首次付费率从 <strong className="font-bold text-black">3.83% 提升至 8.08%</strong>，并支撑用户更高效地完成网站发布。</li>
            <li>主导 Agent 架构下的建站体验重设计，使用户进入编辑页后进入对话编辑的时间较 1.0 显著缩短，推动 Wegic 2.0 订阅转化较 1.0 提升 <strong className="font-bold text-black">1 倍</strong>。</li>
            <li>推动 Agentic 高质量整站生成能力上线，建立可复用的网页生成方法，生成网页满意度达到 <strong className="font-bold text-black">80%</strong>，并使网站视觉质量在同类产品中形成明显优势。</li>
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
            <li>主导全球第一款基于 Design System 生成 UI 的产品从 0 到 1 上线与商业化落地，首月实现 <strong className="font-bold text-black">$3162</strong> 收入，付费率达到 <strong className="font-bold text-black">3.48%</strong>，登上 <strong className="font-bold text-black">Product Hunt #3</strong>，并获得社媒传播与用户好评。</li>
            <li>主导产品 workflow 架构设计与优化、核心交互链路和界面设计，并输出关键功能模块 PRD；推动生成成本降低 <strong className="font-bold text-black">90%</strong>。</li>
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
            <li>负责 UI 设计工具的核心模块体验设计/用户调研/产品调研报告工作。覆盖元素创建交互体系构建、图层面板、工作台搜索、颜色选择器等核心模块</li>
            <li>参与底层重构阶段的设计系统建设，整理并沉淀 token、图标、基础组件与复合界面模块。</li>
          </ul>
        </div>

      </div>

      <SectionTitle>实习经历</SectionTitle>
      <div className="space-y-8">
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
          <ul className="mt-3 list-disc space-y-2 pl-[1.15em] text-[10pt] leading-[1.72] text-[#111111] marker:text-[#2f2f2f]">
            <li>独立负责 B2B 二手车交易平台车辆物流模块的流程梳理、交互方案与 UI 设计，并结合走查、用户反馈与竞品分析持续推进体验迭代。</li>
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
          <ul className="mt-3 list-disc space-y-2 pl-[1.15em] text-[10pt] leading-[1.72] text-[#111111] marker:text-[#2f2f2f]">
            <li>负责校园生活一体化工具的核心页面改版与 0–1 功能模块设计，覆盖流程、交互、UI 与上线协同；推动团队由 PS 迁移至 Figma，提升设计产出与协作效率。</li>
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
