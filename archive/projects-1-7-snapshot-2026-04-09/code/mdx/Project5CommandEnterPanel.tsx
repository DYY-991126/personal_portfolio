"use client";

import { useEffect, useState } from "react";

import { PROJECT5_CANVAS_STYLE } from "./Project5DemoFrame";
import Project5StickyNoteCard, {
  PROJECT5_NOTE_HEIGHT,
  PROJECT5_NOTE_WIDTH,
} from "./Project5StickyNoteCard";

const BOARD_HEIGHT = 320;
const IDLE_END = 420;
const TYPE_ONE_START = 620;
const TYPE_ONE_END = 1880;
const KEYS_ONE_END = 2140;
const CREATE_TWO_END = 2460;
const TYPE_TWO_START = 2660;
const TYPE_TWO_END = 3740;
const KEYS_TWO_END = 4000;
const CREATE_THREE_END = 4320;
const TYPE_THREE_START = 4480;
const TYPE_THREE_END = 5200;
const EXIT_END = 5840;
const CYCLE_DURATION = 6200;
const FIRST_TEXT = "整理首页内容结构";
const SECOND_TEXT = "补充创建说明";
const THIRD_TEXT = "继续补充案例";

export default function Project5CommandEnterPanel() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      setElapsed((now - start) % CYCLE_DURATION);
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const firstNoteLeft = 56;
  const secondNoteLeft = 296;
  const thirdNoteLeft = 536;
  const noteTop = 78;
  const keyRowBottom = 22;
  const commandPressed =
    (elapsed >= TYPE_ONE_END && elapsed < KEYS_ONE_END) ||
    (elapsed >= TYPE_TWO_END && elapsed < KEYS_TWO_END);
  const createdSecondNote = elapsed >= KEYS_ONE_END;
  const createdThirdNote = elapsed >= KEYS_TWO_END;
  const secondNoteOpacity = createdSecondNote
    ? getSegmentProgress(elapsed, KEYS_ONE_END, CREATE_TWO_END)
    : 0;
  const thirdNoteOpacity = createdThirdNote
    ? getSegmentProgress(elapsed, KEYS_TWO_END, CREATE_THREE_END)
    : 0;
  const firstTypingCount =
    elapsed < TYPE_ONE_START
      ? 0
      : elapsed >= TYPE_ONE_END
        ? FIRST_TEXT.length
        : Math.max(
            0,
            Math.floor(getSegmentProgress(elapsed, TYPE_ONE_START, TYPE_ONE_END) * FIRST_TEXT.length),
          );
  const secondTypingCount =
    elapsed < TYPE_TWO_START
      ? 0
      : elapsed >= TYPE_TWO_END
        ? SECOND_TEXT.length
        : Math.max(
            0,
            Math.floor(getSegmentProgress(elapsed, TYPE_TWO_START, TYPE_TWO_END) * SECOND_TEXT.length),
          );
  const thirdTypingCount =
    elapsed < TYPE_THREE_START
      ? 0
      : elapsed >= TYPE_THREE_END
        ? THIRD_TEXT.length
        : Math.max(
            0,
            Math.floor(getSegmentProgress(elapsed, TYPE_THREE_START, TYPE_THREE_END) * THIRD_TEXT.length),
          );
  const firstTypedText = FIRST_TEXT.slice(0, firstTypingCount);
  const secondTypedText = SECOND_TEXT.slice(0, secondTypingCount);
  const thirdTypedText = THIRD_TEXT.slice(0, thirdTypingCount);
  const firstNoteEditing = elapsed >= IDLE_END && elapsed < KEYS_ONE_END;
  const secondNoteEditing = elapsed >= KEYS_ONE_END && elapsed < KEYS_TWO_END;
  const thirdNoteEditing = elapsed >= KEYS_TWO_END && elapsed < EXIT_END;

  return (
    <div
      className="relative overflow-hidden rounded-[24px] border border-border/20"
      style={{ ...PROJECT5_CANVAS_STYLE, width: "100%", minHeight: BOARD_HEIGHT }}
    >
      <div
        className="pointer-events-none absolute"
        style={{
          left: firstNoteLeft,
          top: noteTop,
          width: PROJECT5_NOTE_WIDTH,
          height: PROJECT5_NOTE_HEIGHT,
        }}
      >
        <Project5StickyNoteCard
          editing={firstNoteEditing}
          editingSeed={firstNoteEditing ? firstTypedText : null}
          autoFocus={false}
          text={firstTypedText || "输入文本"}
        />
      </div>

      {createdSecondNote ? (
        <div
          className="pointer-events-none absolute transition-opacity duration-200 ease-out"
          style={{
            left: secondNoteLeft,
            top: noteTop,
            width: PROJECT5_NOTE_WIDTH,
            height: PROJECT5_NOTE_HEIGHT,
            opacity: secondNoteOpacity,
          }}
        >
          <Project5StickyNoteCard
            editing={secondNoteEditing}
            editingSeed={secondNoteEditing ? secondTypedText : null}
            autoFocus={false}
            text={secondTypedText || "输入文本"}
          />
        </div>
      ) : null}

      {createdThirdNote ? (
        <div
          className="pointer-events-none absolute transition-opacity duration-200 ease-out"
          style={{
            left: thirdNoteLeft,
            top: noteTop,
            width: PROJECT5_NOTE_WIDTH,
            height: PROJECT5_NOTE_HEIGHT,
            opacity: thirdNoteOpacity,
          }}
        >
          <Project5StickyNoteCard
            editing={thirdNoteEditing}
            editingSeed={thirdNoteEditing ? thirdTypedText : null}
            autoFocus={false}
            text={thirdTypedText || "输入文本"}
          />
        </div>
      ) : null}

      <div
        className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3"
        style={{
          bottom: keyRowBottom,
        }}
      >
        <KeyChip label="⌘" active={commandPressed} />
        <KeyChip label="Enter" active={commandPressed} />
      </div>
    </div>
  );
}

function KeyChip({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`rounded-[14px] border px-3 py-2 text-sm font-medium transition-all duration-150 ${
        active
          ? "border-black/20 bg-black text-white shadow-[0_8px_18px_rgba(15,23,42,0.18)]"
          : "border-black/12 bg-white/96 text-black/82 shadow-sm"
      }`}
      style={{
        transform: active ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)",
      }}
    >
      {label}
    </span>
  );
}

function getSegmentProgress(elapsed: number, start: number, end: number) {
  if (end <= start) {
    return 1;
  }

  return Math.max(0, Math.min(1, (elapsed - start) / (end - start)));
}
