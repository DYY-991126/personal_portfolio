"use client";

export interface DiagnosticsFilesItem {
  label: string;
  count: number;
}

export interface WorkProductDiagnosticsFilesProps {
  items?: DiagnosticsFilesItem[];
}

/** 结果类型 1：测试 & 找文件，如 "Diagnostics 3 files" / "Founded 1 files" */
export default function WorkProductDiagnosticsFiles({
  items = [],
}: WorkProductDiagnosticsFilesProps) {
  return (
    <div
      className="space-y-1 text-sm font-medium leading-relaxed text-black/50"
      style={{ fontFamily: "var(--font-sans), Inter, sans-serif" }}
    >
      {(items ?? []).map((item, i) => (
        <p key={i}>
          {item.label} {item.count} files
        </p>
      ))}
    </div>
  );
}
