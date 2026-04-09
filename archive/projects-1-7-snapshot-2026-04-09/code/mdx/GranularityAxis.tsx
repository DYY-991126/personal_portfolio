"use client";

/**
 * 展示颗粒度坐标轴：封装程度低 ←→ 封装程度高
 * 弧形线连接两端，「Wegic 的封装程度」在封装端
 */
export default function GranularityAxis() {
  return (
    <div
      className="my-24 w-full max-w-4xl mx-auto px-4 relative"
      style={{ fontFamily: "var(--font-sans), Inter, sans-serif" }}
    >
      {/* 弧形轴线 + Wegic 的封装程度（圆形）：整体抬高，留出下方空间 */}
      <div className="relative h-56 mb-2">
        <svg
          viewBox="0 -55 400 260"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M 20 100 Q 200 -50 380 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeOpacity="0.45"
            className="text-foreground"
          />
        </svg>
        <div
          className="absolute right-[8%] top-[48%] -translate-y-1/2 w-[7.25rem] h-[7.25rem] min-w-[7.25rem] rounded-full flex items-center justify-center px-2 text-center text-xs font-medium leading-snug bg-[#F5F5DC] text-[#1A1A1A] border border-[#F5F5DC] shrink-0"
        >
          <span>Wegic 的封装程度</span>
        </div>
      </div>

      {/* 左右两组：标签 + 描述紧贴 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 md:gap-y-0">
        <div className="space-y-1.5">
          <span className="block text-lg font-medium text-foreground/90">
            封装程度低
          </span>
          <p className="text-base leading-[1.65] text-muted-foreground">
            将系统运行过程全量暴露给用户
          </p>
        </div>
        <div className="space-y-1.5 md:text-right">
          <span className="block text-lg font-medium text-foreground/90">
            封装程度高
          </span>
          <p className="text-base leading-[1.65] text-muted-foreground">
            将系统过程进行包装，局部暴露给用户
          </p>
        </div>
      </div>
    </div>
  );
}
