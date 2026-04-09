"use client";

import { useRef } from "react";

const BASE = "/projects/project-3";

const TASK_GROUPS: { label: string; videos: string[] }[] = [
  { label: "做计划", videos: [`${BASE}/做计划.mp4`] },
  {
    label: "做设计",
    videos: [
      `${BASE}/做设计2.mp4`,
      `${BASE}/做设计4.mp4`,
      `${BASE}/做设计5.mp4`,
      `${BASE}/做设计6.mp4`,
    ],
  },
  { label: "找文件", videos: [`${BASE}/找文件1.mp4`, `${BASE}/找文件2.mp4`] },
  { label: "测试", videos: [`${BASE}/测试1.mp4`] },
  { label: "调研", videos: [`${BASE}/调研1.mp4`, `${BASE}/调研2.mp4`] },
  { label: "素材生产", videos: [`${BASE}/素材生产.mp4`] },
];

function VideoCell({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={togglePlay}
      onKeyDown={(e) => e.key === "Enter" && togglePlay()}
      className="group relative cursor-pointer overflow-hidden"
      style={{
        width: 88,
        height: 88,
        flexShrink: 0,
        borderRadius: 24,
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
      }}
    >
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full object-cover"
        style={{ borderRadius: 24 }}
        muted
        playsInline
        loop
        autoPlay
      />
      <div
        className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/10 group-hover:opacity-100"
        style={{ borderRadius: 24 }}
        aria-hidden
      >
        <span className="flex h-7 w-7 items-center justify-center border border-[#A0522D]/30 bg-white/90 text-[#A0522D]/80">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
    </div>
  );
}

export default function TaskVideoGallery() {
  return (
    <div
      className="my-8 py-6 pr-6 pl-10 bg-white"
      style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)" }}
    >
      <div className="flex flex-col divide-y divide-foreground/[0.06]">
        {TASK_GROUPS.map(({ label, videos }) => (
          <div
            key={label}
            className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
          >
            <span
              className="w-24 shrink-0 text-sm font-medium"
              style={{ letterSpacing: "0.02em", color: "#1a1a1a" }}
            >
              {label}
            </span>
            <div className="flex flex-wrap gap-2">
              {videos.map((src, i) => (
                <VideoCell key={i} src={src} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
