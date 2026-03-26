"use client";

import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Group,
  MathUtils,
  MeshPhysicalMaterial,
  Points,
  TubeGeometry,
  Vector3,
} from "three";

const ASCII_CHARSET = " .,:;i1tfLCG08@";
const GRID_COLUMNS = 76;
const GRID_ROWS = 44;
const ASCII_FRAME_INTERVAL = 1000 / 30;
const STEM_COLOR = new Color("#7ee787");
const PETAL_INNER = new Color("#ecfeff");
const PETAL_OUTER = new Color("#d9f99d");
const PETAL_COOL = new Color("#c4b5fd");

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function mapAsciiChar(brightness: number, edge: number) {
  const weight = MathUtils.clamp(brightness * 0.82 + edge * 0.35, 0, 1);
  const index = Math.min(
    ASCII_CHARSET.length - 1,
    Math.floor(weight * (ASCII_CHARSET.length - 1)),
  );
  return ASCII_CHARSET[index];
}

function createPetalMaterial(color: Color, emissiveIntensity: number) {
  return new MeshPhysicalMaterial({
    color,
    emissive: color.clone().multiplyScalar(0.8),
    emissiveIntensity,
    metalness: 0.08,
    roughness: 0.45,
    transmission: 0.02,
    thickness: 0.5,
    transparent: true,
    opacity: 0.92,
    side: DoubleSide,
  });
}

