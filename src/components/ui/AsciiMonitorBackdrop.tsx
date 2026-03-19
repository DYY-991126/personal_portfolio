"use client";

import { Silkscreen } from "next/font/google";
import { useEffect, useState } from "react";
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

interface AsciiMonitorBackdropProps {
  children: ReactNode;
}

export default function AsciiMonitorBackdrop({ children }: AsciiMonitorBackdropProps) {
  const [bootPhase, setBootPhase] = useState<"off" | "wake" | "map" | "resolve" | "done">("off");
  const [welcomeText, setWelcomeText] = useState("");

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
  }, []);

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
  }, []);

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
              <div className="ascii-screen-glow absolute inset-0" />
              <div className="ascii-screen-curvature absolute inset-0" />
              <div className="ascii-screen-reflection absolute inset-0" />
              <div className="ascii-screen-edge-glow absolute inset-0" />
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
              {/* Dials */}
              <div className="flex gap-3 md:gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="relative h-6 w-6 rounded-full bg-gradient-to-b from-[#e8e2d3] to-[#b5ac95] shadow-[0_3px_5px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.9)] border border-black/10">
                     <div className="absolute top-[2px] left-1/2 -translate-x-1/2 h-2 w-0.5 bg-black/40 rounded-full" />
                  </div>
                ))}
              </div>
              
              {/* Power Button */}
              <div className="relative h-8 w-10 rounded-md bg-gradient-to-b from-[#e0d9c8] to-[#b8af98] shadow-[0_3px_6px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.9)] border border-[#a19882] flex items-center justify-center active:translate-y-px active:shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(0,0,0,0.3)] cursor-pointer">
                <div className="h-1.5 w-1.5 rounded-full bg-[#55ff77] shadow-[0_0_8px_#55ff77,inset_0_1px_2px_rgba(255,255,255,0.6)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
