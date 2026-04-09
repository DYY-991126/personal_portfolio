import { ReactNode } from "react";

interface ColumnsProps {
  cols?: 2 | 3 | 4;
  children: ReactNode;
}

export default function Columns({ cols = 2, children }: ColumnsProps) {
  if (cols === 4) {
    return (
      <div className="my-12 flex w-full min-w-0 flex-row flex-nowrap items-stretch gap-2 sm:gap-4 md:gap-8 *:min-w-0 *:flex-1">
        {children}
      </div>
    );
  }

  const gridClass =
    cols === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2";

  return (
    <div className={`grid ${gridClass} gap-8 my-12 min-w-0`}>{children}</div>
  );
}
