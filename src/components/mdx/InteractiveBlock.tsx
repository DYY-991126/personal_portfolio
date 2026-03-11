"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface InteractiveBlockProps {
  id?: string;
  title?: string;
  description?: string;
  children?: ReactNode;
}

export default function InteractiveBlock({
  title,
  description,
  children,
}: InteractiveBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="my-16 rounded-2xl border border-border/30 bg-muted/30 overflow-hidden"
    >
      {(title || description) && (
        <div className="px-6 py-4 border-b border-border/20">
          {title && (
            <h4 className="text-sm font-semibold text-foreground tracking-tight">
              {title}
            </h4>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="p-6 md:p-8 min-h-[200px] flex items-center justify-center">
        {children ?? (
          <span className="text-muted-foreground/50 text-sm font-mono">
            Interactive demo placeholder
          </span>
        )}
      </div>
    </motion.div>
  );
}
