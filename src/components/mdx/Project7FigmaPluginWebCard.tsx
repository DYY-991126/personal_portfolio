"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const PLUGIN_URL =
  "https://www.figma.com/community/plugin/1402614000214503826/ugic-ai-generate-ui-based-any-component-library";

/** 视频下方：单条可点击外链卡片（无地址栏、无重复按钮）。 */
export default function Project7FigmaPluginWebCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="not-prose my-12 w-full max-w-6xl"
    >
      <a
        href={PLUGIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex w-full min-w-0 items-center justify-between gap-4 rounded-xl border border-border/40 bg-muted/15 px-4 py-4 outline-none ring-offset-background transition-colors hover:border-border/60 hover:bg-muted/25 focus-visible:ring-2 focus-visible:ring-foreground/30 md:px-6 md:py-5"
        aria-label="在 Figma Community 打开 Ugic 插件页"
      >
        <span className="min-w-0 text-left text-base font-semibold tracking-tight text-foreground md:text-lg">
          Ugic — AI Generate UI based on any component library
        </span>
        <ExternalLink
          className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
          strokeWidth={2}
          aria-hidden
        />
      </a>
    </motion.div>
  );
}
