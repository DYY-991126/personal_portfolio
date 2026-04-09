"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type ColorSwatch = {
  step: string;
  hex: string;
  style?: React.CSSProperties;
  transparent?: boolean;
};

const BASE_SWATCHES: { label: string; hex: string; style?: React.CSSProperties; transparent?: boolean }[] = [
  { label: "Black", hex: "#000000", style: { backgroundColor: "#000000" } },
  { label: "White", hex: "#ffffff", style: { backgroundColor: "#ffffff" } },
  { label: "Transparent", hex: "-", transparent: true },
];

const BACKGROUND_SWATCHES: { label: string; hex: string; style?: React.CSSProperties }[] = [
  { label: "Dark", hex: "#282829", style: { backgroundColor: "#282829" } },
  { label: "Light", hex: "#ffffff", style: { backgroundColor: "#ffffff" } },
];

const COLOR_ROWS: { label: string; values: ColorSwatch[] }[] = [
  {
    label: "black",
    values: [
      { step: "50", hex: "#000 5%", style: { backgroundColor: "rgba(0,0,0,0.05)" }, transparent: true },
      { step: "100", hex: "#000 10%", style: { backgroundColor: "rgba(0,0,0,0.10)" }, transparent: true },
      { step: "200", hex: "#000 20%", style: { backgroundColor: "rgba(0,0,0,0.20)" }, transparent: true },
      { step: "300", hex: "#000 30%", style: { backgroundColor: "rgba(0,0,0,0.30)" }, transparent: true },
      { step: "400", hex: "#000 40%", style: { backgroundColor: "rgba(0,0,0,0.40)" }, transparent: true },
      { step: "500", hex: "#000 50%", style: { backgroundColor: "rgba(0,0,0,0.50)" }, transparent: true },
      { step: "600", hex: "#000 60%", style: { backgroundColor: "rgba(0,0,0,0.60)" }, transparent: true },
      { step: "700", hex: "#000 70%", style: { backgroundColor: "rgba(0,0,0,0.70)" }, transparent: true },
      { step: "800", hex: "#000 80%", style: { backgroundColor: "rgba(0,0,0,0.80)" }, transparent: true },
      { step: "900", hex: "#000 90%", style: { backgroundColor: "rgba(0,0,0,0.90)" }, transparent: true },
      { step: "1000", hex: "#000 100%", style: { backgroundColor: "#000000" } },
    ],
  },
  {
    label: "white",
    values: [
      { step: "50", hex: "#fff 5%", style: { backgroundColor: "rgba(255,255,255,0.05)" }, transparent: true },
      { step: "100", hex: "#fff 10%", style: { backgroundColor: "rgba(255,255,255,0.10)" }, transparent: true },
      { step: "200", hex: "#fff 20%", style: { backgroundColor: "rgba(255,255,255,0.20)" }, transparent: true },
      { step: "300", hex: "#fff 30%", style: { backgroundColor: "rgba(255,255,255,0.30)" }, transparent: true },
      { step: "400", hex: "#fff 40%", style: { backgroundColor: "rgba(255,255,255,0.40)" }, transparent: true },
      { step: "500", hex: "#fff 50%", style: { backgroundColor: "rgba(255,255,255,0.50)" }, transparent: true },
      { step: "600", hex: "#fff 60%", style: { backgroundColor: "rgba(255,255,255,0.60)" }, transparent: true },
      { step: "700", hex: "#fff 70%", style: { backgroundColor: "rgba(255,255,255,0.70)" }, transparent: true },
      { step: "800", hex: "#fff 80%", style: { backgroundColor: "rgba(255,255,255,0.80)" }, transparent: true },
      { step: "900", hex: "#fff 90%", style: { backgroundColor: "rgba(255,255,255,0.90)" } },
      { step: "1000", hex: "#fff 100%", style: { backgroundColor: "#ffffff" } },
    ],
  },
  {
    label: "Gray",
    values: [
      { step: "50", hex: "#f6f6f6", style: { backgroundColor: "#f6f6f6" } },
      { step: "100", hex: "#e7e7e7", style: { backgroundColor: "#e7e7e7" } },
      { step: "200", hex: "#d1d1d1", style: { backgroundColor: "#d1d1d1" } },
      { step: "300", hex: "#b0b0b0", style: { backgroundColor: "#b0b0b0" } },
      { step: "400", hex: "#888888", style: { backgroundColor: "#888888" } },
      { step: "500", hex: "#6d6d6d", style: { backgroundColor: "#6d6d6d" } },
      { step: "600", hex: "#5d5d5d", style: { backgroundColor: "#5d5d5d" } },
      { step: "700", hex: "#4f4f4f", style: { backgroundColor: "#4f4f4f" } },
      { step: "800", hex: "#454545", style: { backgroundColor: "#454545" } },
      { step: "900", hex: "#363636", style: { backgroundColor: "#363636" } },
      { step: "950", hex: "#262626", style: { backgroundColor: "#262626" } },
    ],
  },
  {
    label: "Gray Dark",
    values: [
      { step: "50", hex: "#262626", style: { backgroundColor: "#262626" } },
      { step: "100", hex: "#363636", style: { backgroundColor: "#363636" } },
      { step: "200", hex: "#454545", style: { backgroundColor: "#454545" } },
      { step: "300", hex: "#4f4f4f", style: { backgroundColor: "#4f4f4f" } },
      { step: "400", hex: "#5d5d5d", style: { backgroundColor: "#5d5d5d" } },
      { step: "500", hex: "#6d6d6d", style: { backgroundColor: "#6d6d6d" } },
      { step: "600", hex: "#888888", style: { backgroundColor: "#888888" } },
      { step: "700", hex: "#b0b0b0", style: { backgroundColor: "#b0b0b0" } },
      { step: "800", hex: "#d1d1d1", style: { backgroundColor: "#d1d1d1" } },
      { step: "900", hex: "#e7e7e7", style: { backgroundColor: "#e7e7e7" } },
      { step: "950", hex: "#f6f6f6", style: { backgroundColor: "#f6f6f6" } },
    ],
  },
  {
    label: "Blue",
    values: [
      { step: "50", hex: "#eef6fd", style: { backgroundColor: "#eef6fd" } },
      { step: "100", hex: "#daeefe", style: { backgroundColor: "#daeefe" } },
      { step: "200", hex: "#bde4ff", style: { backgroundColor: "#bde4ff" } },
      { step: "300", hex: "#91d4fe", style: { backgroundColor: "#91d4fe" } },
      { step: "400", hex: "#5dbafc", style: { backgroundColor: "#5dbafc" } },
      { step: "500", hex: "#2794fb", style: { backgroundColor: "#2794fb" } },
      { step: "600", hex: "#1c7dee", style: { backgroundColor: "#1c7dee" } },
      { step: "700", hex: "#1866e0", style: { backgroundColor: "#1866e0" } },
      { step: "800", hex: "#1c55b2", style: { backgroundColor: "#1c55b2" } },
      { step: "900", hex: "#18478f", style: { backgroundColor: "#18478f" } },
      { step: "950", hex: "#142c55", style: { backgroundColor: "#142c55" } },
    ],
  },
  {
    label: "Blue Dark",
    values: [
      { step: "50", hex: "#142c55", style: { backgroundColor: "#142c55" } },
      { step: "100", hex: "#18478f", style: { backgroundColor: "#18478f" } },
      { step: "200", hex: "#1c55b2", style: { backgroundColor: "#1c55b2" } },
      { step: "300", hex: "#1866e0", style: { backgroundColor: "#1866e0" } },
      { step: "400", hex: "#1c7dee", style: { backgroundColor: "#1c7dee" } },
      { step: "500", hex: "#2794fb", style: { backgroundColor: "#2794fb" } },
      { step: "600", hex: "#5dbafc", style: { backgroundColor: "#5dbafc" } },
      { step: "700", hex: "#91d4fe", style: { backgroundColor: "#91d4fe" } },
      { step: "800", hex: "#bde4ff", style: { backgroundColor: "#bde4ff" } },
      { step: "900", hex: "#daeefe", style: { backgroundColor: "#daeefe" } },
      { step: "950", hex: "#eef6fd", style: { backgroundColor: "#eef6fd" } },
    ],
  },
  {
    label: "Purple",
    values: [
      { step: "50", hex: "#f7f3fd", style: { backgroundColor: "#f7f3fd" } },
      { step: "100", hex: "#efe6fd", style: { backgroundColor: "#efe6fd" } },
      { step: "200", hex: "#e5d6fe", style: { backgroundColor: "#e5d6fe" } },
      { step: "300", hex: "#d0b5fb", style: { backgroundColor: "#d0b5fb" } },
      { step: "400", hex: "#B385FB", style: { backgroundColor: "#B385FB" } },
      { step: "500", hex: "#a46bf5", style: { backgroundColor: "#a46bf5" } },
      { step: "600", hex: "#813AE6", style: { backgroundColor: "#813AE6" } },
      { step: "700", hex: "#6f27cc", style: { backgroundColor: "#6f27cc" } },
      { step: "800", hex: "#5d23a4", style: { backgroundColor: "#5d23a4" } },
      { step: "900", hex: "#4f1e85", style: { backgroundColor: "#4f1e85" } },
      { step: "950", hex: "#330863", style: { backgroundColor: "#330863" } },
    ],
  },
  {
    label: "Purple Dark",
    values: [
      { step: "50", hex: "#330863", style: { backgroundColor: "#330863" } },
      { step: "100", hex: "#4f1e85", style: { backgroundColor: "#4f1e85" } },
      { step: "200", hex: "#5d23a4", style: { backgroundColor: "#5d23a4" } },
      { step: "300", hex: "#6f27cc", style: { backgroundColor: "#6f27cc" } },
      { step: "400", hex: "#813ae6", style: { backgroundColor: "#813ae6" } },
      { step: "500", hex: "#a46bf5", style: { backgroundColor: "#a46bf5" } },
      { step: "600", hex: "#b385fb", style: { backgroundColor: "#b385fb" } },
      { step: "700", hex: "#d0b5fb", style: { backgroundColor: "#d0b5fb" } },
      { step: "800", hex: "#e5d6fe", style: { backgroundColor: "#e5d6fe" } },
      { step: "900", hex: "#efe6fd", style: { backgroundColor: "#efe6fd" } },
      { step: "950", hex: "#f7f3fd", style: { backgroundColor: "#f7f3fd" } },
    ],
  },
  {
    label: "Pink",
    values: [
      { step: "50", hex: "#fdf2f8", style: { backgroundColor: "#fdf2f8" } },
      { step: "100", hex: "#fdeaf5", style: { backgroundColor: "#fdeaf5" } },
      { step: "200", hex: "#facde6", style: { backgroundColor: "#facde6" } },
      { step: "300", hex: "#f6a6d2", style: { backgroundColor: "#f6a6d2" } },
      { step: "400", hex: "#f27cbd", style: { backgroundColor: "#f27cbd" } },
      { step: "500", hex: "#ef54a9", style: { backgroundColor: "#ef54a9" } },
      { step: "600", hex: "#eb2f96", style: { backgroundColor: "#eb2f96" } },
      { step: "700", hex: "#c82880", style: { backgroundColor: "#c82880" } },
      { step: "800", hex: "#a7216b", style: { backgroundColor: "#a7216b" } },
      { step: "900", hex: "#861b56", style: { backgroundColor: "#861b56" } },
      { step: "950", hex: "#6a1544", style: { backgroundColor: "#6a1544" } },
    ],
  },
  {
    label: "Pink Dark",
    values: [
      { step: "50", hex: "#6a1544", style: { backgroundColor: "#6a1544" } },
      { step: "100", hex: "#861b56", style: { backgroundColor: "#861b56" } },
      { step: "200", hex: "#a7216b", style: { backgroundColor: "#a7216b" } },
      { step: "300", hex: "#c82880", style: { backgroundColor: "#c82880" } },
      { step: "400", hex: "#eb2f96", style: { backgroundColor: "#eb2f96" } },
      { step: "500", hex: "#ef54a9", style: { backgroundColor: "#ef54a9" } },
      { step: "600", hex: "#f27cbd", style: { backgroundColor: "#f27cbd" } },
      { step: "700", hex: "#f6a6d2", style: { backgroundColor: "#f6a6d2" } },
      { step: "800", hex: "#facde6", style: { backgroundColor: "#facde6" } },
      { step: "900", hex: "#fdeaf5", style: { backgroundColor: "#fdeaf5" } },
      { step: "950", hex: "#fdf2f8", style: { backgroundColor: "#fdf2f8" } },
    ],
  },
  {
    label: "Red",
    values: [
      { step: "50", hex: "#fcf3f3", style: { backgroundColor: "#fcf3f3" } },
      { step: "100", hex: "#ffe4e5", style: { backgroundColor: "#ffe4e5" } },
      { step: "200", hex: "#facecf", style: { backgroundColor: "#facecf" } },
      { step: "300", hex: "#f6aaab", style: { backgroundColor: "#f6aaab" } },
      { step: "400", hex: "#f0777a", style: { backgroundColor: "#f0777a" } },
      { step: "500", hex: "#e8575b", style: { backgroundColor: "#e8575b" } },
      { step: "600", hex: "#d42f34", style: { backgroundColor: "#d42f34" } },
      { step: "700", hex: "#b32325", style: { backgroundColor: "#b32325" } },
      { step: "800", hex: "#942124", style: { backgroundColor: "#942124" } },
      { step: "900", hex: "#782223", style: { backgroundColor: "#782223" } },
      { step: "950", hex: "#430f10", style: { backgroundColor: "#430f10" } },
    ],
  },
  {
    label: "Red Dark",
    values: [
      { step: "50", hex: "#430f10", style: { backgroundColor: "#430f10" } },
      { step: "100", hex: "#782223", style: { backgroundColor: "#782223" } },
      { step: "200", hex: "#942124", style: { backgroundColor: "#942124" } },
      { step: "300", hex: "#b32325", style: { backgroundColor: "#b32325" } },
      { step: "400", hex: "#d42f34", style: { backgroundColor: "#d42f34" } },
      { step: "500", hex: "#e8575b", style: { backgroundColor: "#e8575b" } },
      { step: "600", hex: "#f0777a", style: { backgroundColor: "#f0777a" } },
      { step: "700", hex: "#f6aaab", style: { backgroundColor: "#f6aaab" } },
      { step: "800", hex: "#facecf", style: { backgroundColor: "#facecf" } },
      { step: "900", hex: "#ffe4e5", style: { backgroundColor: "#ffe4e5" } },
      { step: "950", hex: "#fcf3f3", style: { backgroundColor: "#fcf3f3" } },
    ],
  },
  {
    label: "Orange",
    values: [
      { step: "50", hex: "#fcf4ea", style: { backgroundColor: "#fcf4ea" } },
      { step: "100", hex: "#fcecd4", style: { backgroundColor: "#fcecd4" } },
      { step: "200", hex: "#fad8ab", style: { backgroundColor: "#fad8ab" } },
      { step: "300", hex: "#fabd77", style: { backgroundColor: "#fabd77" } },
      { step: "400", hex: "#f7963f", style: { backgroundColor: "#f7963f" } },
      { step: "500", hex: "#f58028", style: { backgroundColor: "#f58028" } },
      { step: "600", hex: "#e35b0e", style: { backgroundColor: "#e35b0e" } },
      { step: "700", hex: "#bd4510", style: { backgroundColor: "#bd4510" } },
      { step: "800", hex: "#973814", style: { backgroundColor: "#973814" } },
      { step: "900", hex: "#7a3013", style: { backgroundColor: "#7a3013" } },
      { step: "950", hex: "#431709", style: { backgroundColor: "#431709" } },
    ],
  },
  {
    label: "Orange Dark",
    values: [
      { step: "50", hex: "#431709", style: { backgroundColor: "#431709" } },
      { step: "100", hex: "#7a3013", style: { backgroundColor: "#7a3013" } },
      { step: "200", hex: "#973814", style: { backgroundColor: "#973814" } },
      { step: "300", hex: "#bd4510", style: { backgroundColor: "#bd4510" } },
      { step: "400", hex: "#e35b0e", style: { backgroundColor: "#e35b0e" } },
      { step: "500", hex: "#f58028", style: { backgroundColor: "#f58028" } },
      { step: "600", hex: "#f7963f", style: { backgroundColor: "#f7963f" } },
      { step: "700", hex: "#fabd77", style: { backgroundColor: "#fabd77" } },
      { step: "800", hex: "#fad8ab", style: { backgroundColor: "#fad8ab" } },
      { step: "900", hex: "#fcecd4", style: { backgroundColor: "#fcecd4" } },
      { step: "950", hex: "#fcf4ea", style: { backgroundColor: "#fcf4ea" } },
    ],
  },
  {
    label: "Yellow",
    values: [
      { step: "50", hex: "#fffde9", style: { backgroundColor: "#fffde9" } },
      { step: "100", hex: "#fdf8c4", style: { backgroundColor: "#fdf8c4" } },
      { step: "200", hex: "#fcee8d", style: { backgroundColor: "#fcee8d" } },
      { step: "300", hex: "#f7db4a", style: { backgroundColor: "#f7db4a" } },
      { step: "400", hex: "#f7c81d", style: { backgroundColor: "#f7c81d" } },
      { step: "500", hex: "#ecb40d", style: { backgroundColor: "#ecb40d" } },
      { step: "600", hex: "#c58709", style: { backgroundColor: "#c58709" } },
      { step: "700", hex: "#9f610e", style: { backgroundColor: "#9f610e" } },
      { step: "800", hex: "#824c0f", style: { backgroundColor: "#824c0f" } },
      { step: "900", hex: "#703f16", style: { backgroundColor: "#703f16" } },
      { step: "950", hex: "#401f06", style: { backgroundColor: "#401f06" } },
    ],
  },
  {
    label: "Yellow Dark",
    values: [
      { step: "50", hex: "#401f06", style: { backgroundColor: "#401f06" } },
      { step: "100", hex: "#703f16", style: { backgroundColor: "#703f16" } },
      { step: "200", hex: "#824c0f", style: { backgroundColor: "#824c0f" } },
      { step: "300", hex: "#9f610e", style: { backgroundColor: "#9f610e" } },
      { step: "400", hex: "#c58709", style: { backgroundColor: "#c58709" } },
      { step: "500", hex: "#ecb40d", style: { backgroundColor: "#ecb40d" } },
      { step: "600", hex: "#f7c81d", style: { backgroundColor: "#f7c81d" } },
      { step: "700", hex: "#f7db4a", style: { backgroundColor: "#f7db4a" } },
      { step: "800", hex: "#fcee8d", style: { backgroundColor: "#fcee8d" } },
      { step: "900", hex: "#fdf8c4", style: { backgroundColor: "#fdf8c4" } },
      { step: "950", hex: "#fffde9", style: { backgroundColor: "#fffde9" } },
    ],
  },
  {
    label: "Green",
    values: [
      { step: "50", hex: "#effcf4", style: { backgroundColor: "#effcf4" } },
      { step: "100", hex: "#ddfae8", style: { backgroundColor: "#ddfae8" } },
      { step: "200", hex: "#baf4d4", style: { backgroundColor: "#baf4d4" } },
      { step: "300", hex: "#8aedb6", style: { backgroundColor: "#8aedb6" } },
      { step: "400", hex: "#4ed98b", style: { backgroundColor: "#4ed98b" } },
      { step: "500", hex: "#25bc69", style: { backgroundColor: "#25bc69" } },
      { step: "600", hex: "#13a057", style: { backgroundColor: "#13a057" } },
      { step: "700", hex: "#197d45", style: { backgroundColor: "#197d45" } },
      { step: "800", hex: "#196239", style: { backgroundColor: "#196239" } },
      { step: "900", hex: "#175132", style: { backgroundColor: "#175132" } },
      { step: "950", hex: "#052c18", style: { backgroundColor: "#052c18" } },
    ],
  },
  {
    label: "Green Dark",
    values: [
      { step: "50", hex: "#052c18", style: { backgroundColor: "#052c18" } },
      { step: "100", hex: "#175132", style: { backgroundColor: "#175132" } },
      { step: "200", hex: "#196239", style: { backgroundColor: "#196239" } },
      { step: "300", hex: "#197d45", style: { backgroundColor: "#197d45" } },
      { step: "400", hex: "#13a057", style: { backgroundColor: "#13a057" } },
      { step: "500", hex: "#25bc69", style: { backgroundColor: "#25bc69" } },
      { step: "600", hex: "#4ed98b", style: { backgroundColor: "#4ed98b" } },
      { step: "700", hex: "#8aedb6", style: { backgroundColor: "#8aedb6" } },
      { step: "800", hex: "#baf4d4", style: { backgroundColor: "#baf4d4" } },
      { step: "900", hex: "#ddfae8", style: { backgroundColor: "#ddfae8" } },
      { step: "950", hex: "#effcf4", style: { backgroundColor: "#effcf4" } },
    ],
  },
];

