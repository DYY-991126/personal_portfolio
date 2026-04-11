"use client";

import { 
  motion, 
  AnimatePresence, 
  type MotionValue,
  useMotionValue, 
  useSpring, 
  useTransform, 
  useVelocity, 
  useMotionValueEvent 
} from "framer-motion";
import { Project } from "@/app/data";
import { projectCardBadgeLabel, projectHeroLabel } from "@/lib/project-display";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { terminalAudio } from "@/lib/audio";

interface Props {
  projects: Project[];
  currentProjectId: string;
  onClose: () => void;
  onNavigateToProject?: () => void;
}

// Film grain texture for cinematic feel
const NOISE_SVG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;

const THEME_COLORS = [
  "255, 255, 255", // Silver/White
  "0, 255, 65",    // Matrix Green
  "0, 120, 255",   // Deep Cyber Blue
  "200, 50, 255",  // Neon Purple/Pink
  "255, 100, 0",   // Solar Orange
];

const getWrappedDiff = (index: number, scrollValue: number, length: number) => {
  const halfLength = length / 2;
  const diff = index - scrollValue;
  return ((((diff + halfLength) % length) + length) % length) - halfLength;
};

interface GalleryCardProps {
  p: Project;
  index: number;
  projectsLength: number;
  smoothScroll: MotionValue<number>;
  smoothVelocity: MotionValue<number>;
  itemAngle: number;
  radius: number;
  activeRotateX: MotionValue<number>;
  activeRotateY: MotionValue<number>;
  smoothMouseX: MotionValue<number>;
  smoothMouseY: MotionValue<number>;
  currentColor: string;
  activeIndex: number;
  onCardClick: (e: React.MouseEvent, index: number) => void;
  onNavigate: () => void;
}

