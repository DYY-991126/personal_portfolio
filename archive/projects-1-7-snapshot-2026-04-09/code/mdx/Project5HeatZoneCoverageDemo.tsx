"use client";

import { PROJECT5_CANVAS_STYLE, Project5DemoFrame } from "./Project5DemoFrame";
import Project5HeatZonePreview from "./Project5HeatZonePreview";

export default function Project5HeatZoneCoverageDemo() {
  return (
    <Project5DemoFrame title="热区覆盖范围">
      <div className="space-y-4">
        <div
          className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-[24px] border border-border/20"
          style={PROJECT5_CANVAS_STYLE}
        >
          <Project5HeatZonePreview
            nodeWidth={188}
            nodeHeight={84}
            topBottomThickness={36}
            leftRightThickness={40}
          />
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="rounded-full bg-[#ef4444]/12 px-3 py-1.5 text-[#b91c1c]">
            红色：对象四周热区
          </div>
          <div className="rounded-full bg-[#f97316]/12 px-3 py-1.5 text-[#c2410c]">
            橙色：对象本体也可触发
          </div>
          <div className="rounded-full bg-[#2563eb]/10 px-3 py-1.5 text-[#1d4ed8]">
            蓝色：激活后的控制点
          </div>
        </div>
      </div>
    </Project5DemoFrame>
  );
}
