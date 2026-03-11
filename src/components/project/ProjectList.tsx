"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Project } from "@/app/data";

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  
  // Mouse position state
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Velocity calculation for distortion
  const velocityX = useMotionValue(0);
  const velocityY = useMotionValue(0);

  // Smooth springs for the floating image
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15, mass: 0.5 });

  // Map velocity to distortion (skew/scale)
  const skewX = useTransform(velocityX, [-1000, 1000], [-10, 10]);
  const skewY = useTransform(velocityY, [-1000, 1000], [-10, 10]);
  const scale = useTransform(velocityX, [-1000, 0, 1000], [0.95, 1, 0.95]);

  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let lastTime = Date.now();

    const handleMouseMove = (e: MouseEvent) => {
      const currentTime = Date.now();
      const dt = currentTime - lastTime;
      
      if (dt > 0) {
        const vx = ((e.clientX - lastX) / dt) * 100;
        const vy = ((e.clientY - lastY) / dt) * 100;
        
        velocityX.set(vx);
        velocityY.set(vy);
      }

      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = currentTime;
    };

    const handleMouseLeave = () => {
      velocityX.set(0);
      velocityY.set(0);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    }
  }, [mouseX, mouseY, velocityX, velocityY]);

  return (
    <div className="relative w-full">
      {/* Brutalist List */}
      <div className="flex flex-col border-t border-border/40">
        {projects.map((project, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            key={project.id}
          >
            <Link 
              href={`/projects/${project.id}`}
              className="group block py-10 md:py-16 border-b border-border/40 hover:bg-muted/30 transition-colors px-4 -mx-4"
              onMouseEnter={() => setHoveredProject(project)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-12 relative z-10">
                
                {/* Year & Client */}
                <div className="w-full md:w-1/4 flex justify-between md:flex-col md:justify-start gap-1 font-mono text-sm text-muted-foreground">
                  <span>{project.year}</span>
                  <span className="md:hidden lg:inline-block">{project.client}</span>
                </div>

                {/* Title */}
                <div className="w-full md:w-1/2">
                  <h3 className="text-4xl md:text-6xl font-medium tracking-tight group-hover:pl-4 transition-all duration-300 ease-out">
                    {project.title}
                  </h3>
                </div>

                {/* Category & Arrow */}
                <div className="w-full md:w-1/4 flex justify-between items-center text-muted-foreground">
                  <span className="text-sm uppercase tracking-widest">{project.category}</span>
                  <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
                    <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                  </div>
                </div>

              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Floating Image Follower */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-0 w-[300px] h-[200px] md:w-[400px] md:h-[280px] overflow-hidden rounded-lg shadow-2xl bg-muted origin-center"
        style={{
          x: springX,
          y: springY,
          skewX,
          skewY,
          scale,
          translateX: "-50%",
          translateY: "-50%",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: hoveredProject ? 1 : 0, 
          scale: hoveredProject ? 1 : 0.8 
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {projects.map((project) => (
          <img
            key={project.id}
            src={project.coverImage}
            alt={project.title}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              hoveredProject?.id === project.id ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </motion.div>
    </div>
  );
}
