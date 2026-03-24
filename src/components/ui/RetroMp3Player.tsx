"use client";

import { Press_Start_2P } from "next/font/google";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
});

/** 与 `public/audio/` 内文件名一致；新增歌曲时把文件名加进列表即可 */
const AUDIO_FILES = [
  "谢帝 - Wake up.mp3",
  "TRA$H-Memories.mp3",
  "陶喆-黑色柳丁.mp3",
] as const;

function parseFilename(file: string): { title: string; artist: string } {
  const base = file.replace(/\.mp3$/i, "").trim();
  if (base.includes(" - ")) {
    const [a, t] = base.split(" - ").map((s) => s.trim());
    return { artist: a, title: lcdTitle(t) };
  }
  const i = base.indexOf("-");
  if (i > 0) {
    return { artist: base.slice(0, i).trim(), title: lcdTitle(base.slice(i + 1).trim()) };
  }
  return { artist: "", title: lcdTitle(base) };
}

function lcdTitle(raw: string) {
  const hasCjk = /[\u3000-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(raw);
  const t = hasCjk ? raw : raw.toUpperCase();
  return t.length > 14 ? `${t.slice(0, 13)}…` : t;
}

const PLAYLIST = AUDIO_FILES.map((file) => ({
  file,
  src: `/audio/${encodeURIComponent(file)}`,
  ...parseFilename(file),
}));

const BAR_COUNT = 18;

/** 八边形「圆钮」：完整闭合描边 + 硬边，避免平滑圆弧高光 */
const OCT_CLIP = "polygon(29% 0%, 71% 0%, 100% 29%, 100% 71%, 71% 100%, 29% 100%, 0% 71%, 0% 29%)";

function PixelButton({
  children,
  onClick,
  disabled,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "accent";
  className?: string;
}) {
  const accent = variant === "accent";
  return (
    <div
      className="box-border h-8 w-8 shrink-0 bg-[#010302] p-[2px] sm:h-9 sm:w-9 sm:p-[2.5px]"
      style={{
        clipPath: OCT_CLIP,
        imageRendering: "pixelated",
      }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={[
          "box-border flex h-full w-full items-center justify-center border-2 p-0 text-[5px] leading-none outline-none sm:text-[6px]",
          "transition-[filter,transform] duration-75 active:translate-y-px active:brightness-90",
          "disabled:cursor-not-allowed disabled:opacity-35 disabled:active:translate-y-0",
          "[image-rendering:pixelated]",
          accent
            ? "border-[#8ef84e] bg-[#0d1f10] text-[#d8ff70] hover:border-[#b0ff70] hover:bg-[#102818] hover:text-[#eeff99]"
            : "border-[#52c428] bg-[#060d08] text-[#72e828] hover:border-[#6ee836] hover:bg-[#0a140c] hover:text-[#a8ff55]",
          className,
        ].filter(Boolean).join(" ")}
        style={{
          clipPath: OCT_CLIP,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.45)",
        }}
      >
        <span className="relative z-10 translate-y-px [text-shadow:0_0_5px_rgba(140,255,60,0.5),1px_0_0_#000,-1px_0_0_#000,0_1px_0_#000]">
          {children}
        </span>
      </button>
    </div>
  );
}

export default function RetroMp3Player() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const graphReadyRef = useRef(false);
  const rafRef = useRef<number>(0);
  const frameSkipRef = useRef(0);
  const isPlayingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => Array(BAR_COUNT).fill(0));
  const [lcdHovered, setLcdHovered] = useState(false);
  const playAfterNextRef = useRef(false);
  /** 换源瞬间的 error 常为 ABORTED/NETWORK 误报，短延迟确认避免一直 NO MP3 */
  const mediaErrorConfirmRef = useRef<number | null>(null);

  const clearMediaErrorConfirm = useCallback(() => {
    if (mediaErrorConfirmRef.current) {
      clearTimeout(mediaErrorConfirmRef.current);
      mediaErrorConfirmRef.current = null;
    }
  }, []);

  const scheduleMediaErrorConfirm = useCallback(() => {
    clearMediaErrorConfirm();
    mediaErrorConfirmRef.current = window.setTimeout(() => {
      mediaErrorConfirmRef.current = null;
      const a = audioRef.current;
      if (!a?.error) return;
      if (a.error.code === MediaError.MEDIA_ERR_ABORTED) return;
      setMediaError(true);
    }, 320);
  }, [clearMediaErrorConfirm]);

  const current = PLAYLIST[trackIndex] ?? PLAYLIST[0];

  const showSpectrum = isPlaying && !lcdHovered;
  const showControls = !isPlaying || lcdHovered;

  const ensureAudioGraph = useCallback(() => {
    const el = audioRef.current;
    if (!el || graphReadyRef.current) return;

    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(el);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.72;
    source.connect(analyser);
    analyser.connect(ctx.destination);

    ctxRef.current = ctx;
    analyserRef.current = analyser;
    graphReadyRef.current = true;
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const syncPlaying = () => setIsPlaying(!el.paused);
    const onEnded = () => {
      if (PLAYLIST.length >= 2) {
        playAfterNextRef.current = true;
        setTrackIndex((i) => (i + 1) % PLAYLIST.length);
        return;
      }
      setIsPlaying(false);
    };
    /** 换源时浏览器常先抛 ABORTED；部分环境会报 NETWORK，需延迟确认 */
    const onError = () => {
      const code = el.error?.code;
      if (code === MediaError.MEDIA_ERR_ABORTED) return;
      scheduleMediaErrorConfirm();
    };
    const clearErrorState = () => {
      clearMediaErrorConfirm();
      setMediaError(false);
    };
    const onCanPlay = () => clearErrorState();
    const onLoadedData = () => clearErrorState();

    el.addEventListener("play", syncPlaying);
    el.addEventListener("pause", syncPlaying);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);
    el.addEventListener("canplay", onCanPlay);
    el.addEventListener("loadeddata", onLoadedData);

    return () => {
      clearMediaErrorConfirm();
      el.removeEventListener("play", syncPlaying);
      el.removeEventListener("pause", syncPlaying);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
      el.removeEventListener("canplay", onCanPlay);
      el.removeEventListener("loadeddata", onLoadedData);
      cancelAnimationFrame(rafRef.current);
      graphReadyRef.current = false;
      void ctxRef.current?.close();
      ctxRef.current = null;
      analyserRef.current = null;
    };
  }, [clearMediaErrorConfirm, scheduleMediaErrorConfirm]);

  /** 显式 load：仅靠改 React 的 src 时，部分浏览器会留下上一段的 error / 不触发 canplay */
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    setMediaError(false);
    clearMediaErrorConfirm();
    el.load();
  }, [trackIndex, clearMediaErrorConfirm]);

  useEffect(() => {
    if (!playAfterNextRef.current) return;
    playAfterNextRef.current = false;
    const el = audioRef.current;
    if (!el) return;

    const tryPlay = () => {
      ensureAudioGraph();
      void ctxRef.current?.resume();
      void el.play().catch(() => {});
    };

    /** 切歌后 src 刚换，立刻 play() 常失败；等 canplay 再播 */
    if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      tryPlay();
    } else {
      el.addEventListener("canplay", tryPlay, { once: true });
    }
  }, [trackIndex, ensureAudioGraph]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const loop = () => {
      if (!isPlayingRef.current) return;
      const analyser = analyserRef.current;
      if (!analyser) return;

      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      const usable = Math.min(data.length, 36);
      const chunk = Math.max(1, Math.floor(usable / BAR_COUNT));
      const next: number[] = [];
      for (let i = 0; i < BAR_COUNT; i++) {
        let max = 0;
        const start = i * chunk;
        for (let j = 0; j < chunk && start + j < usable; j++) {
          max = Math.max(max, data[start + j] ?? 0);
        }
        next.push(max / 255);
      }

      frameSkipRef.current += 1;
      if (frameSkipRef.current % 2 === 0) {
        setLevels(next);
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying]);

  const displayLevels = isPlaying ? levels : Array(BAR_COUNT).fill(0);

  const togglePlay = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;

    if (el.paused) {
      setMediaError(false);
      ensureAudioGraph();
      await ctxRef.current?.resume();
      try {
        if (el.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
          await new Promise<void>((resolve, reject) => {
            const t = window.setTimeout(() => {
              el.removeEventListener("canplay", ok);
              el.removeEventListener("error", bad);
              reject(new Error("timeout"));
            }, 15000);
            const ok = () => {
              window.clearTimeout(t);
              resolve();
            };
            const bad = () => {
              window.clearTimeout(t);
              reject(new Error("error"));
            };
            el.addEventListener("canplay", ok, { once: true });
            el.addEventListener("error", bad, { once: true });
          });
        }
        await el.play();
      } catch {
        // autoplay / decode / 超时
      }
    } else {
      el.pause();
    }
  }, [ensureAudioGraph]);

  /** 下一首（右侧圆钮）；之前误绑成「重头播」所以切歌无效 */
  const nextTrack = useCallback(() => {
    if (PLAYLIST.length < 2) return;
    setMediaError(false);
    const el = audioRef.current;
    playAfterNextRef.current = !!(el && !el.paused);
    setTrackIndex((i) => (i + 1) % PLAYLIST.length);
  }, []);

  return (
    <div
      className={`relative z-10 w-[8.25rem] shrink-0 select-none sm:w-[8.75rem] ${pixel.className}`}
      style={{
        filter: "drop-shadow(0 5px 12px rgba(0,0,0,0.48))",
      }}
    >
      <audio ref={audioRef} src={current.src} preload="metadata" />

      <div
        className="rounded-[1.1rem] p-[1.5px] sm:rounded-[1.2rem] sm:p-[2px]"
        style={{
          background:
            "linear-gradient(165deg, rgba(255,255,255,0.9) 0%, rgba(150,152,158,0.48) 24%, rgba(48,50,54,0.92) 52%, rgba(200,202,208,0.42) 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 4px rgba(0,0,0,0.38)",
        }}
      >
        <div
          className="rounded-[1rem] p-[2px] sm:rounded-[1.05rem]"
          style={{
            background: "linear-gradient(180deg, #222326 0%, #080809 52%, #151618 100%)",
            boxShadow: "inset 0 6px 14px rgba(0,0,0,0.82)",
          }}
        >
          <div
            className="relative overflow-hidden rounded-[0.82rem] sm:rounded-[0.9rem]"
            style={{
              background: "#000",
              boxShadow: "inset 0 0 0 1px #000, inset 0 1px 6px rgba(0,0,0,1)",
            }}
          >
            <div
              className="relative min-h-[5.35rem] overflow-hidden rounded-md border border-[#141418] sm:min-h-[5.65rem] sm:rounded-[0.5rem]"
              style={{
                background: "linear-gradient(180deg, #020804 0%, #000 48%, #040805 100%)",
                boxShadow:
                  "inset 0 0 0 1px #000, inset 0 1px 0 rgba(255,255,255,0.025), inset 0 -10px 18px rgba(0,0,0,0.88)",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.1]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at center, transparent 42%, rgba(0,40,0,0.32) 43%)",
                  backgroundSize: "3px 3px",
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-45"
                style={{
                  background:
                    "linear-gradient(118deg, rgba(255,255,255,0.055) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.018) 100%)",
                }}
              />

              {/* 整块 LCD：悬停检测；声纹层不挡事件 */}
              <div
                className="relative flex min-h-[5.35rem] flex-col gap-1 px-2 pb-2 pt-2 sm:min-h-[5.65rem] sm:gap-1.5 sm:px-2.5 sm:pb-2.5 sm:pt-2.5"
                onPointerEnter={() => setLcdHovered(true)}
                onPointerLeave={() => setLcdHovered(false)}
              >
                <div className="min-h-0 shrink-0">
                  <p
                    className="text-[6.5px] leading-tight tracking-wide text-[#8fe025] sm:text-[7.5px]"
                    style={{
                      textShadow:
                        "0 0 5px rgba(120,255,40,0.7), 0 0 1px #000, 1px 0 0 #000, -1px 0 0 #000, 0 1px 0 #000",
                    }}
                  >
                    {current.title}
                  </p>
                  <p
                    className="mt-0.5 text-[5.5px] leading-tight tracking-wider text-[#7ec956] sm:mt-1 sm:text-[6.5px]"
                    style={{
                      textShadow:
                        "0 0 5px rgba(120,220,90,0.35), 0 0 1px rgba(0,0,0,0.9), 1px 0 0 #000, -1px 0 0 #000",
                    }}
                  >
                    {current.artist || "—"}
                  </p>
                  {mediaError ? (
                    <p className="mt-0.5 text-[5px] leading-tight text-[#662020] sm:text-[5.5px]">NO MP3</p>
                  ) : null}
                </div>

                {/* 下部：播放中且未悬停 → 仅声纹；否则 → 仅按钮区 */}
                <div className="relative mt-0.5 min-h-[2.85rem] flex-1 sm:min-h-[3rem]">
                  <div
                    className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-150 ease-out ${
                      showSpectrum ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                    aria-hidden={!showSpectrum}
                  >
                    <div
                      className="flex h-[2.35rem] items-end justify-between gap-px rounded-sm border border-[#0c1a0e] bg-[#010302] px-0.5 py-0.5 sm:h-[2.5rem]"
                      style={{ imageRendering: "pixelated" }}
                    >
                      {displayLevels.map((v, i) => {
                        const h = Math.max(2, Math.round(3 + v * 22));
                        return (
                          <div
                            key={i}
                            className="flex min-w-0 flex-1 items-end justify-center bg-[#030806]"
                            style={{ height: "100%" }}
                          >
                            <div
                              className="w-full max-w-[2px] sm:max-w-[3px]"
                              style={{
                                height: `${h}px`,
                                background: "linear-gradient(180deg, #eeffaa 0%, #7ee818 32%, #3a8c08 78%, #143804 100%)",
                                boxShadow: v > 0.06 ? "0 0 5px rgba(100,255,50,0.45)" : "none",
                                imageRendering: "pixelated",
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-150 ease-out ${
                      showControls ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                  >
                    <div className="flex justify-center gap-2.5 sm:gap-3">
                      <PixelButton variant="accent" onClick={togglePlay}>
                        {isPlaying ? "||" : ">"}
                      </PixelButton>
                      <PixelButton
                        disabled={PLAYLIST.length < 2}
                        onClick={nextTrack}
                        className="text-[4px] sm:text-[5px]"
                      >
                        {">>|"}
                      </PixelButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
