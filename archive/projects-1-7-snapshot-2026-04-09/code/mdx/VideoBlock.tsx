"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { Play, Pause, Maximize } from "lucide-react";

interface VideoBlockProps {
  src: string;
  poster?: string;
  caption?: string;
  autoplay?: boolean;
}

export default function VideoBlock({
  src,
  poster,
  caption,
  autoplay = false,
}: VideoBlockProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(autoplay);

  const toggle = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  const fullscreen = () => {
    videoRef.current?.requestFullscreen?.();
  };

  return (
    <motion.figure
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="w-full relative group my-16"
    >
      <div className="rounded-2xl overflow-hidden bg-muted border border-border/30 relative">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoplay}
          muted={autoplay}
          loop
          playsInline
          className="w-full h-auto"
          onClick={toggle}
        />
        <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={toggle}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={fullscreen}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
      {caption && (
        <figcaption className="text-sm text-muted-foreground text-center mt-6 font-medium">
          {caption}
        </figcaption>
      )}
    </motion.figure>
  );
}
