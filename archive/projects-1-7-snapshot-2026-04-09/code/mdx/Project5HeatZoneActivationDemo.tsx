"use client";

import { useState } from "react";
import { PROJECT5_CANVAS_STYLE, Project5DemoFrame } from "./Project5DemoFrame";
import Project5HeatZonePreview from "./Project5HeatZonePreview";

export default function Project5HeatZoneActivationDemo() {
  const [active, setActive] = useState(false);

  return (
    <Project5DemoFrame title="热区激活预览">
      <div className="space-y-4">
        <div
          className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[24px] border border-border/20"
          style={PROJECT5_CANVAS_STYLE}
          onMouseEnter={() => setActive(true)}
          onMouseLeave={() => setActive(false)}
        >
          <div className="absolute left-6 top-6 rounded-full bg-white/92 px-4 py-2 text-sm text-muted-foreground shadow-sm">
            {active ? "指针已进入画板，热区和控制点被激活" : "将指针移入画板"}
          </div>

          <Project5HeatZonePreview
            nodeWidth={188}
            nodeHeight={84}
            topBottomThickness={36}
            leftRightThickness={40}
            showOuterZones={active}
            showInnerArea={active}
            showControls={active}
          />
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          这个预览只展示一件事：热区和控制点不是默认常驻的，进入画板后才进入可继续操作的状态。
        </p>
      </div>
    </Project5DemoFrame>
  );
}
