"use client";

import { useState } from "react";

/** 任务类型（按任务归类的工具调用） */
export type TaskKind =
  | "找文件"
  | "做计划"
  | "生成图片"
  | "生成视频"
  | "做设计"
  | "调研"
  | "做测试"
  | "联网搜索";

/** 工具调用状态 */
export type ToolCallStatus = "done" | "in_progress" | "pending";

/** 清单项状态：完成 / 进行中 / 未开始 */
export type ChecklistItemStatus = "done" | "in_progress" | "pending";

/** 工作产物：做计划 → 清单（支持进行中状态） */
export interface WorkProductChecklist {
  type: "checklist";
  items: { label: string; status: ChecklistItemStatus }[];
}

/** 工作产物：找文件 → 文案/文件列表摘要 */
export interface WorkProductFiles {
  type: "files";
  summary: string;
  count?: number;
}

/** 工作产物：做测试 → 诊断摘要（多条可合并为一张卡片） */
export interface WorkProductDiagnostics {
  type: "diagnostics";
  summary: string;
  count?: number;
}

/** 工作产物：生成图片 → 多图网格 */
export interface WorkProductImage {
  type: "image";
  images: { src: string; alt?: string }[];
}

/** 工作产物：生成视频 → 多视频网格，带播放按钮 */
export interface WorkProductVideo {
  type: "video";
  videos: { src: string; poster?: string }[];
}

/** 工作产物：做设计 → 代码块 */
export interface WorkProductDesign {
  type: "design";
  code: string;
  language?: string;
}

/** 工作产物：调研 / 联网搜索 → 来源芯片 */
export interface WorkProductResearch {
  type: "research";
  sources: { name: string; url?: string; icon?: string }[];
}

export type WorkProduct =
  | WorkProductChecklist
  | WorkProductFiles
  | WorkProductDiagnostics
  | WorkProductImage
  | WorkProductVideo
  | WorkProductDesign
  | WorkProductResearch;

/** 单条工具调用（可多条合并为一张卡片） */
export interface ToolCallEntry {
  avatar?: string | string[];
  description: string;
  workProduct: WorkProduct;
}

/** 工具调用卡片：可包含单条或合并后的多条 entry */
export interface ToolCallCard {
  id: string;
  taskName: TaskKind;
  status: ToolCallStatus;
  /** 当有多条工具执行结果时合并为一条卡片，每条含头像、描述、工作产物 */
  entries: ToolCallEntry[];
}

const STRUCTURE_GAP = 12;   // 结构之间的间距
const CONTAINER_PADDING = 16; // 内容距离容器四周的间距

/** IP 头像映射，与 ToolCallCardBase 保持一致 */
const AVATAR_SRC: Record<string, string> = {
  kimmy: "/projects/project-3/kimmyAvatar.png",
  timmy: "/projects/project-3/timmyAvatar.png",
  turi: "/projects/project-3/turiAvatar.png",
};

