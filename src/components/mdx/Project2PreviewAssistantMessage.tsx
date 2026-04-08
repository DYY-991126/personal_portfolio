"use client";

import type { ReactNode } from "react";

function renderAssistantMessage(content: string) {
  const lines = content.split("\n");
  const nodes: ReactNode[] = [];
  let listItems: string[] = [];
  let listKey = 0;

  const flushList = () => {
    if (!listItems.length) return;
    nodes.push(
      <ul key={`list-${listKey}`} className="my-2 space-y-1 pl-6 text-sm leading-relaxed text-black/85">
        {listItems.map((item, index) => (
          <li key={`item-${listKey}-${index}`} className="list-disc">
            {item}
          </li>
        ))}
      </ul>
    );
    listItems = [];
    listKey += 1;
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    const bulletMatch = line.match(/^[-*•]\s+(.+)$/);

    if (bulletMatch) {
      listItems.push(bulletMatch[1]);
      return;
    }

    flushList();

    if (!line) {
      nodes.push(<div key={`space-${index}`} className="h-3" />);
      return;
    }

    nodes.push(
      <p key={`line-${index}`} className="text-sm leading-relaxed text-black/85">
        {line}
      </p>
    );
  });

  flushList();
  return nodes;
}

export default function Project2PreviewAssistantMessage({
  content,
  maxWidthClassName = "max-w-[520px]",
}: {
  content: string;
  maxWidthClassName?: string;
}) {
  return (
    <div className="flex justify-start">
      <div
        className={`${maxWidthClassName} rounded-xl bg-white px-6 py-5 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.5)_inset,0_1px_4px_0_rgba(0,0,0,0.06)]`}
      >
        <div className="space-y-0">{renderAssistantMessage(content)}</div>
      </div>
    </div>
  );
}