const TYPE_SCALE = [
  ["UI 24", "24 / 32", "页面标题、模块标题"],
  ["UI 18", "18 / 28", "一级信息、重点文本"],
  ["UI 16", "16 / 24", "常规正文、表单说明"],
  ["UI 14", "14 / 22", "辅助说明、弱信息"],
  ["UI 13", "13 / 20", "表格、密集信息"],
  ["UI 12", "12 / 18", "注释、状态提示"],
];

const SPACING_SCALE = Array.from({ length: 11 }, (_, index) => ({
  token: `spacing-${index}`,
  value: `${index * 4}px`,
  size: index * 4,
}));

const SHADOW_SCALE = [
  {
    token: "shadow-sm",
    usage: "指针、轻 hover",
    light: "0 0 0.5px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.15)",
    dark: "0 0 0.5px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4)",
    examples: "指针",
  },
  {
    token: "shadow",
    usage: "基础浮层",
    light: "0 0 0.5px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.1), 0 3px 8px rgba(0,0,0,0.1)",
    dark: "inset 0 0 0.5px rgba(255,255,255,0.1), 0 0 0.5px rgba(0,0,0,0.5), inset 0 0 0.5px rgba(255,255,255,0.3), 0 1px 3px rgba(0,0,0,0.4)",
    examples: "工具栏（弹出）、Toast",
  },
  {
    token: "shadow-md",
    usage: "信息浮层",
    light: "0 0 0.5px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1), 0 5px 12px rgba(0,0,0,0.13)",
    dark: "inset 0 0 0.5px rgba(255,255,255,0.08), 0 1px 3px rgba(0,0,0,0.5), inset 0 0 0.5px rgba(255,255,255,0.3), 0 5px 12px rgba(0,0,0,0.35)",
    examples: "Tooltips",
  },
  {
    token: "shadow-lg",
    usage: "面板层",
    light: "0 0 0.5px rgba(0,0,0,0.12), 0 2px 5px rgba(0,0,0,0.15), 0 10px 16px rgba(0,0,0,0.12)",
    dark: "inset 1 0px rgba(255,255,255,0.08), 0 10px 16px rgba(0,0,0,0.35), inset 0 0 0.5px rgba(255,255,255,0.35), 0 2px 5px rgba(0,0,0,0.35)",
    examples: "菜单、面板、评论、搜索栏",
  },
  {
    token: "shadow-xl",
    usage: "模态层",
    light: "0 0.5px rgba(0,0,0,0.08), 0 2px 5px rgba(0,0,0,0.15), 0 10px 24px rgba(0,0,0,0.18)",
    dark: "inset 1 0px rgba(255,255,255,0.08), 0 10px 24px rgba(0,0,0,0.45), inset 0 0 0.5px rgba(255,255,255,0.35), 0 3px 5px rgba(0,0,0,0.35)",
    examples: "模态框、对话框",
  },
];