const MOCK_CARDS: ToolCallCard[] = [
  {
    id: "1",
    taskName: "做计划",
    status: "done",
    entries: [
      {
        avatar: "kimmy",
        description:
          "已为你的宠物烘焙工作室排好上线路线：先完成产品拍摄，再落页面与质检。",
        workProduct: {
          type: "checklist",
          items: [
            { label: "Preliminary Research", status: "done" },
            { label: "Defining the Visual Style", status: "done" },
            { label: "Designing the Site Framework", status: "in_progress" },
            { label: "Design&Building the Pages", status: "pending" },
            { label: "Final Quality Check", status: "pending" },
          ],
        },
      },
    ],
  },
  {
    id: "2",
    taskName: "做测试",
    status: "done",
    entries: [
      {
        avatar: "timmy",
        description:
          "已核对运行日志与诊断项，当前未检出阻塞性问题，结账流程可继续验证。",
        workProduct: { type: "diagnostics", summary: "Diagnostics", count: 3 },
      },
      {
        avatar: "timmy",
        description:
          "已核对运行日志与诊断项，当前未检出阻塞性问题，结账流程可继续验证。",
        workProduct: { type: "diagnostics", summary: "Diagnostics", count: 3 },
      },
    ],
  },
  {
    id: "3",
    taskName: "找文件",
    status: "in_progress",
    entries: [
      {
        avatar: "turi",
        description:
          "正在在站点配置目录里查找运费规则 shipping rate 是在哪个文件里定义的。",
        workProduct: {
          type: "files",
          summary: "Finded 3 files",
          count: 3,
        },
      },
    ],
  },
  {
    id: "4",
    taskName: "生成图片",
    status: "done",
    entries: [
      {
        avatar: "kimmy",
        description:
          "已按「手作、温暖」调性生成你的产品陈列主图，用于首页首屏展示。",
        workProduct: {
          type: "image",
          images: [
            { src: "/projects/project-1/cover.jpg", alt: "生成图 1" },
            { src: "/projects/project-2/cover.jpg", alt: "生成图 2" },
            { src: "/projects/project-3/cover.jpg", alt: "生成图 3" },
          ],
        },
      },
    ],
  },
  {
    id: "5",
    taskName: "生成视频",
    status: "done",
    entries: [
      {
        avatar: "kimmy",
        description:
          "已生成你的产品宣传视频，时长约 15 秒，适合朋友圈与短视频首发。",
        workProduct: {
          type: "video",
          videos: [
            { src: "/projects/project-3/做设计4.mp4" },
            { src: "/projects/project-3/做设计1.mp4" },
            { src: "/projects/project-3/做设计2.mp4" },
          ],
        },
      },
    ],
  },
  {
    id: "6",
    taskName: "做设计",
    status: "in_progress",
    entries: [
      {
        avatar: "kimmy",
        description:
          "正在把首页 Hero 的文案与按钮样式更新进页面代码，并同步预览。",
        workProduct: {
          type: "design",
          code: `null,
"CodeMirror-gutter " + gutterClass
);
);
if (gutterClass == "CodeMirror-linenumbers") {
  cm.display.lineGutter = gElt;
  gElt.style.width = (cm.display.lineNumWidth || 1) + "px";`,
          language: "javascript",
        },
      },
    ],
  },
  {
    id: "7",
    taskName: "联网搜索",
    status: "done",
    entries: [
      {
        avatar: "turi",
        description:
          "已整理多家同城烘焙店的套餐结构与价位，供你对比定价与活动形式。",
        workProduct: {
          type: "research",
          sources: [
            { name: "Apple.com" },
            { name: "Github.com" },
            { name: "Google.com" },
            { name: "Youtube.com" },
            { name: "Facebook.com" },
          ],
        },
      },
    ],
  },
];

/** 头像：kimmy/timmy/turi 使用真实 IP 头像，与 ToolCallCardBase 一致 */
function AvatarStack({ avatar }: { avatar?: string | string[] }) {
  const raw = !avatar
    ? ["kimmy"]
    : typeof avatar === "string"
      ? avatar.split(",").map((s) => s.trim()).filter(Boolean)
      : avatar.filter(Boolean);
  const names = (raw.length ? raw : ["kimmy"]).slice(0, 3);

  return (
    <div className="flex -space-x-2">
      {names.map((name, i) => {
        const src = AVATAR_SRC[name.toLowerCase()] ?? AVATAR_SRC.kimmy;
        return (
          <img
            key={i}
            src={src}
            alt={name}
            className="h-8 w-8 shrink-0 rounded-full border-2 border-white object-cover"
            style={{ zIndex: names.length - i }}
          />
        );
      })}
    </div>
  );
}

/** 状态角标：完成 ✓，进行中 旋转圆 */
function StatusBadge({ status }: { status: ToolCallStatus }) {
  if (status === "done") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#22c55e] text-white">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M2 6l3 3 5-6" />
        </svg>
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span
        className="h-5 w-5 shrink-0 rounded-full border-2 border-[#22c55e] border-t-transparent animate-spin"
        aria-label="进行中"
      />
    );
  }
  return (
    <span className="h-5 w-5 shrink-0 rounded-full border border-black/20" aria-label="待开始" />
  );
}

/** 清单项图标：完成=绿勾，进行中=部分填充圆，未开始=空圆 */
function ChecklistIcon({ status }: { status: ChecklistItemStatus }) {
  if (status === "done") {
    return (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#22c55e] text-white">
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M2 6l3 3 5-6" />
        </svg>
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span
        className="h-4 w-4 shrink-0 rounded-full"
        style={{
          background: "conic-gradient(#22c55e 0deg 240deg, #e5e5e5 240deg)",
        }}
        title="进行中"
      />
    );
  }
  return <span className="h-4 w-4 shrink-0 rounded-full border border-black/25" />;
}

