"use client";

export type TodoItemStatus = "done" | "in_progress" | "pending";

export interface TodoItem {
  label: string;
  status: TodoItemStatus;
}

export interface WorkProductTodoCardProps {
  items?: TodoItem[];
}

function StatusIcon({ status }: { status: TodoItemStatus }) {
  if (status === "done") {
    return (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/projects/project-3/done.svg" alt="" width={16} height={16} />
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="flex h-4 w-4 shrink-0 animate-spin items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/projects/project-3/doing.svg" alt="" width={16} height={16} />
      </span>
    );
  }
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/projects/project-3/todo.svg" alt="" width={16} height={16} />
    </span>
  );
}

/** 做计划任务的结果物：Todo 卡片 */
export default function WorkProductTodoCard({ items = [] }: WorkProductTodoCardProps) {
  return (
    <div
      className="rounded-xl border"
      style={{
        backgroundColor: "#F7F7F7",
        borderRadius: 12,
        border: "1px solid #F0F0F0",
        fontFamily: "var(--font-sans), Inter, sans-serif",
      }}
    >
      <div
        className="flex flex-col"
        style={{
          paddingLeft: 16,
          paddingTop: 10,
          paddingRight: 16,
          paddingBottom: 10,
        }}
      >
        {(items ?? []).map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2"
            style={{
              height: 40,
              gap: 8,
            }}
          >
            <StatusIcon status={item.status} />
            <span
              className="text-black"
              style={{
                fontSize: 14,
                fontWeight: 400,
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
