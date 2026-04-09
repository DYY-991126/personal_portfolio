"use client";

export interface ResearchChipItem {
  name: string;
  url?: string;
  /** 若不传则根据 name 自动匹配 Project 3 的 logo */
  icon?: string;
}

const LOGO_SRC: Record<string, string> = {
  "apple.com": "/projects/project-3/apple.svg",
  "github.com": "/projects/project-3/github.svg",
  "google.com": "/projects/project-3/google.svg",
  "youtube.com": "/projects/project-3/youtube.svg",
  "facebook.com": "/projects/project-3/facebook.svg",
};

export interface WorkProductResearchChipsProps {
  items?: ResearchChipItem[];
}

/** 调研结果物：胶囊形芯片，左 logo 右域名，响应式换行 */
export default function WorkProductResearchChips({
  items = [],
}: WorkProductResearchChipsProps) {
  if (items.length === 0) return null;

  return (
    <div
      className="flex flex-wrap"
      style={{
        gap: 8,
        fontFamily: "var(--font-sans), Inter, sans-serif",
      }}
    >
      {(items ?? []).map((item, i) => {
        const iconSrc = item.icon ?? LOGO_SRC[item.name.toLowerCase()];
        const chipContent = (
          <div
            className="flex shrink-0 items-center gap-2 rounded-full"
            style={{
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 10,
              paddingBottom: 10,
              gap: 8,
              backgroundColor: "rgba(0,0,0,0.03)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            {iconSrc && (
              <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={iconSrc}
                  alt=""
                  width={16}
                  height={16}
                  className="object-contain"
                />
              </span>
            )}
            <span className="text-sm font-normal text-black">{item.name}</span>
          </div>
        );
        if (item.url) {
          return (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block no-underline transition-opacity hover:opacity-80"
            >
              {chipContent}
            </a>
          );
        }
        return <span key={i}>{chipContent}</span>;
      })}
    </div>
  );
}
