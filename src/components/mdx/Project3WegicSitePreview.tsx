"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const SITE_URL = "https://wegic.ai/";
const IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";

function useLazyLoad() {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setReady(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200px", threshold: 0.01 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ready]);

  return { ref, ready };
}

/** 背景正文下方：带浏览器 chrome 的 Wegic 站点预览，链接到 wegic.ai。 */
export default function Project3WegicSitePreview() {
  const { ref, ready } = useLazyLoad();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="not-prose my-12 w-full max-w-6xl"
      aria-label="Wegic 官网实时预览"
    >
      <div
        ref={ref}
        className="overflow-hidden rounded-xl border border-border/40 bg-muted/20 shadow-sm"
      >
        <div className="flex h-11 shrink-0 items-center gap-3 border-b border-border/40 bg-muted/50 px-3 md:px-4">
          <div className="hidden items-center gap-1.5 sm:flex" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/90" />
          </div>
          <div className="min-w-0 flex-1 rounded-md border border-border/30 bg-background/80 px-3 py-1.5 font-mono text-[11px] text-muted-foreground md:text-xs">
            <span className="truncate block">wegic.ai</span>
          </div>
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border/40 bg-background/90 px-2.5 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-muted md:text-xs"
          >
            <ExternalLink className="h-3.5 w-3.5 opacity-70" strokeWidth={2} />
            打开站点
          </a>
        </div>
        <div className="relative aspect-16/10 w-full bg-background md:aspect-auto md:min-h-[420px] md:h-[min(72vh,640px)]">
          {ready ? (
            <iframe
              src={SITE_URL}
              title="Wegic — wegic.ai"
              className="h-full w-full border-0 bg-background"
              allow={IFRAME_ALLOW}
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center bg-muted/30 text-sm text-muted-foreground">
              滚动至此加载网页预览…
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
