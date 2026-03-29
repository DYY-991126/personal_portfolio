"use client";

import { motion } from "framer-motion";

interface BeforeAfterBlockProps {
  label?: string;
  title: string;
  images?: string;
  imageAlts?: string;
  caption?: string;
}

function ComparisonBlock({
  label,
  title,
  images,
  imageAlts,
  caption,
}: {
  label: string;
  title: string;
  images?: string;
  imageAlts?: string;
  caption?: string;
}) {
  const imageList = (images ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  const altList = imageAlts?.split("|").map((item) => item.trim()) ?? [];

  return (
    <div className="rounded-3xl border border-border/30 bg-muted/20 overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-border/20">
        <div className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground mb-2">
          {label}
        </div>
        <h4 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h4>
      </div>
      <div className="p-4 md:p-6 space-y-4">
        {imageList.map((src, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={altList[index] || `${title} ${index + 1}`}
            className="w-full h-auto rounded-2xl border border-border/20 bg-background"
            loading="lazy"
          />
        ))}
        {caption ? (
          <p className="text-sm text-muted-foreground mt-4 mb-0">{caption}</p>
        ) : null}
      </div>
    </div>
  );
}

export default function BeforeAfterBlock({
  label = "Before",
  title,
  images = "",
  imageAlts,
  caption,
}: BeforeAfterBlockProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="my-16"
    >
      <ComparisonBlock
        label={label}
        title={title}
        images={images}
        imageAlts={imageAlts}
        caption={caption}
      />
    </motion.section>
  );
}
