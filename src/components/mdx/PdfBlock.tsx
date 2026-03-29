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
}

export default function PdfBlock({
  src,
  title,
  caption,
  previewHeight = 420,
  previewSrc,
}: PdfBlockProps) {
  const [open, setOpen] = useState(false);
  const pdfSrc = `${encodeURI(src)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

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
          onClick={() => setOpen(true)}
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
              <span>展开查看</span>
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
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-black/90 backdrop-blur-md p-4 md:p-8"
          >
            <div className="w-full h-full max-w-7xl mx-auto flex flex-col rounded-3xl overflow-hidden border border-white/10 bg-white shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-black/10">
                <div>
                  <div className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">
                    Architecture PDF
                  </div>
                  <div className="text-lg font-semibold tracking-tight text-foreground mt-1">
                    {title}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-10 h-10 rounded-full border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <iframe title={`${title} full view`} src={pdfSrc} className="w-full flex-1 bg-white" />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
