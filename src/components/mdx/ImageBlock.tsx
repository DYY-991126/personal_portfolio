"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageBlockProps {
  src: string;
  alt?: string;
  caption?: string;
  layout?: "full" | "half" | "side";
  gallerySrcs?: string;
  galleryCaptions?: string;
}

interface GallerySlide {
  src: string;
  caption?: string;
}

export default function ImageBlock({
  src,
  alt = "",
  caption,
  layout = "full",
  gallerySrcs,
  galleryCaptions,
}: ImageBlockProps) {
  const widthClass =
    layout === "half"
      ? "max-w-3xl mx-auto"
      : layout === "side"
        ? "max-w-md ml-auto"
        : "w-full";

  const slides = useMemo<GallerySlide[]>(() => {
    if (!gallerySrcs) return [];
    const srcList = gallerySrcs.split(",").map((s) => s.trim());
    const captionList = galleryCaptions
      ? galleryCaptions.split("|").map((s) => s.trim())
      : [];
    return srcList.map((s, i) => ({
      src: s,
      caption: captionList[i] || undefined,
    }));
  }, [gallerySrcs, galleryCaptions]);

  const hasGallery = slides.length > 0;
  const allSlides: GallerySlide[] = hasGallery
    ? [{ src, caption: caption || "全览" }, ...slides]
    : [];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(0);

  const navigate = useCallback(
    (idx: number) => {
      setDirection(idx > activeIdx ? 1 : -1);
      setActiveIdx(idx);
    },
    [activeIdx]
  );

  const prev = useCallback(() => {
    if (allSlides.length === 0) return;
    setDirection(-1);
    setActiveIdx((i) => (i - 1 + allSlides.length) % allSlides.length);
  }, [allSlides.length]);

  const next = useCallback(() => {
    if (allSlides.length === 0) return;
    setDirection(1);
    setActiveIdx((i) => (i + 1) % allSlides.length);
  }, [allSlides.length]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <>
      <motion.figure
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className={`${widthClass} relative group my-16 ${hasGallery ? "cursor-pointer" : ""}`}
        onClick={hasGallery ? () => { setActiveIdx(0); setLightboxOpen(true); } : undefined}
      >
        <div className="overflow-hidden bg-muted border border-border/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt || caption || "Project visual"}
            className="w-full h-auto object-cover transition-transform duration-[2s] group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>
        {caption && (
          <figcaption className="text-sm text-muted-foreground text-center mt-6 font-medium">
            {caption}
            {hasGallery && (
              <span className="inline-block ml-2 text-[#A0522D]">
                ← 点击放大，左右切换查看详情
              </span>
            )}
          </figcaption>
        )}
      </motion.figure>

      {/* Lightbox with gallery navigation */}
      <AnimatePresence>
        {lightboxOpen && allSlides.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-100 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(false);
              }}
              className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Prev */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center
                text-white/40 hover:text-white transition-colors z-10"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>

            {/* Next */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center
                text-white/40 hover:text-white transition-colors z-10"
            >
              <ChevronRight className="w-7 h-7" />
            </button>

            {/* Image area */}
            <div
              className="relative w-[90vw] max-h-[78vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.img
                  key={activeIdx}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  src={allSlides[activeIdx].src}
                  alt={allSlides[activeIdx].caption || ""}
                  className="max-w-full max-h-[78vh] object-contain"
                />
              </AnimatePresence>
            </div>

            {/* Bottom bar: dots + caption */}
            <div
              className="mt-5 flex flex-col items-center gap-3 max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Caption */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-white/60 text-center"
                >
                  {allSlides[activeIdx].caption || ""}
                  <span className="ml-3 text-white/30 tabular-nums text-xs">
                    {activeIdx + 1} / {allSlides.length}
                  </span>
                </motion.p>
              </AnimatePresence>

              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {allSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(idx)}
                    className={`h-1 transition-all duration-300 ${
                      idx === activeIdx
                        ? "w-5 bg-[#F5F5DC]"
                        : "w-1.5 bg-white/15 hover:bg-white/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