const TYPOGRAPHY_WEIGHTS = [
  ["Regular", "font-weight: 400;", "即时设计"],
  ["Medium", "font-weight: 500;", "即时设计"],
  ["Semibold", "font-weight: 600;", "即时设计"],
];

const TYPOGRAPHY_LINE_HEIGHT = [
  ["紧凑型", "1.34 × font-size", "标题、辅标", "每个平台的原生排版"],
  ["标准型", "1.42 × font-size", "正文、描述", "The comparison operation cannot be undone."],
  ["大文本型", "1.76 × font-size", "长文本阅读", "Clear typographical hierarchy organizes content."],
];

const ICON_BASE_PATH = "/projects/project-6/icons";
const icon = (name: string) => `${ICON_BASE_PATH}/${name}`;

type PdfDoc = {
  label: string;
  src: string;
};

type ImageDoc = {
  label: string;
  src: string;
};

type PdfDocGroup = {
  label: string;
  docs: PdfDoc[];
};

type IconItem = {
  name: string;
  src: string;
};

type IconRow = {
  label: string;
  items: IconItem[];
};

type IconReferenceSection = {
  title: string;
  rows: IconRow[];
};

const ICON_REFERENCE_SECTIONS: IconReferenceSection[] = [
  {
    title: "S / Sidebar (16dp)",
    rows: [
      {
        label: "General",
        items: [
          { name: "Cross", src: icon("general-Cross.svg") },
          { name: "Minus", src: icon("general-minus.svg") },
          { name: "Add", src: icon("add.svg") },
          { name: "More", src: icon("general-more.svg") },
          { name: "Adjust", src: icon("general-adjust.svg") },
          { name: "Panel Grid", src: icon("general-panel grid.svg") },
          { name: "Link", src: icon("general--link.svg") },
          { name: "Link Break", src: icon("general-link break.svg") },
          { name: "Chevron Left", src: icon("general-Chevron Left.svg") },
          { name: "Chevron Right", src: icon("general-Chevron Right.svg") },
          { name: "Chevron Up", src: icon("general-Chevron Up.svg") },
          { name: "Chevron Down", src: icon("general-Chevron Down.svg") },
          { name: "Arrow Left", src: icon("general-Arrow Left.svg") },
          { name: "Arrow Right", src: icon("general-Arrow Right.svg") },
          { name: "Pop-up", src: icon("general-Pop-up.svg") },
          { name: "Folder", src: icon("general-folder.svg") },
          { name: "Lock Closed", src: icon("general-lock Closed.svg") },
          { name: "Lock Open", src: icon("general-lock Open.svg") },
          { name: "Reload", src: icon("general-reload.svg") },
          { name: "Globe", src: icon("general-globe.svg") },
        ],
      },
      {
        label: "Search + Filters",
        items: [
          { name: "Search", src: icon("general-search.svg") },
          { name: "Filter", src: icon("general-filter.svg") },
          { name: "Cross", src: icon("general-Cross.svg") },
          { name: "Library", src: icon("general-library-32.svg") },
        ],
      },
      {
        label: "File browser",
        items: [
          { name: "File", src: icon("general-file.svg") },
          { name: "Cross Circled", src: icon("general-cross circled.svg") },
          { name: "Info", src: icon("general-info circled.svg") },
          { name: "Warning", src: icon("general-exclamation triangle.svg") },
          { name: "Upload", src: icon("general-file-upload.svg") },
          { name: "Download", src: icon("general-download.svg") },
          { name: "Question", src: icon("general-question Mark-circled.svg") },
        ],
      },
      {
        label: "Plugin + Help",
        items: [
          { name: "Star", src: icon("general-star.svg") },
          { name: "Star Filled", src: icon("general-star Filled.svg") },
          { name: "Push Background", src: icon("general-push background.svg") },
          { name: "Select Component", src: icon("general-select component.svg") },
          { name: "Select Instance", src: icon("general-select instance.svg") },
          { name: "Help Light", src: icon("help-light.svg") },
          { name: "Help Dark", src: icon("help-dark.svg") },
          { name: "Floating Popup", src: icon("floating-popup-28.svg") },
        ],
      },
      {
        label: "Effects",
        items: [
          { name: "Drop Shadow 1", src: icon("effect-drop-shadow-top.svg") },
          { name: "Drop Shadow 2", src: icon("effect-drop-shadow-top-right.svg") },
          { name: "Drop Shadow 3", src: icon("effect-drop-shadow-left.svg") },
          { name: "Inner Shadow 1", src: icon("effect-inner-shadow-top.svg") },
          { name: "Inner Shadow 2", src: icon("effect-inner-shadow-top-right.svg") },
          { name: "Inner Shadow 3", src: icon("effect-inner-shadow-left.svg") },
          { name: "Background Blur", src: icon("effect-background-blur.svg") },
          { name: "Layer Blur", src: icon("effect-layer-blur.svg") },
          { name: "Drop Shadow Bottom", src: icon("effect-sdrop-shadow-bottom.svg") },
        ],
      },
      {
        label: "Editor",
        items: [
          { name: "Eyedropper", src: icon("editor-color pick-eyedropper.svg") },
          { name: "Blend Empty", src: icon("editor-color blend-empty.svg") },
          { name: "Blend Pick", src: icon("editor-color pick-blend-empty.svg") },
          { name: "Row Spacing", src: icon("editor-Row Spacing.svg") },
          { name: "Column Spacing", src: icon("editor-column spacing.svg") },
          { name: "W Min Max", src: icon("editor-W-min-max.svg") },
          { name: "H Min Max", src: icon("editor-H-min-max.svg") },
        ],
      },
      {
        label: "Text",
        items: [
          { name: "Align Left", src: icon("text align-left.svg") },
          { name: "Auto Width", src: icon("text-auto-width.svg") },
          { name: "Auto Height", src: icon("text-auto-height.svg") },
          { name: "Uppercase", src: icon("font-letter case-uppercase.svg") },
          { name: "Lowercase", src: icon("font-letter case-lowercase.svg") },
          { name: "Capitalize", src: icon("font-letter case-capitalize.svg") },
          { name: "None", src: icon("font-none.svg") },
          { name: "AA", src: icon("font-letter case toggle.svg") },
          { name: "Align Left 2", src: icon("text align-left.svg") },
          { name: "Align Center", src: icon("text-align center.svg") },
          { name: "Align Right", src: icon("text-align right.svg") },
          { name: "Justify", src: icon("text-align justify.svg") },
          { name: "Underline", src: icon("font-underline.svg") },
          { name: "Strike", src: icon("font-strike-through.svg") },
          { name: "Overline", src: icon("font-overline.svg") },
          { name: "Ordered List", src: icon("text-ordered list.svg") },
          { name: "Panel List", src: icon("text-panel list.svg") },
        ],
      },
      {
        label: "Stroke",
        items: [
          { name: "Weight", src: icon("stroke-weight.svg") },
          { name: "Dashed", src: icon("stroke-weight-dashed.svg") },
          { name: "Round", src: icon("stroke-round.svg") },
          { name: "Square", src: icon("stroke-square.svg") },
          { name: "Per Side", src: icon("stroke-per-side.svg") },
          { name: "Join", src: icon("stroke-join-miter.svg") },
          { name: "Side Top", src: icon("stroke-side-top.svg") },
          { name: "Side Bottom", src: icon("stroke-side-bottom.svg") },
          { name: "Side Left", src: icon("stroke-side-left.svg") },
          { name: "Side Right", src: icon("stroke-side-right.svg") },
          { name: "Top Left", src: icon("stroke-side-topleft.svg") },
          { name: "Top Right", src: icon("stroke-side-topright.svg") },
          { name: "Dash Border", src: icon("stroke-border dashed.svg") },
          { name: "Fill Reverse", src: icon("stroke-fill reverse.svg") },
        ],
      },
      {
        label: "Transform",
        items: [
          { name: "X", src: icon("transform-X.svg") },
          { name: "Y", src: icon("transform-Y.svg") },
          { name: "W", src: icon("transform-W.svg") },
          { name: "H", src: icon("transform-H.svg") },
          { name: "Absolute", src: icon("transform-absolute positioning.svg") },
          { name: "Angle", src: icon("transform-angle.svg") },
          { name: "Bezier", src: icon("transform-bezier.svg") },
          { name: "Mirror H", src: icon("transform-mirror horizontal.svg") },
          { name: "Mirror V", src: icon("transform-mirror vertical.svg") },
          { name: "Ratio", src: icon("transform-ratio.svg") },
          { name: "Constrain", src: icon("transform-constrain proportions-open.svg") },
          { name: "Move", src: icon("move.svg") },
          { name: "Scale", src: icon("scale.svg") },
          { name: "Frame", src: icon("frame.svg") },
          { name: "Rectangle", src: icon("rectangle.svg") },
          { name: "Ellipse", src: icon("ellipse.svg") },
          { name: "Polygon", src: icon("polygon.svg") },
          { name: "Star", src: icon("star.svg") },
          { name: "Line", src: icon("line.svg") },
        ],
      },
      {
        label: "Orientation + Layout",
        items: [
          { name: "Constraints H", src: icon("Constraints-horizontal.svg") },
          { name: "Constraints V", src: icon("Constraints-vertical.svg") },
          { name: "Auto Layout H", src: icon("auto-layou-constraints horizontally.svg") },
          { name: "Auto Layout V", src: icon("auto-layou-constraints vertically.svg") },
          { name: "Align Horizontal", src: icon("align-horizontal.svg") },
          { name: "Align Vertical", src: icon("align-vertical.svg") },
          { name: "Align Horizontal Centers", src: icon("align-horizontal-centers_as-group.svg") },
          { name: "Align Vertical Centers", src: icon("align-vertical-centers_as-group.svg") },
          { name: "Panel Grid", src: icon("general-panel grid.svg") },
          { name: "Center Horizontal", src: icon("Center-horizontal.svg") },
          { name: "Center Vertical", src: icon("Center-vertical.svg") },
          { name: "Auto Spacing H", src: icon("auto-spacing horizontal.svg") },
          { name: "Auto Spacing V", src: icon("auto-Spacing vertical.svg") },
          { name: "Auto Padding H", src: icon("auto-padding horizontal.svg") },
          { name: "Auto Padding V", src: icon("auto-padding vertical.svg") },
        ],
      },
    ],
  },
  {
    title: "M / Standard (32dp)",
    rows: [
      {
        label: "Alignment",
        items: [
          { name: "Align Left Group", src: icon("align-left_as-group.svg") },
          { name: "Align Center H", src: icon("align-center-horizontal.svg") },
          { name: "Align Right Group", src: icon("align-right_as-group.svg") },
          { name: "Align Start H", src: icon("align-start-horizontal.svg") },
          { name: "Align End H", src: icon("align-end-horizontal.svg") },
          { name: "Align Start V", src: icon("align-start-vertical.svg") },
          { name: "Align End V", src: icon("align-end-vertical.svg") },
          { name: "Center H", src: icon("Center-horizontal.svg") },
          { name: "Center V", src: icon("Center-vertical.svg") },
          { name: "Align Top Group", src: icon("align-top_as-group.svg") },
          { name: "Panel Grid", src: icon("general-panel grid.svg") },
          { name: "Cell H Bottom", src: icon("alignment cell-horizontal- bottom.svg") },
          { name: "Cell H Center", src: icon("alignment cell-horizontal-centered.svg") },
          { name: "Cell H Top", src: icon("alignment cell-horizontal-top.svg") },
          { name: "Cell V Center", src: icon("alignment cell-vertical- centered.svg") },
          { name: "Cell V Left", src: icon("alignment cell-vertical-left.svg") },
          { name: "Cell V Right", src: icon("alignment cell-vertical- right.svg") },
        ],
      },
    ],
  },
  {
    title: "L / Toolbar (28dp)",
    rows: [
      {
        label: "ToolBar-Menu",
        items: [
          { name: "Move", src: icon("move-28.svg") },
          { name: "Scale", src: icon("scale-28.svg") },
          { name: "Frame", src: icon("frame-28.svg") },
          { name: "Rectangle", src: icon("rectangle-28.svg") },
          { name: "Ellipse", src: icon("ellipse-28.svg") },
          { name: "Star", src: icon("star-28.svg") },
          { name: "Polygon", src: icon("polygon-28.svg") },
          { name: "Image", src: icon("image-28.svg") },
          { name: "Arrow", src: icon("arrow-28.svg") },
          { name: "Line", src: icon("line-28.svg") },
          { name: "Fill Tool", src: icon("fill-tool-28.svg") },
          { name: "Curve Tool", src: icon("curve-tool-28.svg") },
          { name: "Text", src: icon("text-28.svg") },
          { name: "Comment", src: icon("comment-28.svg") },
          { name: "Click Through", src: icon("click-through-28.svg") },
          { name: "Boolean Union", src: icon("boolean-union-28.svg") },
          { name: "Boolean Subtract", src: icon("boolean-subtract-28.svg") },
          { name: "Boolean Intersect", src: icon("boolean-intersect-28.svg") },
          { name: "Boolean Exclude", src: icon("boolean-exclude-28.svg") },
        ],
      },
      {
        label: "Left-layer",
        items: [
          { name: "Frame", src: icon("frame.svg") },
          { name: "Text", src: icon("text.svg") },
          { name: "Group", src: icon("group.svg") },
          { name: "Component", src: icon("component.svg") },
          { name: "Instance", src: icon("instance.svg") },
          { name: "Align Vertical", src: icon("align-vertical.svg") },
          { name: "Align Horizontal", src: icon("align-horizontal.svg") },
          { name: "Align Left", src: icon("align-left_as-group.svg") },
          { name: "Align Center", src: icon("align-center-horizontal.svg") },
          { name: "Align Right", src: icon("align-right_as-group.svg") },
          { name: "Eye Open", src: icon("general-eye open.svg") },
          { name: "Eye Closed", src: icon("general-eye closed.svg") },
          { name: "Search", src: icon("general-search.svg") },
          { name: "Add", src: icon("add.svg") },
          { name: "Chevron Up", src: icon("general-Chevron Up.svg") },
          { name: "Cross", src: icon("general-Cross.svg") },
          { name: "Triangle Down", src: icon("general-triangle down.svg") },
        ],
      },
      {
        label: "L/TopBar (28dp)",
        items: [
          { name: "Hamburger", src: icon("menu-hamburger-28.svg") },
          { name: "Adjust", src: icon("general-adjust.svg") },
          { name: "Library", src: icon("general-library-32.svg") },
          { name: "Comment", src: icon("general-comment-smiley.svg") },
          { name: "Pop-up", src: icon("general-Pop-up.svg") },
          { name: "Link", src: icon("general--link.svg") },
          { name: "Folder", src: icon("general-folder.svg") },
          { name: "Component", src: icon("general-component master.svg") },
          { name: "Instance", src: icon("general-component instance.svg") },
          { name: "Download", src: icon("general-download.svg") },
          { name: "Cross", src: icon("general-close-32.svg") },
        ],
      },
    ],
  },
];