function AsciiOverlay({
  sourceCanvasRef,
  reducedMotion,
}: {
  sourceCanvasRef: MutableRefObject<HTMLCanvasElement | null>;
  reducedMotion: boolean;
}) {
  const displayRef = useRef<HTMLCanvasElement>(null);
  const samplerRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    samplerRef.current = document.createElement("canvas");
  }, []);

  useEffect(() => {
    let frameId = 0;
    let lastRender = 0;

    const renderAscii = (time: number) => {
      const sourceCanvas = sourceCanvasRef.current;
      const displayCanvas = displayRef.current;
      const samplerCanvas = samplerRef.current;

      if (!sourceCanvas || !displayCanvas || !samplerCanvas) {
        frameId = window.requestAnimationFrame(renderAscii);
        return;
      }

      if (time - lastRender < ASCII_FRAME_INTERVAL) {
        frameId = window.requestAnimationFrame(renderAscii);
        return;
      }
      lastRender = time;

      const bounds = displayCanvas.getBoundingClientRect();
      const width = Math.max(1, Math.floor(bounds.width));
      const height = Math.max(1, Math.floor(bounds.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);

      if (displayCanvas.width !== Math.floor(width * dpr) || displayCanvas.height !== Math.floor(height * dpr)) {
        displayCanvas.width = Math.floor(width * dpr);
        displayCanvas.height = Math.floor(height * dpr);
      }

      const sampleColumns = reducedMotion ? 56 : GRID_COLUMNS;
      const sampleRows = reducedMotion ? 32 : GRID_ROWS;

      samplerCanvas.width = sampleColumns;
      samplerCanvas.height = sampleRows;

      const samplerContext = samplerCanvas.getContext("2d", { willReadFrequently: true });
      const displayContext = displayCanvas.getContext("2d");

      if (!samplerContext || !displayContext) {
        frameId = window.requestAnimationFrame(renderAscii);
        return;
      }

      samplerContext.imageSmoothingEnabled = true;
      samplerContext.clearRect(0, 0, sampleColumns, sampleRows);
      samplerContext.drawImage(sourceCanvas, 0, 0, sampleColumns, sampleRows);

      const pixels = samplerContext.getImageData(0, 0, sampleColumns, sampleRows).data;
      const cellWidth = displayCanvas.width / sampleColumns;
      const cellHeight = displayCanvas.height / sampleRows;
      const charSize = Math.min(cellWidth * 1.06, cellHeight * 1.28);
      const jitter = reducedMotion ? 0 : Math.sin(time * 0.00085) * 0.1;

      displayContext.save();
      displayContext.scale(dpr, dpr);
      displayContext.clearRect(0, 0, width, height);
      displayContext.fillStyle = "#020402";
      displayContext.fillRect(0, 0, width, height);
      displayContext.globalCompositeOperation = "lighter";
      displayContext.font = `${charSize}px var(--font-mono), monospace`;
      displayContext.textAlign = "center";
      displayContext.textBaseline = "middle";

      for (let y = 0; y < sampleRows; y += 1) {
        for (let x = 0; x < sampleColumns; x += 1) {
          const index = (y * sampleColumns + x) * 4;
          const r = pixels[index];
          const g = pixels[index + 1];
          const b = pixels[index + 2];
          const alpha = pixels[index + 3] / 255;

          if (alpha < 0.05) {
            continue;
          }

          const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          if (brightness < 0.045) {
            continue;
          }

          const leftBrightness =
            x > 0
              ? (0.2126 * pixels[index - 4] + 0.7152 * pixels[index - 3] + 0.0722 * pixels[index - 2]) / 255
              : brightness;
          const topIndex = index - sampleColumns * 4;
          const topBrightness =
            y > 0
              ? (0.2126 * pixels[topIndex] + 0.7152 * pixels[topIndex + 1] + 0.0722 * pixels[topIndex + 2]) / 255
              : brightness;
          const edge = Math.min(1, Math.abs(brightness - leftBrightness) * 2.8 + Math.abs(brightness - topBrightness) * 2.8);
          const char = mapAsciiChar(brightness, edge);
          const hueDrift = 0.9 + edge * 0.25 + brightness * 0.1;
          const glowAlpha = Math.min(0.95, alpha * (0.5 + brightness * 0.7 + edge * 0.2));
          const drawX = (x + 0.5) * (width / sampleColumns);
          const drawY = (y + 0.5) * (height / sampleRows);

          displayContext.shadowBlur = brightness > 0.72 ? Math.max(1.5, charSize * 0.22) : 0;
          displayContext.shadowColor = `rgba(${Math.min(255, r * 1.06)}, ${Math.min(255, g * 1.08)}, ${Math.min(255, b * 1.08)}, ${Math.min(0.45, glowAlpha)})`;
          displayContext.fillStyle = `rgba(${Math.min(255, r * hueDrift)}, ${Math.min(255, g * hueDrift)}, ${Math.min(255, b * 1.08)}, ${Math.min(1, glowAlpha + 0.1)})`;
          displayContext.fillText(char, drawX + jitter, drawY);
        }
      }

      displayContext.globalCompositeOperation = "screen";
      const gradient = displayContext.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "rgba(190,255,225,0.06)");
      gradient.addColorStop(0.45, "rgba(255,255,255,0)");
      gradient.addColorStop(1, "rgba(120,255,210,0.08)");
      displayContext.fillStyle = gradient;
      displayContext.fillRect(0, 0, width, height);

      if (!reducedMotion) {
        displayContext.fillStyle = "rgba(255,255,255,0.035)";
        for (let i = 0; i < 2; i += 1) {
          const scanY = (height * ((time * 0.00005 + i * 0.23) % 1));
          displayContext.fillRect(0, scanY, width, 1);
        }
      }

      displayContext.restore();
      frameId = window.requestAnimationFrame(renderAscii);
    };

    frameId = window.requestAnimationFrame(renderAscii);
    return () => window.cancelAnimationFrame(frameId);
  }, [reducedMotion, sourceCanvasRef]);

  return (
    <canvas
      ref={displayRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

function Atmosphere({ reducedMotion }: { reducedMotion: boolean }) {
  const pointsRef = useRef<Points<BufferGeometry>>(null);
  const [geometry] = useState(() => {
    const particleCount = 1200;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i += 1) {
      const radius = 1.5 + Math.random() * 3.6;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.2) * 8;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius * 0.75;
      sizes[i] = 0.7 + Math.random() * 1.6;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("aSize", new BufferAttribute(sizes, 1));
    return geometry;
  });

  useFrame((state) => {
    if (!pointsRef.current || reducedMotion) {
      return;
    }

    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.08;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#d9fff0"
        size={reducedMotion ? 0.018 : 0.025}
        transparent
        opacity={0.22}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function Stem({ growth }: { growth: number }) {
  const material = useMemo(() => {
    const base = STEM_COLOR.clone();
    return new MeshPhysicalMaterial({
      color: base,
      emissive: base.clone().multiplyScalar(0.68),
      emissiveIntensity: 1.4,
      roughness: 0.34,
      metalness: 0.02,
      clearcoat: 0.3,
    });
  }, []);

  const tubeGeometry = useMemo(() => {
    const curve = new CatmullRomCurve3([
      new Vector3(0, -2.6, 0),
      new Vector3(0.16, -1.4, -0.08),
      new Vector3(-0.22, -0.3, 0.12),
      new Vector3(0.1, 1.15, 0.02),
      new Vector3(0, 1.82, 0),
    ]);
    return new TubeGeometry(curve, 140, 0.075, 12, false);
  }, []);

  return (
    <mesh
      geometry={tubeGeometry}
      material={material}
      scale={[1, Math.max(0.001, growth), 1]}
      position={[0, -2.6 + 2.6 * growth, 0]}
      castShadow
      receiveShadow
    />
  );
}

function Leaf({
  side,
  progressRef,
  delay,
}: {
  side: 1 | -1;
  progressRef: MutableRefObject<{ growth: number; bloom: number }>;
  delay: number;
}) {
  const ref = useRef<Group>(null);
  const material = useMemo(
    () =>
      createPetalMaterial(
        side > 0 ? new Color("#9df58f") : new Color("#72f4ca"),
        1.15,
      ),
    [side],
  );

  useFrame((state) => {
    if (!ref.current) {
      return;
    }

    const growth = progressRef.current.growth;
    const local = smoothstep(delay, delay + 0.22, growth);
    ref.current.position.set(side * 0.22, -0.35 + local * 0.18, side * 0.06);
    ref.current.rotation.set(
      side * 0.4 - local * 0.1,
      side * (0.6 + local * 0.5),
      side * (0.2 + local * 0.3),
    );
    ref.current.scale.setScalar(Math.max(0.001, local * (1 + Math.sin(state.clock.elapsedTime * 1.2 + side) * 0.03)));
  });

  return (
    <group ref={ref}>
      <mesh material={material} castShadow>
        <sphereGeometry args={[0.25, 26, 22]} />
      </mesh>
    </group>
  );
}

function FlowerHead({
  progressRef,
}: {
  progressRef: MutableRefObject<{ growth: number; bloom: number }>;
}) {
  const groupRef = useRef<Group>(null);
  const petalRefs = useRef<Group[]>([]);
  const innerMaterial = useMemo(() => createPetalMaterial(PETAL_INNER, 1.45), []);
  const middleMaterial = useMemo(() => createPetalMaterial(PETAL_OUTER, 1.3), []);
  const accentMaterial = useMemo(() => createPetalMaterial(PETAL_COOL, 1.2), []);
  const coreMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color("#f0fdf4"),
        emissive: new Color("#d9f99d"),
        emissiveIntensity: 2.4,
        roughness: 0.2,
        metalness: 0.04,
        transmission: 0.2,
      }),
    [],
  );

  const petals = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => {
        const ring = index < 6 ? 0 : index < 12 ? 1 : 2;
        const ringIndex = ring === 0 ? index : ring === 1 ? index - 6 : index - 12;
        const count = ring === 0 ? 6 : 6;
        const angle = (ringIndex / count) * Math.PI * 2 + ring * 0.36;
        const baseTilt = ring === 0 ? 0.7 : ring === 1 ? 1.02 : 1.24;
        const radius = ring === 0 ? 0.34 : ring === 1 ? 0.56 : 0.76;
        const delay = 0.08 + ring * 0.12 + ringIndex * 0.018;
        return { angle, baseTilt, radius, delay, ring };
      }),
    [],
  );

  useFrame((state) => {
    const bloom = progressRef.current.bloom;

    if (groupRef.current) {
      groupRef.current.scale.setScalar(0.24 + bloom * 0.96);
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.6) * 0.08;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.18;
    }

    petalRefs.current.forEach((petal, index) => {
      if (!petal) {
        return;
      }

      const config = petals[index];
      const local = smoothstep(config.delay, Math.min(1, config.delay + 0.42), bloom);
      const flutter = Math.sin(state.clock.elapsedTime * 1.7 + config.angle * 2.4) * 0.045 * local;
      const spread = config.baseTilt + local * (0.52 + config.ring * 0.14);

      petal.position.set(
        Math.cos(config.angle) * config.radius * local,
        local * (0.14 + config.ring * 0.05),
        Math.sin(config.angle) * config.radius * local,
      );
      petal.rotation.set(spread + flutter, config.angle, Math.sin(config.angle * 2 + state.clock.elapsedTime * 0.8) * 0.08);
      petal.scale.set(0.28 + config.ring * 0.07, 0.62 + local * 0.18, 0.12);
    });
  });

  return (
    <group ref={groupRef} position={[0, 1.9, 0]}>
      {petals.map((petal, index) => (
        <group
          key={`${petal.angle}-${petal.ring}`}
          ref={(node) => {
            if (node) {
              petalRefs.current[index] = node;
            }
          }}
        >
          <mesh material={petal.ring === 0 ? innerMaterial : petal.ring === 1 ? middleMaterial : accentMaterial} castShadow>
            <sphereGeometry args={[0.42, 32, 24]} />
          </mesh>
        </group>
      ))}

      <mesh material={coreMaterial} castShadow>
        <sphereGeometry args={[0.2, 26, 26]} />
      </mesh>

      <mesh material={accentMaterial} position={[0, 0.04, 0]}>
        <torusGeometry args={[0.26, 0.038, 20, 60]} />
      </mesh>
    </group>
  );
}

