import type { CSSProperties, ReactNode } from "react";

export const PROJECT5_CANVAS_STYLE: CSSProperties = {
  backgroundColor: "#fbfaf5",
  backgroundImage:
    "radial-gradient(rgba(31,41,55,0.11) 0.8px, transparent 0.8px)",
  backgroundSize: "16px 16px",
};

/** Vertical rhythm for canvas previews in MDX (matches `Project5DemoFrame` `my-14`). */
export const PROJECT5_PREVIEW_BLOCK_MARGIN_CLASS =
  "my-12 md:my-14 w-full min-w-0";

interface Project5DemoFrameProps {
  title: string;
  description?: string;
  controls?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function Project5DemoFrame({
  title,
  description,
  controls,
  footer,
  children,
}: Project5DemoFrameProps) {
  return (
    <div className="my-14 overflow-hidden rounded-[28px] border border-border/40 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.06)]">
      <div className="border-b border-border/20 px-6 py-5 md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground/70">
              Interactive Demo
            </p>
            <h4 className="mt-2 text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              {title}
            </h4>
            {description && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                {description}
              </p>
            )}
          </div>
          {controls ? <div className="flex flex-wrap gap-2">{controls}</div> : null}
        </div>
      </div>

      <div className="px-5 py-5 md:px-8 md:py-8">{children}</div>

      {footer ? (
        <div className="border-t border-border/20 bg-muted/20 px-6 py-4 md:px-8">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

interface ToggleButtonProps {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export function Project5ToggleButton({
  active = false,
  onClick,
  children,
}: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active
          ? "border-[#1f8ef1] bg-[#1f8ef1] text-white"
          : "border-border/40 bg-white text-muted-foreground hover:border-[#1f8ef1]/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

interface MiniStatProps {
  label: string;
  value: string;
}

export function Project5MiniStat({ label, value }: MiniStatProps) {
  return (
    <div className="rounded-2xl border border-border/30 bg-white/90 px-4 py-3 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

