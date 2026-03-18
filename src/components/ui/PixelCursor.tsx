"use client";

import { useEffect, useRef, useState } from "react";

type CursorMode = "default" | "interactive" | "text" | "drag";

const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "[role='button']",
  "summary",
  "label",
  "select",
  "input:not([type='text']):not([type='email']):not([type='search']):not([type='url']):not([type='password'])",
  "[data-cursor='interactive']",
  ".cursor-pointer",
].join(", ");

const TEXT_SELECTOR = [
  "textarea",
  "[contenteditable='true']",
  "input[type='text']",
  "input[type='email']",
  "input[type='search']",
  "input[type='url']",
  "input[type='password']",
  "[data-cursor='text']",
].join(", ");

export default function PixelCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ x: -200, y: -200 });
  const currentRef = useRef({ x: -200, y: -200 });

  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    if (!media.matches) return;

    document.documentElement.classList.add("has-pixel-cursor");

    const resolveMode = (target: EventTarget | null): CursorMode => {
      if (!(target instanceof HTMLElement)) return "default";
      if (target.closest(".cursor-grab, .cursor-grabbing, [data-cursor='drag']")) return "drag";
      if (target.closest(TEXT_SELECTOR)) return "text";
      if (target.closest(INTERACTIVE_SELECTOR)) return "interactive";
      return "default";
    };

    const animate = () => {
      const cursor = cursorRef.current;
      if (!cursor) return;

      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.22;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.22;

      cursor.style.transform = `translate3d(${currentRef.current.x}px, ${currentRef.current.y}px, 0)`;
      rafRef.current = window.requestAnimationFrame(animate);
    };

    const handleMove = (event: MouseEvent) => {
      targetRef.current.x = event.clientX;
      targetRef.current.y = event.clientY;
      setVisible(true);
      setMode(resolveMode(event.target));
      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(animate);
      }
    };

    const handleOver = (event: MouseEvent) => {
      setMode(resolveMode(event.target));
    };

    const handleDown = () => setPressed(true);
    const handleUp = () => setPressed(false);
    const handleLeave = () => setVisible(false);
    const handleEnter = (event: MouseEvent) => {
      targetRef.current.x = event.clientX;
      targetRef.current.y = event.clientY;
      currentRef.current.x = event.clientX;
      currentRef.current.y = event.clientY;
      setVisible(true);
      setMode(resolveMode(event.target));
      const cursor = cursorRef.current;
      if (cursor) {
        cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      }
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseover", handleOver, { passive: true });
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);

    return () => {
      document.documentElement.classList.remove("has-pixel-cursor");
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseover", handleOver);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={`pixel-cursor pixel-cursor--${mode} ${visible ? "is-visible" : ""} ${pressed ? "is-pressed" : ""}`}
      aria-hidden="true"
    >
      <div className="pixel-cursor__shape">
        <div className="pixel-cursor__glyph" />
      </div>
      <div className="pixel-cursor__halo" />
    </div>
  );
}
