const BRANCHES = [
  {
    title: "视觉层",
    description: "整体风格是否匹配用户偏好与业务气质",
  },
  {
    title: "内容层",
    description: "信息结构、语言设计与叙事是否服务业务目标",
  },
  {
    title: "功能层",
    description: "关键功能是否支撑用户在线完成目标",
  },
];

export default function Project2ExpectationFramework() {
  return (
    <div className="my-14 rounded-[28px] border border-border/40 bg-muted/12 p-6 md:p-8">
      <div className="rounded-[24px] border border-border/35 bg-background/55 p-5 md:p-7">
        <div className="flex justify-center">
          <div className="w-full max-w-xl rounded-[22px] border border-foreground/15 bg-foreground/[0.04] px-6 py-5 text-center">
            <h4 className="m-0 text-xl font-semibold text-foreground md:text-2xl">
              用户满意、高效达成业务目标的网站
            </h4>
          </div>
        </div>

        <div className="relative mx-auto hidden max-w-6xl pt-16 md:block">
          <div className="absolute left-1/2 top-0 h-16 w-px -translate-x-1/2 bg-border/70" />
          <div className="absolute left-[16.66%] right-[16.66%] top-16 h-px bg-border/70" />

          <div className="grid grid-cols-3 gap-8">
            {BRANCHES.map((branch) => (
              <div key={branch.title} className="relative pt-12">
                <div className="absolute left-1/2 top-0 h-12 w-px -translate-x-1/2 bg-border/70" />
                <div className="rounded-[22px] border border-foreground/15 bg-foreground/[0.03] px-6 py-5">
                  <h5 className="m-0 text-lg font-semibold text-foreground md:text-xl">
                    {branch.title}
                  </h5>
                  <p className="mt-4 mb-0 text-sm leading-7 text-muted-foreground">
                    {branch.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-4 md:hidden">
          {BRANCHES.map((branch) => (
            <div key={branch.title} className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-foreground/70" />
              <div className="rounded-[18px] border border-border/35 bg-background/80 p-4 flex-1">
                <h5 className="m-0 text-base font-semibold text-foreground">
                  {branch.title}
                </h5>
                <p className="mt-3 mb-0 text-sm leading-7 text-muted-foreground">
                  {branch.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