// Memoized to keep React out of the scroll hot path.
const GalleryCard = memo(function GalleryCard({
  p,
  index,
  projectsLength,
  smoothScroll,
  smoothVelocity,
  itemAngle,
  radius,
  activeRotateX,
  activeRotateY,
  smoothMouseX,
  smoothMouseY,
  currentColor,
  activeIndex,
  onCardClick,
  onNavigate,
}: GalleryCardProps) {
  const x = useTransform(() => {
    const diff = getWrappedDiff(index, smoothScroll.get(), projectsLength);
    const theta = diff * itemAngle;
    const radian = theta * (Math.PI / 180);
    return `calc(-50% + ${radius * Math.sin(radian)}px)`;
  });

  const z = useTransform(() => {
    const diff = getWrappedDiff(index, smoothScroll.get(), projectsLength);
    const theta = diff * itemAngle;
    const radian = theta * (Math.PI / 180);
    const zBase = radius * Math.cos(radian) - radius;
    const activeBoost = Math.max(0, 1 - Math.abs(diff)) * 80;
    return zBase + activeBoost;
  });

  const rotateY = useTransform(() => {
    const diff = getWrappedDiff(index, smoothScroll.get(), projectsLength);
    const baseRY = -diff * itemAngle;
    const isAct = Math.abs(diff) < 0.5;
    return baseRY + (isAct ? activeRotateY.get() : 0);
  });

  const rotateX = useTransform(() => {
    const diff = getWrappedDiff(index, smoothScroll.get(), projectsLength);
    const isAct = Math.abs(diff) < 0.5;
    return isAct ? activeRotateX.get() : 0;
  });

  const rotateZ = useTransform(smoothVelocity, [-20, 20], [8, -8]);

  const opacity = useTransform(() => {
    const diff = Math.abs(getWrappedDiff(index, smoothScroll.get(), projectsLength));
    if (diff > Math.max(4, projectsLength / 2)) return 0;
    return Math.max(0, 1 - diff * 0.3);
  });

  const filter = useTransform(() => {
    const diff = Math.abs(getWrappedDiff(index, smoothScroll.get(), projectsLength));
    const b = Math.max(0.3, 1 - diff * 0.25);
    return `brightness(${b})`;
  });

  const zIndex = useTransform(() => {
    const diff = Math.abs(getWrappedDiff(index, smoothScroll.get(), projectsLength));
    return Math.round(100 - diff * 10);
  });

  const boxShadow = useTransform(() => {
    const diff = Math.abs(getWrappedDiff(index, smoothScroll.get(), projectsLength));
    const isAct = diff < 0.5;
    return isAct 
      ? `0 0 0 1px rgba(255,255,255,0.1), 0 40px 150px -20px rgba(0,0,0,1), 0 0 120px -30px rgba(${currentColor}, 0.6)` 
      : `0 0 0 1px rgba(255,255,255,0.05), 0 0 40px -10px rgba(${currentColor}, 0.1)`;
  });

  const imageX = useTransform(() => {
    const diff = Math.abs(getWrappedDiff(index, smoothScroll.get(), projectsLength));
    return diff < 0.5 ? smoothMouseX.get() * -30 : 0;
  });
  
  const imageY = useTransform(() => {
    const diff = Math.abs(getWrappedDiff(index, smoothScroll.get(), projectsLength));
    return diff < 0.5 ? smoothMouseY.get() * -30 : 0;
  });

  const isActive = index === activeIndex;

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 w-[90vw] max-w-[1200px] aspect-[16/9] md:aspect-[21/9] cursor-pointer"
      initial={false}
      style={{
        x, y: "-50%", z, rotateY, rotateX, rotateZ,
        opacity, filter, zIndex,
        transformStyle: "preserve-3d"
      }}
      onClick={(e) => onCardClick(e, index)}
    >
      <Link 
        href={isActive ? `/projects/${p.id}` : "#"}
        onClick={(e) => {
          e.stopPropagation();
          if (!isActive) e.preventDefault();
          else {
            terminalAudio?.playEnter();
            onNavigate();
          }
        }}
        className="w-full h-full block relative group"
      >
        <motion.div 
          className="w-full h-full rounded-3xl overflow-hidden relative bg-[#050505]"
          style={{ transformStyle: "preserve-3d", boxShadow }}
        >
          <motion.div className="absolute -inset-8" style={{ x: imageX, y: imageY }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.coverImage} alt={projectHeroLabel(p)} className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[0.16,1,0.3,1] group-hover:scale-[1.03]" />
          </motion.div>

          {/* Keep the floor reflection feel, but clip it inside the card frame. */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] opacity-35"
            style={{
              maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.coverImage}
              alt=""
              className="absolute inset-x-0 bottom-0 h-full w-full scale-y-[-1] object-cover blur-[14px]"
            />
          </div>
          
          <AnimatePresence>
            {!isActive && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" 
              />
            )}
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <AnimatePresence>
            {isActive && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  <Maximize2 className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-widest font-medium">Explore Project</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isActive && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-0 left-0 right-0 p-8 md:p-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none flex items-end justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {p.product ? (
                      <span className="px-2 py-1 border border-white/20 rounded-md text-[10px] font-mono text-white/70 uppercase tracking-widest backdrop-blur-md">{p.product}</span>
                    ) : null}
                    {p.role ? (
                      <span className="px-2 py-1 border border-white/20 rounded-md text-[10px] font-mono text-white/70 uppercase tracking-widest backdrop-blur-md">{p.role}</span>
                    ) : null}
                    {p.year ? (
                      <span className="px-2 py-1 border border-white/20 rounded-md text-[10px] font-mono text-white/70 uppercase tracking-widest backdrop-blur-md">{p.year}</span>
                    ) : null}
                  </div>
                  <h3 className="text-3xl md:text-5xl font-semibold text-white tracking-tight drop-shadow-xl">{p.title}</h3>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </Link>
    </motion.div>
  );
});

