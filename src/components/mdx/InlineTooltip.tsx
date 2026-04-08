import type { ReactNode } from "react";

interface InlineTooltipProps {
  label: ReactNode;
  content: ReactNode;
}

export default function InlineTooltip({ label, content }: InlineTooltipProps) {
  return (
    <span className="group relative inline-flex items-center align-baseline">
      <span className="cursor-pointer border-b border-dashed border-foreground/35 text-foreground transition-colors duration-200 group-hover:border-foreground/70">
        {label}
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#101010]/95 px-4 py-3 text-sm leading-relaxed text-white opacity-0 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:opacity-100">
        {content}
      </span>
    </span>
  );
}
