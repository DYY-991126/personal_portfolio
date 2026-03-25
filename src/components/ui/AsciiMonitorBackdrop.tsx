"use client";

import { Silkscreen } from "next/font/google";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import RetroMp3Player from "./RetroMp3Player";

const silkscreen = Silkscreen({
  subsets: ["latin"],
  weight: ["700"],
});

const ASCII_ROWS = [
  "01001001 00100000 01100001 01101101 00100000 01110011 01110100 01101001 01101100 01101100 00100000 01110111 01100001 01101011 01101001 01101110 01100111",
  "> render.layout --quality high --mood atmospheric --structure adaptive",
  "{ grid: 12, rhythm: 'measured', typography: 'editorial', motion: 'soft' }",
  "████▒▒▒░░░ SYSTEM CHECK :: visual coherence / hierarchy / originality",
  "design -> research -> direction -> structure -> code -> preload -> reveal",
  "if quality < benchmark: refine(prompt.principles) && retry(render.pipeline)",
  "A site should feel intentional before it feels impressive.",
  "$ skill.invoke(style_system) --tone premium --avoid generic-ui",
];

const WELCOME_MESSAGE = "Welcome :)";

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
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
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
  const [bootPhase, setBootPhase] = useState<"off" | "wake" | "map" | "resolve" | "done">("off");
  const [welcomeText, setWelcomeText] = useState("");
  const [bootSeed] = useState(0);
  const [screenInstanceKey] = useState(0);
  const brightnessLevels = useMemo(() => [28, 62, 100], []);
  const [brightnessIndex, setBrightnessIndex] = useState(2);
  const [themeIndex, setThemeIndex] = useState(1);

  const activeTheme = MONITOR_THEMES[themeIndex];
  const brightness = brightnessLevels[brightnessIndex];

  const screenFilterStyle = useMemo<CSSProperties>(() => {
    const normalizedBrightness = brightness / 100;
    return {
      filter: `brightness(${0.38 + normalizedBrightness * 0.92}) ${activeTheme.filter}`,
    };
  }, [activeTheme, brightness]);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setBootPhase("wake"), 90),
      window.setTimeout(() => setBootPhase("map"), 680),
      window.setTimeout(() => setBootPhase("resolve"), 1380),
      window.setTimeout(() => setBootPhase("done"), 4200),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [bootSeed]);

  useEffect(() => {
    let typingTimer: number | undefined;
    const startTimer = window.setTimeout(() => {
      let index = 0;
      typingTimer = window.setInterval(() => {
        index += 1;
        setWelcomeText(WELCOME_MESSAGE.slice(0, index));

        if (index >= WELCOME_MESSAGE.length) {
          window.clearInterval(typingTimer);
        }
      }, 90);
    }, 1500);

    return () => {
      window.clearTimeout(startTimer);
      if (typingTimer) {
        window.clearInterval(typingTimer);
      }
    };
  }, [bootSeed]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_32%),linear-gradient(180deg,_#151515_0%,_#070707_45%,_#020202_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_35%,_rgba(0,0,0,0.35)_100%)]" />

      <div className="absolute left-[0.8vw] right-[0.8vw] top-[1.2vh] bottom-[1.4vh] md:left-[1.4vw] md:right-[1.4vw] md:top-[1.8vh] md:bottom-[2vh]">
        <div className="ascii-monitor-cabinet absolute inset-0 rounded-[2.4rem] md:rounded-[3.2rem]">
          <div className="ascii-monitor-shadow absolute inset-[0.55rem] rounded-[2rem] md:inset-[0.7rem] md:rounded-[2.8rem]" />
          <div className="ascii-monitor-rim absolute inset-[1rem] rounded-[1.7rem] md:inset-[1.35rem] md:rounded-[2.2rem]" />

          {/* Monitor Screen Frame / Bezel */}
          <div className="absolute left-[3.4%] right-[3.4%] top-[6.1%] bottom-[15.3%] z-0 rounded-[1.5rem] border-2 border-[#151715] bg-[#2a2d2a] shadow-[inset_0_10px_24px_rgba(255,255,255,0.05),inset_0_-16px_30px_rgba(0,0,0,0.62),inset_0_0_0_5px_rgba(7,8,7,0.36),0_8px_18px_rgba(0,0,0,0.26)] md:rounded-[1.9rem]">
            <div className="ascii-screen-inner absolute inset-[0.72rem] overflow-hidden rounded-[1.6rem] border-[4px] border-[#0a0a0a] bg-[#03110b] shadow-[inset_0_2px_0_rgba(255,255,255,0.04),inset_0_22px_36px_rgba(0,0,0,0.28),inset_0_-28px_44px_rgba(0,0,0,0.44)] md:inset-[0.98rem] md:rounded-[2rem]">
              <div className="ascii-screen-curvature absolute inset-0" />
              <div className="ascii-screen-lightfall absolute inset-0" />
              <div className="ascii-screen-reflection absolute inset-0" />
              <div className="ascii-screen-patina absolute inset-0" />
              <div className="ascii-screen-edge-glow absolute inset-0" />
              <div key={screenInstanceKey} className="absolute inset-0" style={screenFilterStyle}>
                <div className="ascii-screen-glow absolute inset-0" />
                <div className="ascii-screen-microgrid absolute inset-0" />
                <div className="absolute inset-0 opacity-45">
                  {ASCII_ROWS.map((row, index) => (
                    <div
                      key={`${row}-${index}`}
                      className="ascii-row absolute whitespace-nowrap font-mono text-[10px] leading-none text-[#c8ffd8]/40 md:text-[13px]"
                      style={
                        {
                          top: `${8 + index * 10.5}%`,
                          animationDelay: `${index * -2.1}s`,
                        } as CSSProperties
                      }
                    >
                      {row}
                    </div>
                  ))}
                </div>

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.06),transparent_28%),radial-gradient(circle_at_center,transparent_48%,rgba(0,0,0,0.26)_100%)]" />
                <div className="ascii-scanline absolute inset-0 opacity-30" />
                <div className={`absolute inset-0 z-[9] transition-opacity duration-700 ${bootPhase === "done" ? "opacity-0" : "opacity-100"}`}>
                  <div className="ascii-boot-stage absolute inset-0">
                    <div className="ascii-boot-flow absolute inset-0 opacity-90">
                      {Array.from({ length: 14 }).map((_, index) => (
                        <div
                          key={index}
                          className="ascii-boot-stream font-mono text-[9px] uppercase tracking-[0.28em] text-[#aaffc5]/[0.16] md:text-[11px]"
                          style={
                            {
                              top: `${index * 7.2}%`,
                              animationDelay: `${index * -0.85}s`,
                            } as CSSProperties
                          }
                        >
                          {ASCII_ROWS[index % ASCII_ROWS.length]} :: {ASCII_ROWS[(index + 3) % ASCII_ROWS.length]} :: {ASCII_ROWS[(index + 5) % ASCII_ROWS.length]}
                        </div>
                      ))}
                    </div>
                    <div className="ascii-boot-edge-pulse absolute inset-0" />
                    <div className="ascii-boot-sweep absolute inset-0" />
                    <div className="absolute inset-0 flex items-center justify-center px-6">
                      <div className={`ascii-boot-welcome ${silkscreen.className} ${welcomeText ? "is-visible" : ""}`}>
                        <span className="phosphor-text">{welcomeText}</span>
                        {welcomeText.length < WELCOME_MESSAGE.length && bootPhase === "resolve" ? <span className="caret-block ml-2" /> : null}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`absolute inset-0 z-10 transition-opacity duration-500 ${bootPhase === "done" ? "opacity-100" : "opacity-0"}`}>
                  {children}
                </div>
                <div className={`ascii-boot-fade absolute inset-0 z-[8] transition-opacity duration-700 ${bootPhase === "done" ? "opacity-0" : "opacity-100"}`} />
              </div>
            </div>

            {/* Biohazard / property label: bezel top-right corner, hug rim */}
            <Image
              aria-hidden
              src="/sticker2.png"
              alt=""
              width={256}
              height={256}
              className="pointer-events-none absolute right-0 top-0 z-[20] h-auto w-[clamp(4.75rem,19vmin,8.5rem)] object-contain select-none md:w-[clamp(5.25rem,20vmin,9.25rem)]"
              style={
                {
                  transform: "translate(18%, -12%) rotate(11deg)",
                  filter:
                    "drop-shadow(0 1px 0 rgba(255,255,255,0.22)) drop-shadow(0 3px 5px rgba(0,0,0,0.28))",
                  opacity: 0.97,
                } as CSSProperties
              }
            />
          </div>

          {/* Stickers: screen edge overlap (green monster + purple) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 z-[5] overflow-visible"
            style={{
              top: "min(79%, calc(71% + 0.75vh))",
              bottom: "max(4.85rem, min(13%, 6.5rem))",
            }}
          >
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

          {/* Retro MP3: magnetically docked under the cabinet lip */}
          <div
            className="absolute left-[48%] bottom-[11.8%] z-20 flex justify-center"
            style={{ transform: "translate(calc(-50% + 248px), 49px)" }}
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
          <div className="absolute left-[6%] right-[6%] bottom-[4%] z-[6] flex items-center justify-between">
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
      </div>
    </div>
  );
}