const ICON_SHORTCUT_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => icon(`keyshort-${letter.toLowerCase()}.svg`));
const ICON_SHORTCUT_NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((digit) => icon(`keyshort-${digit}.svg`));
const ICON_SHORTCUT_SYMBOLS = [
  icon("keyshort-add.svg"),
  icon("keyshort-min.svg"),
  icon("keyshort-dot.svg"),
  icon("keyshort-re-slash.svg"),
  icon("keyshort-slash.svg"),
  icon("keyshort-single-quote.svg"),
  icon("keyshort-left-bracket.svg"),
  icon("keyshort-right-bracket.svg"),
  icon("keyshort-cmd.svg"),
  icon("keyshort-shift.svg"),
  icon("keyshort-alt.svg"),
  icon("keyshort-control.svg"),
  icon("keyshort-rightArrow.svg"),
];

const ICON_SPECIAL_ANY_SIZE: IconItem[] = [
  { name: "Check", src: icon("general-check circled.svg") },
  { name: "Minus", src: icon("general-minus.svg") },
  { name: "Loading", src: icon("general-loading.svg") },
  { name: "Chevron Up", src: icon("general-Chevron Up.svg") },
  { name: "Center Horizontal", src: icon("Center-horizontal.svg") },
  { name: "Center Vertical", src: icon("Center-vertical.svg") },
  { name: "Arrow Width", src: icon("general-arrow-width.svg") },
  { name: "Arrow Height", src: icon("general-arrow-hight.svg") },
  { name: "Absolute Position", src: icon("absolute-position.svg") },
  { name: "Collapse", src: icon("collapse.svg") },
  { name: "Close", src: icon("close.svg") },
];

