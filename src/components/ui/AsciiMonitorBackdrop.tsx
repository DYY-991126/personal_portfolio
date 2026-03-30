"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Caveat } from "next/font/google";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import HomeWebGLScene from "./HomeWebGLScene";
import RetroMp3Player from "./RetroMp3Player";
import AsciiStartupIntro from "./AsciiStartupIntro";

const STARTUP_INTRO_SEEN_KEY = "home_startup_intro_seen_v1";

const signatureFont = Caveat({
  subsets: ["latin"],
  weight: ["700"],
});

/** Green + purple: screen/bezel overlap band (not on cream casing). */
const CABINET_STICKER_LAYOUT = [
  {
    src: "/sticker1.png",
    left: "-1%",
    bottom: "-5%",
    width: "clamp(3.4rem, 14vmin, 10rem)",
    rotate: -11,
    z: 2,
    tx: "0.12rem",
    ty: "0.08rem",
  },
  {
    src: "/sticker4.png",
    right: "1%",
    bottom: "5%",
    width: "clamp(3.1rem, 15.5vmin, 15.4rem)",
    rotate: 8,
    z: 3,
    tx: "-0.06rem",
    ty: "0.1rem",
  },
] as const;

const MONITOR_THEMES = [
  { name: "Mono", filter: "grayscale(1) sepia(0.08) brightness(1.02) contrast(1.06)", glow: "#f4f1dc" },
  { name: "Emerald", filter: "hue-rotate(0deg) saturate(1)", glow: "#55ff77" },
  { name: "Amber", filter: "hue-rotate(-58deg) saturate(1.05)", glow: "#ffc44d" },
  { name: "Ice", filter: "hue-rotate(104deg) saturate(0.95)", glow: "#8be9ff" },
  { name: "Rose", filter: "hue-rotate(158deg) saturate(0.95)", glow: "#ff85cb" },
] as const;

interface AsciiMonitorBackdropProps {
  children: ReactNode;
}

function isInteractiveElement(element: Element | null): boolean {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  return (
    element.matches("input, textarea, select, button, a, summary, [role='button'], [tabindex]:not([tabindex='-1'])") ||
    element.isContentEditable
  );
}

interface MonitorKnobProps {
  label: string;
  value: number;
  steps?: number;
  onChange: () => void;
}

function MonitorKnob({
  label,
  value,
  steps = 4,
  onChange,
}: MonitorKnobProps) {
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowDown" && event.key !== "ArrowRight" && event.key !== "ArrowUp") {
      return;
    }

    event.preventDefault();
    onChange();
  };

  const rotation = -120 + (value / Math.max(steps - 1, 1)) * 240;

  return (
    <div className="flex h-[2.35rem] w-[2.35rem] items-center justify-center">
      <button
        type="button"
        aria-label={`${label}, position ${Math.round(value) + 1}`}
        onClick={onChange}
        onKeyDown={handleKeyDown}
        className="group relative flex h-[2.35rem] w-[2.35rem] cursor-pointer items-center justify-center rounded-full transition-transform duration-150 active:translate-y-px"
      >
        <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.16),rgba(255,255,255,0)_34%),radial-gradient(circle_at_50%_70%,rgba(0,0,0,0),rgba(0,0,0,0.26)_78%,rgba(0,0,0,0.46)_100%)] opacity-85" />
        <span className="pointer-events-none absolute inset-[2px] rounded-full border border-[#d3d0c8]/26 bg-[linear-gradient(180deg,#f2f1ec_0%,#c3beb4_44%,#888277_100%)] shadow-[0_6px_12px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.78),inset_0_-1px_1px_rgba(52,48,43,0.16)] transition-shadow duration-150 group-hover:shadow-[0_7px_14px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.84),inset_0_-1px_1px_rgba(52,48,43,0.18)]" />
        <span className="pointer-events-none absolute inset-[5px] rounded-full border border-[#58534b]/20 bg-[linear-gradient(180deg,#3c3935_0%,#1d1b18_100%)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),inset_0_-2px_3px_rgba(0,0,0,0.46)]" />
        <span className="pointer-events-none absolute inset-[8px] rounded-full border border-white/8 bg-[linear-gradient(180deg,#d6d2ca_0%,#ada79b_100%)] shadow-[0_3px_6px_rgba(0,0,0,0.14),inset_0_0.5px_0_rgba(255,255,255,0.34),inset_0_-1px_1px_rgba(67,62,54,0.12)]" />
        <span className="pointer-events-none absolute inset-[9px] rounded-full bg-[radial-gradient(circle_at_30%_24%,rgba(255,255,255,0.34),rgba(255,255,255,0)_34%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0)_30%)] opacity-75" />
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0"
          style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
        >
          <span className="absolute left-1/2 top-1/2 h-[9px] w-[2px] -translate-x-1/2 -translate-y-[11px] rounded-full bg-[linear-gradient(180deg,#0f0f0d,#2b2924)] shadow-[0_0_3px_rgba(255,255,255,0.16),0_0_8px_rgba(255,248,220,0.18)]" />
        </span>
        <span className="pointer-events-none absolute inset-[11px] rounded-full border border-black/10 opacity-55" />
      </button>
    </div>
  );
}