function Scene({
  reducedMotion,
  onCanvasReady,
}: {
  reducedMotion: boolean;
  onCanvasReady: (canvas: HTMLCanvasElement | null) => void;
}) {
  const rootRef = useRef<Group>(null);
  const cameraGoal = useRef(new Vector3(0, 0.8, 8.8));

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime;
    const cycle = reducedMotion ? 0.88 : 1;
    const bloom = smoothstep(2.4, 7.2, elapsed * cycle);

    if (rootRef.current) {
      rootRef.current.position.y = -0.3 + Math.sin(elapsed * 0.3) * 0.05;
      rootRef.current.rotation.y = elapsed * 0.12 + bloom * 0.18;
      rootRef.current.rotation.z = Math.sin(elapsed * 0.28) * 0.06;
    }

    const radius = MathUtils.lerp(8.8, 4.8, bloom);
    const orbit = elapsed * (reducedMotion ? 0.12 : 0.22);
    cameraGoal.current.set(
      Math.sin(orbit) * 1.2,
      0.7 + bloom * 0.9 + Math.sin(elapsed * 0.34) * 0.12,
      radius + Math.cos(orbit * 0.7) * 0.35,
    );
    state.camera.position.lerp(cameraGoal.current, 1 - Math.exp(-delta * 2.6));
    state.camera.lookAt(0, 1.25 + bloom * 0.55, 0);
  });

  useEffect(() => {
    return () => onCanvasReady(null);
  }, [onCanvasReady]);

  const elapsedGrowth = (time: number) => smoothstep(0.8, 4.2, time);
  const elapsedBloom = (time: number) => smoothstep(2.4, 7.2, time);

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#020502", 4.8, 12.5]} />
      <ambientLight intensity={0.18} color="#bfffe8" />
      <directionalLight position={[2.4, 4.2, 4.4]} intensity={1.9} color="#f8fff3" />
      <pointLight position={[0, 2, 1.5]} intensity={1.8} distance={8} color="#d4fff0" />
      <pointLight position={[0, 1.6, -1.8]} intensity={1.25} distance={9} color="#b0ffd0" />

      <group ref={rootRef}>
        <AnimatedGarden reducedMotion={reducedMotion} growthAt={elapsedGrowth} bloomAt={elapsedBloom} />
      </group>

      <Atmosphere reducedMotion={reducedMotion} />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.18}
          luminanceSmoothing={0.3}
          intensity={1.35}
          radius={0.72}
        />
        <Noise opacity={reducedMotion ? 0.012 : 0.025} />
        <Vignette eskil={false} offset={0.18} darkness={0.88} />
      </EffectComposer>
    </>
  );
}

