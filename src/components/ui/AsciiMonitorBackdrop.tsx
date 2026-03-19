"use client";

import { Silkscreen } from "next/font/google";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

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
    <button
      type="button"
      aria-label={`${label}, position ${Math.round(value) + 1}`}
      onClick={onChange}
      onKeyDown={handleKeyDown}
      className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-transform active:translate-y-px"
    >
      <span className="pointer-events-none absolute inset-1 rounded-full border border-black/10 bg-gradient-to-b from-[#e8e2d3] to-[#b5ac95] shadow-[0_3px_5px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.9)]" />
      <span className="pointer-events-none absolute inset-[6px] rounded-full border border-white/45 opacity-65" />
      <span
        className="pointer-events-none absolute left-1/2 top-1/2 h-[9px] w-[2px] -translate-x-1/2 -translate-y-[85%] rounded-full bg-black/45 shadow-[0_0_2px_rgba(255,255,255,0.24)]"
        style={{ transform: `translate(-50%, -85%) rotate(${rotation}deg)`, transformOrigin: "50% calc(100% + 7px)" }}
      />
    </button>
  );
}

export default function AsciiMonitorBackdrop({ children }: AsciiMonitorBackdropProps) {
  const [bootPhase, setBootPhase] = useState<"off" | "wake" | "map" | "resolve" | "done">("off");
  const [welcomeText, setWelcomeText] = useState("");
  const [bootSeed, setBootSeed] = useState(0);
  const [screenInstanceKey, setScreenInstanceKey] = useState(0);
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

  const restartMonitor = useCallback(() => {
    setBootPhase("off");
    setWelcomeText("");
    setScreenInstanceKey((value) => value + 1);
    setBootSeed((value) => value + 1);
  }, []);

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
          <div className="absolute left-[3.4%] right-[3.4%] top-[6.1%] bottom-[15.3%] rounded-[1.5rem] border-2 border-[#151715] bg-[#2a2d2a] shadow-[inset_0_10px_24px_rgba(255,255,255,0.05),inset_0_-16px_30px_rgba(0,0,0,0.62),inset_0_0_0_5px_rgba(7,8,7,0.36),0_8px_18px_rgba(0,0,0,0.26)] md:rounded-[1.9rem]">
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
          </div>

          {/* Bottom Control Panel */}
          <div className="absolute left-[6%] right-[6%] bottom-[4%] flex items-center justify-between">
            {/* Left side: Ventilation / Speaker grilles */}
            <div className="flex gap-2 opacity-70">
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} className="block h-10 w-1.5 rounded-full bg-black/20 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5),1px_0_0_rgba(255,255,255,0.7)]" />
              ))}
            </div>
            
            {/* Center: Model Badge */}
            <div className="flex flex-col items-center gap-1.5 translate-x-4">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#6e6557]/90 font-medium">CTR 1999</span>
            </div>

            {/* Right side: Control Dials & Power */}
            <div className="flex items-center gap-5 md:gap-7">
              <div className="flex gap-3 md:gap-4">
                <MonitorKnob
                  label={`Brightness ${Math.round(brightness)} percent`}
                  value={brightnessIndex}
                  steps={brightnessLevels.length}
                  onChange={() => setBrightnessIndex((value) => (value + 1) % brightnessLevels.length)}
                />
                <MonitorKnob
                  label={`Theme ${activeTheme.name}`}
                  value={themeIndex}
                  steps={MONITOR_THEMES.length}
                  onChange={() => setThemeIndex((value) => (value + 1) % MONITOR_THEMES.length)}
                />
              </div>
              
              {/* Power Button */}
              <button
                type="button"
                aria-label="Restart monitor"
                onClick={restartMonitor}
                className="relative flex h-8 w-10 cursor-pointer items-center justify-center rounded-md border border-[#a19882] bg-gradient-to-b from-[#e0d9c8] to-[#b8af98] shadow-[0_3px_6px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.9)] active:translate-y-px active:shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(0,0,0,0.3)]"
              >
                <div
                  className="h-1.5 w-1.5 rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)]"
                  style={{ backgroundColor: activeTheme.glow, boxShadow: `0 0 8px ${activeTheme.glow}, inset 0 1px 2px rgba(255,255,255,0.6)` }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