export default function AsciiMonitorBackdrop({ children }: AsciiMonitorBackdropProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const pointerFrameRef = useRef<number | null>(null);
  const pendingPointerRef = useRef({ x: 0, y: 0 });
  const [startupStage, setStartupStage] = useState<"intro" | "handoff" | "home" | null>(null);
  const [screenInstanceKey] = useState(0);
  const brightnessLevels = useMemo(() => [88, 100, 122], []);
  const [brightnessIndex, setBrightnessIndex] = useState(2);
  const [themeIndex, setThemeIndex] = useState(1);
  const prefersReducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const interactionIntensity = useMotionValue(prefersReducedMotion ? 0 : 1);
  const smoothPointerX = useSpring(pointerX, { damping: 24, stiffness: 210, mass: 0.55 });
  const smoothPointerY = useSpring(pointerY, { damping: 24, stiffness: 210, mass: 0.55 });
  const smoothIntensity = useSpring(interactionIntensity, { damping: 26, stiffness: 180, mass: 0.65 });

  const activeTheme = MONITOR_THEMES[themeIndex];
  const brightness = brightnessLevels[brightnessIndex];
  const handoffActive = startupStage === "handoff";
  const showHomeScene = startupStage !== "intro" && startupStage !== null;
  const startupVisible = startupStage !== "home" && startupStage !== null;
  const activePointerX = useTransform(() => smoothPointerX.get() * smoothIntensity.get());
  const activePointerY = useTransform(() => smoothPointerY.get() * smoothIntensity.get());
  const cabinetRotateX = useTransform(() => activePointerY.get() * -6.6);
  const cabinetRotateY = useTransform(() => activePointerX.get() * 9.1);
  const shadowShiftX = useTransform(() => activePointerX.get() * 18);
  const shadowShiftY = useTransform(() => 22 + Math.abs(activePointerY.get()) * 7);
  const shadowScaleX = useTransform(() => 0.9 - Math.abs(activePointerX.get()) * 0.03);
  const shadowScaleY = useTransform(() => 0.6 - Math.abs(activePointerY.get()) * 0.05);
  const shadowOpacity = useTransform(() => 0.34 + smoothIntensity.get() * 0.16);
  const haloShiftX = useTransform(() => activePointerX.get() * 28);
  const haloShiftY = useTransform(() => activePointerY.get() * 18);
  const haloOpacity = useTransform(() => 0.2 + smoothIntensity.get() * 0.12);
  const screenGlareX = useTransform(() => activePointerX.get() * -20);
  const screenGlareY = useTransform(() => activePointerY.get() * -14);

  const screenFilterStyle = useMemo<CSSProperties>(() => {
    const normalizedBrightness = brightness / 100;
    return {
      filter: `brightness(${0.38 + normalizedBrightness * 0.86}) contrast(1.06) ${activeTheme.filter}`,
    };
  }, [activeTheme, brightness]);

  useEffect(() => {
    try {
      const introSeen = window.localStorage.getItem(STARTUP_INTRO_SEEN_KEY) === "1";
      setStartupStage(introSeen ? "home" : "intro");
    } catch {
      setStartupStage("intro");
    }
  }, []);

  useEffect(() => {
    interactionIntensity.set(prefersReducedMotion ? 0 : 1);
    if (prefersReducedMotion) {
      pointerX.set(0);
      pointerY.set(0);
    }
  }, [interactionIntensity, pointerX, pointerY, prefersReducedMotion]);

  useEffect(() => {
    if (!handoffActive) {
      return;
    }

    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STARTUP_INTRO_SEEN_KEY, "1");
      } catch {
        // Ignore storage write failures and continue.
      }
      setStartupStage("home");
    }, 720);

    return () => {
      window.clearTimeout(timer);
    };
  }, [handoffActive]);

  useEffect(() => {
    return () => {
      if (pointerFrameRef.current !== null) {
        window.cancelAnimationFrame(pointerFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    let keyboardTimer: number | undefined;

    const syncIntensity = () => {
      interactionIntensity.set(isInteractiveElement(document.activeElement) ? 0.28 : 1);
    };

    const handleKeyDown = () => {
      interactionIntensity.set(0.42);
      window.clearTimeout(keyboardTimer);
      keyboardTimer = window.setTimeout(syncIntensity, 1100);
    };

    const handleFocusChange = () => {
      window.setTimeout(syncIntensity, 0);
    };

    syncIntensity();
    window.addEventListener("keydown", handleKeyDown, { passive: true });
    window.addEventListener("focusin", handleFocusChange);
    window.addEventListener("focusout", handleFocusChange);

    return () => {
      window.clearTimeout(keyboardTimer);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("focusin", handleFocusChange);
      window.removeEventListener("focusout", handleFocusChange);
    };
  }, [interactionIntensity, prefersReducedMotion]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !stageRef.current) {
      return;
    }

    const rect = stageRef.current.getBoundingClientRect();
    const normalizedX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const normalizedY = ((event.clientY - rect.top) / rect.height) * 2 - 1;

    pendingPointerRef.current.x = Math.max(-1, Math.min(1, normalizedX));
    pendingPointerRef.current.y = Math.max(-1, Math.min(1, normalizedY));

    if (pointerFrameRef.current === null) {
      pointerFrameRef.current = window.requestAnimationFrame(() => {
        pointerFrameRef.current = null;
        pointerX.set(pendingPointerRef.current.x);
        pointerY.set(pendingPointerRef.current.y);
      });
    }
  };

  const handlePointerLeave = () => {
    pendingPointerRef.current.x = 0;
    pendingPointerRef.current.y = 0;

    if (pointerFrameRef.current === null) {
      pointerFrameRef.current = window.requestAnimationFrame(() => {
        pointerFrameRef.current = null;
        pointerX.set(0);
        pointerY.set(0);
      });
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_32%),linear-gradient(180deg,_#151515_0%,_#070707_45%,_#020202_100%)]">
      {showHomeScene ? <HomeWebGLScene /> : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_35%,_rgba(0,0,0,0.35)_100%)]" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[10%] h-[42%] w-[72%] -translate-x-1/2 rounded-full blur-[72px] will-change-transform"
        style={{
          background: "radial-gradient(circle at center, rgba(112, 255, 210, 0.16), rgba(112, 255, 210, 0) 66%)",
          x: haloShiftX,
          y: haloShiftY,
          opacity: haloOpacity,
        }}
      />

      <div
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="absolute left-[0.8vw] right-[0.8vw] top-[1.2vh] bottom-[1.4vh] [perspective:1950px] [perspective-origin:50%_42%] md:left-[1.4vw] md:right-[1.4vw] md:top-[1.8vh] md:bottom-[2vh]"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-[14%] bottom-[2.6%] h-[14%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.46)_0%,rgba(0,0,0,0.22)_44%,rgba(0,0,0,0)_82%)] blur-[10px] will-change-transform"
          style={{
            x: shadowShiftX,
            y: shadowShiftY,
            scaleX: shadowScaleX,
            scaleY: shadowScaleY,
            opacity: shadowOpacity,
          }}
        />
        <motion.div
          className="ascii-monitor-cabinet absolute inset-0 transform-gpu rounded-[2.4rem] will-change-transform md:rounded-[3.2rem]"
          style={{
            rotateX: cabinetRotateX,
            rotateY: cabinetRotateY,
            transformStyle: "preserve-3d",
            transformOrigin: "50% 42%",
          }}
        >
          <div className="ascii-monitor-shadow absolute inset-[0.55rem] rounded-[2rem] md:inset-[0.7rem] md:rounded-[2.8rem]" />
          <div className="ascii-monitor-rim absolute inset-[1rem] rounded-[1.7rem] md:inset-[1.35rem] md:rounded-[2.2rem]" />

          {/* Monitor Screen Frame / Bezel */}
          <div
            className="absolute left-[3.1%] right-[3.1%] top-[3.8%] bottom-[13.8%] z-0 overflow-hidden rounded-[1.5rem] border-2 border-[#151715] bg-[#2a2d2a] shadow-[inset_0_10px_24px_rgba(255,255,255,0.05),inset_0_-16px_30px_rgba(0,0,0,0.62),inset_0_0_0_3px_rgba(7,8,7,0.28),0_8px_18px_rgba(0,0,0,0.26)] md:rounded-[1.9rem]"
            style={{ transform: "translateZ(54px)" }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-[0.08rem] rounded-[1.45rem] md:rounded-[1.82rem]"
              style={{
                transform: "translateZ(10px)",
                background: "linear-gradient(180deg, rgba(58, 62, 58, 0.26), rgba(30, 33, 30, 0.06))",
                boxShadow:
                  "inset 0 0 0 1px rgba(74, 79, 74, 0.82), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -12px 18px rgba(0,0,0,0.28)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute left-[0.22rem] right-[0.22rem] top-[0.08rem] z-[2] h-[0.22rem] rounded-t-[1.18rem] md:left-[0.28rem] md:right-[0.28rem] md:h-[0.26rem] md:rounded-t-[1.48rem]"
              style={{
                transform: "translateZ(18px)",
                background:
                  "linear-gradient(180deg, rgba(78, 84, 78, 0.92) 0%, rgba(54, 58, 54, 0.92) 54%, rgba(31, 34, 31, 0.48) 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.24)",
              }}
            />
            <div className="absolute inset-x-[0.34rem] top-[0.14rem] bottom-[0.06rem] rounded-[1.4rem] bg-[#060a08] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_18px_30px_rgba(0,0,0,0.34),inset_0_-24px_34px_rgba(0,0,0,0.56),0_0_0_1px_rgba(0,0,0,0.42)] md:inset-x-[0.46rem] md:top-[0.16rem] md:bottom-[0.08rem] md:rounded-[1.8rem]">
              <div
                className="ascii-screen-inner absolute inset-x-[0.18rem] top-[0.24rem] bottom-[0.02rem] overflow-hidden rounded-[1.26rem] border-[4px] border-[#0a0a0a] bg-[#03110b] shadow-[inset_0_2px_0_rgba(255,255,255,0.04),inset_0_22px_36px_rgba(0,0,0,0.28),inset_0_-28px_44px_rgba(0,0,0,0.44)] md:inset-x-[0.24rem] md:top-[0.3rem] md:bottom-[0.04rem] md:rounded-[1.66rem]"
                style={{ transform: "translateZ(-10px)" }}
              >
                <div className="ascii-screen-curvature absolute inset-0" />
                <div className="ascii-screen-lightfall absolute inset-0" />
                <div className="ascii-screen-reflection absolute inset-0" />
                <div className="ascii-screen-patina absolute inset-0" />
                <div className="ascii-screen-edge-glow absolute inset-0" />
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-[-8%] z-[2] rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),rgba(255,255,255,0)_42%)] mix-blend-screen opacity-55 blur-2xl"
                  style={{ x: screenGlareX, y: screenGlareY }}
                />
                <div key={screenInstanceKey} className="absolute inset-0" style={screenFilterStyle}>
                  <div className="ascii-screen-glow absolute inset-0" />
                  <div className="ascii-screen-depth absolute inset-0" />
                  <div className="ascii-screen-microgrid absolute inset-0" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.06),transparent_28%),radial-gradient(circle_at_center,transparent_48%,rgba(0,0,0,0.26)_100%)]" />
                  <div className="ascii-scanline absolute inset-0 opacity-30" />
                  {startupVisible ? (
                    <AsciiStartupIntro
                      phase={handoffActive ? "handoff" : "intro"}
                      onComplete={() => {
                        try {
                          window.localStorage.setItem(STARTUP_INTRO_SEEN_KEY, "1");
                        } catch {
                          // Ignore storage write failures and continue.
                        }
                        setStartupStage("handoff");
                      }}
                    />
                  ) : null}
                  <motion.div
                    className="absolute inset-0 z-10"
                    initial={false}
                    animate={
                      startupStage !== "intro" && startupStage !== null
                        ? {
                            opacity: 1,
                            scale: 1,
                            y: 0,
                          }
                        : {
                            opacity: 0,
                            scale: 1.012,
                            y: 6,
                          }
                    }
                    transition={{
                      duration: 0.78,
                      ease: [0.25, 0.25, 0.75, 0.75],
                    }}
                  >
                    {children}
                  </motion.div>
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-[11] bg-[#03110b] blur-[12px]"
                    initial={false}
                    animate={
                      startupStage !== "intro" && startupStage !== null
                        ? {
                            opacity: 0,
                            scale: 1,
                          }
                        : {
                            opacity: 0.22,
                            scale: 1.05,
                          }
                    }
                    transition={{
                      duration: 0.62,
                      ease: [0.25, 0.25, 0.75, 0.75],
                    }}
                  />
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-[12] blur-[8px]"
                    initial={false}
                    animate={
                      startupStage !== "intro" && startupStage !== null
                        ? {
                            opacity: 0,
                            scale: 1,
                          }
                        : {
                            opacity: 0.36,
                            scale: 1.04,
                          }
                    }
                    transition={{
                      duration: 0.58,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                      background:
                        "radial-gradient(circle at 50% 48%, rgba(126,255,204,0.2), rgba(126,255,204,0) 42%), linear-gradient(180deg, rgba(2,8,6,0.08), rgba(3,17,11,0.32)), repeating-linear-gradient(180deg, rgba(153,255,213,0.06) 0px, rgba(153,255,213,0.06) 1px, transparent 1px, transparent 4px)",
                    }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Biohazard / property label: cabinet surface, above bezel clipping */}
          <Image
            aria-hidden
            src="/sticker2.png"
            alt=""
            width={256}
            height={256}
            className="pointer-events-none absolute right-[2.2%] top-[1.5%] z-[22] h-auto w-[clamp(4.75rem,19vmin,8.5rem)] object-contain select-none md:right-[2.4%] md:top-[1.6%] md:w-[clamp(5.25rem,20vmin,9.25rem)]"
            style={
              {
                transform: "translateZ(96px) rotate(11deg)",
                filter:
                  "drop-shadow(0 1px 0 rgba(255,255,255,0.22)) drop-shadow(0 3px 5px rgba(0,0,0,0.28))",
                opacity: 0.97,
              } as CSSProperties
            }
          />

          {/* Stickers: screen edge overlap (green monster + purple) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 z-[5] overflow-visible"
            style={{
              transform: "translateZ(86px)",
              top: "min(79%, calc(71% + 0.75vh))",
              bottom: "max(4.85rem, min(13%, 6.5rem))",
            }}
          >
            <div className="relative h-full w-full">
              {CABINET_STICKER_LAYOUT.map((item) => (
                <Image
                  key={item.src}
                  src={item.src}
                  alt=""
                  width={256}
                  height={256}
                  className="absolute h-auto object-contain select-none"
                  style={
                    {
                      ...("left" in item ? { left: item.left } : { right: item.right }),
                      bottom: item.bottom,
                      width: item.width,
                      zIndex: item.z,
                      transform: `translate(${item.tx}, ${item.ty}) rotate(${item.rotate}deg)`,
                      filter:
                        "drop-shadow(0 1px 0 rgba(255,255,255,0.22)) drop-shadow(0 3px 5px rgba(0,0,0,0.28))",
                      opacity: 0.97,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          </div>

          {/* Retro MP3: magnetically docked under the cabinet lip */}
          <div
            className="absolute left-[48%] bottom-[11.8%] z-20 flex justify-center"
            style={{ transform: "translate(calc(-50% + 248px), 49px) translateZ(94px)" }}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-1/2 top-[-8px] h-[12px] w-[84%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.26)_0%,rgba(0,0,0,0.12)_44%,rgba(0,0,0,0)_80%)] blur-[2px]" />
              <span className="pointer-events-none absolute left-1/2 top-[-3px] h-[6px] w-[74%] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,255,255,0))]" />
              <span className="pointer-events-none absolute left-1/2 top-[-2px] h-[2px] w-[62%] -translate-x-1/2 rounded-full bg-black/7 blur-[0.5px]" />
              <div
                className="relative"
                style={{
                  transform: "rotate(-1.5deg)",
                  transformOrigin: "50% 0%",
                  filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.09)) drop-shadow(0 4px 6px rgba(0,0,0,0.05))",
                }}
              >
                <RetroMp3Player />
              </div>
            </div>
          </div>

          {/* Bottom Control Panel */}
          <div
            className="absolute left-[6%] right-[6%] bottom-[4%] z-[6]"
            style={{ transform: "translateZ(34px)" }}
          >
            <div className="relative flex items-center justify-between">
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 flex h-[1.6rem] w-[clamp(5rem,12vw,8rem)] -translate-x-1/2 items-center justify-center md:h-[1.8rem] md:w-[clamp(6rem,11vw,9rem)]"
                style={{ bottom: "calc(2% + 16px)" }}
              >
                <div className="relative flex h-full w-full items-center justify-center px-4">
                  <span
                    aria-hidden
                    className={`${signatureFont.className} select-none text-[2rem] font-bold leading-none tracking-[0.02em] opacity-80 mix-blend-multiply md:text-[2.2rem]`}
                    style={{
                      color: "#665B49",
                      transform: "translateY(-1px) rotate(-4deg)",
                      filter:
                        "drop-shadow(0 1px 0 rgba(255,248,232,0.12)) drop-shadow(0 -1px 0 rgba(94,84,70,0.16))",
                    }}
                  >
                    DYY
                  </span>
                </div>
              </div>

              {/* Left side: Ventilation / Speaker grilles */}
              <div className="flex gap-2 opacity-70">
                {Array.from({ length: 10 }).map((_, i) => (
                  <span key={i} className="block h-10 w-1.5 rounded-full bg-black/20 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5),1px_0_0_rgba(255,255,255,0.7)]" />
                ))}
              </div>
              
              {/* Right side: Control Dials & Power */}
              <div
                className="absolute -right-[10px] flex -translate-y-1/2 items-center gap-4 md:gap-5"
                style={{ top: "42%" }}
              >
                <MonitorKnob
                  label="Bright"
                  value={brightnessIndex}
                  steps={brightnessLevels.length}
                  onChange={() => setBrightnessIndex((value) => (value + 1) % brightnessLevels.length)}
                />
                <MonitorKnob
                  label="Phosphor"
                  value={themeIndex}
                  steps={MONITOR_THEMES.length}
                  onChange={() => setThemeIndex((value) => (value + 1) % MONITOR_THEMES.length)}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
