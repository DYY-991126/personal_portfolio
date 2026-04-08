"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

export type Project4GallerySite = {
  url: string;
  label: string;
};

const DEFAULT_SITES: Project4GallerySite[] = [
  { url: "https://website.wegic.top/", label: "Nocturnal · 睡眠教练与优化" },
  { url: "https://my-website-9y2fsdqf.wegic.top/", label: "生成案例 · my-website" },
  { url: "https://general-web-2t94e4ln.wegic.top/", label: "生成案例 · general-web" },
  { url: "https://personal-web-g93tpc2d.wegic.top/", label: "生成案例 · personal-web" },
  { url: "https://my-web-mq7xwf5v.wegic.top/", label: "生成案例 · my-web" },
  { url: "https://web-site-0y4b1jzi.wegic.top/", label: "生成案例 · web-site" },
  { url: "https://web3-creative-agency-2w4qgqz5.wegic.top/", label: "Web3 · 创意机构" },
  { url: "https://aesthetic-med-clinic-gf20k38q.wegic.top/", label: "医美诊所" },
  { url: "https://footsole-forum-p4dff00c.wegic.top/", label: "论坛 · footsole" },
  {
    url: "https://footsole-forum-xvfl3msi.wegic.top/",
    label: "Footsole · Find Your Sole Mate",
  },
  { url: "https://my-website-fdtgkysl.wegic.top/", label: "生成案例 · my-website（二）" },
  { url: "https://craft-beer-hub-vzh0fctl.wegic.top/", label: "AURUM BREWING · 精酿" },
];

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
      { rootMargin: "240px", threshold: 0.01 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ready]);

  return { ref, ready };
}

function LivePreviewFrame({
  url,
  title,
  className,
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const { ref, ready } = useLazyLoad();

  return (
    <div ref={ref} className={className}>
      {ready ? (
        <iframe
          src={url}
          title={title}
          className="pointer-events-none h-full w-full border-0 bg-background"
          allow={IFRAME_ALLOW}
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="flex h-full min-h-[160px] items-center justify-center bg-muted/40 text-sm text-muted-foreground">
          滚动至此将加载实时页面…
        </div>
      )}
    </div>
  );
}

export type Project4LiveSiteGalleryProps = {
  sites?: Project4GallerySite[];
};

export default function Project4LiveSiteGallery({
  sites = DEFAULT_SITES,
}: Project4LiveSiteGalleryProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="not-prose my-12 max-w-7xl"
      aria-label="生成站点实时预览画廊"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        {sites.map((site) => (
          <a
            key={site.url}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${site.label}，在新标签页打开`}
            className="group relative isolate aspect-square w-full overflow-hidden rounded-2xl border border-[#C9B896]/22 bg-muted/10 outline-none transition-[border-color,transform] duration-300 ease-out hover:border-[#D4C4A8]/42 hover:bg-muted/12 focus-visible:border-[#E8DCC8]/55 focus-visible:ring-2 focus-visible:ring-[#C9B896]/25"
          >
            <div className="absolute inset-0 overflow-hidden transition-transform duration-500 ease-out group-hover:scale-[1.02]">
              <LivePreviewFrame
                url={site.url}
                title={site.label}
                className="h-full w-full overflow-hidden"
              />
            </div>
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#0a0a0a]/72 opacity-0 backdrop-blur-[6px] transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
              aria-hidden
            >
              <span className="flex items-center gap-2 rounded-full border border-[#E8DCC8]/45 bg-[#141312]/92 px-4 py-2 text-xs font-medium tracking-tight text-[#F0E6D4] sm:px-5 sm:py-2.5 sm:text-sm">
                <ExternalLink className="h-4 w-4 shrink-0 text-[#E8DCC8]" strokeWidth={1.75} />
                在新标签页打开
              </span>
            </div>
          </a>
        ))}
      </div>
    </motion.section>
  );
}
