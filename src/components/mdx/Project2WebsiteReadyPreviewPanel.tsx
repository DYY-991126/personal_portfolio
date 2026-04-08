"use client";

const DEMO_BUSINESS_NAME = "Sunny Paws Bakery";
const DEMO_BUSINESS_DESCRIPTION = "为宠物主人提供定制烘焙与节日蛋糕预订的品牌官网。";

const DEMO_VISITOR_BENEFITS = [
  "先建立信任，再推动咨询与下单。",
  "品牌介绍、主打产品、订购方式、用户反馈、联系方式。",
  "微信 sunnypaws-bakery，Logo 已上传，产品图 12 张，品牌主色为奶油白与浅棕。",
];

export type Project2WebsiteReadyPanelProps = {
  businessName?: string;
  businessDescription?: string;
  visitorBenefits?: string[];
  ctaLabel?: string;
  onCtaClick?: () => void;
  /** When true (chat), use doc-style cream outer frame with tighter max-width; when false (MDX demo), add vertical page margin. */
  embedded?: boolean;
};

function buildFieldRows(
  businessDescription: string,
  visitorBenefits: string[]
): Array<{ label: string; value: string }> {
  const b = visitorBenefits.filter(Boolean);
  const row1 = b[0] ?? "先建立信任，再推动咨询与下单。";
  const row2 = b[1] ?? (businessDescription || "品牌介绍、主打产品、订购方式与联系方式。");
  const row3 =
    b.length >= 3 ? b.slice(2).join("；") : "可按需补充 Logo、实拍图、营业时间等真实资料。";

  return [
    { label: "网站目标", value: row1 },
    { label: "网站核心内容", value: row2 },
    { label: "关键资料", value: row3 },
  ];
}

/** Shared layout for “生成网站卡片” — used in project-2.mdx demo and live chat `website_ready_summary`. */
export function Project2WebsiteReadyPanel({
  businessName = DEMO_BUSINESS_NAME,
  businessDescription = DEMO_BUSINESS_DESCRIPTION,
  visitorBenefits,
  ctaLabel = "马上获取我的专属网站 - 支付 $2.99",
  onCtaClick,
  embedded = false,
}: Project2WebsiteReadyPanelProps) {
  const benefits =
    visitorBenefits && visitorBenefits.length > 0
      ? visitorBenefits
      : embedded
        ? [
            businessDescription || "明确访客来到网站后要完成的核心动作。",
            "用真实业务信息建立信任，并引导下一步转化。",
            "可后续补充 Logo、实拍图、营业时间等资料。",
          ]
        : DEMO_VISITOR_BENEFITS;
  const fieldRows = buildFieldRows(businessDescription, benefits);

  const inner = (
    <div className="mx-auto flex w-full max-w-[980px] flex-col gap-5 overflow-visible">
      <div className="flex justify-start">
        <div className="max-w-[540px] rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,245,239,0.95))] px-6 py-6 shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_10px_30px_rgba(82,60,32,0.05)] md:px-7">
          <div className="space-y-6">
            <div className="space-y-2 border-b border-black/6 pb-5">
              <h3 className="max-w-[420px] text-[27px] font-semibold leading-[1.2] tracking-[-0.04em] text-black/88">
                这是你的网站制作方案
              </h3>
              <p className="max-w-[420px] text-[14px] leading-6 text-black/48">
                已根据你确认的信息整理完成，可以直接进入制作。
              </p>
            </div>

            <div className="rounded-[18px] bg-[rgba(255,252,248,0.78)] px-5 py-5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
              <div className="space-y-1.5">
                <p className="text-[12px] font-medium text-black/38">品牌项目</p>
                <p className="text-[25px] font-semibold leading-tight tracking-[-0.035em] text-black/92">
                  {businessName}
                </p>
                <p className="max-w-[420px] text-[15px] leading-7 text-black/62">{businessDescription}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[18px] bg-[#fcfaf6] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
              {fieldRows.map((field, index) => (
                <div
                  key={field.label}
                  className={`grid gap-2 px-5 py-4.5 ${index !== fieldRows.length - 1 ? "border-b border-black/6" : ""} md:grid-cols-[100px_minmax(0,1fr)] md:gap-5`}
                >
                  <p className="text-[12px] font-medium text-black/38">{field.label}</p>
                  <p className="text-[14px] leading-7 text-black/78">{field.value}</p>
                </div>
              ))}
            </div>
          </div>

          {onCtaClick ? (
            <div className="mt-5">
              <button
                type="button"
                onClick={onCtaClick}
                className="w-full px-5 py-3.5 text-[15px] font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95"
                style={{
                  borderRadius: "14px",
                  backgroundColor: "#000",
                  boxShadow: `
                    inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                    inset 0 -1px 1px 0 rgba(255, 255, 255, 0.2),
                    inset 0 1px 4px 1px rgba(255, 255, 255, 0.2),
                    inset 0 -2px 1px 1px rgba(255, 255, 255, 0.2),
                    inset 0 20px 20px 0 rgba(255, 255, 255, 0.04),
                    0 0 0 1px #000,
                    0 1px 1px 0 rgba(0, 0, 0, 0.2)
                  `,
                }}
              >
                {ctaLabel}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (embedded) {
    /* Same cream “frame” as the MDX demo so chat is not a flat white bubble only. */
    return (
      <div className="w-full max-w-[min(100%,580px)] rounded-[28px] bg-[#f7f4ee] p-6 shadow-[inset_0_0_0_1px_rgba(82,60,32,0.07)] md:p-8">
        {inner}
      </div>
    );
  }

  return <div className="my-10 rounded-[28px] bg-[#f7f4ee] p-8 md:p-10">{inner}</div>;
}

/** MDX 文档内静态预览：与对话里「生成网站卡片」同一套布局。 */
export default function Project2WebsiteReadyPreviewPanel() {
  return (
    <Project2WebsiteReadyPanel
      businessName={DEMO_BUSINESS_NAME}
      businessDescription={DEMO_BUSINESS_DESCRIPTION}
      visitorBenefits={DEMO_VISITOR_BENEFITS}
      onCtaClick={() => {}}
    />
  );
}
