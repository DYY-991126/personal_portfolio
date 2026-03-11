import { ReactNode } from "react";

interface ColumnsProps {
  cols?: 2 | 3;
  children: ReactNode;
}

export default function Columns({ cols = 2, children }: ColumnsProps) {
  const gridClass =
    cols === 3
      ? "grid-cols-1 md:grid-cols-3"
      : "grid-cols-1 md:grid-cols-2";

  return (
    <div className={`grid ${gridClass} gap-8 my-12`}>
      {children}
    </div>
  );
}