const BASE_COMPONENT_DOCS: ImageDoc[] = [
  { label: "Avatar", src: "/projects/project-6/base_component/avatar.png" },
  { label: "Badges", src: "/projects/project-6/base_component/Badges.png" },
  { label: "Button", src: "/projects/project-6/base_component/Button.png" },
  { label: "Checkbox", src: "/projects/project-6/base_component/Checkbox.png" },
  { label: "Collapse", src: "/projects/project-6/base_component/Collapse.png" },
  { label: "Color Container", src: "/projects/project-6/base_component/Color Container - wip.png" },
  { label: "Corner Radius", src: "/projects/project-6/base_component/Corner Radius.png" },
  { label: "Editable Select", src: "/projects/project-6/base_component/EditableSelect.png" },
  { label: "Editor Input Value", src: "/projects/project-6/base_component/Editor Input Value.png" },
  { label: "Generic Input", src: "/projects/project-6/base_component/Generic Input.png" },
  { label: "Menu", src: "/projects/project-6/base_component/Menu.png" },
  { label: "Option Menu", src: "/projects/project-6/base_component/Option Menu.png" },
  { label: "Option Strip", src: "/projects/project-6/base_component/Option Strip.png" },
  { label: "Panels", src: "/projects/project-6/base_component/Panels.png" },
  { label: "Radio Group", src: "/projects/project-6/base_component/Radio-Group.png" },
  { label: "Responsive Layout", src: "/projects/project-6/base_component/Responsive layout.png" },
  { label: "Scroll Bar", src: "/projects/project-6/base_component/Scroll Bar.png" },
  { label: "Segment", src: "/projects/project-6/base_component/Segment.png" },
  { label: "Select", src: "/projects/project-6/base_component/Select.png" },
  { label: "Separator", src: "/projects/project-6/base_component/Separator.png" },
  { label: "Slider Dot", src: "/projects/project-6/base_component/Slider-Dot.png" },
  { label: "Slider Dot 1", src: "/projects/project-6/base_component/Slider-Dot-1.png" },
  { label: "Spin", src: "/projects/project-6/base_component/Spin.png" },
  { label: "Tabs Strip", src: "/projects/project-6/base_component/Tabs strip.png" },
  { label: "Toast", src: "/projects/project-6/base_component/Toast.png" },
  { label: "Tooltip", src: "/projects/project-6/base_component/ToolTip.png" },
  { label: "Color Picker", src: "/projects/project-6/base_component/colorpicker.png" },
  { label: "Switch", src: "/projects/project-6/base_component/switch.png" },
  { label: "Auto Layout", src: "/projects/project-6/base_component/auto layout.png" },
];

const EDITOR_ONLY_COMPONENT_LABELS = new Set([
  "Color Container",
  "Corner Radius",
  "Editable Select",
  "Editor Input Value",
  "Responsive Layout",
  "Slider Dot 1",
  "Slider Dot",
  "Color Picker",
  "Auto Layout",
]);

const UI_TOPBAR_DOCS: ImageDoc[] = [
  { label: "TopBar", src: "/projects/project-6/base_component/TopBar.png" },
];

const UI_TOOLBAR_DOCS: PdfDoc[] = [
  { label: "Toolbar", src: "/projects/project-6/UI/右侧面板/ToolBar.pdf" },
];

const UI_LEFT_PANEL_GROUPS: PdfDocGroup[] = [
  {
    label: "Structure",
    docs: [
      { label: "Layer UI Rules", src: "/projects/project-6/UI/左侧面板/图层 UI 规则.vector.pdf" },
      { label: "Layer Panel Icons", src: "/projects/project-6/UI/左侧面板/图层面板图标.vector.pdf" },
      { label: "Layer Single Row", src: "/projects/project-6/UI/左侧面板/图层 Single Row.vector.pdf" },
      { label: "Expand / Collapse Layers", src: "/projects/project-6/UI/左侧面板/展开收起图层.vector.pdf" },
    ],
  },
  {
    label: "Selection & Discovery",
    docs: [
      { label: "Selection Logic", src: "/projects/project-6/UI/左侧面板/选中逻辑（单选、多选）.vector.pdf" },
      { label: "Search", src: "/projects/project-6/UI/左侧面板/搜索.vector.pdf" },
      { label: "Filter", src: "/projects/project-6/UI/左侧面板/筛选.vector.pdf" },
      { label: "Slot System", src: "/projects/project-6/UI/左侧面板/[共有部分] 插槽系统.vector.pdf" },
    ],
  },
  {
    label: "Layout & Overflow",
    docs: [
      { label: "Sticky", src: "/projects/project-6/UI/左侧面板/Sticky.vector.pdf" },
      { label: "Box Model & Spacing Rules", src: "/projects/project-6/UI/左侧面板/盒子模型与间距规则.vector.pdf" },
      { label: "Resize Left Panel", src: "/projects/project-6/UI/左侧面板/调整左侧面板宽度.vector.pdf" },
      { label: "Overflow Scroll", src: "/projects/project-6/UI/左侧面板/超出滚动.vector.pdf" },
      { label: "Cross-Layer Move Interaction", src: "/projects/project-6/UI/左侧面板/【P2】待评估后决策是否处理.vector.pdf" },
    ],
  },
];

const UI_RIGHT_PANEL_GROUPS: PdfDocGroup[] = [
  {
    label: "Core Panels",
    docs: [
      { label: "All", src: "/projects/project-6/UI/右侧面板/All.pdf" },
      { label: "Editor Panels UI 2.0", src: "/projects/project-6/UI/右侧面板/Editor Panels UI 2.0.pdf" },
      { label: "Components", src: "/projects/project-6/UI/右侧面板/组件.pdf" },
    ],
  },
  {
    label: "Editing Panels",
    docs: [
      { label: "Transform Panel", src: "/projects/project-6/UI/右侧面板/Transform Panel.pdf" },
      { label: "Text", src: "/projects/project-6/UI/右侧面板/Text.pdf" },
      { label: "Alignment Settings", src: "/projects/project-6/UI/右侧面板/对齐设置.pdf" },
      { label: "Color Background", src: "/projects/project-6/UI/右侧面板/Color Background.pdf" },
    ],
  },
  {
    label: "Advanced Case",
    docs: [
      { label: "Secondary Panel Positioning", src: "/projects/project-6/UI/右侧面板/唤出二级面板定位.pdf" },
    ],
  },
];

