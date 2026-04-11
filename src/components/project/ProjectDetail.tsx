"use client";

import { motion, AnimatePresence, useScroll, useSpring, useMotionValueEvent } from "framer-motion";
import { Project } from "@/app/data";
import { projectHeroLabel } from "@/lib/project-display";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { terminalAudio } from "@/lib/audio";
import ProjectGallery3D from "./ProjectGallery3D";
import ProjectNavigation from "./ProjectNavigation";

interface Props {
  project: Project;
  nextProject: Project;
  allProjects: Project[];
  mdxContent?: React.ReactNode;
  initialIndexOpen?: boolean;
  initialIndexReturnTo?: string;
}

export default function ProjectDetail({
  project,
  nextProject,
  allProjects,
  mdxContent,
  initialIndexOpen = false,
  initialIndexReturnTo,
}: Props) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(initialIndexOpen);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    const handleOpenProjectIndex = () => {
      terminalAudio?.playKeystroke();
      setDrawerOpen(true);
    };

    window.addEventListener("project-index:open", handleOpenProjectIndex);
    return () => {
      window.removeEventListener("project-index:open", handleOpenProjectIndex);
    };
  }, []);

  // Micro progress bar state
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [isScrolled, setIsScrolled] = useState(false);
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 200);
  });

  const handleCloseIndex = () => {
    if (initialIndexOpen && initialIndexReturnTo) {
      router.push(initialIndexReturnTo);
      return;
    }
    setDrawerOpen(false);
  };

  const hideBasePage = initialIndexOpen && drawerOpen;

  return (
    <div className={`min-h-screen text-foreground font-sans selection:bg-foreground selection:text-background flex flex-col relative transition-colors duration-700 ${hideBasePage ? "bg-black" : "bg-background"}`}>
      
      {/* Micro Progress Bar */}
      <motion.div
        className={`fixed top-0 left-0 right-0 h-[2px] bg-[#00ff41] origin-left z-50 shadow-[0_0_10px_#00ff41] transition-opacity duration-300 ${hideBasePage ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        style={{ scaleX }}
      />

      {/* Top Bar - Clean & Solid */}
      <AnimatePresence>
        {isScrolled && (
          <motion.header 
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed top-0 w-full z-40 bg-background border-b border-border shadow-sm transition-opacity duration-300 ${hideBasePage ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
              {/* Left - Back */}
              <div className="flex-1 flex items-center">
                <Link 
                  href="/" 
                  onClick={() => terminalAudio?.playKeystroke()}
                  className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group py-2"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">←</span>
                  <span>Home</span>
                </Link>
              </div>

              {/* Center - Title */}
              <div className="flex-1 flex justify-center items-center text-xs font-mono uppercase tracking-widest text-foreground truncate px-4 opacity-70">
                {project.title}
              </div>

              {/* Right - Menu */}
              <div className="flex-1 flex justify-end items-center">
                <button 
                  onClick={() => {
                    terminalAudio?.playKeystroke();
                    setDrawerOpen(true);
                  }}
                  className="cursor-pointer text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center gap-2 group"
                >
                  Index
                  <div className="flex gap-[2px] ml-1 opacity-50 group-hover:opacity-100 transition-opacity">
                    <span className="w-1 h-1 rounded-full bg-current"></span>
                    <span className="w-1 h-1 rounded-full bg-current"></span>
                    <span className="w-1 h-1 rounded-full bg-current"></span>
                  </div>
                </button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 pt-12 md:pt-16 pb-20 md:pb-32 relative z-20 transition-opacity duration-300 ${hideBasePage ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        {/* Initial Inline Navigation */}
        <nav className="flex items-center justify-between mb-16 md:mb-24 h-14">
          {/* Left - Back */}
          <div className="flex-1 flex items-center">
            <Link 
              href="/" 
              onClick={() => terminalAudio?.playKeystroke()}
              className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group py-2"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span>Home</span>
            </Link>
          </div>

          {/* Center - ID */}
          <div className="flex-1 flex justify-center items-center text-xs font-mono uppercase tracking-widest text-muted-foreground/30 hidden md:flex">
            [ {project.id} ]
          </div>

          {/* Right - Menu */}
          <div className="flex-1 flex justify-end items-center">
            <button 
              onClick={() => {
                terminalAudio?.playKeystroke();
                setDrawerOpen(true);
              }}
              className="cursor-pointer text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center gap-2 group"
            >
              Index
              <div className="flex gap-[2px] ml-1 opacity-50 group-hover:opacity-100 transition-opacity">
                <span className="w-1 h-1 rounded-full bg-current"></span>
                <span className="w-1 h-1 rounded-full bg-current"></span>
                <span className="w-1 h-1 rounded-full bg-current"></span>
              </div>
            </button>
          </div>
        </nav>

        <article>
          
          {/* Header Section */}
          <header className={project.hideDetailCover ? "mb-28 md:mb-32" : "mb-20"}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="mb-16"
            >
              <h1
                id="project-title"
                data-label={projectHeroLabel(project)}
                className="text-5xl md:text-8xl font-semibold tracking-tighter text-foreground leading-[1.1] max-w-5xl"
              >
                {project.title}
              </h1>
              {project.subtitle && (
                <p className="mt-4 text-xl md:text-2xl text-muted-foreground font-normal tracking-tight">
                  {project.subtitle}
                </p>
              )}
            </motion.div>
            
            {/* Metadata Grid */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="grid grid-cols-1 gap-8 py-10 border-y border-border/50 text-sm w-full md:grid-cols-3"
            >
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  Product
                </span>
                <span className="font-medium text-foreground">{project.product ?? "-"}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  Role
                </span>
                <span className="font-medium text-foreground">{project.role}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  Year
                </span>
                <span className="font-medium text-foreground">{project.year ?? "-"}</span>
              </div>
            </motion.div>
          </header>

          {/* Cover Image */}
          {!project.hideDetailCover && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full aspect-[16/9] md:aspect-[21/9] mb-28 relative rounded-2xl overflow-hidden bg-muted border border-border/30 shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={project.coverImage} 
                alt={project.title} 
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {/* Description */}
          {project.description && (
            <div className="max-w-4xl mb-32 xl:ml-60">
              <p className="text-2xl md:text-3xl leading-relaxed text-foreground font-medium tracking-tight">
                {project.description}
              </p>
            </div>
          )}

          {/* MDX Content */}
          {mdxContent && (
            <div className="w-full mb-40 mdx-content flex flex-col xl:flex-row gap-12">
              <div className="hidden xl:block w-48 shrink-0">
                <ProjectNavigation />
              </div>
              <div className="flex-1 min-w-0 w-full max-w-4xl xl:max-w-none">
                {mdxContent}
              </div>
            </div>
          )}

          {/* Next Project Section */}
          <motion.div 
            initial="initial"
            whileHover="hover"
            className="w-full pt-20 mt-20 pb-32"
          >
            <Link 
              href={`/projects/${nextProject.id}`} 
              onClick={() => terminalAudio?.playEnter()}
              className="block group p-8 -mx-8 rounded-3xl border border-transparent hover:bg-muted/30 transition-all duration-500"
            >
              <span className="text-sm font-medium text-muted-foreground mb-6 block uppercase tracking-wider">
                Next Project
              </span>
              <div className="flex items-center justify-between">
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground transition-all duration-500 group-hover:translate-x-2">
                  {nextProject.title}
                </h2>
                <div className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center text-background shadow-xl opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 ease-[0.16,1,0.3,1]">
                  <span className="font-medium text-xl">→</span>
                </div>
              </div>
            </Link>
          </motion.div>
        </article>
      </main>

      {/* 3D Orbit Gallery Overlay Index */}
      <AnimatePresence>
        {drawerOpen && (
          <ProjectGallery3D 
            projects={allProjects} 
            currentProjectId={project.id} 
            onClose={handleCloseIndex}
            onNavigateToProject={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
