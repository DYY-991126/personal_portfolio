"use client";

export interface VideoItem {
  src: string;
  poster?: string;
}

export interface WorkProductVideoGridProps {
  videos?: VideoItem[];
}

const VIDEO_GAP = 8;
const COLLECTION_PADDING = 10;

/** 生成视频的结果物：视频网格，每排 2 个，按卡片宽度响应式缩放，比例 200×112 */
export default function WorkProductVideoGrid({
  videos = [],
}: WorkProductVideoGridProps) {
  if (videos.length === 0) return null;

  return (
    <div
      className="overflow-hidden rounded-lg border"
      style={{
        backgroundColor: "#F7F7F7",
        border: "1px solid #F0F0F0",
        padding: COLLECTION_PADDING,
        fontFamily: "var(--font-sans), Inter, sans-serif",
      }}
    >
      <div
        className="grid grid-cols-2"
        style={{ gap: VIDEO_GAP }}
      >
        {(videos ?? []).map((v, i) => (
          <div
            key={i}
            className="relative w-full overflow-hidden rounded-lg bg-black/10"
            style={{
              aspectRatio: "200/112",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
            }}
          >
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
    </div>
  );
}
