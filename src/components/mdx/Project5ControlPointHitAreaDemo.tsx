"use client";

import { useState } from "react";
import { PROJECT5_CANVAS_STYLE, Project5DemoFrame } from "./Project5DemoFrame";

export default function Project5ControlPointHitAreaDemo() {
  const [active, setActive] = useState(false);

  return (
    <Project5DemoFrame title="控制点命中区">
      <div className="space-y-4">
        <div
          className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-[24px] border border-border/20"
          style={PROJECT5_CANVAS_STYLE}
        >
          <div className="absolute left-6 top-6 rounded-full bg-white/92 px-4 py-2 text-sm text-muted-foreground shadow-sm">
            {active ? "已进入命中区" : "将指针移到浅蓝区域内"}
          </div>

          <div
            className="relative flex h-10 w-10 items-center justify-center"
            onMouseEnter={() => setActive(true)}
            onMouseLeave={() => setActive(false)}
          >
            <div
              className={`absolute rounded-full border transition-colors ${
                active
                  ? "border-[#2563eb]/55 bg-[#2563eb]/12"
                  : "border-[#2563eb]/24 bg-[#2563eb]/06"
              }`}
              style={{ width: 40, height: 40 }}
            />
            <div
              className={`absolute rounded-full border-2 border-white transition-all ${
                active ? "h-[28px] w-[28px] bg-white" : "h-[14px] w-[14px] bg-[#2563eb]"
              }`}
              style={{ boxShadow: active ? "0 0 0 2px #2563eb inset" : "none" }}
            />
            {active ? (
              <span className="absolute text-[15px] font-medium leading-none text-[#2563eb]">
                +
              </span>
            ) : null}
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          中间是控制点真正看到的尺寸，外层浅蓝区域是更宽容的点击范围。这样做是为了减少误点，同时不让界面看起来太重。
        </p>
      </div>
    </Project5DemoFrame>
  );
}
