"use client";

import { motion } from "framer-motion";
import { Project2WebsiteReadyPanel } from "./Project2WebsiteReadyPreviewPanel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Project2UIToolCall } from "@/lib/project2/ui-tools";

function ToolShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[90%] rounded-2xl bg-white px-5 py-5 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.5)_inset,0_1px_4px_0_rgba(0,0,0,0.06)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-black/35">Tool</p>
          <h3 className="text-sm font-medium text-black/90">{title}</h3>
        </div>
      </div>
      {children}
    </div>
  );
}

function OptionsCard({
  payload,
  onQuickReply,
}: {
  payload: Extract<Project2UIToolCall, { type: "show_input_options" }>["payload"];
  onQuickReply: (message: string) => void;
}) {
  return (
    <ToolShell title="继续确认一下你的意图">
      <div className="space-y-4">
        <p className="text-sm leading-6 text-black/65">{payload.question}</p>
        <div className="flex flex-wrap gap-2">
          {payload.options.map((option, index) => (
            <button
              key={`${option.label}-${index}`}
              type="button"
              onClick={() => onQuickReply(option.value || option.label)}
              className="rounded-full border border-black/10 bg-[#fbfbfb] px-4 py-2 text-xs text-black/75 transition hover:bg-white"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </ToolShell>
  );
}

function LinkReaderCard({
  payload,
  onQuickReply,
}: {
  payload: Extract<Project2UIToolCall, { type: "firecrawl" }>["payload"];
  onQuickReply: (message: string) => void;
}) {
  return (
    <ToolShell title="Firecrawl 调研结果">
      <div className="space-y-4">
        <div className="rounded-2xl border border-black/10 bg-[#fcfbf8] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-black/35">Source</p>
          <p className="mt-2 break-all text-sm leading-6 text-black/72">{payload.url}</p>
        </div>
        <p className="text-sm leading-6 text-black/65">{payload.summary}</p>
        {payload.markdownExcerpt ? (
          <div className="rounded-2xl border border-black/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-black/35">Firecrawl Excerpt</p>
            <p className="mt-2 text-sm leading-6 text-black/62">{payload.markdownExcerpt}</p>
          </div>
        ) : null}
        {payload.placeProfile ? (
          <div className="rounded-2xl border border-black/10 bg-[#fcfbf8] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-black/35">Maps Business Profile</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {payload.placeProfile.name ? <p className="text-xs leading-5 text-black/62">名称：{payload.placeProfile.name}</p> : null}
              {payload.placeProfile.type ? <p className="text-xs leading-5 text-black/62">类型：{payload.placeProfile.type}</p> : null}
              {payload.placeProfile.address ? <p className="text-xs leading-5 text-black/62">地址：{payload.placeProfile.address}</p> : null}
              {payload.placeProfile.phone ? <p className="text-xs leading-5 text-black/62">电话：{payload.placeProfile.phone}</p> : null}
              {payload.placeProfile.rating ? (
                <p className="text-xs leading-5 text-black/62">
                  评分：{payload.placeProfile.rating}
                  {payload.placeProfile.totalReviews ? ` (${payload.placeProfile.totalReviews} reviews)` : ""}
                </p>
              ) : null}
              {payload.placeProfile.priceLevel ? <p className="text-xs leading-5 text-black/62">价格：{payload.placeProfile.priceLevel}</p> : null}
              {payload.placeProfile.openState ? <p className="text-xs leading-5 text-black/62">状态：{payload.placeProfile.openState}</p> : null}
              {typeof payload.placeProfile.photosCount === "number" ? (
                <p className="text-xs leading-5 text-black/62">图片：{payload.placeProfile.photosCount}</p>
              ) : null}
            </div>
            {payload.placeProfile.description ? (
              <p className="mt-3 text-xs leading-5 text-black/55">{payload.placeProfile.description}</p>
            ) : null}
          </div>
        ) : null}
        {payload.keyFacts.length ? (
          <div className="flex flex-wrap gap-2">
            {payload.keyFacts.map((fact, index) => (
              <span key={`${fact}-${index}`} className="rounded-full bg-[#f1efe9] px-3 py-1.5 text-xs text-black/70">
                {fact}
              </span>
            ))}
          </div>
        ) : null}
        {payload.suggestedSkill ? (
          <div className="rounded-2xl border border-black/10 bg-[#fcfbf8] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-black/35">Suggested Skill</p>
            <p className="mt-2 text-sm leading-6 text-black/72">{payload.suggestedSkill}</p>
            {payload.suggestedSkillDescription ? (
              <p className="text-xs leading-5 text-black/50">{payload.suggestedSkillDescription}</p>
            ) : null}
            {payload.nextSkill ? <p className="text-xs leading-5 text-black/50">Next: {payload.nextSkill}</p> : null}
          </div>
        ) : null}
        {payload.suggestedActions.length ? (
          <div className="flex flex-wrap gap-2">
            {payload.suggestedActions.map((action, index) => (
              <button
                key={`${action}-${index}`}
                type="button"
                onClick={() => onQuickReply(action)}
                className="rounded-full border border-black/10 bg-[#fbfbfb] px-4 py-2 text-xs text-black/75 transition hover:bg-white"
              >
                {action}
              </button>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onQuickReply("我已经看过这个链接了，继续帮我判断下一步。")}
            className="rounded-full bg-black px-4 py-2 text-xs text-white"
          >
            继续
          </button>
        </div>
      </div>
    </ToolShell>
  );
}

function StructureCard({
  payload,
}: {
  payload: Extract<Project2UIToolCall, { type: "design_content_structure" }>["payload"];
}) {
  return (
    <div className="w-full max-w-[320px] py-1 [font-family:'Bradley_Hand','Chalkboard_SE','Comic_Sans_MS',cursive]">
      <svg style={{ display: "none" }}>
        <defs>
          <filter id="project2-hand-drawn-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
          </filter>
        </defs>
      </svg>

      <div className="space-y-5">
        {payload.pages.map((page) => (
          <div
            key={page.id}
            className="relative overflow-hidden border-2 border-[#2c3e50] bg-[#fffefc] shadow-[2px_2px_0_rgba(44,62,80,0.10),0_0_20px_rgba(0,0,0,0.03),inset_0_0_30px_rgba(0,0,0,0.01)]"
            style={{
              borderRadius: "2px 255px 3px 25px / 255px 5px 225px 5px",
              filter: "url(#project2-hand-drawn-filter)",
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.02) 1px, rgba(0,0,0,0.02) 2px), radial-gradient(circle at 20% 30%, rgba(0,0,0,0.01) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.01) 0%, transparent 50%)",
            }}
          >
            <div className="relative flex items-center justify-center gap-[5px] px-[14px] pt-[14px] pb-[10px]">
              <div
                className="flex h-6 w-9 shrink-0 items-center justify-center border-2 border-[#2c3e50] bg-white"
                style={{
                  borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
                  filter: "url(#project2-hand-drawn-filter)",
                }}
              >
                <span className="text-[12px] font-semibold text-[#2c3e50]">logo</span>
              </div>
              <h3 className="m-0 text-[15px] font-bold leading-[1.4] tracking-[0.3px] text-[#2c3e50]">
                {page.name}
                （手稿）
              </h3>
              <div className="pointer-events-none absolute bottom-0 left-[14px] right-[14px] h-[2px] rotate-[-0.5deg] rounded-sm bg-[#2c3e50] opacity-80" />
            </div>

            <div className="flex flex-col gap-[14px] px-[19px] pt-[10px] pb-[14px]">
              {page.modules.map((module) => (
                <div
                  key={module.id}
                  className="relative flex items-center justify-center border-2 border-[#2c3e50] bg-white px-3 py-[14px] transition-transform duration-300"
                  style={{
                    borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
                    filter: "url(#project2-hand-drawn-filter)",
                    backgroundImage:
                      "repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(44,62,80,0.03) 10px, rgba(44,62,80,0.03) 11px)",
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-[-3px] border-[1.5px] border-[#2c3e50] opacity-60"
                    style={{
                      borderRadius: "15px 225px 15px 255px / 255px 15px 225px 15px",
                      transform: "rotate(-0.8deg)",
                    }}
                  />
                  <div className="relative z-[1] flex min-w-0 flex-1 flex-col items-center gap-[5px] text-center">
                    <span className="text-[15px] font-semibold leading-[1.4] text-[#2c3e50]">{module.name}</span>
                    {module.purpose ? (
                      <span className="text-[12px] leading-[1.5] text-[#57606f] opacity-90">{module.purpose}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

function getCardBackground(accent?: string, imageUrl?: string) {
  if (imageUrl) {
    return {
      background: "#ffffff",
    };
  }

  if (accent) {
    return {
      background: `linear-gradient(135deg, ${accent}, #f6f0e8)`,
    };
  }

  return {
    background: "linear-gradient(135deg, #f1e1c6, #d4e6f7)",
  };
}

const STYLE_REFERENCE_SAMPLE_IMAGES = [
  "/project-2/style-reference-samples/01.png",
  "/project-2/style-reference-samples/02.png",
  "/project-2/style-reference-samples/03.png",
  "/project-2/style-reference-samples/04.png",
  "/project-2/style-reference-samples/05.png",
  "/project-2/style-reference-samples/06.png",
  "/project-2/style-reference-samples/07.png",
  "/project-2/style-reference-samples/08.png",
];

function StyleReferenceCard({
  payload,
  onQuickReply,
  onSendMessage,
}: {
  payload: Extract<Project2UIToolCall, { type: "show_style_references" }>["payload"];
  onQuickReply: (message: string) => void;
  onSendMessage?: (message: string) => void | Promise<void>;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.4 });
  const [isInitialAnimation, setIsInitialAnimation] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});

  const images = useMemo(
    () =>
      payload.referenceImages.map((item, index) => ({
        ...item,
        fallbackImageUrl: STYLE_REFERENCE_SAMPLE_IMAGES[index % STYLE_REFERENCE_SAMPLE_IMAGES.length],
      })),
    [payload.referenceImages]
  );
  const activeItem = images[currentIndex];
  const stackRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const isNavigatingRef = useRef(false);
  const wheelAccumulator = useRef(0);
  const wheelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const staticRotations = useMemo(
    () => images.map((_, index) => (index % 2 === 0 ? 1 : -1) * (0.5 + ((index * 37) % 100) / 100)),
    [images]
  );

  const navigate = useCallback((direction: "prev" | "next") => {
    if (isNavigatingRef.current || images.length <= 1) {
      return;
    }

    isNavigatingRef.current = true;
    setCurrentIndex((prev) =>
      direction === "next"
        ? (prev + 1) % images.length
        : (prev - 1 + images.length) % images.length
    );

    window.setTimeout(() => {
      isNavigatingRef.current = false;
    }, 600);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        navigate("prev");
      }

      if (event.key === "ArrowRight") {
        navigate("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsInitialAnimation(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateDeviceState = () => {
      setIsMobile(window.innerWidth <= 768 || "ontouchstart" in window);
    };

    updateDeviceState();
    window.addEventListener("resize", updateDeviceState);
    return () => window.removeEventListener("resize", updateDeviceState);
  }, []);

  useEffect(() => {
    const el = stackRef.current;
    if (!el) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      if (isMobile || isNavigatingRef.current || !isHovering) {
        return;
      }

      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
        return;
      }

      wheelAccumulator.current += event.deltaX;

      if (wheelTimeout.current) {
        clearTimeout(wheelTimeout.current);
      }

      wheelTimeout.current = setTimeout(() => {
        wheelAccumulator.current = 0;
      }, 150);

      if (Math.abs(wheelAccumulator.current) > 70 || Math.abs(event.deltaX) > 40) {
        navigate(wheelAccumulator.current > 0 || event.deltaX > 20 ? "next" : "prev");
        wheelAccumulator.current = 0;

        if (wheelTimeout.current) {
          clearTimeout(wheelTimeout.current);
          wheelTimeout.current = null;
        }
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      if (wheelTimeout.current) {
        clearTimeout(wheelTimeout.current);
        wheelTimeout.current = null;
      }
    };
  }, [isHovering, isMobile, navigate]);

  if (!activeItem) {
    return null;
  }

  const getCardTransform = (index: number) => {
    let diff = index - currentIndex;
    if (diff < 0) diff += images.length;
    if (diff > Math.floor(images.length / 2)) diff -= images.length;

    if (diff === 0) {
      const tiltX = isHovering && !isMobile ? (mousePos.y - 0.4) * 12 : 0;
      const tiltY = isHovering && !isMobile ? (mousePos.x - 0.5) * -12 : 0;

      return {
        transform: `translate(0px, ${isHovering || isMobile ? (isMobile ? -20 : -34) : -40}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${isHovering || isMobile ? (isMobile ? 1.08 : 1.2) : 0.68})`,
        opacity: 1,
        zIndex: images.length + 10,
      };
    }

    const absDiff = Math.abs(diff);
    const isLeft = diff < 0;
    const maxLayer = isMobile ? 1 : 2;
    const staticRot = staticRotations[index] ?? 0;

    if (isHovering || isMobile) {
      const mobileRatio = isMobile ? 0.25 : 1;
      const angle = (absDiff === 1 ? 6 : 10) * (isLeft ? -1 : 1) * mobileRatio;
      const baseOffset = isMobile ? 25 : 110;
      const xOffset =
        absDiff === 1
          ? baseOffset * (isLeft ? -1 : 1)
          : (baseOffset + (isMobile ? 12 : 60)) * (isLeft ? -1 : 1);
      const yOffset = absDiff === 1 ? (isMobile ? -2 : -12) : (isMobile ? -1 : -8);
      const zOffset = absDiff * (isMobile ? -10 : -33);
      const scale = isMobile ? 0.85 - absDiff * 0.08 : 0.85 - absDiff * 0.04;

      return {
        transform: `translate(${xOffset}px, ${yOffset}px) translateZ(${zOffset}px) rotate(${angle}deg) scale(${scale})`,
        opacity: absDiff <= maxLayer ? 1 : 0,
        zIndex: images.length - absDiff,
      };
    }

    return {
      transform: `translate(${absDiff * 22 * (isLeft ? -1 : 1)}px, ${-40 + absDiff * 6}px) translateZ(${absDiff * -15}px) rotate(${absDiff * 4 * (isLeft ? -1 : 1) + staticRot}deg) scale(${0.53 - absDiff * 0.02})`,
      opacity: absDiff <= maxLayer ? 1 : 0,
      zIndex: images.length - absDiff,
    };
  };

  return (
    <motion.div
      className="flex h-full w-full items-center py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <div className="flex h-full min-h-0 w-full items-center justify-start overflow-visible">
        <div
          ref={stackRef}
          className="flex h-full w-full items-center overflow-visible"
          onMouseEnter={() => !isMobile && setIsHovering(true)}
          onMouseLeave={() => {
            if (!isMobile) {
              setIsHovering(false);
              setMousePos({ x: 0.5, y: 0.5 });
            }
          }}
          onMouseMove={(event) => {
            if (isMobile || isNavigatingRef.current) {
              return;
            }

            const rect = event.currentTarget.getBoundingClientRect();
            setMousePos({
              x: (event.clientX - rect.left) / rect.width,
              y: (event.clientY - rect.top) / rect.height,
            });
          }}
          onTouchStart={(event) => {
            touchStartRef.current = {
              x: event.touches[0].clientX,
              y: event.touches[0].clientY,
            };
          }}
          onTouchEnd={(event) => {
            const diffX = touchStartRef.current.x - event.changedTouches[0].clientX;
            const diffY = touchStartRef.current.y - event.changedTouches[0].clientY;

            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
              navigate(diffX > 0 ? "next" : "prev");
            }
          }}
        >
          <motion.div
            className="relative aspect-[9/16] h-[96%] w-auto max-h-full max-w-[min(44vw,460px)] overflow-visible [perspective:2200px]"
            style={{ cursor: isHovering || isMobile ? "pointer" : "default" }}
            animate={{
              left: isHovering || isMobile ? "50%" : "0%",
              x: isHovering || isMobile ? "-50%" : "0%",
            }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
          <div
            className="pointer-events-none absolute inset-y-0 left-0 right-0 z-30 flex items-center justify-between"
            style={{
              opacity: isHovering || isMobile ? 1 : 0,
              transform: isHovering || isMobile ? "translateY(0)" : "translateY(8px)",
            }}
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                navigate("prev");
              }}
              className="pointer-events-auto -translate-x-[230px] flex h-[52px] w-[52px] items-center justify-center rounded-full border border-black/12 bg-[rgba(255,255,255,0.96)] text-black/80 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur-md transition duration-300 hover:scale-[1.03] hover:bg-white hover:text-black"
              aria-label="上一个"
            >
              <ChevronLeft className="h-5 w-5 -translate-x-[1px]" strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                navigate("next");
              }}
              className="pointer-events-auto translate-x-[230px] flex h-[52px] w-[52px] items-center justify-center rounded-full border border-black/12 bg-[rgba(255,255,255,0.96)] text-black/80 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur-md transition duration-300 hover:scale-[1.03] hover:bg-white hover:text-black"
              aria-label="下一个"
            >
              <ChevronRight className="h-5 w-5 translate-x-[1px]" strokeWidth={2.2} />
            </button>
          </div>
          {images.map((item, index) => {
            const { transform, opacity, zIndex } = getCardTransform(index);
            const isActive = index === currentIndex;

            return (
              <motion.div
                key={item.id}
                className="absolute inset-0 [transform-style:preserve-3d]"
                style={{ zIndex }}
                initial={
                  isInitialAnimation
                    ? {
                        opacity: 0,
                        filter: "blur(20px)",
                        transform: "translate(0px, 0px) translateZ(-500px) rotate(0deg) scale(0.1)",
                      }
                    : false
                }
                animate={{
                  opacity,
                  transform,
                  filter: "blur(0px)",
                }}
                transition={{
                  opacity: { duration: isInitialAnimation ? 1 : 0.45, delay: isInitialAnimation ? index * 0.06 + 0.05 : 0 },
                  transform: {
                    duration: isInitialAnimation ? 1.4 : isActive ? 0.6 : 0.8,
                    ease: isInitialAnimation ? [0.34, 1.56, 0.64, 1] : [0.34, 1.3, 0.64, 1],
                    delay: isInitialAnimation ? index * 0.06 + 0.05 : 0,
                  },
                  filter: { duration: 0.9, delay: isInitialAnimation ? index * 0.06 + 0.05 : 0 },
                }}
              >
                <div
                  className="relative h-full w-full overflow-hidden rounded-[24px] border border-white/10 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_0_1px_1px_rgba(0,0,0,0.04),0_1px_4px_0_rgba(0,0,0,0.06),0_12px_24px_rgba(0,0,0,0.10),0_30px_60px_rgba(0,0,0,0.08)] transition-all duration-500"
                  style={getCardBackground(item.accent, item.imageUrl)}
                  onClick={() => {
                    if (!isActive) {
                      setCurrentIndex(index);
                    }
                  }}
                >
                  <div className="absolute inset-0 bg-white">
                    <img
                      src={failedImageIds[item.id] ? item.fallbackImageUrl : item.imageUrl || item.fallbackImageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      draggable={false}
                      onError={() => {
                        setFailedImageIds((prev) => (prev[item.id] ? prev : { ...prev, [item.id]: true }));
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.08),rgba(0,0,0,0.18))]" />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_25%,rgba(255,255,255,0)_50%)] shadow-[inset_0_0_2px_1px_rgba(255,255,255,0.12)]" />

                  <div
                    className="pointer-events-none absolute inset-x-1 bottom-1 z-20 transition-all duration-500"
                    style={{
                      opacity: isHovering && isActive ? 1 : 0,
                      transform: isHovering && isActive ? "translateY(0)" : "translateY(24px)",
                    }}
                  >
                    <div
                      className="mx-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,246,242,0.96)_100%)] px-5 pt-5 pb-4 text-black shadow-[0_14px_36px_rgba(0,0,0,0.18)]"
                      style={{
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        borderBottomLeftRadius: 20,
                        borderBottomRightRadius: 20,
                      }}
                    >
                      <div className="flex flex-col gap-2.5 text-left">
                        <h3 className="text-[15px] font-semibold leading-none tracking-[-0.03em] text-black">{item.title}</h3>
                        {item.description ? (
                          <p className="max-w-[15rem] text-[13px] leading-[1.2] tracking-[-0.02em] text-black/78">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          const msg = `我选择这个风格方向：${item.title}`;
                          if (onSendMessage) {
                            void onSendMessage(msg);
                          } else {
                            onQuickReply(msg);
                          }
                        }}
                        className="pointer-events-auto mt-5 flex h-8 w-full items-center justify-center text-[13px] font-medium text-white transition-all hover:opacity-90"
                        style={{
                          borderRadius: "10px",
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
                        选择
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function AssetCollectionCard({
  payload,
  onQuickReply,
  onSendMessage,
}: {
  payload: Extract<Project2UIToolCall, { type: "show_asset_collection_form" }>["payload"];
  onQuickReply: (message: string) => void;
  onSendMessage?: (message: string) => void | Promise<void>;
}) {
  const initialValues = useMemo(
    () =>
      Object.fromEntries(
        payload.items.map((item) => [item.id, item.type === "file" ? "" : ""])
      ) as Record<string, string>,
    [payload.items]
  );
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [modes, setModes] = useState<Record<string, "manual" | "ai">>(
    Object.fromEntries(payload.items.map((item) => [item.id, "manual"])) as Record<string, "manual" | "ai">
  );
  const send = onSendMessage ?? onQuickReply;

  const submit = () => {
    const lines = payload.items.map((item) =>
      `${item.name}：${modes[item.id] === "ai" ? "AI 生成" : values[item.id]?.trim() || "暂未提供"}`
    );
    void send(lines.join("\n"));
  };

  return (
    <div className="w-full max-w-[520px] overflow-hidden rounded-[22px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.07),inset_0_0_0_1px_rgba(255,255,255,0.55)]">
      <div className="grid grid-cols-[148px_minmax(0,1fr)] border-b border-black/8 bg-[#faf7f2]">
        <div className="border-r border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(250,247,242,0.72))] px-5 py-4 text-[14px] font-semibold text-black/42">
          资产
        </div>
        <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(250,247,242,0.72))] px-5 py-4 text-[14px] font-semibold text-black/42">
          您的输入
        </div>
      </div>
      <div>
        {payload.items.map((item) => {
          const isAI = modes[item.id] === "ai";
          const isFile = item.type === "file";
          const switchLabel = isFile ? "切换回手动上传" : "切换回手动输入";
          const aiTitle = isFile ? "AI 将为您生成相关图片" : "AI 将自动生成内容";

          return (
            <div key={item.id} className="grid grid-cols-[148px_minmax(0,1fr)] border-b border-black/8 last:border-b-0">
              <div className="border-r border-black/8 px-4 py-7 text-[14px] font-semibold leading-6 text-black/78">
                {item.name}
              </div>
              <div className="px-5 py-4">
                {isAI ? (
                  <div className="rounded-[18px] border border-dashed border-[#d7cbff] bg-[#f7f4ff] px-5 py-7 text-center">
                    <div className="mb-3 flex justify-center text-[#8f73ff]">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l1.8 4.7L18.5 8.5l-4.7 1.8L12 15l-1.8-4.7L5.5 8.5l4.7-1.8L12 2zm7 9l.9 2.1L22 14l-2.1.9L19 17l-.9-2.1L16 14l2.1-.9L19 11z" />
                      </svg>
                    </div>
                    <p className="text-[15px] font-medium text-[#8f73ff]">{aiTitle}</p>
                    <button
                      type="button"
                      onClick={() => setModes((prev) => ({ ...prev, [item.id]: "manual" }))}
                      className="mt-4 text-[13px] text-black/34 underline underline-offset-4"
                    >
                      {switchLabel}
                    </button>
                  </div>
                ) : isFile ? (
                  <>
                    <div className="rounded-[18px] border border-dashed border-black/10 bg-white px-5 py-7 text-center">
                      <div className="mb-3 flex justify-center">
                        <img
                          src="/projects/project-2/file.svg"
                          alt=""
                          width={24}
                          height={24}
                          className="opacity-25"
                        />
                      </div>
                      <p className="mx-auto max-w-[300px] text-[14px] leading-7 text-black/32">
                        {item.placeholder || item.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModes((prev) => ({ ...prev, [item.id]: "ai" }))}
                      className="mt-3 text-[13px] font-medium text-[#8f73ff]"
                    >
                      ✦ 还没有素材？让 AI 帮我生成
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      value={values[item.id] || ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      placeholder={item.placeholder || item.description}
                      className="w-full rounded-[14px] bg-[#f7f7f7] px-4 py-3.5 text-[13px] text-black/70 outline-none placeholder:text-black/28"
                    />
                    <button
                      type="button"
                      onClick={() => setModes((prev) => ({ ...prev, [item.id]: "ai" }))}
                      className="mt-3 text-[13px] font-medium text-[#8f73ff]"
                    >
                      ✦ 还没有想好？让 AI 帮我生成
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-4 px-5 py-6">
        <button
          type="button"
          onClick={() => void send("暂时跳过")}
          className="px-4 py-2.5 text-sm font-medium text-black/80 transition-all hover:bg-black/5"
          style={{
            borderRadius: "10px",
            backgroundColor: "rgba(59, 42, 0, 0.05)",
            boxShadow: "inset 0 0 1px 1px #fff, 0 0 0 1px rgba(230, 227, 223, 0.8)",
          }}
        >
          {payload.skipLabel || "暂时跳过"}
        </button>
        <button
          type="button"
          onClick={submit}
          className="px-4 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
          style={{
            borderRadius: "10px",
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
          {payload.submitLabel || "提交"}
        </button>
      </div>
    </div>
  );
}

function WebsiteReadySummaryCard({
  payload,
  onRunSkill,
}: {
  payload: Extract<Project2UIToolCall, { type: "website_ready_summary" }>["payload"];
  onRunSkill?: (skill: "website_design" | "image_generation" | "video_generation") => void;
}) {
  return (
    <Project2WebsiteReadyPanel
      embedded
      businessName={payload.businessName}
      businessDescription={payload.businessDescription}
      visitorBenefits={payload.visitorBenefits}
      ctaLabel="马上获取我的专属网站 - 支付 $2.99"
      onCtaClick={() => onRunSkill?.("website_design")}
    />
  );
}

function GenerationExecutionPlanCard({
  payload,
  onQuickReply,
  onRunSkill,
}: {
  payload: Extract<Project2UIToolCall, { type: "generation_execution_plan" }>["payload"];
  onQuickReply: (message: string) => void;
  onRunSkill?: (skill: "website_design" | "image_generation" | "video_generation") => void;
}) {
  return (
    <ToolShell title="生成网站执行计划">
      <div className="space-y-4">
        <div className="rounded-2xl border border-black/10 bg-[#fcfbf8] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-black/35">Skill</p>
          <p className="mt-2 text-sm font-medium text-black/85">{payload.title}</p>
          <p className="text-xs leading-5 text-black/50">{payload.skill}</p>
          {payload.skillMeta ? (
            <p className="mt-2 text-xs leading-5 text-black/55">{payload.skillMeta.description}</p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-black/35">Objective</p>
          <p className="mt-2 text-sm leading-6 text-black/68">{payload.objective}</p>
          <p className="mt-2 text-xs leading-5 text-black/45">Status: {payload.status}</p>
          {payload.sourceSkillPath ? (
            <p className="text-xs leading-5 text-black/45">Skill File: {payload.sourceSkillPath}</p>
          ) : null}
        </div>

        {payload.outputs.length ? (
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-black/35">Outputs</p>
            <div className="flex flex-wrap gap-2">
              {payload.outputs.map((output, index) => (
                <span key={`${output}-${index}`} className="rounded-full bg-[#f1efe9] px-3 py-1.5 text-xs text-black/70">
                  {output}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {payload.promptHints.length ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-[#fcfbf8] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-black/35">Prompt Hints</p>
            <div className="mt-2 space-y-1">
              {payload.promptHints.map((hint, index) => (
                <p key={`${hint}-${index}`} className="text-xs leading-5 text-black/58">
                  {hint}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        {payload.recommendedNextSkills.length ? (
          <div className="flex flex-wrap gap-2">
            {payload.recommendedNextSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => {
                  if (
                    onRunSkill &&
                    (skill === "website_design" || skill === "image_generation" || skill === "video_generation")
                  ) {
                    onRunSkill(skill);
                    return;
                  }
                  onQuickReply(`继续进入 ${skill}。`);
                }}
                className="rounded-full border border-black/10 bg-[#fbfbfb] px-4 py-2 text-xs text-black/75 transition hover:bg-white"
              >
                下一步：{skill}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </ToolShell>
  );
}

function GenerationResultCard({
  payload,
  onRunSkill,
}: {
  payload: Extract<Project2UIToolCall, { type: "generation_result" }>["payload"];
  onRunSkill?: (skill: "website_design" | "image_generation" | "video_generation") => void;
}) {
  return (
    <ToolShell title={payload.title}>
      <div className="space-y-4">
        <p className="text-sm leading-6 text-black/68">{payload.summary}</p>
        {payload.format === "website_brief" && payload.websiteBrief ? (
          <>
            <div className="rounded-2xl border border-black/10 bg-[#fcfbf8] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-black/35">Project Summary</p>
              <p className="mt-2 text-sm leading-6 text-black/65">{payload.websiteBrief.projectSummary}</p>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.14em] text-black/35">Pages</p>
              <div className="flex flex-wrap gap-2">
                {payload.websiteBrief.pages.map((page, index) => (
                  <span key={`${page}-${index}`} className="rounded-full bg-[#f1efe9] px-3 py-1.5 text-xs text-black/70">
                    {page}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-black/35">Style Direction</p>
              <p className="mt-2 text-sm leading-6 text-black/65">{payload.websiteBrief.styleDirection}</p>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.14em] text-black/35">Media Plan</p>
              <div className="space-y-1">
                {payload.websiteBrief.mediaPlan.map((item, index) => (
                  <p key={`${item}-${index}`} className="text-xs leading-5 text-black/58">
                    {item}
                  </p>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-dashed border-black/10 bg-[#fcfbf8] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-black/35">Build Prompt</p>
              <p className="mt-2 text-xs leading-5 text-black/58">{payload.websiteBrief.buildPrompt}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onRunSkill?.("image_generation")}
                className="rounded-full border border-black/10 bg-[#fbfbfb] px-4 py-2 text-xs text-black/75 transition hover:bg-white"
              >
                生成图片
              </button>
              <button
                type="button"
                onClick={() => onRunSkill?.("video_generation")}
                className="rounded-full border border-black/10 bg-[#fbfbfb] px-4 py-2 text-xs text-black/75 transition hover:bg-white"
              >
                生成视频
              </button>
            </div>
          </>
        ) : null}
        {payload.format === "image" && payload.imageUrls?.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {payload.imageUrls.map((url, index) => (
              <a
                key={`${url}-${index}`}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-2xl border border-black/10 bg-white"
              >
                <div className="h-48 w-full bg-[#f5f5f5]">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </div>
              </a>
            ))}
          </div>
        ) : null}
        {payload.format === "video" && payload.videoUrl ? (
          <div className="space-y-3">
            <video src={payload.videoUrl} controls className="w-full rounded-2xl border border-black/10 bg-black" />
            <a
              href={payload.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-black/10 bg-[#fbfbfb] px-4 py-2 text-xs text-black/75 transition hover:bg-white"
            >
              在新窗口打开视频
            </a>
          </div>
        ) : null}
      </div>
    </ToolShell>
  );
}

export function Project2UIToolCard({
  tool,
  onQuickReply,
  onSendMessage,
  onRunSkill,
}: {
  tool: Project2UIToolCall;
  onQuickReply?: (message: string) => void;
  onSendMessage?: (message: string) => void | Promise<void>;
  onRunSkill?: (skill: "website_design" | "image_generation" | "video_generation") => void;
}) {
  const reply = onQuickReply ?? (() => {});

  switch (tool.type) {
    case "show_input_options":
      return <OptionsCard payload={tool.payload} onQuickReply={reply} />;
    case "firecrawl":
      return <LinkReaderCard payload={tool.payload} onQuickReply={reply} />;
    case "design_content_structure":
      return <StructureCard payload={tool.payload} />;
    case "show_style_references":
      return (
        <StyleReferenceCard
          payload={tool.payload}
          onQuickReply={reply}
          onSendMessage={onSendMessage}
        />
      );
    case "show_asset_collection_form":
      return (
        <AssetCollectionCard
          payload={tool.payload}
          onQuickReply={reply}
          onSendMessage={onSendMessage}
        />
      );
    case "website_ready_summary":
      return <WebsiteReadySummaryCard payload={tool.payload} onRunSkill={onRunSkill} />;
    case "generation_execution_plan":
      return (
        <GenerationExecutionPlanCard
          payload={tool.payload}
          onQuickReply={reply}
          onRunSkill={onRunSkill}
        />
      );
    case "generation_result":
      return <GenerationResultCard payload={tool.payload} onRunSkill={onRunSkill} />;
    default:
      return null;
  }
}