export default function ProjectGallery3D({ projects, currentProjectId, onClose, onNavigateToProject }: Props) {
  const initialIndex = Math.max(0, projects.findIndex(p => p.id === currentProjectId));
  
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const targetScroll = useRef(initialIndex);
  const wheelRafRef = useRef<number | null>(null);
  const pendingScrollDelta = useRef(0);
  
  // High-end physics springs for continuous scrolling
  const scrollY = useMotionValue(initialIndex);
  const smoothScroll = useSpring(scrollY, { damping: 35, stiffness: 180, mass: 1.2 });
  const scrollVelocity = useVelocity(smoothScroll);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });

  const [radius, setRadius] = useState(1000);
  const [itemAngle, setItemAngle] = useState(30);
  
  useEffect(() => {
    const updateDimensions = () => {
      if (window.innerWidth < 768) {
        setRadius(600);
        setItemAngle(45);
      } else {
        setRadius(1200);
        setItemAngle(25);
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Granular Tick Sound (颗粒感)
  const lastTickRef = useRef(initialIndex);
  useMotionValueEvent(smoothScroll, "change", (latest) => {
    const currentTick = Math.round(latest);
    if (currentTick !== lastTickRef.current) {
      lastTickRef.current = currentTick;
      terminalAudio?.playKeystroke();
      
      const wrappedIndex = ((((currentTick) % projects.length) + projects.length) % projects.length);
      setActiveIndex(wrappedIndex);
    }
  });

  const jumpToOffset = useCallback((offset: number) => {
    targetScroll.current += offset;
    scrollY.set(targetScroll.current);
  }, [scrollY]);

  const handleNext = useCallback(() => jumpToOffset(1), [jumpToOffset]);
  const handlePrev = useCallback(() => jumpToOffset(-1), [jumpToOffset]);

  const flushPendingScroll = useCallback(() => {
    if (pendingScrollDelta.current !== 0) {
      targetScroll.current += pendingScrollDelta.current;
      pendingScrollDelta.current = 0;
      scrollY.set(targetScroll.current);
    }
    wheelRafRef.current = null;
  }, [scrollY]);

  const scheduleScrollDelta = useCallback((delta: number) => {
    pendingScrollDelta.current += delta;
    if (wheelRafRef.current === null) {
      wheelRafRef.current = window.requestAnimationFrame(flushPendingScroll);
    }
  }, [flushPendingScroll]);

  // Scroll and Drag Input
  const isDragging = useRef(false);

  useEffect(() => {
    let snapTimeout: NodeJS.Timeout;
    const guardId = `project-index-guard-${Date.now()}`;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverscrollX = html.style.overscrollBehaviorX;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    const prevBodyOverscrollX = body.style.overscrollBehaviorX;
    const prevBodyOverscroll = body.style.overscrollBehavior;

    html.style.overscrollBehaviorX = "none";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehaviorX = "none";
    body.style.overscrollBehavior = "none";

    // Add a temporary history entry so macOS trackpad back/forward gestures
    // get absorbed while the index overlay is open.
    window.history.pushState({ ...window.history.state, __projectIndexGuard: guardId }, "", window.location.href);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") onClose();
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = isHorizontal ? e.deltaX : e.deltaY;
      
      // Batch wheel input to once per frame for smoother motion.
      scheduleScrollDelta(delta * 0.005);

      // Snap to integer when stopped (阻尼感/吸附感)
      clearTimeout(snapTimeout);
      snapTimeout = setTimeout(() => {
        targetScroll.current = Math.round(targetScroll.current);
        scrollY.set(targetScroll.current);
      }, 150);
    };

    const handlePopState = () => {
      window.history.pushState({ ...window.history.state, __projectIndexGuard: guardId }, "", window.location.href);
    };

    // Capture phase blocks browser back/forward gestures from trackpads earlier.
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel, true);
      window.removeEventListener("popstate", handlePopState);
      clearTimeout(snapTimeout);
      if (wheelRafRef.current !== null) {
        window.cancelAnimationFrame(wheelRafRef.current);
        wheelRafRef.current = null;
      }
      pendingScrollDelta.current = 0;
      if (window.history.state?.__projectIndexGuard === guardId) {
        window.history.back();
      }
      html.style.overscrollBehaviorX = prevHtmlOverscrollX;
      html.style.overscrollBehavior = prevHtmlOverscroll;
      body.style.overscrollBehaviorX = prevBodyOverscrollX;
      body.style.overscrollBehavior = prevBodyOverscroll;
    };
  }, [handleNext, handlePrev, onClose, scheduleScrollDelta, scrollY]);

  // Parallax Mouse Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 40, stiffness: 150, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);
  
  const activeRotateX = useTransform(smoothMouseY, [-0.5, 0.5], [8, -8]);
  const activeRotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-8, 8]);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth) - 0.5);
    mouseY.set((clientY / innerHeight) - 0.5);
  };

  const activeProject = projects[activeIndex];
  const currentColor = THEME_COLORS[activeIndex % THEME_COLORS.length];

  const handleCardClick = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (isDragging.current) {
      e.preventDefault();
      return;
    }
    if (index !== activeIndex) {
      const currentScroll = targetScroll.current;
      const remainder = ((currentScroll % projects.length) + projects.length) % projects.length;
      let diff = index - remainder;
      if (diff > projects.length / 2) diff -= projects.length;
      if (diff < -projects.length / 2) diff += projects.length;
      
      jumpToOffset(diff);
      terminalAudio?.playKeystroke();
    }
  }, [activeIndex, jumpToOffset, projects.length]);

  const visibleRange = Math.min(4, Math.ceil(projects.length / 2));
  const visibleCards = projects
    .map((project, index) => ({ project, index }))
    .filter(({ index }) => {
      const diff = Math.abs(getWrappedDiff(index, activeIndex, projects.length));
      return diff <= visibleRange;
    });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col font-sans select-none overscroll-none touch-none cursor-grab active:cursor-grabbing"
      onClick={() => {
        if (!isDragging.current) onClose();
      }}
      onMouseMove={handleMouseMove}
      onPanStart={() => { isDragging.current = true; }}
      onPan={(e, info) => {
        const isHorizontal = Math.abs(info.delta.x) > Math.abs(info.delta.y);
        const delta = isHorizontal ? info.delta.x : info.delta.y;
        targetScroll.current -= delta * 0.005;
        scrollY.set(targetScroll.current);
      }}
      onPanEnd={(e, info) => {
        const isHorizontal = Math.abs(info.velocity.x) > Math.abs(info.velocity.y);
        const velocity = isHorizontal ? info.velocity.x : info.velocity.y;
        targetScroll.current -= velocity * 0.002;
        
        targetScroll.current = Math.round(targetScroll.current);
        scrollY.set(targetScroll.current);
        setTimeout(() => { isDragging.current = false; }, 50);
      }}
    >
      {/* Background Noise & Vignette */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url("${NOISE_SVG}")` }}
      />
      
      {/* Intense Ambient Environment Glow */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-0 transition-colors duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(${currentColor}, 0.15) 0%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,1) 100%)`,
        }}
      />

      {/* Dynamic Core Light Behind Active Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none z-0 flex items-center justify-center"
      >
        <motion.div 
          className="w-[80vw] h-[80vw] rounded-full blur-[150px] opacity-40 mix-blend-screen"
          animate={{ 
            background: `radial-gradient(circle, rgba(${currentColor}, 1) 0%, rgba(${currentColor}, 0.4) 40%, transparent 70%)`,
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Horizon Light Rim */}
      <motion.div 
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 0.3, scaleX: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0 shadow-[0_0_20px_rgba(255,255,255,0.5)] origin-center" 
      />

      {/* Top HUD */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
        className="w-full max-w-[1800px] mx-auto px-6 md:px-12 h-24 flex items-center justify-between absolute top-0 left-0 right-0 z-[80] pointer-events-none"
      >
        <div className="flex flex-col gap-1 pointer-events-auto">
          <span className="text-[10px] font-mono text-white/40 tracking-[0.3em] uppercase">
            PROJECT {String(activeIndex + 1).padStart(2, "0")} - {String(projects.length).padStart(2, "0")}
          </span>
          <div className="flex gap-1">
            {projects.map((_, i) => (
              <div 
                key={i} 
                className={`h-[2px] w-6 transition-all duration-500 ${i === activeIndex ? 'bg-white' : 'bg-white/20'}`}
                style={{ boxShadow: i === activeIndex ? `0 0 10px rgba(${currentColor}, 0.5)` : 'none' }}
              />
            ))}
          </div>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            terminalAudio?.playKeystroke();
            onClose();
          }}
          className="pointer-events-auto group relative flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:scale-110 transition-all duration-300"
        >
          <X className="w-4 h-4 text-white/70 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
        </button>
      </motion.div>

      {/* Massive Background Typography */}
      <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 flex justify-center z-0 pointer-events-none overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: "20%", scale: 1.08 }}
            animate={{ opacity: 1, y: "0%", scale: 1 }}
            exit={{ opacity: 0, y: "-20%", scale: 0.94 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[12vw] font-bold tracking-tighter text-transparent whitespace-nowrap px-10"
            style={{ 
              WebkitTextStroke: '2px rgba(255,255,255,0.06)',
              lineHeight: 1,
            }}
          >
            {activeProject.title.toUpperCase()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3D Orbit Cylinder - With Million Dollar Entry Animation */}
      <motion.div 
        className="flex-1 w-full h-full flex items-center justify-center relative z-10"
        style={{ perspective: "1500px" }}
        initial={{ opacity: 0, scale: 0.78, y: "10%", rotateX: -10 }}
        animate={{ opacity: 1, scale: 1, y: "0%", rotateX: 0 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        {visibleCards.map(({ project: p, index }) => (
          <GalleryCard 
            key={p.id}
            p={p}
            index={index}
            projectsLength={projects.length}
            smoothScroll={smoothScroll}
            smoothVelocity={smoothVelocity}
            itemAngle={itemAngle}
            radius={radius}
            activeRotateX={activeRotateX}
            activeRotateY={activeRotateY}
            smoothMouseX={smoothMouseX}
            smoothMouseY={smoothMouseY}
            currentColor={currentColor}
            activeIndex={activeIndex}
            onCardClick={handleCardClick}
            onNavigate={() => onNavigateToProject?.()}
          />
        ))}
      </motion.div>

      {/* Ground Grid / Stage */}
      <motion.div 
        className="absolute bottom-0 left-0 w-full h-[45vh] pointer-events-none z-0 transition-colors duration-1000"
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: "0%" }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        style={{
          background: `
            linear-gradient(to top, rgba(${currentColor}, 0.15) 0%, transparent 100%),
            radial-gradient(ellipse at bottom, rgba(${currentColor}, 0.2) 0%, transparent 80%)
          `,
          transform: "perspective(1000px) rotateX(75deg)",
          transformOrigin: "bottom"
        }}
      >
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(${currentColor}, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(${currentColor}, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            maskImage: "radial-gradient(circle at top, black 0%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(circle at top, black 0%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Side Navigation Buttons */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
        className="absolute top-1/2 -translate-y-1/2 left-4 md:left-12 z-[90] pointer-events-none"
      >
        <button 
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="pointer-events-auto w-14 h-14 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-300 group"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
        className="absolute top-1/2 -translate-y-1/2 right-4 md:right-12 z-[90] pointer-events-none"
      >
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="pointer-events-auto w-14 h-14 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-300 group"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
      
      {/* Bottom Hint */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
        className="absolute bottom-8 left-0 w-full text-center z-[90] pointer-events-none"
      >
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">
          Scroll or drag to navigate
        </p>
      </motion.div>
    </motion.div>
  );
}
