"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface PdfBlockProps {
  src: string;
  title: string;
  caption?: string;
  previewHeight?: number;
  previewSrc?: string;
  openMode?: "modal" | "new_tab";
}

export default function PdfBlock({
  src,
  title,
  caption,
  previewHeight = 420,
  previewSrc,
  openMode = "modal",
}: PdfBlockProps) {
  const [open, setOpen] = useState(false);
  const pdfSrc = `${encodeURI(src)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
  const handleOpen = () => {
    if (openMode === "new_tab") {
      window.open(src, "_blank", "noopener,noreferrer");
      return;
    }

    setOpen(true);
  };

  useEffect(() => {
    if (!open || openMode !== "modal") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, openMode]);

  return (
    <>
      <motion.figure
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        className="my-16"
      >
        <button
          type="button"
          onClick={handleOpen}
          className="group block w-full text-left rounded-2xl overflow-hidden border border-border/30 bg-white"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/20 bg-background/90">
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">
                Architecture PDF
              </div>
              <div className="text-lg font-semibold tracking-tight text-foreground mt-1">
                {title}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              <span>{openMode === "new_tab" ? "打开 PDF" : "展开查看"}</span>
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>
          <div
            className="w-full overflow-hidden bg-white"
            style={{ height: `${previewHeight}px` }}
          >
            {previewSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc}
                alt={`${title} preview`}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <iframe title={title} src={pdfSrc} className="w-full h-full bg-white pointer-events-none" />
            )}
          </div>
        </button>
        {caption ? (
          <figcaption className="text-sm text-muted-foreground text-center mt-6 font-medium">
            {caption}
          </figcaption>
        ) : null}
      </motion.figure>

      <AnimatePresence>
        {open && openMode === "modal" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-black/88"
            onClick={() => setOpen(false)}
          >
            <button
              type="button"
              aria-label="关闭 PDF 预览"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-[240px] z-20 flex h-14 w-14 items-center justify-center rounded-full bg-white/96 text-black/70 shadow-[0_10px_30px_rgba(0,0,0,0.28)] transition-colors hover:text-black md:right-6 md:top-[86px]"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="h-full w-full" onClick={(event) => event.stopPropagation()}>
              <iframe
                title={`${title} full view`}
                src={pdfSrc}
                className="h-full w-full bg-white"
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
