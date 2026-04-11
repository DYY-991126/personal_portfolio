"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO_SOURCES = [
  "/projects/project-3/做设计1.mp4",
  "/projects/project-3/做设计2.mp4",
  "/projects/project-3/做设计3.mp4",
  "/projects/project-3/做设计4.mp4",
  "/projects/project-3/做设计5.mp4",
  "/projects/project-3/做设计6.mp4",
];

const LOG_MESSAGES = [
  "正在查阅同城烘焙工作室的首页与套餐页，帮你对齐竞品卖点与结构。",
  "正在把你的「宠物烘焙工作室」春季上线拆成拍摄、修图、页面上线、质检四步清单。",
  "正在按「手作、温暖」调性生成你的产品陈列主图，用于首页 Hero。",
  "正在微调首页横幅的对比度与留白，让招牌文案和下单按钮更醒目。",
  "正在生成你的产品宣传视频，成片约 15 秒，适合朋友圈与短视频首发。",
  "正在查看最新部署日志，排查结账按钮偶发无响应的问题。",
  "正在打开站点配置，定位运费规则 `shipping rate` 写在哪个文件里。",
  "正在汇总 Data 目录里近三个月的订单报表，方便你做营收复盘。",
];

const STAGES = [
  { time: 0, percent: 0 },
  { time: 2000, percent: 30 },
  { time: 10000, percent: 60 },
  { time: 30000, percent: 80 },
  { time: 300000, percent: 99 },
];

const UPDATE_INTERVAL = 3500;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function calculateTargetPercent(elapsed: number): number {
  let current = STAGES[0];
  let next = STAGES[STAGES.length - 1];
  for (let i = 0; i < STAGES.length - 1; i++) {
    if (elapsed >= STAGES[i].time && elapsed < STAGES[i + 1].time) {
      current = STAGES[i];
      next = STAGES[i + 1];
      break;
    }
  }
  if (elapsed >= next.time) return next.percent;
  const duration = next.time - current.time;
  const timeInStage = elapsed - current.time;
  const linearRatio = timeInStage / duration;
  const eased = easeOutCubic(linearRatio);
  return current.percent + (next.percent - current.percent) * eased;
}

interface ProgressBarDemoProps {
  /** 嵌入对话面板时不加外圈 margin 与居中外层 */
  embedded?: boolean;
  /** 点击任务描述区域（红框位置）时回调，用于展开为工具调用面板 */
  onExpandClick?: () => void;
}