function AnimatedGarden({
  reducedMotion,
  growthAt,
  bloomAt,
}: {
  reducedMotion: boolean;
  growthAt: (time: number) => number;
  bloomAt: (time: number) => number;
}) {
  const stemGroup = useRef<Group>(null);
  const headGroup = useRef<Group>(null);
  const progressRef = useRef({ growth: 0, bloom: 0 });

  useFrame((state) => {
    const scaledTime = state.clock.elapsedTime * (reducedMotion ? 0.88 : 1);
    const growth = growthAt(scaledTime);
    const bloom = bloomAt(scaledTime);
    const sway = Math.sin(state.clock.elapsedTime * 0.55) * 0.04;
    progressRef.current.growth = growth;
    progressRef.current.bloom = bloom;

    if (stemGroup.current) {
      stemGroup.current.scale.y = Math.max(0.001, growth);
      stemGroup.current.position.y = -2.6 + 2.6 * growth;
      stemGroup.current.rotation.z = sway * growth;
      stemGroup.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.03 * growth;
    }

    if (headGroup.current) {
      headGroup.current.position.y = -2.6 + 4.5 * growth + sway * 0.5;
      headGroup.current.scale.setScalar(0.75 + bloom * 0.25);
    }
  });

  return (
    <group>
      <group ref={stemGroup}>
        <Stem growth={1} />
      </group>
      <Leaf side={1} progressRef={progressRef} delay={0.28} />
      <Leaf side={-1} progressRef={progressRef} delay={0.42} />
      <group ref={headGroup}>
        <FlowerHead progressRef={progressRef} />
      </group>
    </group>
  );
}