export function Project6ColorTokensPanel() {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [mode, setMode] = useState<"light" | "dark">("light");
  const visibleRows = COLOR_ROWS.filter((row) => {
    const isDarkRow = row.label.includes("Dark");
    return mode === "dark" ? isDarkRow : !isDarkRow;
  });

  const copyValue = (value: string, label: string) => {
    if (value === "-") return;
    navigator.clipboard.writeText(value).catch(() => {});
    setCopiedLabel(label);
    window.setTimeout(() => {
      setCopiedLabel((current) => (current === label ? null : current));
    }, 1200);
  };

  return (
    <div
      className={`relative rounded-[32px] border px-8 py-8 shadow-[0_18px_60px_rgba(17,24,39,0.06)] transition-colors duration-200 ${
        mode === "light" ? "border-border/25 bg-white text-[#111827]" : "border-white/10 bg-[#282829] text-white"
      }`}
    >
      <div className={`flex items-center justify-between gap-4 border-b pb-6 ${mode === "light" ? "border-border/20" : "border-white/10"}`}>
        <h4 className={`text-[26px] font-semibold tracking-tight ${mode === "light" ? "text-[#111827]" : "text-white"}`}>Colors</h4>
        <div className={`inline-flex rounded-full border p-1 ${mode === "light" ? "border-border/20 bg-[#f8fafc]" : "border-white/10 bg-white/5"}`}>
          {(["light", "dark"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                mode === value
                  ? value === "light"
                    ? "bg-white text-[#111827] shadow-sm"
                    : "bg-white text-[#111827] shadow-sm"
                  : mode === "light"
                    ? "text-[#6b7280]"
                    : "text-white/65"
              }`}
            >
              {value === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-12 pt-8">
        <ColorTokenIntroRow
          label="Base"
          items={BASE_SWATCHES}
          onCopy={copyValue}
          copiedLabel={copiedLabel}
          mode={mode}
        />
        <ColorTokenIntroRow
          label="Background"
          items={BACKGROUND_SWATCHES}
          onCopy={copyValue}
          copiedLabel={copiedLabel}
          mode={mode}
        />

        <div className="space-y-9">
          {visibleRows.map((row) => (
            <div key={row.label} className="grid gap-5 xl:grid-cols-[92px_minmax(0,1fr)] xl:items-start">
              <div className={`pt-2 text-[15px] font-medium ${mode === "light" ? "text-[#111827]" : "text-white"}`}>{row.label}</div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-11">
                {row.values.map((item) => (
                    <ColorTokenButton
                      key={`${row.label}-${item.step}`}
                      label={`${row.label} ${item.step}`}
                      value={item.hex}
                      style={item.style}
                      transparent={item.transparent}
                      onCopy={copyValue}
                      copied={copiedLabel === `${row.label} ${item.step}`}
                      step={item.step}
                      mode={mode}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 right-6">
        <div
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
            copiedLabel ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          } ${mode === "light" ? "border border-black/8 bg-black text-white" : "border border-white/10 bg-white text-[#111827]"}`}
        >
          {copiedLabel ? `已复制 ${copiedLabel}` : ""}
        </div>
      </div>
    </div>
  );
}

function ColorTokenButton({
  label,
  value,
  style,
  transparent,
  onCopy,
  copied,
  step,
  mode,
}: {
  label: string;
  value: string;
  style?: React.CSSProperties;
  transparent?: boolean;
  onCopy: (value: string, label: string) => void;
  copied: boolean;
  step: string;
  mode: "light" | "dark";
}) {
  return (
    <button
      type="button"
      onClick={() => onCopy(value, label)}
      className="group min-w-0 rounded-xl text-left transition-transform duration-150 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2794fb]/55"
    >
      <ColorSquare style={style} transparent={transparent} copied={copied} />
      <p className={`mt-2 text-[13px] font-medium leading-none ${mode === "light" ? "text-[#111827]" : "text-white"}`}>{step}</p>
      <p className={`mt-1 text-[12px] leading-none ${mode === "light" ? "text-[#6b7280]" : "text-white/72"}`}>{value}</p>
      <p className={`mt-2 text-[11px] leading-none opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${mode === "light" ? "text-[#8a94a6]" : "text-white/50"}`}>
        {value === "-" ? "不可复制" : copied ? "Copied" : "Click to copy"}
      </p>
    </button>
  );
}

function ColorTokenIntroRow({
  label,
  items,
  onCopy,
  copiedLabel,
  mode,
}: {
  label: string;
  items: { label: string; hex: string; style?: React.CSSProperties; transparent?: boolean }[];
  onCopy: (value: string, label: string) => void;
  copiedLabel: string | null;
  mode: "light" | "dark";
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[92px_minmax(0,1fr)] xl:items-start">
      <div className={`pt-2 text-[15px] font-medium ${mode === "light" ? "text-[#111827]" : "text-white"}`}>{label}</div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:max-w-[420px]">
          {items.map((item) => (
            <button
              key={`${label}-${item.label}`}
              type="button"
              onClick={() => onCopy(item.hex, `${label} ${item.label}`)}
              className="group min-w-0 rounded-xl text-left transition-transform duration-150 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2794fb]/55"
            >
              <ColorSquare
                style={item.style}
                transparent={item.transparent}
                copied={copiedLabel === `${label} ${item.label}`}
              />
              <p className={`mt-2 text-[13px] font-medium leading-none ${mode === "light" ? "text-[#111827]" : "text-white"}`}>{item.label}</p>
              <p className={`mt-1 text-[12px] leading-none ${mode === "light" ? "text-[#6b7280]" : "text-white/72"}`}>{item.hex}</p>
              <p className={`mt-2 text-[11px] leading-none opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${mode === "light" ? "text-[#8a94a6]" : "text-white/50"}`}>
                {item.hex === "-" ? "不可复制" : copiedLabel === `${label} ${item.label}` ? "Copied" : "Click to copy"}
              </p>
            </button>
          ))}
      </div>
    </div>
  );
}

function ColorSquare({
  style,
  transparent = false,
  copied = false,
}: {
  style?: React.CSSProperties;
  transparent?: boolean;
  copied?: boolean;
}) {
  return (
    <div
      className={`relative h-10 w-full overflow-hidden rounded-[6px] border bg-white transition-all duration-150 ${
        copied ? "border-[#2794fb]/60 shadow-[0_0_0_3px_rgba(39,148,251,0.12)]" : "border-black/8"
      }`}
    >
      {transparent ? (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(45deg, rgba(15,23,42,0.08) 25%, transparent 25%, transparent 75%, rgba(15,23,42,0.08) 75%), linear-gradient(45deg, rgba(15,23,42,0.08) 25%, transparent 25%, transparent 75%, rgba(15,23,42,0.08) 75%)",
            backgroundSize: "12px 12px",
            backgroundPosition: "0 0, 6px 6px",
          }}
        />
      ) : null}
      <div className="absolute inset-0" style={style} />
    </div>
  );
}

