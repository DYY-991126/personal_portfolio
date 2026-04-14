"use client";

/**
 * 简历全屏模态：A4 纸张 + 黑色蒙层；点击蒙层任意处关闭（纸张区域除外），Esc 关闭。
 */

import { useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { terminalAudio } from "@/lib/audio";
import { ResumeDocument } from "@/components/ui/ResumeDocument";

export type ResumeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const RESUME_PNG_FILENAME = "邓毅洋-简历";
const RESUME_SHEET_BACKGROUND = "#fafaf8";

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

async function waitForEmbeddedAssets(node: HTMLElement) {
  await document.fonts?.ready;

  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map(async (img) => {
      if (img.complete && img.naturalWidth > 0) {
        if (typeof img.decode === "function") {
          try {
            await img.decode();
          } catch {
            // Completed images can still render correctly even if decode fails.
          }
        }
        return;
      }

      await new Promise<void>((resolve) => {
        const finalize = () => resolve();
        img.addEventListener("load", finalize, { once: true });
        img.addEventListener("error", finalize, { once: true });
      });
    })
  );
}

async function exportResumePng(node: HTMLElement) {
  const { toPng } = await import("html-to-image");
  const dataUrl = await toPng(node, {
    cacheBust: true,
    backgroundColor: RESUME_SHEET_BACKGROUND,
    pixelRatio: Math.min(window.devicePixelRatio || 2, 3),
  });

  downloadDataUrl(dataUrl, `${RESUME_PNG_FILENAME}.png`);
}

export function ResumeModal({ open, onOpenChange }: ResumeModalProps) {
  const resumeRef = useRef<HTMLDivElement>(null);
  const exportInProgressRef = useRef(false);

  const close = useCallback(() => {
    terminalAudio?.playKeystroke();
    onOpenChange(false);
  }, [onOpenChange]);

  const handleExportPng = useCallback(async () => {
    if (exportInProgressRef.current) return;

    const resumeNode = resumeRef.current;
    if (!resumeNode) return;

    exportInProgressRef.current = true;
    terminalAudio?.playEnter();

    try {
      await waitForEmbeddedAssets(resumeNode);
      await exportResumePng(resumeNode);
    } catch (error) {
      console.error("Resume PNG export failed", error);
    } finally {
      exportInProgressRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }

      // Hidden export shortcut for the resume modal.
      if (e.metaKey && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void handleExportPng();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, handleExportPng]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence mode="sync">
      {open ? (
        <motion.div
          key="resume-modal"
          role="dialog"
          aria-modal="true"
          aria-label="邓毅洋简历，点击深色背景关闭"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-200 cursor-pointer overflow-y-auto overscroll-contain bg-[#1a1a1a]/92 py-8 px-3 pb-16 sm:px-6 sm:py-10 sm:pb-20 md:px-10"
          data-lenis-prevent
          onClick={close}
        >
          <span className="sr-only">点击简历外的深色区域或按 Esc 关闭</span>
          <motion.div
            ref={resumeRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="mx-auto w-full max-w-[210mm] cursor-auto border border-neutral-300/90 bg-[#fafaf8] text-[#1a1a1a]"
            style={{
              boxShadow: "0 12px 48px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.04)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-[12mm] py-[18mm] sm:px-[16mm] sm:py-[22mm] md:px-[18mm] md:py-[26mm]">
              <ResumeDocument />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
