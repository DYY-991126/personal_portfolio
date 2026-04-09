"use client";

import { type ReactNode } from "react";

const STRUCTURE_GAP = 12;
const CONTAINER_PADDING = 16;

const AVATAR_SRC: Record<string, string> = {
  kimmy: "/projects/project-3/kimmyAvatar.png",
  timmy: "/projects/project-3/timmyAvatar.png",
  turi: "/projects/project-3/turiAvatar.png",
};

export type CardStatus = "todo" | "doing" | "loading" | "done";

export interface ToolCallCardBaseProps {
  /** 头像：kimmy / timmy / turi，单人或多人用逗号分隔如 "kimmy,timmy" */
  avatar?: string | string[];
  /** 任务类型标题，用于说明这是什么任务 */
  taskTitle?: string;
  /** 工具调用的描述 */
  description: string;
  /** 卡片状态：Todo / Doing / Done，有值时显示右侧状态标识 */
  status?: CardStatus;
  /** 结果物：6 种任务类型的变体将传入此处 */
  children?: ReactNode;
}

function StatusIndicator({ status }: { status: CardStatus }) {
  if (status === "done") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/projects/project-3/done.svg" alt="" width={20} height={20} />
      </span>
    );
  }
  if (status === "doing" || status === "loading") {
    return (
      <span className="flex h-5 w-5 shrink-0 animate-spin items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/projects/project-3/doing.svg" alt="" width={20} height={20} />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/projects/project-3/todo.svg" alt="" width={20} height={20} />
    </span>
  );
}

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

/** 工具调用卡片基础结构：头像 + 状态(space-between) → 描述 → 结果物 → taskTitle（可选，卡片内底部居中）。 */
export default function ToolCallCardBase({
  avatar,
  taskTitle,
  description,
  status,
  children,
}: ToolCallCardBaseProps) {
  const card = (
    <div
      className="rounded-xl text-left"
      style={{
        padding: CONTAINER_PADDING,
        backgroundColor: "#fff",
        border: "1px solid rgba(0,0,0,0.1)",
        fontFamily: "var(--font-sans), Inter, sans-serif",
      }}
    >
      <div
        className="flex flex-col"
        style={{ gap: STRUCTURE_GAP }}
      >
        <div className={status != null ? "flex w-full items-center justify-between" : undefined}>
          <AvatarStack avatar={avatar} />
          {status != null ? <StatusIndicator status={status} /> : null}
        </div>
        <div>
          <p className="text-sm font-medium leading-relaxed text-black/50">{description}</p>
        </div>
        {children != null && <div className="min-w-0 overflow-hidden">{children}</div>}
      </div>
    </div>
  );

  if (taskTitle != null) {
    return (
      <div className="flex flex-col gap-1.5">
        {card}
        <div className="flex justify-center">
          <span className="text-xs font-medium uppercase tracking-wide text-black/30">
            {taskTitle}
          </span>
        </div>
      </div>
    );
  }
  return card;
}
