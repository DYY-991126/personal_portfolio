"use client";

import { useEffect, useRef, useState } from "react";

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

varying vec2 vUv;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform float uMotion;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float gridLine(vec2 uv, float scale) {
  vec2 grid = abs(fract(uv * scale - 0.5) - 0.5);
  float line = min(grid.x, grid.y);
  float thickness = mix(0.045, 0.016, min(scale / 2.5, 1.0));
  return 1.0 - smoothstep(thickness, thickness + 0.012, line);
}

mat3 lookAt(vec3 ro, vec3 ta, float roll) {
  vec3 forward = normalize(ta - ro);
  vec3 right = normalize(cross(forward, vec3(sin(roll), cos(roll), 0.0)));
  vec3 up = cross(right, forward);
  return mat3(right, up, forward);
}

float planeIntersect(vec3 ro, vec3 rd, float height) {
  float denom = rd.y;
  if (abs(denom) < 0.001) {
    return -1.0;
  }
  return (height - ro.y) / denom;
}

float glow(vec2 uv, vec2 center, vec2 stretch, float power) {
  vec2 d = (uv - center) / stretch;
  return pow(max(0.0, 1.0 - dot(d, d)), power);
}

float starField(vec2 uv, float time) {
  vec2 cell = floor(uv * 28.0);
  float acc = 0.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 offset = vec2(float(i), float(j));
      vec2 id = cell + offset;
      float twinkleSeed = hash21(id);
      vec2 point = id + vec2(hash21(id + 4.13), hash21(id + 1.27));
      vec2 delta = fract(uv * 28.0) - point + cell;
      float sparkle = smoothstep(0.055, 0.0, length(delta));
      float twinkle = 0.55 + 0.45 * sin(time * (0.6 + twinkleSeed * 2.0) + twinkleSeed * 6.2831);
      acc += sparkle * twinkle;
    }
  }
  return acc;
}

