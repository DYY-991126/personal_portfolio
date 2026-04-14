"use client";

import Image from "next/image";
import { FileText, Mic, Play } from "lucide-react";
import { useEffect, useState } from "react";

function DiscoveryCanvas({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-[28px] border border-black/10 bg-[#f7f4ee] p-7 md:p-8 ${className}`}>
      {children}
    </div>
  );
}

function ComparePanel({
  tone,
  children,
}: {
  tone: "bad" | "good";
  children: React.ReactNode;
}) {
  const toneClasses =
    tone === "bad"
      ? "text-[#7d6f62]"
      : "text-[#6c7566]";

  return (
    <div className={`flex h-full min-h-[280px] flex-col ${toneClasses}`}>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Bubble({
  role,
  children,
  streaming = false,
}: {
  role: "assistant" | "user";
  children: React.ReactNode;
  streaming?: boolean;
}) {
  const isUser = role === "user";
  const textContent = typeof children === "string" ? children : null;
  const [displayText, setDisplayText] = useState(
    streaming && textContent ? "" : textContent
  );

  useEffect(() => {
    if (!streaming || !textContent) {
      setDisplayText(textContent);
      return;
    }

    let index = 0;
    setDisplayText("");
    const timer = window.setInterval(() => {
      index += 1;
      setDisplayText(textContent.slice(0, index));
      if (index >= textContent.length) {
        window.clearInterval(timer);
      }
    }, 18);

    return () => window.clearInterval(timer);
  }, [streaming, textContent]);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {isUser ? (
        <div className="max-w-[85%] rounded-xl bg-[#1a1a1a] px-4 py-3">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-white">{children}</div>
        </div>
      ) : (
        <div className="max-w-[90%] rounded-xl bg-white px-6 py-5 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.5)_inset,0_1px_4px_0_rgba(0,0,0,0.06)]">
          <div className="space-y-0 whitespace-pre-wrap text-sm leading-relaxed text-black/85">
            {streaming && textContent ? displayText : children}
          </div>
        </div>
      )}
    </div>
  );
}

function OptionRow({ options }: { options: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {options.map((option) => (
        <span
          key={option}
          className="inline-flex items-center gap-3 rounded-[8px] border-none bg-[#fbfbfb] px-4 py-[7px] text-[14px] font-normal leading-[22px] text-black/70 shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.5),0_0_0_1px_rgba(0,0,0,0.04)] transition hover:bg-white hover:text-black"
        >
          {option}
        </span>
      ))}
    </div>
  );
}

function UploadMediaTile({
  tone,
}: {
  tone: "image" | "video";
}) {
  return (
    <div
      className={`relative h-[74px] overflow-hidden rounded-[14px] border border-black/7 bg-[#e8dccf] shadow-[0_1px_0_rgba(255,255,255,0.85)_inset,0_1px_3px_rgba(0,0,0,0.04)] ${
        tone === "video" ? "w-[132px]" : "w-[74px]"
      }`}
    >
      <Image
        src="/projects/project-2/cover.jpg"
        alt=""
        fill
        className="object-cover"
        sizes={tone === "video" ? "132px" : "74px"}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(0,0,0,0.06))]" />
      <div className="absolute left-[10px] top-[10px] flex h-[18px] w-[18px] items-center justify-center overflow-hidden rounded-[5px] border border-white/55 bg-white/78 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#85a26f]">
          <path d="M2.25 10.75L5.2 7.55C5.46 7.27 5.9 7.26 6.17 7.53L7.36 8.73L9.78 5.9C10.06 5.57 10.58 5.57 10.86 5.9L11.75 6.95V11.75H2.25V10.75Z" fill="currentColor" fillOpacity="0.9" />
          <circle cx="4.2" cy="4.15" r="1.15" fill="#d8ecb9" />
        </svg>
      </div>
      {tone === "video" ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/92 text-black/72 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <Play size={13} fill="currentColor" strokeWidth={0} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function UploadFilePill({
  name,
  ext,
}: {
  name: string;
  ext: string;
}) {
  return (
    <div className="inline-flex h-[74px] min-w-[188px] max-w-[188px] items-center rounded-[14px] border border-black/7 bg-[#f7f6f5] px-4 shadow-[0_1px_0_rgba(255,255,255,0.85)_inset,0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mr-3 flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-[linear-gradient(180deg,#e5e5e5_0%,#d7d7d7_100%)] text-black/42">
        <Image
          src="/projects/project-2/file.svg"
          alt=""
          width={24}
          height={24}
          className="h-6 w-6 opacity-70"
        />
      </div>
      <div className="min-w-0 text-[13px] leading-[1.2] text-black/88">
        <span className="truncate">{name}</span>
        <span className="whitespace-nowrap">.{ext}</span>
      </div>
    </div>
  );
}

function CapabilityBlock({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-2 mb-10">
      <DiscoveryCanvas className="p-5 md:p-6">{children}</DiscoveryCanvas>
    </div>
  );
}

function DiscoveryPromptInput({
  children,
  minHeight = 142,
}: {
  children?: React.ReactNode;
  minHeight?: number;
}) {
  return (
    <div
      className="flex flex-col rounded-xl bg-white px-3 py-3"
      style={{
        minHeight,
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
      }}
    >
      {children}
      <div className="min-h-0 flex-1 text-left text-sm leading-relaxed text-black/40">
        Say what you want and Kimmy will surprise you
      </div>
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-black/50 transition-colors hover:bg-black/5 hover:text-black/70"
          aria-label="添加附件"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-black/35"
          style={{
            boxShadow:
              "inset 0 20px 20px 0 rgba(0,0,0,0.02), inset 0 -2px 1px 1px rgba(0,0,0,0.06), inset 0 1px 4px 1px rgba(255,255,255,0.2), inset 0 -1px 1px 0 rgba(255,255,255,0.2), inset 0 1px 0 0 #fff, 0 1px 1px 0 rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.08)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 13V3M8 3L3.5 7.5M8 3L12.5 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function DiscoveryCompare({
  badLabel,
  goodLabel,
  bad,
  good,
}: {
  badLabel: string;
  goodLabel: string;
  bad: React.ReactNode;
  good: React.ReactNode;
}) {
  return (
    <div className="my-14 grid gap-4 lg:grid-cols-2">
      <div className="flex h-full flex-col">
        <DiscoveryCanvas className="h-full">
          <ComparePanel tone="bad">
            {bad}
          </ComparePanel>
        </DiscoveryCanvas>
        <p className="mt-5 text-center text-xs font-medium uppercase tracking-[0.18em] text-[#6d665c]">
          {badLabel}
        </p>
      </div>
      <div className="flex h-full flex-col">
        <DiscoveryCanvas className="h-full">
          <ComparePanel tone="good">
            {good}
          </ComparePanel>
        </DiscoveryCanvas>
        <p className="mt-5 text-center text-xs font-medium uppercase tracking-[0.18em] text-[#6d665c]">
          {goodLabel}
        </p>
      </div>
    </div>
  );
}

export function Project2DiscoveryQuestionFilterPanel() {
  return (
    <div className="my-14 space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex h-full flex-col">
          <DiscoveryCanvas className="h-full">
            <ComparePanel tone="bad">
              <Bubble role="assistant">你希望把联系方式放在页面顶部，还是底部？</Bubble>
              <div className="pt-4">
                <Bubble role="user">都可以。</Bubble>
              </div>
            </ComparePanel>
          </DiscoveryCanvas>
          <p className="mt-5 text-center text-xs font-medium uppercase tracking-[0.18em] text-[#6d665c]">
            Bad Case
          </p>
        </div>
        <div className="flex h-full flex-col">
          <DiscoveryCanvas className="h-full">
            <ComparePanel tone="bad">
              <Bubble role="assistant">你希望用户先了解你的内容再联系你，还是直接联系你？</Bubble>
              <div className="pt-4">
                <Bubble role="user">先了解再联系吧。</Bubble>
              </div>
            </ComparePanel>
          </DiscoveryCanvas>
          <p className="mt-5 text-center text-xs font-medium uppercase tracking-[0.18em] text-[#6d665c]">
            Bad Case
          </p>
        </div>
      </div>
      <div className="flex h-full flex-col">
        <DiscoveryCanvas className="h-full">
          <ComparePanel tone="good">
            <Bubble role="assistant">你的网站主要是想展示你的作品和能力，还是想重点介绍你的服务内容并引导客户咨询？</Bubble>
            <div className="pt-4">
              <Bubble role="user">重点介绍服务内容并引导客户咨询。</Bubble>
            </div>
          </ComparePanel>
        </DiscoveryCanvas>
        <p className="mt-5 text-center text-xs font-medium uppercase tracking-[0.18em] text-[#6d665c]">
          Good Case
        </p>
      </div>
    </div>
  );
}

export function Project2DiscoveryOpeningPanel() {
  return (
    <DiscoveryCompare
      badLabel="Bad Case"
      goodLabel="Good Case"
      bad={
        <>
          <Bubble role="assistant">你想做什么类型的网站？</Bubble>
        </>
      }
      good={
        <>
          <Bubble role="assistant" streaming>
            我是 Kimmy，你的专属建站顾问。我会先和你进行一轮简单沟通，来更好的设计你的网站。你可以和我说说你的想法
          </Bubble>
        </>
      }
    />
  );
}

export function Project2DiscoveryGoalPanel() {
  return (
    <DiscoveryCompare
      badLabel="Bad Case"
      goodLabel="Good Case"
      bad={
        <>
          <Bubble role="assistant">你想做什么类型的网站？网站上想实现什么功能？</Bubble>
          <div className="pt-4">
            <Bubble role="user">我想做一个可以预约的网站。</Bubble>
          </div>
        </>
      }
      good={
        <>
          <Bubble role="assistant" streaming>
            你想用这个网站来做什么？最希望用户来到网站后完成什么？
          </Bubble>
          <div className="pt-4">
            <Bubble role="user">我想先让用户了解我的服务，再决定要不要联系我。</Bubble>
          </div>
          <Bubble role="assistant" streaming>
            明白，那网站重点应该先讲清服务内容、建立信任，再设计合适的咨询或预约入口。
          </Bubble>
        </>
      }
    />
  );
}

export function Project2DiscoveryOptionsPanel() {
  return (
    <div className="my-14 grid gap-8 md:grid-cols-2">
      <Project2DiscoveryVoiceInputPanel />
      <Project2DiscoverySuggestionsPanel />
      <Project2DiscoveryUploadPanel />
      <Project2DiscoveryFirecrawlPanel />
    </div>
  );
}

export function Project2DiscoverySuggestionsPanel() {
  return (
    <CapabilityBlock>
      <div className="px-1 pt-2 pb-1">
        <div className="mb-6 flex justify-start">
          <div className="max-w-[90%] rounded-xl bg-white px-6 py-5 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.5)_inset,0_1px_4px_0_rgba(0,0,0,0.06)]">
            <p className="text-sm leading-relaxed text-black/85">
              我是 Kimmy，你的专属建站顾问。我会先和你做一轮简单沟通，再帮你把网站方向整理清楚。你想做一个什么样的网站？
            </p>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-2 px-2 pb-1">
          {["作品集网站", "品牌展示站", "服务介绍站"].map((option) => (
            <button
              key={option}
              type="button"
              className="select-none rounded-[8px] border-none bg-[#fbfbfb] px-4 py-[7px] text-[14px] font-normal leading-[22px] text-black/70 shadow-[0_1px_2px_rgba(229,231,235,1),inset_0_0_0_1px_rgba(255,255,255,0.8),0_0_0_1px_rgba(0,0,0,0.04)]"
            >
              {option}
            </button>
          ))}
        </div>
        <DiscoveryPromptInput />
      </div>
    </CapabilityBlock>
  );
}

export function Project2DiscoveryUploadPanel() {
  return (
    <CapabilityBlock>
      <div className="px-1 pt-2 pb-1">
        <DiscoveryPromptInput minHeight={220}>
          <div className="mb-5 flex flex-wrap items-start gap-3">
            <UploadMediaTile tone="image" />
            <UploadMediaTile tone="video" />
            <UploadFilePill name="方案文档" ext="pdf" />
            <UploadFilePill name="报价表" ext="xlsx" />
          </div>
        </DiscoveryPromptInput>
      </div>
    </CapabilityBlock>
  );
}

export function Project2DiscoveryVoiceInputPanel() {
  return (
    <CapabilityBlock>
      <div className="flex min-h-[136px] items-center justify-center px-5 py-3">
        <div className="flex max-w-[520px] items-center justify-center gap-6">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center text-black/48">
            <Mic size={24} strokeWidth={1.8} />
          </div>
          <div className="w-[280px] whitespace-normal break-words text-sm leading-[1.7] text-black/72">
            我开了一家宠物烘焙工作室，想做一个网站，先把产品和订购方式讲清楚。
          </div>
        </div>
      </div>
    </CapabilityBlock>
  );
}

export function Project2DiscoveryFirecrawlPanel() {
  return (
    <CapabilityBlock>
      <div className="space-y-4">
        <div className="rounded-[20px] border border-black/10 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex rounded-full bg-[#ece7dd] px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-black/45">
              URL
            </span>
            <div className="truncate text-sm text-black/70">https://lotusbakery.cn/menu</div>
          </div>
          <div className="rounded-[16px] bg-[#f4f1eb] p-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-black/35">Page Snapshot</p>
            <div className="mt-3 space-y-2">
              <div className="h-3 w-2/3 rounded-full bg-black/10" />
              <div className="h-3 w-full rounded-full bg-black/10" />
              <div className="h-3 w-5/6 rounded-full bg-black/10" />
              <div className="h-16 rounded-[12px] bg-[#ddd6ca]" />
              <div className="h-3 w-3/5 rounded-full bg-black/10" />
              <div className="h-3 w-4/5 rounded-full bg-black/10" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[12px] text-black/42">
            <FileText size={14} />
            <span>Readable page content extracted by Firecrawl</span>
          </div>
        </div>
      </div>
    </CapabilityBlock>
  );
}

export function Project2DiscoveryAllInputPanels() {
  return (
    <div className="my-14 grid gap-8 md:grid-cols-2">
      <Project2DiscoveryVoiceInputPanel />
      <Project2DiscoverySuggestionsPanel />
      <Project2DiscoveryUploadPanel />
      <Project2DiscoveryFirecrawlPanel />
    </div>
  );
}
