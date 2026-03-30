"use client";

import { motion } from "framer-motion";
import type { WheelEvent } from "react";

type ExperienceItem = {
  title: string;
  desc: string;
};

type ExperienceSection = {
  id: string;
  label: string;
  items: ExperienceItem[];
};

const sections: ExperienceSection[] = [
  {
    id: "general",
    label: "通用原则",
    items: [
      {
        title: "用老板听得懂的语言说话",
        desc: "专业但不死板、平等、靠谱、有主见。多用「你 / 我 / 我们」，避免机械话。",
      },
      {
        title: "问问题小步走",
        desc: "紧贴业务场景慢慢推进，问题里带生意词：顾客、电话、微信、预约等。",
      },
      {
        title: "控制信息量",
        desc: "每条消息 2-4 句，先结论后解释，让老板一眼看懂重点。",
      },
      {
        title: "分段式回复",
        desc: "像真实对话一样有回合感，不一次性倾倒长文。",
      },
      {
        title: "让用户感到“你听懂了”",
        desc: "用自己的话复述用户的诉求和关键点，再继续往下走。",
      },
      {
        title: "提供选择，降低表达成本",
        desc: "用按钮、卡片、快捷响应等交互，让用户低成本表达偏好。",
      },
    ],
  },
  {
    id: "pre",
    label: "生成前",
    items: [
      {
        title: "开场自我介绍",
        desc: "自我介绍为 Kimmy，强调全程陪伴、技术不用操心。",
      },
      {
        title: "信任感前置",
        desc: "用同行案例自然带出经验感，让用户觉得“你不是第一次做这种”。",
      },
      {
        title: "先沟通需求",
        desc: "不直接问“网站用途 / 风格”，先通过对话了解真实需求。",
      },
      {
        title: "识别目标访客",
        desc: "了解客户画像：C 端 / B 端、年龄、设备、来源渠道。",
      },
      {
        title: "询问现有资料",
        desc: "询问旧网站、文档 PPT、品牌手册、运营账号等，快速了解用户。",
      },
      {
        title: "行业洞察",
        desc: "基于行业经验给出差异化建议，超越“问啥答啥”。",
      },
      {
        title: "挖掘隐藏需求",
        desc: "把用户没意识到的业务逻辑转化为设计策略。",
      },
      {
        title: "可视化卡片 + 多轮选择",
        desc: "展示风格卡片，通过 2-3 轮选择逐步收敛到用户想要的风格。",
      },
      {
        title: "基于受众推荐",
        desc: "把选择从“凭感觉”变成“有依据”。",
      },
      {
        title: "解释选择逻辑",
        desc: "让用户理解设计意图，后续沟通更高效。",
      },
      {
        title: "先定框架再补信息",
        desc: "逐页、逐块确认框架，不要求一次性全部确认。",
      },
      {
        title: "采集客观信息（不强制）",
        desc: "询问但不强制，没给的用占位内容继续。",
      },
      {
        title: "建议高转化模块",
        desc: "超出用户预期的模块建议，如 FAQ。",
      },
      {
        title: "生成时间预期",
        desc: "明确告知生成大概需要 10 分钟。",
      },
      {
        title: "生成结果预期",
        desc: "标记已完成 / 样例占位 / 暂未实现，避免误会。",
      },
      {
        title: "说清不能做什么（被动式）",
        desc: "不主动说，只在用户提出做不到的需求时才说明。",
      },
    ],
  },
  {
    id: "post",
    label: "生成后",
    items: [
      {
        title: "引览（导游 + 销售）",
        desc: "解释设计选择、带用户从访客视角过一遍网站。",
      },
      {
        title: "圈绘标记",
        desc: "用户可以圈选区域标记问题，AI 记录不打断。",
      },
      {
        title: "标记统一处理",
        desc: "引览完毕后整合清单，区分处理方式，确认后再动手。",
      },
      {
        title: "待办清单",
        desc: "按紧急程度分类：必须做、建议做、可选做。",
      },
      {
        title: "图片质量检测",
        desc: "上传时自动检测清晰度、分辨率、背景等，主动告知问题。",
      },
      {
        title: "图片智能优化",
        desc: "主动提供优化方案，比如换背景、提亮，并给出对比让用户选。",
      },
      {
        title: "文案结构优化",
        desc: "主动建议调整文案顺序：量化数据 → 资质 → 特色。",
      },
      {
        title: "模糊诉求澄清",
        desc: "把“有点怪”拆成可操作的子问题，再给多方案。",
      },
      {
        title: "多方案设计选择",
        desc: "准备 2-3 个方案，可切换预览，犹豫时给推荐。",
      },
      {
        title: "系统性修改分步确认",
        desc: "先做小样，确认后全站应用，再列出修改汇总。",
      },
      {
        title: "复合诉求拆解",
        desc: "识别 → 拆解列表 → 逐一处理打勾 → 完成汇总。",
      },
      {
        title: "平替方案沟通",
        desc: "诚实说明边界，挖掘真实目的，再提供可行替代方案。",
      },
      {
        title: "转化路径优化",
        desc: "表单配置后建议加感谢页、微信二维码等。",
      },
      {
        title: "SEO 建议",
        desc: "检测标题、描述，建议优化以提升搜索曝光。",
      },
      {
        title: "加载速度检测",
        desc: "检测并自动优化图片大小，提升加载体验。",
      },
      {
        title: "内容一致性检测",
        desc: "改价格后检测关联内容，列出修改建议和汇总。",
      },
      {
        title: "关联更新检测",
        desc: "改电话等信息后，自动检测并同步所有关联位置。",
      },
    ],
  },
];

export default function ServiceExperiencePreview() {
  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const delta = event.deltaY;
    const canScrollUp = scrollTop > 0;
    const canScrollDown = scrollTop + clientHeight < scrollHeight - 1;

    if ((delta < 0 && canScrollUp) || (delta > 0 && canScrollDown)) {
      event.stopPropagation();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="my-16"
    >
      <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
        <div
          className="h-[760px] overflow-y-auto overscroll-contain bg-white px-5 py-5 md:px-6 md:py-6"
          onWheel={handleWheel}
        >
          <div className="space-y-5">
            {sections.map((section) => {
              return (
                <section
                  key={section.id}
                  className="rounded-[22px] border border-black/8 bg-[#fcfcfb] p-4 md:p-5"
                >
                  <div className="mb-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                        {section.label}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {section.items.map((item) => (
                      <article
                        key={item.title}
                        className="rounded-2xl border border-black/6 bg-white p-4"
                      >
                        <h4 className="text-sm font-semibold leading-6 text-slate-900">
                          {item.title}
                        </h4>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {item.desc}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