void main() {
  vec2 frag = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);
  vec2 pointer = uPointer * uMotion;

  vec3 ro = vec3(pointer.x * 0.75, 1.28 + pointer.y * 0.18, 6.5 - uMotion * 0.15);
  vec3 ta = vec3(pointer.x * 0.18, 0.18 + pointer.y * 0.12, 0.0);
  mat3 cam = lookAt(ro, ta, 0.0);
  vec3 rd = cam * normalize(vec3(frag, -1.65));

  vec3 col = vec3(0.008, 0.012, 0.018);

  float horizon = smoothstep(-0.35, 0.95, rd.y);
  col += mix(vec3(0.01, 0.02, 0.03), vec3(0.02, 0.09, 0.08), 1.0 - horizon) * 0.55;

  float tFloor = planeIntersect(ro, rd, -1.15);
  if (tFloor > 0.0) {
    vec3 p = ro + rd * tFloor;
    float nearFade = smoothstep(11.5, 0.5, tFloor);
    float farFade = exp(-0.045 * tFloor * tFloor);
    float primaryGrid = gridLine(p.xz, 0.62);
    float secondaryGrid = gridLine(p.xz + vec2(0.0, uTime * 0.03), 2.5);
    vec3 floorBase = vec3(0.01, 0.022, 0.024);
    vec3 floorGlow = vec3(0.04, 0.28, 0.23) * primaryGrid * 0.36;
    floorGlow += vec3(0.06, 0.13, 0.20) * secondaryGrid * 0.11;
    float aisle = smoothstep(2.2, 0.1, abs(p.x));
    floorGlow += vec3(0.02, 0.09, 0.14) * aisle * 0.18;
    col = mix(col, floorBase + floorGlow, nearFade * farFade);
  }

  float portal = glow(frag, vec2(0.0, 0.18), vec2(1.1, 1.35), 1.7);
  col += vec3(0.0, 0.13, 0.10) * portal * 0.19;
  col += vec3(0.11, 0.18, 0.28) * pow(portal, 2.3) * 0.12;

  float leftBeam = glow(frag, vec2(-1.12 + pointer.x * 0.05, -0.08), vec2(0.46, 1.5), 1.35);
  float rightBeam = glow(frag, vec2(1.12 + pointer.x * 0.05, -0.08), vec2(0.46, 1.5), 1.35);
  col += vec3(0.05, 0.24, 0.20) * leftBeam * 0.42;
  col += vec3(0.08, 0.16, 0.28) * rightBeam * 0.32;

  float topHalo = glow(frag, vec2(0.0, -0.95 + pointer.y * 0.05), vec2(1.45, 0.62), 1.5);
  col += vec3(0.15, 0.22, 0.20) * topHalo * 0.08;

  float stars = starField(vUv * 0.82 + vec2(0.0, uTime * 0.004), uTime);
  col += vec3(0.22, 0.45, 0.56) * stars * 0.16;

  float drift = sin(uTime * 0.22 + frag.y * 2.8) * 0.5 + 0.5;
  col += vec3(0.02, 0.06, 0.07) * drift * 0.04;

  float vignette = smoothstep(1.45, 0.28, length(frag * vec2(0.92, 1.18)));
  col *= vignette;

  col = pow(col, vec3(0.95));
  gl_FragColor = vec4(col, 1.0);
}
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

  if (!vertexShader || !fragmentShader) {
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

function getInitialReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function HomeWebGLScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getInitialReducedMotion);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsReady(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      premultipliedAlpha: true,
    });

    if (!gl) {
      setIsReady(false);
      return;
    }

    const program = createProgram(gl);
    if (!program) {
      setIsReady(false);
      return;
    }

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    const resolutionLocation = gl.getUniformLocation(program, "uResolution");
    const timeLocation = gl.getUniformLocation(program, "uTime");
    const pointerLocation = gl.getUniformLocation(program, "uPointer");
    const motionLocation = gl.getUniformLocation(program, "uMotion");

    const buffer = gl.createBuffer();
    if (!buffer) {
      gl.deleteProgram(program);
      setIsReady(false);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
      ]),
      gl.STATIC_DRAW,
    );

    const pointer = {
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0,
    };

    let motion = 0.92;
    let targetMotion = 0.92;
    let keyboardMotionUntil = 0;
    let frameId = 0;
    let isVisible = !document.hidden;
    let mounted = true;

    const updateInteractionState = () => {
      const activeElement = document.activeElement;
      const isFormControl =
        activeElement instanceof HTMLElement &&
        (activeElement.matches("input, textarea, select, button, a, summary, [role='button']") ||
          activeElement.isContentEditable);

      const keyboardSuppressed = keyboardMotionUntil > performance.now();
      if (isFormControl) {
        targetMotion = 0.16;
        return;
      }

      targetMotion = keyboardSuppressed ? 0.32 : 0.92;
    };

    const resize = () => {
      const maxDpr = window.innerWidth < 900 ? 0.85 : 1;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const width = Math.max(1, Math.floor(window.innerWidth * dpr));
      const height = Math.max(1, Math.floor(window.innerHeight * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.targetY = (event.clientY / window.innerHeight) * 2 - 1;
    };

    const resetPointer = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) {
        resetPointer();
      }
    };

    const handleKeyDown = () => {
      keyboardMotionUntil = performance.now() + 1400;
      updateInteractionState();
    };

    const handleFocus = () => {
      updateInteractionState();
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible && mounted && frameId === 0) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      if (mounted) {
        setIsReady(false);
      }
    };

    const render = (time: number) => {
      if (!mounted) {
        return;
      }

      frameId = 0;
      if (!isVisible) {
        return;
      }

      pointer.currentX += (pointer.targetX - pointer.currentX) * 0.06;
      pointer.currentY += (pointer.targetY - pointer.currentY) * 0.06;
      motion += (targetMotion - motion) * 0.07;

      updateInteractionState();

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, time * 0.001);
      gl.uniform2f(pointerLocation, pointer.currentX, pointer.currentY);
      gl.uniform1f(motionLocation, motion);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      frameId = window.requestAnimationFrame(render);
    };

    resize();
    updateInteractionState();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerout", handlePointerOut);
    window.addEventListener("blur", resetPointer);
    window.addEventListener("keydown", handleKeyDown, { passive: true });
    window.addEventListener("focusin", handleFocus);
    window.addEventListener("focusout", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    canvas.addEventListener("webglcontextlost", handleContextLost);

    frameId = window.requestAnimationFrame(render);
    setIsReady(true);

    return () => {
      mounted = false;
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("blur", resetPointer);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("focusin", handleFocus);
      window.removeEventListener("focusout", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [prefersReducedMotion]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${isReady ? "opacity-100" : "opacity-0"}`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(130,255,223,0.12),transparent_28%),radial-gradient(circle_at_50%_92%,rgba(28,152,189,0.18),transparent_32%),linear-gradient(180deg,rgba(5,9,13,0.08),rgba(1,3,5,0.4))]" />
      <div className="absolute inset-x-0 bottom-0 h-[38vh] bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.46)_68%,rgba(0,0,0,0.74))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_44%,rgba(0,0,0,0.34)_100%)]" />
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${prefersReducedMotion ? "opacity-100" : "opacity-0"}`}
      >
        <div className="absolute inset-x-[8%] top-[12%] h-[34%] rounded-full bg-[radial-gradient(circle,rgba(82,255,197,0.12),rgba(82,255,197,0)_70%)] blur-3xl" />
        <div className="absolute inset-x-[10%] bottom-[10%] h-[24%] bg-[linear-gradient(180deg,rgba(41,116,134,0),rgba(41,116,134,0.18)_52%,rgba(4,11,18,0.02))]" />
      </div>
    </div>
  );
}
