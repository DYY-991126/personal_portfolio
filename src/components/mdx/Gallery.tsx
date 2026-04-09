"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface GalleryImage {
  src: string;
  caption?: string;
}

interface GalleryProps {
  images?: GalleryImage[];
  data?: string;
  srcs?: string;
  captions?: string;
  columns?: 2 | 3;
}

export default function Gallery({ images: imagesProp, data, srcs, captions }: GalleryProps) {
  let images: GalleryImage[] = [];
  try {
    if (imagesProp) {
      images = imagesProp;
    } else if (data) {
      images = JSON.parse(data);
    } else if (srcs) {
      const srcList = srcs.split(",").map(s => s.trim());
      const captionList = captions ? captions.split("|").map(s => s.trim()) : [];
      images = srcList.map((src, i) => ({ src, caption: captionList[i] || undefined }));
    }
  } catch {
    images = [];
  }

  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [direction, setDirection] = useState(0);

  const navigate = useCallback((newIdx: number) => {
    setDirection(newIdx > activeIdx ? 1 : -1);
    setActiveIdx(newIdx);
  }, [activeIdx]);

  const prev = useCallback(() => {
    const newIdx = (activeIdx - 1 + images.length) % images.length;
    setDirection(-1);
    setActiveIdx(newIdx);
  }, [activeIdx, images.length]);

  const next = useCallback(() => {
    const newIdx = (activeIdx + 1) % images.length;
    setDirection(1);
    setActiveIdx(newIdx);
  }, [activeIdx, images.length]);

  if (images.length === 0) return null;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="my-16"
      >
        {/* Image viewer */}
        <div className="relative group">
          <div
            className="relative overflow-hidden bg-muted border border-border/30 cursor-pointer"
            onClick={() => setLightboxOpen(true)}
          >
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.img
                key={activeIdx}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                src={images[activeIdx].src}
                alt={images[activeIdx].caption || `Gallery image ${activeIdx + 1}`}
                className="w-full h-auto"
                loading="lazy"
                decoding="async"
              />
            </AnimatePresence>
          </div>

          {/* Prev / Next arrows overlaid on image */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center
                  bg-black/40 text-white/70 hover:text-white hover:bg-black/60
                  opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center
                  bg-black/40 text-white/70 hover:text-white hover:bg-black/60
                  opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Caption + controls bar */}
        <div className="mt-4 flex items-center gap-4">
          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => navigate(idx)}
                className={`h-1.5 transition-all duration-300 ${
                  idx === activeIdx
                    ? "w-6 bg-[#F5F5DC]"
                    : "w-1.5 bg-[#F5F5DC]/20 hover:bg-[#F5F5DC]/40"
                }`}
              />
            ))}
          </div>

          {/* Counter */}
          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
            {activeIdx + 1} / {images.length}
          </span>

          {/* Caption */}
          <AnimatePresence mode="wait">
            <motion.span
              key={activeIdx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-muted-foreground truncate"
            >
              {images[activeIdx].caption || ""}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
              className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-6 text-white/60 hover:text-white transition-colors z-10"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-6 text-white/60 hover:text-white transition-colors z-10"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="max-w-[90vw] max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[activeIdx].src}
                alt={images[activeIdx].caption || ""}
                className="max-w-full max-h-[85vh] object-contain"
              />
              {images[activeIdx].caption && (
                <p className="text-sm text-white/60 text-center mt-4">
                  {images[activeIdx].caption}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
