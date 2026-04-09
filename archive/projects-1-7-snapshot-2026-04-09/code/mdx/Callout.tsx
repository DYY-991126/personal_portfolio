import { ReactNode } from "react";

const STYLES: Record<string, { border: string; bg: string; icon: string }> = {
  tip: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    icon: "💡",
  },
  warning: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    icon: "⚠️",
  },
  insight: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    icon: "✦",
  },
  note: {
    border: "border-border/50",
    bg: "bg-muted/30",
    icon: "📌",
  },
};

interface CalloutProps {
  type?: "tip" | "warning" | "insight" | "note";
  title?: string;
  children: ReactNode;
}

export default function Callout({
  type = "note",
  title,
  children,
}: CalloutProps) {
  const style = STYLES[type] ?? STYLES.note;

  return (
    <div
      className={`my-12 rounded-xl border ${style.border} ${style.bg} px-6 py-5`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg leading-none mt-0.5 shrink-0">
          {style.icon}
        </span>
        <div className="min-w-0">
          {title && (
            <p className="text-sm font-semibold text-foreground mb-1">
              {title}
            </p>
          )}
          <div className="text-sm text-muted-foreground leading-relaxed [&>p]:m-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
