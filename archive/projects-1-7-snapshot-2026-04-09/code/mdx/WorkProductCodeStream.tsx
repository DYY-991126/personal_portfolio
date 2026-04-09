"use client";

import { useEffect, useState } from "react";
import CodeStreamGlowLayer from "./CodeStreamGlowLayer";

const CODE_LINES = [
  '<span class="keyword">import</span> { <span class="class-name">Injectable</span>, <span class="class-name">UnauthorizedException</span> } <span class="keyword">from</span> <span class="string">\'@nestjs/common\'</span>;',
  '<span class="keyword">import</span> { <span class="class-name">JwtService</span> } <span class="keyword">from</span> <span class="string">\'@nestjs/jwt\'</span>;',
  '<span class="keyword">import</span> { <span class="class-name">UserService</span> } <span class="keyword">from</span> <span class="string">\'./user.service\'</span>;',
  '<span class="keyword">import</span> * <span class="keyword">as</span> <span class="variable">bcrypt</span> <span class="keyword">from</span> <span class="string">\'bcrypt\'</span>;',
  "",
  '<span class="comment">// 用户认证服务</span>',
  '@<span class="function">Injectable</span>()',
  '<span class="keyword">export</span> <span class="keyword">class</span> <span class="class-name">AuthService</span> {',
  '  <span class="keyword">constructor</span>(',
  '    <span class="keyword">private</span> <span class="variable">userService</span>: <span class="class-name">UserService</span>,',
  '    <span class="keyword">private</span> <span class="variable">jwtService</span>: <span class="class-name">JwtService</span>,',
  '  ) {}',
  "",
  '  <span class="comment">// 验证用户凭证</span>',
  '  <span class="keyword">async</span> <span class="function">validateUser</span>(<span class="variable">email</span>: <span class="class-name">string</span>, <span class="variable">password</span>: <span class="class-name">string</span>) {',
  '    <span class="keyword">const</span> <span class="variable">user</span> <span class="operator">=</span> <span class="keyword">await</span> <span class="keyword">this</span>.<span class="property">userService</span>.<span class="function">findByEmail</span>(<span class="variable">email</span>);',
  "    ",
  '    <span class="keyword">if</span> (<span class="operator">!</span><span class="variable">user</span>) {',
  '      <span class="keyword">throw</span> <span class="keyword">new</span> <span class="function">UnauthorizedException</span>(<span class="string">\'Invalid credentials\'</span>);',
  '    }',
];

const CURSOR_IMG = "/projects/project-3/cursor.png";
const GLOW_VARIANT_COUNT = 4;

function getPartialHTML(htmlString: string, targetLength: number): string {
  if (targetLength >= htmlString.length) return htmlString;
  let visibleChars = 0;
  let result = "";
  let inTag = false;
  let currentTag = "";
  const openTags: string[] = [];
  for (let i = 0; i < htmlString.length; i++) {
    const char = htmlString[i];
    if (char === "<") {
      inTag = true;
      currentTag = "<";
    } else if (char === ">" && inTag) {
      currentTag += ">";
      result += currentTag;
      if (currentTag.startsWith("</")) openTags.pop();
      else if (!currentTag.includes("/>")) {
        const m = currentTag.match(/<(\w+)/);
        if (m) openTags.push(m[1]);
      }
      inTag = false;
      currentTag = "";
    } else if (inTag) {
      currentTag += char;
    } else {
      if (visibleChars < targetLength) {
        result += char;
        visibleChars++;
      } else break;
    }
  }
  while (openTags.length > 0) result += "</" + openTags.pop()! + ">";
  return result;
}

/** 做设计结果物：流式代码输出动画，源自小绿写代码 demo */
export default function WorkProductCodeStream() {
  const [html, setHtml] = useState("");
  const [glowIndex, setGlowIndex] = useState(0);
  const [alignBottom, setAlignBottom] = useState(false); // 行数满 7 时贴底向上堆叠
  const maxVisibleLines = 7;

  useEffect(() => {
    const lineRef = { current: 0 };
    const charRef = { current: 0 };

    /** 高度固定，内容从底部向上写：始终显示最后 maxVisibleLines 行，光标行在底部 */
    const getVisibleLines = (curLine: number, partial = "") => {
      const start = Math.max(0, curLine - maxVisibleLines + 1);
      const lines: string[] = [];
      for (let i = start; i <= curLine; i++) {
        if (i < curLine) lines.push(CODE_LINES[i]!);
        else lines.push(partial);
      }
      return lines.join("<br>");
    };

    const run = () => {
      const line = lineRef.current;
      const char = charRef.current;
      if (line >= CODE_LINES.length) {
        lineRef.current = 0;
        charRef.current = 0;
        setAlignBottom(false);
        setGlowIndex((i) => (i + 1) % GLOW_VARIANT_COUNT);
        setTimeout(run, 0);
        return;
      }
      const codeLine = CODE_LINES[line]!;
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = codeLine;
      const plainLen = (tempDiv.textContent || "").length;

      if (char <= plainLen) {
        const partial = getPartialHTML(codeLine, char);
        const lineCount = Math.min(line + 1, maxVisibleLines);
        setAlignBottom(lineCount >= maxVisibleLines);
        setHtml(getVisibleLines(line, partial));
        charRef.current += Math.floor(Math.random() * 2) + 1;
        setTimeout(run, 20 + Math.random() * 30);
      } else {
        const lineCount = Math.min(line + 2, maxVisibleLines);
        setAlignBottom(lineCount >= maxVisibleLines);
        setHtml(getVisibleLines(line + 1));
        lineRef.current = line + 1;
        charRef.current = 0;
        setTimeout(run, 100);
      }
    };

    const t = setTimeout(run, 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative h-[140px] min-w-0 w-full overflow-hidden rounded-xl border"
      style={{
        backgroundColor: "#FFF",
        borderColor: "#EBEBEB",
        fontFamily: "var(--font-mono), SF Mono, Monaco, Inconsolata, Fira Code, Consolas, monospace",
      }}
    >
      <CodeStreamGlowLayer variant={glowIndex} />

      {/* 代码内容层 - 开始时居中写，行数满 7 后贴底向上堆叠 */}
      <div
        className={`relative z-2 flex h-[140px] flex-col overflow-hidden py-4 pl-12 pr-20 ${alignBottom ? "justify-end" : "justify-center"}`}
        style={{ fontSize: 11, lineHeight: 1.6, color: "#24292e" }}
      >
        <div
          className="code-stream-syntax w-full"
          dangerouslySetInnerHTML={{
            __html:
              html +
              `<span class="code-stream-cursor" style="background-image:url('${CURSOR_IMG}')"></span>`,
          }}
        />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
.code-stream-syntax .keyword { color: #E91E63; font-weight: 500; }
.code-stream-syntax .function { color: #3B82F6; }
.code-stream-syntax .string { color: #22C55E; }
.code-stream-syntax .variable, .code-stream-syntax .operator { color: #1F2937; }
.code-stream-syntax .comment { color: #9CA3AF; font-style: italic; }
.code-stream-syntax .class-name, .code-stream-syntax .property { color: #F59E0B; font-weight: 500; }
.code-stream-cursor {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-left: 3px;
  background-size: 20px 20px;
  background-repeat: no-repeat;
  background-position: center;
  vertical-align: middle;
  animation: code-stream-cursorGlow 1.2s ease-in-out infinite;
}
`,
      }} />
    </div>
  );
}
