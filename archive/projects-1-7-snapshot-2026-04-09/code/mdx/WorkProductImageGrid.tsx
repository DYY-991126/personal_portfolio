"use client";

export interface ImageItem {
  src: string;
  alt?: string;
}

export interface WorkProductImageGridProps {
  images?: ImageItem[];
}

const IMAGE_GAP = 8;
const COLLECTION_PADDING = 10;

/** 生成图片的结果物：图片网格，图间距 8，整体距容器 10，容器 bg #F7F7F7、描边 #F0F0F0 */
export default function WorkProductImageGrid({
  images = [],
}: WorkProductImageGridProps) {
  if (images.length === 0) return null;

  const cols = images.length <= 3 ? 3 : images.length <= 4 ? 4 : 5;
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
        className="grid"
        style={{
          gap: IMAGE_GAP,
          gridTemplateColumns: `repeat(${cols}, 80px)`,
        }}
      >
        {(images ?? []).map((img, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg bg-black/5"
            style={{
              width: 80,
              height: 80,
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt ?? `生成图 ${i + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
