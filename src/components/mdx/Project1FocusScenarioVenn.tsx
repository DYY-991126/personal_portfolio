/**
 * 三圆韦恩：聚焦「信息展示 + 留资类」场景的决策维度（project-1）
 */
export default function Project1FocusScenarioVenn() {
  return (
    <figure
      className="my-10 w-full max-w-2xl mx-auto px-2"
      aria-label="三圆交集示意：数据验证、优势匹配、技术可行性的交集为信息展示加留资类网站"
    >
      <div className="rounded-none border border-[#333333] bg-[#141414] px-3 py-5 md:px-6 md:py-5">
        <svg
          viewBox="-48 0 496 345"
          className="w-full h-auto text-foreground"
          role="img"
          aria-hidden
        >
          {/* 三圆对称排布；中心距再收拢一点以略增大三重交集 */}
          <circle cx="200" cy="124" r="105" fill="#A0522D" fillOpacity="0.14" stroke="currentColor" strokeWidth="1" strokeOpacity="0.38" />
          <circle cx="136" cy="222" r="105" fill="#F5F5DC" fillOpacity="0.08" stroke="currentColor" strokeWidth="1" strokeOpacity="0.38" />
          <circle cx="264" cy="222" r="105" fill="#737373" fillOpacity="0.1" stroke="currentColor" strokeWidth="1" strokeOpacity="0.38" />

          <text
            x="200"
            y="190"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[#F5F5DC] text-[10px] md:text-[11px] font-medium leading-tight"
            style={{ fontFamily: "var(--font-sans), Inter, sans-serif" }}
          >
            <tspan x="200" dy="-0.55em">
              信息展示
            </tspan>
            <tspan x="200" dy="1.15em">
              留资类网站
            </tspan>
          </text>

          <text
            x="200"
            y="82"
            textAnchor="middle"
            className="fill-muted-foreground text-[10px] md:text-[11px] font-medium"
            style={{ fontFamily: "var(--font-sans), Inter, sans-serif" }}
          >
            优势匹配
          </text>
          <text
            x="100"
            y="240"
            textAnchor="middle"
            className="fill-muted-foreground text-[10px] md:text-[11px] font-medium"
            style={{ fontFamily: "var(--font-sans), Inter, sans-serif" }}
          >
            数据验证
          </text>
          <text
            x="300"
            y="240"
            textAnchor="middle"
            className="fill-muted-foreground text-[10px] md:text-[11px] font-medium"
            style={{ fontFamily: "var(--font-sans), Inter, sans-serif" }}
          >
            技术可行
          </text>
        </svg>
      </div>
    </figure>
  );
}
