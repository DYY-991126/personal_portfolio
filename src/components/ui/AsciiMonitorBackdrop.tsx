"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

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

interface AsciiMonitorBackdropProps {
  children: ReactNode;
}

export default function AsciiMonitorBackdrop({ children }: AsciiMonitorBackdropProps) {
  const [bootPhase, setBootPhase] = useState<"off" | "line" | "flash" | "done">("off");

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setBootPhase("line"), 120),
      window.setTimeout(() => setBootPhase("flash"), 320),
      window.setTimeout(() => setBootPhase("done"), 760),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_32%),linear-gradient(180deg,_#151515_0%,_#070707_45%,_#020202_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_35%,_rgba(0,0,0,0.35)_100%)]" />

      <div className="absolute left-[0.8vw] right-[0.8vw] top-[1.2vh] bottom-[1.4vh] md:left-[1.4vw] md:right-[1.4vw] md:top-[1.8vh] md:bottom-[2vh]">
        <div className="ascii-monitor-cabinet absolute inset-0 rounded-[2.4rem] md:rounded-[3.2rem]">
          <div className="ascii-monitor-shadow absolute inset-[0.55rem] rounded-[2rem] md:inset-[0.7rem] md:rounded-[2.8rem]" />
          <div className="ascii-monitor-rim absolute inset-[1rem] rounded-[1.7rem] md:inset-[1.35rem] md:rounded-[2.2rem]" />

          <div className="absolute left-[4.6%] right-[4.6%] top-[6.2%] bottom-[14.8%] rounded-[1.2rem] bg-[#152019] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03),0_50px_120px_rgba(0,0,0,0.55)] md:rounded-[1.5rem]">
            <div className="ascii-screen-inner absolute inset-[0.8rem] overflow-hidden rounded-[0.9rem] border border-[#c7ffd7]/10 bg-[#03110b] md:inset-[1rem] md:rounded-[1.1rem]">
              <div className="ascii-screen-glow absolute inset-0" />
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
              <div className={`absolute inset-0 z-10 transition-opacity duration-500 ${bootPhase === "done" ? "opacity-100" : "opacity-0"}`}>
                {children}
              </div>

              <div
                className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-300 ${
                  bootPhase === "done" ? "opacity-0" : "opacity-100"
                }`}
              >
                <div className="boot-screen absolute inset-0" />
                <div
                  className={`boot-line absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 ${
                    bootPhase === "line" ? "opacity-100 scale-x-100" : "opacity-0 scale-x-[0.08]"
                  }`}
                />
                <div
                  className={`boot-flash absolute inset-0 ${
                    bootPhase === "flash" ? "opacity-100" : "opacity-0"
                  }`}
                />
                <div
                  className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(200,255,220,0.12),_transparent_55%)] transition-opacity duration-300 ${
                    bootPhase === "flash" ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="absolute left-[6.5%] right-[6.5%] bottom-[4.4%] flex items-end justify-between text-[10px] uppercase tracking-[0.3em] text-[#61594e]/70 md:text-xs">
            <div className="flex items-center gap-2">
              <span className="block h-1.5 w-8 rounded-full bg-black/10" />
              <span className="block h-1.5 w-14 rounded-full bg-black/10" />
            </div>
            <span className="font-medium tracking-[0.24em] text-[#6e6557]">DYY CRT-1450</span>
            <div className="flex items-center gap-2">
              <span className="block h-3 w-3 rounded-full border border-black/10 bg-[#d7d0c1]" />
              <span className="block h-3 w-3 rounded-full border border-black/10 bg-[#d7d0c1]" />
            </div>
          </div>

          <div className="absolute left-[9%] right-[9%] bottom-[1.45%] flex items-center justify-center gap-2 opacity-65">
            <span className="block h-1.5 w-12 rounded-full bg-black/8" />
            <span className="block h-1.5 w-12 rounded-full bg-black/8" />
            <span className="block h-1.5 w-12 rounded-full bg-black/8" />
            <span className="block h-1.5 w-12 rounded-full bg-black/8" />
          </div>

          <div className="absolute left-[6.2%] right-[6.2%] top-[3.2%] flex items-center justify-between">
            <span className="block h-2 w-2 rounded-full bg-black/8" />
            <span className="block h-2 w-2 rounded-full bg-black/8" />
          </div>
        </div>
      </div>
    </div>
  );
}