export function Project6TypographyPanel() {
  return (
    <div className="rounded-[32px] border border-border/25 bg-white px-8 py-8 text-[#111827] shadow-[0_18px_60px_rgba(17,24,39,0.06)]">
      <div className="border-b border-border/20 pb-6">
        <h4 className="text-[26px] font-semibold tracking-tight text-[#111827]">Typography</h4>
      </div>

      <div className="space-y-10 pt-8">
        <div className="space-y-4">
          <h5 className="text-[18px] font-semibold text-[#111827]">Font Family</h5>

          <div className="rounded-2xl border border-border/25 overflow-hidden">
            <div className="border-b border-border/15 bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-[#111827]">
              font-family
            </div>
            <div className="px-4 py-4 font-mono text-[13px] leading-6 text-[#4b5563]">
              Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu,
              Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
            </div>
            <div className="grid border-t border-border/15 text-sm md:grid-cols-3">
              <div className="border-r border-border/15 px-4 py-3">
                <p className="text-xs text-[#6b7280]">系统</p>
                <p className="mt-2 font-medium text-[#111827]">中文</p>
                <p className="mt-1 text-[#4b5563]">Sans-serif</p>
                <p className="mt-3 text-[#4b5563]">Mac: PingFang SC</p>
                <p className="mt-1 text-[#4b5563]">Win: Microsoft YaHei</p>
              </div>
              <div className="border-r border-border/15 px-4 py-3">
                <p className="text-xs text-[#6b7280]">英⽂ / 数字 / 符号</p>
                <p className="mt-2 font-medium text-[#111827]">Segoe UI / Inter</p>
                <p className="mt-1 text-[#4b5563]">优先保持系统原生阅读感</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs text-[#6b7280]">下载</p>
                <a
                  href="https://fonts.google.com/download?family=Inter"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex rounded-full border border-border/25 px-3 py-1.5 text-xs font-medium text-[#111827] hover:bg-[#f8fafc]"
                >
                  Inter 下载
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h5 className="text-[18px] font-semibold text-[#111827]">Weight</h5>
          <div className="grid gap-4 md:grid-cols-3">
            {TYPOGRAPHY_WEIGHTS.map(([label, spec, brand]) => (
              <div key={label} className="rounded-2xl border border-border/25 p-4">
                <p className="text-sm font-semibold text-[#111827]">{label}</p>
                <p className="mt-3 text-[28px] tracking-tight text-[#111827]" style={{ fontWeight: spec.includes("400") ? 400 : spec.includes("500") ? 500 : 600 }}>
                  即时设计
                </p>
                <p className="mt-3 text-xs text-[#6b7280]">{brand}</p>
                <p className="mt-1 text-xs text-[#4b5563]">{spec}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h5 className="text-[18px] font-semibold text-[#111827]">Line Height</h5>
          <div className="rounded-2xl border border-border/25 overflow-hidden">
            <div className="grid bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-[#111827] md:grid-cols-[140px_180px_180px_1fr]">
              <div>类型</div>
              <div>规则</div>
              <div>适用场景</div>
              <div>示例</div>
            </div>
            {TYPOGRAPHY_LINE_HEIGHT.map(([label, rule, usage, sample]) => (
              <div key={label} className="grid border-t border-border/10 px-4 py-4 text-sm md:grid-cols-[140px_180px_180px_1fr]">
                <div className="font-medium text-[#111827]">{label}</div>
                <div className="text-[#4b5563]">{rule}</div>
                <div className="text-[#4b5563]">{usage}</div>
                <div className="text-[#4b5563]">{sample}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h5 className="text-[18px] font-semibold text-[#111827]">Type Scale</h5>
          <div className="space-y-5">
          {TYPE_SCALE.map(([label, spec], index) => {
            const samples = [
              "text-[32px] leading-[40px]",
              "text-[24px] leading-[32px]",
              "text-[18px] leading-[28px]",
              "text-[16px] leading-[24px]",
              "text-[14px] leading-[22px]",
              "text-[13px] leading-[20px]",
            ];

            return (
              <div key={label} className="grid gap-4 border-t border-border/15 pt-5 md:grid-cols-[88px_120px_1fr_1fr_1fr]">
                <div className="text-sm font-semibold text-[#111827]">{label}</div>
                <div className="text-sm text-[#6b7280]">{spec}</div>
                <div className={`${samples[index]} font-medium tracking-tight text-[#111827]`}>
                  即时设计测试字体，每个平台的原生排版
                </div>
                <div className={`${samples[index]} font-medium tracking-tight text-[#111827]`}>
                  即时设计测试字体，每个平台的原生排版
                </div>
                <div className={`${samples[index]} font-medium tracking-tight text-[#111827]`}>
                  即时设计测试字体，每个平台的原生排版
                </div>
              </div>
            );
          })}
          </div>
        </div>

        <div className="grid gap-8 border-t border-border/15 pt-8 md:grid-cols-[1fr_180px]">
          <div>
            <h5 className="text-[18px] font-semibold text-[#111827]">特殊字符</h5>
            <div className="mt-4 grid gap-3 text-sm text-[#4b5563] md:grid-cols-3">
              <p>abcdefghijklmnopqrstuvwxyz</p>
              <p>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
              <p>0123456789. !?@#%()[]+-=/</p>
            </div>
          </div>
          <div>
            <h5 className="text-[18px] font-semibold text-[#111827]">下载</h5>
            <a
              href="https://fonts.google.com/download?family=Inter"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-full border border-border/25 px-3 py-1.5 text-sm font-medium text-[#111827] hover:bg-[#f8fafc]"
            >
              Inter 下载
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Project6LayoutPanel() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token).catch(() => {});
    setCopiedToken(token);
    window.setTimeout(() => {
      setCopiedToken((current) => (current === token ? null : current));
    }, 1200);
  };

  return (
    <div className="relative rounded-[32px] border border-border/25 bg-white px-8 py-8 text-[#111827] shadow-[0_18px_60px_rgba(17,24,39,0.06)]">
      <div className="border-b border-border/20 pb-6">
        <h4 className="text-[26px] font-semibold tracking-tight text-[#111827]">Spacing</h4>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-border/20 pt-8">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#f8fafc]">
            <tr className="border-b border-border/15">
              <th className="px-6 py-4 text-sm font-semibold text-[#111827]">Token</th>
              <th className="px-6 py-4 text-sm font-semibold text-[#111827]">Value</th>
              <th className="px-6 py-4 text-sm font-semibold text-[#111827]">Preview</th>
            </tr>
          </thead>
          <tbody>
            {SPACING_SCALE.map((item) => (
              <tr key={item.token} className="border-b border-border/10 last:border-b-0">
                <td className="px-6 py-5">
                  <button
                    type="button"
                    onClick={() => copyToken(item.token)}
                    className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      copiedToken === item.token
                        ? "border-[#2794fb]/45 bg-[#eff6ff] text-[#1d4ed8]"
                        : "border-border/20 bg-white text-[#111827] hover:bg-[#f8fafc]"
                    }`}
                  >
                    {item.token}
                  </button>
                </td>
                <td className="px-6 py-5 text-sm text-[#6b7280]">{item.value}</td>
                <td className="px-6 py-5">
                  <div className="flex h-[100px] items-center justify-center">
                    <div className="flex items-center" style={{ gap: item.size }}>
                      <div className="h-10 w-10 rounded-[12px] bg-[#eef2f7]" />
                      <div className="h-10 w-10 rounded-[12px] bg-[#d7dee8]" />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pointer-events-none absolute bottom-6 right-6">
        <div
          className={`rounded-full border border-black/8 bg-black px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 ${
            copiedToken ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          {copiedToken ? `已复制 ${copiedToken}` : ""}
        </div>
      </div>
    </div>
  );
}

export function Project6ShadowMotionPanel() {
  const [copiedShadow, setCopiedShadow] = useState<string | null>(null);

  const copyShadow = (token: string, value: string) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopiedShadow(token);
    window.setTimeout(() => {
      setCopiedShadow((current) => (current === token ? null : current));
    }, 1200);
  };

  return (
    <div className="relative rounded-[32px] border border-border/25 bg-white px-8 py-8 text-[#111827] shadow-[0_18px_60px_rgba(17,24,39,0.06)]">
      <div className="border-b border-border/20 pb-6">
        <h4 className="text-[26px] font-semibold tracking-tight text-[#111827]">Box Shadow</h4>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-border/20 pt-8">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#f8fafc]">
            <tr className="border-b border-border/15">
              <th className="px-6 py-4 text-sm font-semibold text-[#111827]">Token</th>
              <th className="px-6 py-4 text-sm font-semibold text-[#111827]">Usage</th>
              <th className="px-6 py-4 text-sm font-semibold text-[#111827]">Light</th>
              <th className="px-6 py-4 text-sm font-semibold text-[#111827]">Dark</th>
              <th className="px-6 py-4 text-sm font-semibold text-[#111827]">Preview</th>
            </tr>
          </thead>
          <tbody>
            {SHADOW_SCALE.map((item) => (
              <tr key={item.token} className="border-b border-border/10 last:border-b-0">
                <td className="px-6 py-5">
                  <button
                    type="button"
                    onClick={() => copyShadow(item.token, `${item.token}\nLight: ${item.light}\nDark: ${item.dark}`)}
                    className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      copiedShadow === item.token
                        ? "border-[#2794fb]/45 bg-[#eff6ff] text-[#1d4ed8]"
                        : "border-border/20 bg-white text-[#111827] hover:bg-[#f8fafc]"
                    }`}
                  >
                    {item.token}
                  </button>
                </td>
                <td className="px-6 py-5 text-sm text-[#6b7280]">{item.examples}</td>
                <td className="px-6 py-5 text-xs leading-6 text-[#6b7280]">{item.light}</td>
                <td className="px-6 py-5 text-xs leading-6 text-[#6b7280]">{item.dark}</td>
                <td className="px-6 py-5">
                  <div className="flex h-[100px] items-center justify-center">
                    <div className="h-[100px] w-[100px] rounded-[24px] bg-white" style={{ boxShadow: item.light }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pointer-events-none absolute bottom-6 right-6">
        <div
          className={`rounded-full border border-black/8 bg-black px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 ${
            copiedShadow ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          {copiedShadow ? `已复制 ${copiedShadow}` : ""}
        </div>
      </div>
    </div>
  );
}

export function Project6IconSystemPanel() {
  const [copiedIcon, setCopiedIcon] = useState<string | null>(null);

  const copyIcon = (value: string) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopiedIcon(value);
    window.setTimeout(() => {
      setCopiedIcon((current) => (current === value ? null : current));
    }, 1200);
  };

  return (
    <div className="relative rounded-[32px] border border-border/25 bg-white px-8 py-8 text-[#111827] shadow-[0_18px_60px_rgba(17,24,39,0.06)]">
      <div className="border-b border-border/20 pb-6">
        <h4 className="text-[26px] font-semibold tracking-tight text-[#111827]">Icon Library</h4>
      </div>

      <div className="space-y-12 pt-8">
        {ICON_REFERENCE_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-6">
            <h5 className="text-[18px] font-semibold text-[#111827]">{section.title}</h5>
            <div className="space-y-7">
              {section.rows.map((row) => (
                <IconReferenceRow key={`${section.title}-${row.label}`} label={row.label} items={row.items} onCopy={copyIcon} copiedIcon={copiedIcon} />
              ))}
            </div>
          </div>
        ))}

        <div className="space-y-6">
          <h5 className="text-[18px] font-semibold text-[#111827]">MenuKeyShort</h5>
          <div className="space-y-5">
            <IconShortcutRow label="" items={ICON_SHORTCUT_LETTERS} onCopy={copyIcon} copiedIcon={copiedIcon} />
            <IconShortcutRow label="" items={ICON_SHORTCUT_NUMBERS} onCopy={copyIcon} copiedIcon={copiedIcon} />
            <IconShortcutRow label="" items={ICON_SHORTCUT_SYMBOLS} onCopy={copyIcon} copiedIcon={copiedIcon} />
          </div>
        </div>

        <div className="space-y-6">
          <h5 className="text-[18px] font-semibold text-[#111827]">Special (Any Size)</h5>
          <IconReferenceRow label="" items={ICON_SPECIAL_ANY_SIZE} onCopy={copyIcon} copiedIcon={copiedIcon} />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 right-6">
        <div
          className={`rounded-full border border-black/8 bg-black px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 ${
            copiedIcon ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          {copiedIcon ? `已复制 ${copiedIcon.split("/").pop()}` : ""}
        </div>
      </div>
    </div>
  );
}

function IconReferenceRow({
  label,
  items,
  onCopy,
  copiedIcon,
}: {
  label: string;
  items: IconItem[];
  onCopy: (value: string) => void;
  copiedIcon: string | null;
}) {
  const hasLabel = Boolean(label.trim());

  return (
    <div className={`grid gap-4 md:items-start ${hasLabel ? "md:grid-cols-[140px_minmax(0,1fr)]" : "md:grid-cols-1"}`}>
      {hasLabel ? <div className="pt-1 text-sm text-[#6b7280]">{label}</div> : null}
      <div className={`flex flex-wrap ${hasLabel ? "gap-x-4 gap-y-3" : "gap-x-5 gap-y-4"}`}>
        {items.map((item) => (
          <button
            key={`${label}-${item.name}`}
            type="button"
            onClick={() => onCopy(item.src)}
            title={item.name}
            className={`flex h-8 w-8 items-center justify-center rounded-[10px] transition-all duration-150 hover:bg-[#f5f7fb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2794fb]/55 ${
              copiedIcon === item.src ? "bg-[#eff6ff] shadow-[0_0_0_2px_rgba(39,148,251,0.15)]" : ""
            }`}
          >
            <Image
              src={encodeURI(item.src)}
              alt={item.name}
              width={20}
              height={20}
              className="max-h-5 max-w-5 object-contain"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function IconShortcutRow({
  label,
  items,
  onCopy,
  copiedIcon,
}: {
  label: string;
  items: string[];
  onCopy: (value: string) => void;
  copiedIcon: string | null;
}) {
  const hasLabel = Boolean(label.trim());

  return (
    <div className={`grid gap-4 md:items-start ${hasLabel ? "md:grid-cols-[140px_minmax(0,1fr)]" : "md:grid-cols-1"}`}>
      {hasLabel ? <div className="pt-1 text-sm text-[#6b7280]">{label}</div> : null}
      <div className="grid grid-cols-8 gap-x-7 gap-y-4 sm:grid-cols-10 lg:grid-cols-13 xl:grid-cols-15">
        {items.map((src) => (
          <button
            key={src}
            type="button"
            onClick={() => onCopy(src)}
            className={`flex h-7 w-7 items-center justify-center rounded-[8px] transition-all duration-150 hover:bg-[#f5f7fb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2794fb]/55 ${
              copiedIcon === src ? "bg-[#eff6ff] shadow-[0_0_0_2px_rgba(39,148,251,0.15)]" : ""
            }`}
          >
            <Image
              src={encodeURI(src)}
              alt={src.split("/").pop() ?? "shortcut"}
              width={18}
              height={18}
              className="max-h-[18px] max-w-[18px] object-contain"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function Project6BaseComponentPanel() {
  const generalComponents = BASE_COMPONENT_DOCS.filter((doc) => !EDITOR_ONLY_COMPONENT_LABELS.has(doc.label));
  const editorOnlyComponents = BASE_COMPONENT_DOCS.filter((doc) => EDITOR_ONLY_COMPONENT_LABELS.has(doc.label));
  const [selectedGeneralDoc, setSelectedGeneralDoc] = useState<ImageDoc>(generalComponents[0]);
  const [selectedEditorDoc, setSelectedEditorDoc] = useState<ImageDoc>(editorOnlyComponents[0]);

  return (
    <div className="space-y-8 text-[#111827]">
      <div className="space-y-4">
        <h5 className="text-[18px] font-semibold text-white">General Components</h5>
        <NavigationPreviewShell
          sidebar={
            <div className="space-y-2">
              {generalComponents.map((doc) => (
                <SidebarNavButton
                  key={doc.src}
                  active={selectedGeneralDoc.src === doc.src}
                  onClick={() => setSelectedGeneralDoc(doc)}
                  label={doc.label}
                />
              ))}
            </div>
          }
          preview={<ImageViewerFrame doc={selectedGeneralDoc} />}
          actionHref={encodeURI(selectedGeneralDoc.src)}
          actionLabel="Open Image"
        />
      </div>

      <div className="space-y-4">
        <h5 className="text-[18px] font-semibold text-white">Business Components</h5>
        <NavigationPreviewShell
          sidebar={
            <div className="space-y-2">
              {editorOnlyComponents.map((doc) => (
                <SidebarNavButton
                  key={doc.src}
                  active={selectedEditorDoc.src === doc.src}
                  onClick={() => setSelectedEditorDoc(doc)}
                  label={doc.label}
                />
              ))}
            </div>
          }
          preview={<ImageViewerFrame doc={selectedEditorDoc} />}
          actionHref={encodeURI(selectedEditorDoc.src)}
          actionLabel="Open Image"
        />
      </div>
    </div>
  );
}

export function Project6UIPanel() {
  const [selectedTopbarDoc, setSelectedTopbarDoc] = useState<ImageDoc>(UI_TOPBAR_DOCS[0]);
  const [selectedToolbarDoc, setSelectedToolbarDoc] = useState<PdfDoc>(UI_TOOLBAR_DOCS[0]);
  const [selectedRightDoc, setSelectedRightDoc] = useState<PdfDoc>(UI_RIGHT_PANEL_GROUPS[0].docs[0]);
  const [selectedLeftDoc, setSelectedLeftDoc] = useState<PdfDoc>(UI_LEFT_PANEL_GROUPS[0].docs[0]);

  return (
    <div className="space-y-8 text-[#111827]">
      <div className="space-y-4">
        <h4 className="text-[26px] font-semibold tracking-tight text-white">Left Panel</h4>
        <NavigationPreviewShell
          sidebar={
            <>
              {UI_LEFT_PANEL_GROUPS.map((group) => (
                <div key={group.label} className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#111827]">{group.label}</p>
                  <div className="space-y-2">
                    {group.docs.map((doc) => (
                      <SidebarNavButton
                        key={doc.src}
                        active={selectedLeftDoc.src === doc.src}
                        onClick={() => setSelectedLeftDoc(doc)}
                        label={doc.label}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </>
          }
          preview={<PdfViewerFrame doc={selectedLeftDoc} heightClassName="h-[760px]" />}
          actionHref={`${encodeURI(selectedLeftDoc.src)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
          actionLabel="Open PDF"
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-[26px] font-semibold tracking-tight text-white">Right Panel</h4>
        <NavigationPreviewShell
          sidebar={
            <>
              {UI_RIGHT_PANEL_GROUPS.map((group) => (
                <div key={group.label} className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#111827]">{group.label}</p>
                  <div className="space-y-2">
                    {group.docs.map((doc) => (
                      <SidebarNavButton
                        key={doc.src}
                        active={selectedRightDoc.src === doc.src}
                        onClick={() => setSelectedRightDoc(doc)}
                        label={doc.label}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </>
          }
          preview={<PdfViewerFrame doc={selectedRightDoc} heightClassName="h-[760px]" />}
          actionHref={`${encodeURI(selectedRightDoc.src)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
          actionLabel="Open PDF"
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-[26px] font-semibold tracking-tight text-white">Top Bar</h4>
        <NavigationPreviewShell
          sidebar={
            <div className="space-y-2">
              {UI_TOPBAR_DOCS.map((doc) => (
                <SidebarNavButton
                  key={doc.src}
                  active={selectedTopbarDoc.src === doc.src}
                  onClick={() => setSelectedTopbarDoc(doc)}
                  label={doc.label}
                />
              ))}
            </div>
          }
          preview={<ImageViewerFrame doc={selectedTopbarDoc} />}
          actionHref={encodeURI(selectedTopbarDoc.src)}
          actionLabel="Open Image"
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-[26px] font-semibold tracking-tight text-white">Toolbar</h4>
        <NavigationPreviewShell
          sidebar={
            <div className="space-y-2">
              {UI_TOOLBAR_DOCS.map((doc) => (
                <SidebarNavButton
                  key={doc.src}
                  active={selectedToolbarDoc.src === doc.src}
                  onClick={() => setSelectedToolbarDoc(doc)}
                  label={doc.label}
                />
              ))}
            </div>
          }
          preview={<PdfViewerFrame doc={selectedToolbarDoc} heightClassName="h-[760px]" />}
          actionHref={`${encodeURI(selectedToolbarDoc.src)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
          actionLabel="Open PDF"
        />
      </div>
    </div>
  );
}

function NavigationPreviewShell({
  sidebar,
  preview,
  actionHref,
  actionLabel,
}: {
  sidebar: React.ReactNode;
  preview: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
      <div className="grid min-h-[720px] xl:grid-cols-[264px_minmax(0,1fr)]">
        <div className="border-b border-black/8 bg-[#f6f7f8] p-5 xl:border-b-0 xl:border-r">
          <SidebarScrollArea>{sidebar}</SidebarScrollArea>
        </div>
        <div className="space-y-4 bg-[#fbfbfc] p-5 md:p-6">
          {actionHref ? (
            <div className="flex justify-end">
              <a
                href={actionHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f6f7f8]"
              >
                {actionLabel}
              </a>
            </div>
          ) : null}
          {preview}
        </div>
      </div>
    </div>
  );
}

function SidebarScrollArea({
  children,
}: {
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    const element = scrollRef.current;
    if (!element) return;

    const { deltaY } = event;
    const canScroll = element.scrollHeight > element.clientHeight;

    if (!canScroll) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    element.scrollTop += deltaY;
  };

  return (
    <div
      ref={scrollRef}
      onWheel={handleWheel}
      className="max-h-[720px] space-y-5 overflow-y-auto pr-1 overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {children}
    </div>
  );
}

function SidebarNavButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[18px] border px-4 py-3.5 text-left text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2794fb]/55 ${
        active
          ? "border-[#2794fb]/40 bg-white text-[#111827] shadow-[0_0_0_3px_rgba(39,148,251,0.08)]"
          : "border-black/8 bg-white/78 text-[#4b5563] hover:border-black/12 hover:bg-white"
      }`}
    >
      {label}
    </button>
  );
}

function PdfViewerFrame({
  doc,
  heightClassName,
}: {
  doc: PdfDoc;
  heightClassName: string;
}) {
  const pdfSrc = `${encodeURI(doc.src)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;

  return (
    <div className="overflow-hidden rounded-[24px] border border-black/8 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
      <iframe title={doc.label} src={pdfSrc} className={`w-full bg-white ${heightClassName}`} />
    </div>
  );
}

function ImageViewerFrame({
  doc,
}: {
  doc: ImageDoc;
}) {
  const imageSrc = encodeURI(doc.src);

  return (
    <div className="overflow-hidden rounded-[24px] border border-black/8 bg-white">
      <div className="overflow-auto bg-[#f5f6f8] p-5">
        <div className="mx-auto max-w-[1400px] rounded-[18px] border border-black/5 bg-white p-3 shadow-[0_10px_32px_rgba(15,23,42,0.05)]">
          <Image
            src={imageSrc}
            alt={doc.label}
            width={1400}
            height={2200}
            className="h-auto w-full rounded-[12px] object-contain"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}