export default function ProgressBarDemo({ embedded, onExpandClick }: ProgressBarDemoProps) {
  const [progress, setProgress] = useState(0);
  const [logText, setLogText] = useState("Waiting to start...");
  const [logUpdating, setLogUpdating] = useState(false);
  const [sliding, setSliding] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const lastLogTimeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const progressRef = useRef(0);
  const videoIndexRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const slidingLockRef = useRef(false);

  useEffect(() => {
    const start = () => {
      startTimeRef.current = Date.now();
      lastLogTimeRef.current = Date.now();
      setLogText(LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)]);
      setProgress(0);
      progressRef.current = 0;
      videoIndexRef.current = Math.floor(Math.random() * VIDEO_SOURCES.length);
      const v1 = video1Ref.current;
      if (v1 && VIDEO_SOURCES.length > 0) {
        v1.src = VIDEO_SOURCES[videoIndexRef.current];
        v1.muted = true;
        v1.loop = true;
        v1.play().catch(() => {});
      }
    };

    const slideToNext = () => {
      if (slidingLockRef.current) return;
      const track = trackRef.current;
      if (!track || track.children.length < 2) return;
      const left = track.children[0] as HTMLVideoElement;
      const right = track.children[1] as HTMLVideoElement;
      if (!left || !right || left.tagName !== "VIDEO" || right.tagName !== "VIDEO") {
        return;
      }
      slidingLockRef.current = true;
      const nextIndex = (videoIndexRef.current + 1) % VIDEO_SOURCES.length;
      videoIndexRef.current = nextIndex;
      right.src = VIDEO_SOURCES[nextIndex];
      right.muted = true;
      right.loop = true;
      right.play().catch(() => {});
      setSliding(true);
      setTimeout(() => {
        track.style.transition = "none";
        track.style.transform = "translateX(0)";
        track.appendChild(left);
        left.pause();
        left.currentTime = 0;
        left.removeAttribute("src");
        left.load();
        setSliding(false);
        requestAnimationFrame(() => {
          track.style.transition = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
        });
        slidingLockRef.current = false;
      }, 600);
    };

    const tick = () => {
      const start = startTimeRef.current;
      if (start == null) return;

      const now = Date.now();
      const elapsed = now - start;

      if (now - lastLogTimeRef.current > UPDATE_INTERVAL) {
        lastLogTimeRef.current = now;
        setLogUpdating(true);
        setTimeout(() => {
          setLogText(LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)]);
          setLogUpdating(false);
        }, 400);
        slideToNext();
      }

      const ceiling = calculateTargetPercent(elapsed);
      let p = progressRef.current;

      if (p < ceiling) {
        let step =
          p < 50 ? 0.1 + Math.random() * 0.2 : p < 80 ? 0.02 + Math.random() * 0.08 : (ceiling - p) * 0.05;
        if (Math.random() < 0.15) step = 0;
        if (Math.random() < 0.01) step *= 5;
        p += step;
      } else {
        const crawl = Math.max((99 - p) * 0.001, 0.002);
        p += crawl;
      }
      if (p > 99) p = 99;
      progressRef.current = p;
      setProgress(p);
      rafRef.current = requestAnimationFrame(tick);
    };

    start();
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const card = (
    <div
      className={`overflow-hidden rounded-2xl bg-white text-left shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.5)_inset,0_1px_4px_0_rgba(0,0,0,0.06)] ${embedded ? "w-full" : "w-[340px]"}`}
        style={{ fontFamily: "var(--font-sans), Inter, sans-serif" }}
      >
        <div className="border-b border-black/[0.03] bg-[#FBFBFB] px-6 pb-6 pt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-baseline" style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
              <span className="text-[32px] font-bold leading-none text-black/70 tabular-nums">
                {Math.floor(progress)}
              </span>
              <span className="ml-0.5 text-base font-bold text-black/70">%</span>
            </div>
            <div className="h-[100px] w-[100px] shrink-0 overflow-hidden rounded-lg bg-[#E8E8E8]">
              <div
                ref={trackRef}
                className="flex h-full w-[200%] transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: sliding ? "translateX(-50%)" : "translateX(0)" }}
              >
                <video
                  ref={video1Ref}
                  className="h-full w-1/2 shrink-0 object-cover"
                  muted
                  playsInline
                  loop
                />
                <video
                  ref={video2Ref}
                  className="h-full w-1/2 shrink-0 object-cover"
                  muted
                  playsInline
                  loop
                />
              </div>
            </div>
          </div>
          <div className="mt-3 h-[7px] w-full overflow-hidden rounded-full bg-[#E6E6E6]">
            <div
              className="h-full rounded-full bg-[#5DD99F] transition-[width] duration-100 ease-linear"
              style={{
                width: `${progress}%`,
                boxShadow:
                  "inset 0 0 1px 2px rgba(255,255,255,0.2), inset 0 0 2px 0 #FFF, 0 0 1px 0 rgba(0,146,35,0.5)",
              }}
            />
          </div>
        </div>
        <div
          role={onExpandClick ? "button" : undefined}
          tabIndex={onExpandClick ? 0 : undefined}
          onClick={onExpandClick}
          onKeyDown={onExpandClick ? (e) => e.key === "Enter" && onExpandClick() : undefined}
          className={`flex items-center justify-between px-6 py-5 transition-colors hover:bg-black/5 ${onExpandClick ? "cursor-pointer" : ""}`}
        >
          <div
            className={`max-w-[276px] text-sm leading-[22px] text-[#666] transition-all duration-300 ease-out ${
              logUpdating ? "translate-y-0.5 opacity-0 blur-[2px]" : "opacity-70"
            }`}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {logText}
          </div>
          <div className="ml-2.5 shrink-0 opacity-60">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-black/40">
              <path
                d="M5.9 14c.25 0 .47-.1.64-.26L11.54 8.74c.35-.35.35-.92 0-1.27L6.55 2.48a1 1 0 00-1.65.76c0 .25.1.47.26.64L9.63 8.1l-4.37 4.36A.98.98 0 005 13.1C5 13.6 5.4 14 5.9 14z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </div>
  );

  if (embedded) return card;
  return <div className="my-10 flex justify-center">{card}</div>;
}
