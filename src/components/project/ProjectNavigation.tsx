"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function ProjectNavigation() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll("#project-title, .mdx-content h2")
    );
    const extracted: Heading[] = elements
      .map((el) => ({
        id: el.id,
        text: (el as HTMLElement).dataset.label || el.textContent || "",
        level: parseInt(el.tagName.substring(1), 10),
      }))
      .filter((h) => h.id);

    setHeadings(extracted);
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let active = "";
        entries.forEach((entry) => {
          if (entry.isIntersecting) active = entry.target.id;
        });
        if (active) setActiveId(active);
      },
      { rootMargin: "-10% 0px -80% 0px" }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="sticky top-32 w-full z-30 hidden xl:block">
      <div className="pl-4 border-l border-border/30 space-y-3 relative">
        <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-6">
          Contents
        </h4>
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const isH3 = heading.level === 3;
          return (
            <div key={heading.id} className={`relative ${isH3 ? "pl-3" : ""}`}>
              {isActive && (
                <motion.div
                  layoutId="active-nav-line"
                  className="absolute -left-[17px] top-0 bottom-0 w-0.5 bg-foreground rounded-r"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`block tracking-tight transition-colors line-clamp-2 ${
                  isH3
                    ? "text-xs text-muted-foreground/70 hover:text-foreground font-normal"
                    : "text-sm font-medium text-muted-foreground hover:text-foreground"
                } ${isActive ? "!text-foreground" : ""}`}
              >
                {heading.text}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
