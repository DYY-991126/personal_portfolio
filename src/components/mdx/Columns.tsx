import { ReactNode } from "react";

interface ColumnsProps {
  cols?: 2 | 3 | 4;
  /** 更紧的间距与外边距，适合多图并列 */
  compact?: boolean;
  children: ReactNode;
}

export default function Columns({ cols = 2, compact = false, children }: ColumnsProps) {
  if (cols === 4) {
    return (
      <div
        className={`flex w-full min-w-0 flex-row flex-nowrap items-stretch *:min-w-0 *:flex-1 ${compact ? "my-6 gap-2 sm:gap-3 md:gap-4" : "my-12 gap-2 sm:gap-4 md:gap-8"}`}
      >
        {children}
      </div>
    );
  }

  const gridClass =
    cols === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2";

  const gapMy = compact ? "gap-4 md:gap-5 my-6 md:my-8" : "gap-8 my-12";

  return (
    <div className={`grid ${gridClass} min-w-0 ${gapMy}`}>{children}</div>
  );
}
