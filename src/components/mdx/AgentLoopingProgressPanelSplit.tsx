"use client";

import { useEffect, useState } from "react";
import ProgressBarDemo from "./ProgressBarDemo";
import ToolCallCardPanel from "./ToolCallCardPanel";
import ToolCallCardBase from "./ToolCallCardBase";
import { ALL_CARDS, CARD_DELAY_MS, DONE_DELAY_MS } from "./ToolCallCardPanelDemo";

/** Agent Looping 小节专用：左进度卡 + 右 Wegic Studio 面板并排；不影响 ToolCallCardPanelDemo 的其它引用。 */
export default function AgentLoopingProgressPanelSplit() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const addCard = () => {
      setVisibleCount((v) => {
        if (v >= ALL_CARDS.length) return v;
        setTimeout(() => setCompletedCount((c) => c + 1), DONE_DELAY_MS);
        return v + 1;
      });
    };
    const initial = setTimeout(addCard, 500);
    const interval = setInterval(addCard, CARD_DELAY_MS);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="my-10 flex h-[780px] flex-col items-center justify-start gap-10 bg-[#f3f4f6] py-10 md:flex-row md:items-start md:justify-center md:gap-12"
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="flex w-full shrink-0 justify-center md:w-auto">
        <div className="w-[340px] max-w-full">
          <ProgressBarDemo embedded />
        </div>
      </div>
      <div className="flex w-full min-h-0 shrink-0 justify-center md:w-auto">
        <div
          className="h-[700px] w-full max-w-md overflow-hidden rounded-2xl bg-white"
          style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.06)" }}
        >
          <ToolCallCardPanel hideBack>
            {ALL_CARDS.slice(0, visibleCount).map((card, i) => (
              <ToolCallCardBase
                key={i}
                avatar={card.avatar}
                description={card.description}
                status={i < completedCount ? "done" : "loading"}
              >
                {card.children}
              </ToolCallCardBase>
            ))}
          </ToolCallCardPanel>
        </div>
      </div>
    </div>
  );
}
