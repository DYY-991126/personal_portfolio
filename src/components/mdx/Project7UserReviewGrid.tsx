"use client";

import { motion } from "framer-motion";

const REVIEW_IMAGES: { src: string; alt: string }[] = [
  {
    src: "/projects/project-7/用户好评/00.png",
    alt: "用户推荐 Ugic 插件相对 Figma AI、一次生成多页设计（社交媒体截图）",
  },
  { src: "/projects/project-7/用户好评/01.png", alt: "社交媒体用户好评截图 1" },
  { src: "/projects/project-7/用户好评/02.png", alt: "社交媒体用户好评截图 2" },
  { src: "/projects/project-7/用户好评/03.png", alt: "社交媒体用户好评截图 3" },
  { src: "/projects/project-7/用户好评/04.png", alt: "社交媒体用户好评截图 4" },
  { src: "/projects/project-7/用户好评/05.png", alt: "社交媒体用户好评截图 5" },
  { src: "/projects/project-7/用户好评/06.png", alt: "社交媒体用户好评截图 6" },
  { src: "/projects/project-7/用户好评/07.png", alt: "社交媒体用户好评截图 7" },
];

/** 上线后用户好评：多列瀑布流（CSS columns），点击新标签打开原图。 */
export default function Project7UserReviewGrid() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="not-prose my-12 w-full max-w-6xl"
      aria-label="上线后用户好评"
    >
      <div className="columns-1 gap-x-5 sm:columns-2 lg:columns-3">
        {REVIEW_IMAGES.map((item) => (
          <a
            key={item.src}
            href={item.src}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-5 block min-w-0 break-inside-avoid overflow-hidden rounded-xl border border-border/40 bg-muted/20 shadow-sm transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.src} alt={item.alt} className="block h-auto w-full object-top" loading="lazy" />
          </a>
        ))}
      </div>
    </motion.div>
  );
}
