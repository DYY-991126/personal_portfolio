"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 小猫的状态：待机、行走、睡觉、交互（被点击/悬浮）、追逐鼠标
type CatState = "idle" | "walk" | "sleep" | "interact" | "chase";

interface CatLumiProps {
  // 可以传入容器宽度，如果没有则使用 window.innerWidth
  containerWidth?: number;
}

export function CatLumi({ containerWidth }: CatLumiProps) {
  const [catState, setCatState] = useState<CatState>("idle");
  const [positionX, setPositionX] = useState(50); // 初始位置（像素）
  const [direction, setDirection] = useState<"left" | "right">("right"); // 面朝方向
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const [frameIndex, setFrameIndex] = useState(1); // 动画帧索引 (1 到 4)

  // 鼠标追踪相关状态
  const [mouseX, setMouseX] = useState<number | null>(null);
  const chaseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const interactTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const walkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimeRef = useRef<number>(0); // 记录空闲时间，用来判断是否要睡觉

  // 帧动画循环逻辑
  useEffect(() => {
    // 根据状态调整动画帧的切换速度 (毫秒)
    // 待机(idle)设为 1000 毫秒(1秒)一次，睡觉(sleep)600毫秒，行走/追逐200毫秒，交互200毫秒
    const fps = (catState === "walk" || catState === "chase") ? 200 : catState === "sleep" ? 600 : catState === "interact" ? 200 : 1000;
    
    frameIntervalRef.current = setInterval(() => {
      setFrameIndex((prev) => (prev >= 4 ? 1 : prev + 1));
    }, fps);

    return () => {
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    };
  }, [catState]);

  // 当状态改变时，重置帧索引，确保新动作从第一帧开始
  useEffect(() => {
    setFrameIndex(1);
  }, [catState]);

  // 根据当前状态和帧索引获取图片路径
  // 如果是 chase 状态，复用 walk 的图片
  const spriteState = catState === "chase" ? "walk" : catState;
  const currentSpritePath = `/lumi/${spriteState}${frameIndex}.png`;

  const mouseXRef = useRef<number | null>(null);

  // 监听鼠标在全局的移动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 获取鼠标的屏幕位置
      setMouseX(e.clientX);
      mouseXRef.current = e.clientX;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 渲染全局指针样式（仅在追逐时变成逗猫棒）
  useEffect(() => {
    if (catState === "chase") {
      document.body.style.cursor = "url('/lumi/catWand_64.png') 8 8, auto";
    } else {
      document.body.style.cursor = "auto";
    }

    return () => {
      document.body.style.cursor = "auto";
    };
  }, [catState]);

  // 随机决定下一个状态的逻辑
  const decideNextAction = () => {
    if (catState === "interact" || catState === "chase") return; // 交互或追逐中不自动打断

    // 如果空闲很久了（比如 > 20秒），较大概率去睡觉
    if (idleTimeRef.current > 20) {
      if (Math.random() > 0.4) {
        setCatState("sleep");
        return;
      }
    }

    const rand = Math.random();
    if (catState === "sleep") {
      // 睡觉时有很小概率自然醒来
      if (rand > 0.85) {
        setCatState("idle");
        idleTimeRef.current = 0;
      }
    } else if (catState === "idle") {
      // 待机时，较小概率开始走动，大概率继续保持待机
      if (rand > 0.7) { // 提高待机的黏性，更少走动
        setCatState("walk");
        // 走动时随机决定方向 (但在待机时尽量不要频繁改变朝向)
        if (Math.random() > 0.5) {
          setDirection(Math.random() > 0.5 ? "right" : "left");
        }
      }
    } else if (catState === "walk") {
      // 走动时，较大概率停下来待机休息
      if (rand > 0.4) {
        setCatState("idle");
      } else {
        // 极小极小概率突然回头走 (防止左右横跳)
        if (rand < 0.05) {
          setDirection((prev) => (prev === "right" ? "left" : "right"));
        }
      }
    }
  };

  // 状态机循环
  useEffect(() => {
    const loop = () => {
      // 根据当前状态，动态决定下一次思考(切换状态)的延迟时间
      let nextTime = 5000;
      if (catState === "sleep") {
        nextTime = 10000 + Math.random() * 15000; // 睡得比较沉：10~25秒才判断一次是否醒来
      } else if (catState === "idle") {
        nextTime = 4000 + Math.random() * 6000;   // 待机比较久：4~10秒
      } else if (catState === "walk") {
        nextTime = 3000 + Math.random() * 4000;   // 走动一小段：3~7秒
      }

      stateTimerRef.current = setTimeout(() => {
        decideNextAction();
        loop(); // 递归调用，持续循环
      }, nextTime);
    };

    loop();

    return () => {
      if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catState]);

  // 走动或追逐逻辑
  useEffect(() => {
    if (catState === "walk" || catState === "chase") {
      // 追逐时速度稍微快一点点 (3)，平时散步 (1.5)
      const speed = catState === "chase" ? 3 : 1.5; 
      const fps = 30; // 动画帧率
      
      walkIntervalRef.current = setInterval(() => {
        setPositionX((prev) => {
          let nextX = prev;
          
          if (catState === "chase" && mouseXRef.current !== null) {
            // 获取当前鼠标实际屏幕 X 坐标
            const currentMouseX = mouseXRef.current;
            
            // 为了简化计算，我们假设猫咪所在的容器是靠左的（或者我们只要大致追着鼠标的相对位置跑）
            // 在复杂布局下最好能拿到容器的 getBoundingClientRect().left。
            // 这里提供一种粗略但有效的追逐方式：假设左侧留白为 0
            const targetX = currentMouseX - 48; // 减去猫咪宽度的一半，让中心对准鼠标
            
            // 计算与鼠标在 X 轴的相对距离
            // 这个距离可能不准（如果左侧有边距），但这反而会让追逐有一种“大概在追”的可爱感
            const distance = targetX - prev;
            
            // 只要距离超过 30 像素，就判定为还没追到
            if (Math.abs(distance) > 30) {
              setDirection(distance > 0 ? "right" : "left");
              nextX = distance > 0 ? prev + speed : prev - speed;
            } else {
              // 追到了（距离很近）
              nextX = prev; 
              
              setCatState("interact");
              if (interactTimerRef.current) clearTimeout(interactTimerRef.current);
              
              setSpeechText("🐾");
              setShowSpeechBubble(true);
              
              interactTimerRef.current = setTimeout(() => {
                setCatState("idle");
                setShowSpeechBubble(false);
              }, 1000); 
            }
          } else {
            // 普通散步模式
            nextX = direction === "right" ? prev + speed : prev - speed;
          }
          
          // 边界检查
          const maxW = containerWidth || (typeof window !== "undefined" ? window.innerWidth : 800);
          const boundRight = maxW - 60;
          const boundLeft = 20;

          if (nextX > boundRight) {
            nextX = boundRight;
            if (catState !== "chase") setDirection("left"); 
          } else if (nextX < boundLeft) {
            nextX = boundLeft;
            if (catState !== "chase") setDirection("right");
          }
          return nextX;
        });
        
        idleTimeRef.current = 0; // 移动时重置空闲时间
      }, 1000 / fps);
    } else {
      if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
    }

    return () => {
      if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
    };
  }, [catState, direction, containerWidth]);

  // 追逐的超时放弃逻辑 (如果一直追不到)
  useEffect(() => {
    if (catState === "chase") {
      // 设定追逐最大时间，比如追了 4 秒都没追到，就放弃
      chaseTimerRef.current = setTimeout(() => {
        setCatState("idle"); // 停住待机
        
        // 稍微强行加一点疲惫感，让他很快去睡觉
        idleTimeRef.current = 25; 
        
        setShowSpeechBubble(true);
        setSpeechText("?"); // 疑惑/放弃的表情
        setTimeout(() => setShowSpeechBubble(false), 1500);

      }, 4000); 
    }

    return () => {
      if (chaseTimerRef.current) clearTimeout(chaseTimerRef.current);
    };
  }, [catState]);

  // 计算空闲时间 (每秒 + 1)
  useEffect(() => {
    const timer = setInterval(() => {
      if (catState === "idle") {
        idleTimeRef.current += 1;
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [catState]);

  // 交互事件：点击或鼠标悬浮
  const handleInteract = (e: React.MouseEvent) => {
    // 如果已经在追逐了，不要重复触发交互，等他自己追到
    if (catState === "chase") return;

    setCatState("interact");
    idleTimeRef.current = 0;
    
    // 随机说一句猫言猫语
    const meows = ["Meow~", "喵！", "Prrr...", "Lumi!"];
    setSpeechText(meows[Math.floor(Math.random() * meows.length)]);
    setShowSpeechBubble(true);

    if (interactTimerRef.current) clearTimeout(interactTimerRef.current);

    // 交互时，如果发现鼠标离开了猫咪（不再处于悬停状态/被点击后移开）
    // 给一点反应时间，比如 1秒 后检查鼠标位置，如果太远就开始追逐
    interactTimerRef.current = setTimeout(() => {
      // 为了拿到最新准确的容器内坐标偏移进行比较，我们需要用 ref 记录。
      // 但这里用一个简单稳定的策略：如果不处于 interact 状态就什么也不做。
      // 因为我们是在 setTimeout 里，需要使用最新的状态判断。
      const currentMouseX = mouseXRef.current;
      if (currentMouseX !== null) {
        // 由于猫的父容器不一定是从 0 开始的（比如在大屏幕上可能居中了），
        // 简单起见，我们判断只要鼠标不在猫的上方附近，就追。
        setCatState("chase");
        setShowSpeechBubble(false);
      } else {
        setCatState("idle");
        setShowSpeechBubble(false);
      }
    }, 1000); 
  };

  // 删除了 renderPlaceholder 函数

  return (
    <div 
      // 在这里增加了一个透明的点击/悬停热区，仅向上和左右扩展，下方不扩展
      className="absolute bottom-full left-0 mb-1 z-30 select-none pt-12 px-12 -mt-12 -mx-12"
      style={{ 
        transform: `translate(${positionX}px, 16px)`,
      }}
      onMouseEnter={handleInteract}
      onClick={handleInteract}
    >
      <div className="relative flex flex-col items-center">
        {/* 对话气泡 / 睡觉符号 */}
        <AnimatePresence>
          {showSpeechBubble && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-full mb-2 bg-[#00ff41]/20 border border-[#00ff41]/50 text-[#00ff41] px-2 py-1 text-xs font-mono rounded backdrop-blur-sm whitespace-nowrap"
            >
              {speechText}
            </motion.div>
          )}
          {catState === "sleep" && !showSpeechBubble && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-full mb-1 text-[#00ff41]/60 text-xs font-mono animate-pulse"
            >
              zZz...
            </motion.div>
          )}
        </AnimatePresence>

        {/* 猫咪本体 - 逐帧动画 */}
        <motion.div
          animate={
            catState === "interact"
              ? { y: [0, -8, 0], scale: [1, 1.1, 1] } // 交互时增加一点跳跃感
              : {} 
          }
          transition={{
            duration: 0.4,
            repeat: 0,
            ease: "easeInOut",
          }}
          className="relative origin-bottom"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={currentSpritePath} 
            alt="Lumi the cat"
            className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-[0_0_5px_rgba(0,255,65,0.3)] transition-transform duration-200"
            style={{ 
              transform: direction === "left" ? "scaleX(-1)" : "scaleX(1)",
              opacity: catState === "sleep" ? 0.8 : 1 // 睡觉时变暗一点
            }}
            draggable={false}
            onError={(e) => {
              // 如果图片还没放进去，回退到 emoji
              e.currentTarget.style.display = "none";
              const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextSibling) nextSibling.style.display = "block";
            }}
          />
          {/* 图片没加载出来时的备用 Emoji */}
          <div 
            className="text-4xl md:text-5xl filter drop-shadow-[0_0_8px_rgba(0,255,65,0.5)] hidden"
            style={{ transform: direction === "left" ? "scaleX(-1)" : "scaleX(1)" }}
          >
            {catState === "sleep" ? "💤🐈" : catState === "walk" ? "🐈" : catState === "interact" ? "✨🐈" : "🐈"}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