/** 工作产物渲染 */
function WorkProductBlock({ workProduct }: { workProduct: WorkProduct }) {
  switch (workProduct.type) {
    case "checklist":
      return (
        <ul className="space-y-3">
          {workProduct.items.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <ChecklistIcon status={item.status} />
              <span
                className={
                  item.status === "done"
                    ? "text-black/85"
                    : item.status === "in_progress"
                      ? "text-black/75"
                      : "text-black/50"
                }
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      );
    case "files":
      return (
        <p className="text-sm text-black/75">
          {workProduct.summary}
          {workProduct.count != null && (
            <span className="text-black/50"> ({workProduct.count} files)</span>
          )}
        </p>
      );
    case "diagnostics":
      return (
        <p className="text-sm text-black/75">
          {workProduct.summary}
          {workProduct.count != null && (
            <span className="text-black/50"> {workProduct.count} files</span>
          )}
        </p>
      );
    case "image":
      return (
        <div
          className="grid grid-cols-3 gap-3"
          style={{ gap: STRUCTURE_GAP }}
        >
          {workProduct.images.map((img, i) => (
            <div key={i} className="overflow-hidden rounded-lg bg-black/5 aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt ?? "生成图片"}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      );
    case "video":
      return (
        <div
          className="grid gap-3"
          style={{ gap: STRUCTURE_GAP, gridTemplateColumns: "repeat(2, 1fr)" }}
        >
          {workProduct.videos.map((v, i) => (
            <div key={i} className="relative overflow-hidden rounded-lg bg-black/10 aspect-video">
              <video
                src={v.src}
                poster={v.poster}
                className="h-full w-full object-cover"
                muted
                playsInline
              />
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/20"
                aria-hidden
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black/80">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    case "design":
      return (
        <pre
          className="overflow-x-auto rounded-lg border border-black/10 bg-linear-to-br from-amber-50/80 via-white to-blue-50/80 px-3 py-3 text-xs leading-relaxed text-black/85"
          style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
        >
          <code>{workProduct.code.trim()}</code>
        </pre>
      );
    case "research":
      return (
        <div
          className="flex flex-wrap gap-2"
          style={{ gap: STRUCTURE_GAP }}
        >
          {workProduct.sources.map((s, i) => (
            <a
              key={i}
              href={s.url ?? "#"}
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black/80 transition-colors hover:bg-black/5 hover:border-black/15"
            >
              {s.name}
            </a>
          ))}
        </div>
      );
    default:
      return null;
  }
}

/** 单张工具调用卡片：可含单条或合并后的多条 entry，结构间距 12px，内容区 padding 16px */
function ToolCallCardBlock({ card }: { card: ToolCallCard }) {
  const entries = card.entries;
  return (
    <div
      className="overflow-hidden rounded-xl bg-white text-left shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.5)_inset,0_1px_4px_0_rgba(0,0,0,0.06)]"
      style={{
        padding: CONTAINER_PADDING,
        fontFamily: "var(--font-sans), Inter, sans-serif",
      }}
    >
      {entries.map((entry, idx) => (
        <div
          key={idx}
          style={{
            marginTop: idx === 0 ? 0 : STRUCTURE_GAP,
            paddingTop: idx === 0 ? 0 : STRUCTURE_GAP,
            borderTop: idx === 0 ? "none" : "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {/* 头像 + description（首条右侧显示状态角标） */}
          <div
            className="flex gap-3"
            style={{ marginBottom: STRUCTURE_GAP }}
          >
            <AvatarStack avatar={entry.avatar} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm leading-relaxed text-black/85">
                  {entry.description}
                </p>
                {idx === 0 && <StatusBadge status={card.status} />}
              </div>
            </div>
          </div>
          {/* 工作产物 */}
          <div style={{ marginTop: STRUCTURE_GAP }}>
            <WorkProductBlock workProduct={entry.workProduct} />
          </div>
        </div>
      ))}
    </div>
  );
}

interface AgentTaskExpandPanelProps {
  /** 是否嵌入在对话面板内（与 ChatPanelDemo 同宽、无外圈） */
  embedded?: boolean;
  /** 工具调用卡片列表，不传则用 mock */
  cards?: ToolCallCard[];
  /** 标题，不传则用默认 */
  title?: string;
  /** 是否默认展开 */
  defaultExpanded?: boolean;
  /** 是否为可折叠形态：先显示一行“查看 N 个并行任务”，点击后展开面板 */
  collapsible?: boolean;
  /** 折叠时显示的摘要文案 */
  collapseSummary?: string;
}

export default function AgentTaskExpandPanel({
  embedded = false,
  cards = MOCK_CARDS,
  title = "Wegic Studio",
  defaultExpanded = false,
  collapsible = false,
  collapseSummary,
}: AgentTaskExpandPanelProps) {
  const [panelExpanded, setPanelExpanded] = useState(!collapsible || defaultExpanded);

  const summary = collapseSummary ?? `查看 ${cards.length} 个工具调用`;

  const panel = (
    <div
      className="overflow-hidden rounded-xl bg-[#FBFBFB] text-left shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.5)_inset,0_1px_4px_0_rgba(0,0,0,0.06)]"
      style={{
        fontFamily: "var(--font-sans), Inter, sans-serif",
      }}
    >
      <div
        className="flex items-center justify-between border-b border-black/6"
        style={{ padding: CONTAINER_PADDING }}
      >
        <div>
          <h3 className="text-sm font-medium text-black/90">{title}</h3>
          <p className="mt-0.5 text-xs text-black/50">See what everyone is up to</p>
        </div>
        <button
          type="button"
          className="text-xs text-black/50 hover:text-black/70"
          aria-label="返回"
        >
          Back
        </button>
      </div>
      <div
        className="flex max-h-[480px] flex-col overflow-y-auto overflow-x-hidden overscroll-contain"
        style={{
          padding: CONTAINER_PADDING,
          gap: STRUCTURE_GAP,
        }}
      >
        {cards.map((card) => (
          <ToolCallCardBlock key={card.id} card={card} />
        ))}
      </div>
    </div>
  );

  const content =
    collapsible && !panelExpanded ? (
      <button
        type="button"
        onClick={() => setPanelExpanded(true)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-black/8 bg-white px-4 py-3 text-left shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_1px_2px_0_rgba(0,0,0,0.06)] transition-colors hover:bg-black/2"
        style={{ fontFamily: "var(--font-sans), Inter, sans-serif" }}
      >
        <span className="text-sm text-black/70">{summary}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="shrink-0 text-black/40"
          style={{ transform: "rotate(-90deg)" }}
          aria-hidden
        >
          <path
            d="M5.9 14c.25 0 .47-.1.64-.26L11.54 8.74c.35-.35.35-.92 0-1.27L6.55 2.48a1 1 0 00-1.65.76c0 .25.1.47.26.64L9.63 8.1l-4.37 4.36A.98.98 0 005 13.1C5 13.6 5.4 14 5.9 14z"
            fill="currentColor"
          />
        </svg>
      </button>
    ) : (
      <>
        {collapsible && (
          <button
            type="button"
            onClick={() => setPanelExpanded(false)}
            className="mb-2 flex w-full items-center justify-center gap-1 py-1.5 text-xs text-black/45 hover:text-black/65"
            style={{ fontFamily: "var(--font-sans), Inter, sans-serif" }}
          >
            收起
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="currentColor"
              style={{ transform: "rotate(90deg)" }}
            >
              <path d="M5.9 14c.25 0 .47-.1.64-.26L11.54 8.74c.35-.35.35-.92 0-1.27L6.55 2.48a1 1 0 00-1.65.76c0 .25.1.47.26.64L9.63 8.1l-4.37 4.36A.98.98 0 005 13.1C5 13.6 5.4 14 5.9 14z" />
            </svg>
          </button>
        )}
        {panel}
      </>
    );

  if (embedded) {
    return (
      <div
        className="w-full max-w-[90%]"
        style={{ fontFamily: "var(--font-sans), Inter, sans-serif" }}
        onWheel={(e) => e.stopPropagation()}
      >
        {content}
      </div>
    );
  }

  return (
    <div className="my-10 flex justify-center bg-[#f3f4f6] py-10">
      <div
        className="w-[380px] flex flex-col rounded-2xl p-4"
        style={{
          backgroundColor: "#F7F6F5",
          boxShadow:
            "0 0 10px 0 #E3E0DB, 0 0 0 1px rgba(0,0,0,0.06), inset 0 0 2px 2px #FFFFFF",
        }}
        onWheel={(e) => e.stopPropagation()}
      >
        <p className="mb-3 text-xs text-black/50">
          独立预览：展开态面板（工具调用卡片列表，可后续接到 AI 卡片下方）
        </p>
        {content}
      </div>
    </div>
  );
}