export default function AsciiFlowerExperience() {
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,255,207,0.12),transparent_30%),radial-gradient(circle_at_70%_30%,rgba(200,244,255,0.10),transparent_35%),linear-gradient(180deg,#020402_0%,#000_100%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-between px-6 py-6 md:px-10 md:py-8">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-xl">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.42em] text-emerald-200/65">
                Procedural ASCII Bloom
              </p>
              <h1 className="text-3xl font-semibold tracking-[0.04em] text-white md:text-5xl">
                A flower that grows out of darkness, entirely translated into colored ASCII light.
              </h1>
            </div>
            <div className="hidden max-w-sm text-right font-mono text-[11px] leading-6 tracking-[0.24em] text-emerald-100/45 md:block">
              CAMERA / DOLLY IN / ORBIT<br />
              BLOOM / FOG / SCANLINES<br />
              PURE ASCII OUTPUT / COLORIZED
            </div>
          </div>

          <div className="relative mt-6 flex-1 overflow-hidden rounded-[2rem] border border-white/10 bg-black/50 shadow-[0_0_80px_rgba(94,255,182,0.12)]">
            <Canvas
              dpr={[1, 1.8]}
              camera={{ position: [0, 0.8, 8.5], fov: 35, near: 0.1, far: 50 }}
              gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
              onCreated={({ gl }) => {
                sourceCanvasRef.current = gl.domElement;
              }}
              className="absolute inset-0 opacity-0"
            >
              <Scene
                reducedMotion={reducedMotion}
                onCanvasReady={(canvas) => {
                  sourceCanvasRef.current = canvas;
                }}
              />
            </Canvas>

            <AsciiOverlay sourceCanvasRef={sourceCanvasRef} reducedMotion={reducedMotion} />

            <div className="pointer-events-none absolute inset-x-6 bottom-6 flex items-end justify-between gap-6 md:inset-x-8 md:bottom-8">
              <div className="max-w-md rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md">
                <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-emerald-200/55">
                  Visual Notes
                </p>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  The stem rises first, petals unfold in staggered rings, then the camera eases inward while the ASCII bloom intensifies.
                </p>
              </div>
              <div className="hidden rounded-2xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-100/50 backdrop-blur-md md:block">
                120 x 68 GRID<br />
                COLOR-INHERITED GLYPHS<br />
                SOFT PHOSPHOR HALATION
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
