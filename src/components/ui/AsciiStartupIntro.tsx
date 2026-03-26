"use client";

import { motion } from "framer-motion";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { ForwardedRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, Effect } from "postprocessing";
import * as THREE from "three";

interface AsciiStartupIntroProps {
  onComplete: () => void;
  phase: "intro" | "handoff";
}

const LOOP_DURATION_MS = 12000;

const asciiFragmentShader = `
uniform sampler2D tAscii;
uniform float characters;
uniform float charSize;
uniform vec2 resolution;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 cell = resolution / charSize;
    vec2 grid = floor(uv * cell) / cell;
    vec4 color = texture2D(inputBuffer, grid + 0.5 / cell);
    float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    luminance = clamp(luminance * 2.2, 0.0, 1.0);
    float charIndex = floor(luminance * (characters - 1.0));
    vec2 charUv = fract(uv * cell);
    vec2 asciiUv = vec2((charIndex + charUv.x) / characters, charUv.y);
    vec4 asciiColor = texture2D(tAscii, asciiUv);
    outputColor = vec4(color.rgb * asciiColor.r, 1.0);
}
`;

class AsciiEffectImpl extends Effect {
  constructor(texture: THREE.Texture, characters = 10, charSize = 24) {
    const uniforms = new Map<string, THREE.IUniform>([
      ["tAscii", new THREE.Uniform(texture)],
      ["characters", new THREE.Uniform(characters)],
      ["charSize", new THREE.Uniform(charSize)],
      ["resolution", new THREE.Uniform(new THREE.Vector2())],
    ]);

    super("AsciiEffect", asciiFragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms,
    });
  }

  override setSize(width: number, height: number): void {
    this.uniforms.get("resolution")?.value.set(width, height);
  }
}

interface AsciiEffectProps {
  texture: THREE.Texture;
  characters?: number;
  charSize?: number;
}

const AsciiEffect = forwardRef(function AsciiEffect(
  { texture, characters = 10, charSize = 24 }: AsciiEffectProps,
  ref: ForwardedRef<AsciiEffectImpl>
) {
  const effect = useMemo(
    () => new AsciiEffectImpl(texture, characters, charSize),
    [texture, characters, charSize]
  );

  return <primitive ref={ref} object={effect} dispose={null} />;
});

function useAsciiTexture() {
  const [textureData] = useState<{ texture: THREE.Texture; numChars: number } | null>(() => {
    if (typeof document === "undefined") {
      return null;
    }

    const chars = " .:-=+*#%@";
    const numChars = chars.length;
    const canvas = document.createElement("canvas");
    const charWidth = 64;

    canvas.width = charWidth * numChars;
    canvas.height = charWidth;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 48px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < numChars; i += 1) {
      ctx.fillText(chars[i], i * charWidth + charWidth / 2, charWidth / 2 + 4);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    return { texture, numChars };
  });

  return textureData;
}

function FlowerCluster() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const numFlowers = 45;
  const petalsPerFlower = 45;
  const totalPetals = numFlowers * petalsPerFlower;

  const flowers = useMemo(() => {
    const data: Array<{ x: number; y: number; z: number; rotX: number; rotY: number; t: number }> = [];

    for (let i = 0; i < numFlowers; i += 1) {
      const t = i / (numFlowers - 1);
      const y = -10 + t * 20;
      const angle = t * Math.PI * 10;
      const radius = 0.8 + Math.sin(t * Math.PI) * 2 + Math.pow(t, 3) * 5;
      const noiseX = (Math.sin(t * 43) + Math.cos(t * 17)) * 0.5;
      const noiseZ = (Math.cos(t * 37) + Math.sin(t * 23)) * 0.5;

      data.push({
        x: Math.cos(angle) * radius + noiseX,
        y,
        z: Math.sin(angle) * radius + noiseZ,
        rotX: Math.PI / 3 - Math.pow(t, 2) * (Math.PI / 6) + noiseZ * 0.5,
        rotY: angle + noiseX,
        t,
      });
    }

    return data;
  }, []);

  const { geometry, colors } = useMemo(() => {
    const geom = new THREE.SphereGeometry(0.5, 6, 5);
    geom.scale(0.7, 1.4, 0.3);
    geom.translate(0, 0.6, 0);
    geom.computeVertexNormals();

    const palette = new Float32Array(totalPetals * 3);
    const color = new THREE.Color();

    for (let i = 0; i < totalPetals; i += 1) {
      const flowerIndex = Math.floor(i / petalsPerFlower);
      const petalIndex = i % petalsPerFlower;
      const petalT = petalIndex / petalsPerFlower;
      const flowerT = flowerIndex / numFlowers;
      const randomSeed = (flowerIndex * 137.5 + petalIndex * 12.3) % 1;
      const isLeaf = petalT > 0.8;

      if (isLeaf) {
        color.setHSL(0.3 + randomSeed * 0.1, 0.8, 0.2 + randomSeed * 0.2);
      } else {
        const hue = THREE.MathUtils.lerp(0.7, 0.95, flowerT);
        const petalHue = hue + (randomSeed - 0.5) * 0.05;
        const lightness = THREE.MathUtils.lerp(0.3, 0.7, 1 - petalT);
        color.setHSL(petalHue, 0.9, lightness + randomSeed * 0.1);
      }

      palette[i * 3] = color.r;
      palette[i * 3 + 1] = color.g;
      palette[i * 3 + 2] = color.b;
    }

    return { geometry: geom, colors: palette };
  }, [numFlowers, petalsPerFlower, totalPetals]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const time = clock.getElapsedTime();
    const loopTime = Math.min(time, 12);
    let globalGrowth = 0;

    if (loopTime > 0.5 && loopTime <= 6.5) {
      const t = (loopTime - 0.5) / 6;
      globalGrowth = 1 - Math.pow(1 - t, 3);
    } else if (loopTime > 6.5) {
      globalGrowth = 1;
    }

    const dummy = new THREE.Object3D();
    let instanceIndex = 0;

    for (let flowerIndex = 0; flowerIndex < numFlowers; flowerIndex += 1) {
      const flower = flowers[flowerIndex];
      let rawBloom = 0;
      const startT = Math.max(0, flower.t - 0.05);

      if (globalGrowth > startT) {
        rawBloom = Math.min(1, (globalGrowth - startT) * 12);
      }

      const easeBloom = 1 - Math.pow(1 - rawBloom, 3);
      const pop = rawBloom > 0 && rawBloom < 1 ? Math.sin(rawBloom * Math.PI) * 0.6 : 0;
      const springBloom = Math.max(0, easeBloom + pop);

      for (let petalIndex = 0; petalIndex < petalsPerFlower; petalIndex += 1) {
        const petalT = petalIndex / petalsPerFlower;
        const petalAngle = petalT * Math.PI * 2 * 2.618033;
        const petalRadius = Math.pow(petalT, 0.5) * 1.2 * springBloom;
        const randomSeed = (flowerIndex * 137.5 + petalIndex * 12.3) % 1;
        const closedTilt = -0.4;
        const openTilt = THREE.MathUtils.lerp(0.2, 1.6, petalT);
        const tilt = THREE.MathUtils.lerp(closedTilt, openTilt, easeBloom);
        const twist = (randomSeed - 0.5) * 0.8 * easeBloom;

        dummy.position.set(0, 0, 0);
        dummy.rotation.set(tilt, petalAngle, twist, "YXZ");
        dummy.translateZ(petalRadius);

        const flowerScale = 0.8 + Math.pow(flower.t, 2) * 4;
        const petalScale = THREE.MathUtils.lerp(0.1, 1, petalT) * springBloom * flowerScale;
        const isLeaf = petalT > 0.8;

        if (isLeaf) {
          const leafLength = 1 + randomSeed * 0.8;
          dummy.scale.set(petalScale * 0.5, petalScale * leafLength, petalScale);
        } else {
          const widthVar = 0.6 + randomSeed * 0.6;
          const lengthVar = 0.8 + (1 - randomSeed) * 0.4;
          dummy.scale.set(petalScale * widthVar, petalScale * lengthVar, petalScale);
        }

        dummy.position.applyEuler(new THREE.Euler(flower.rotX, flower.rotY, 0));
        dummy.position.add(new THREE.Vector3(flower.x, flower.y, flower.z));
        dummy.rotation.x += Math.sin(time * 2 + flowerIndex + petalIndex) * 0.05 * easeBloom;
        dummy.updateMatrix();

        meshRef.current.setMatrixAt(instanceIndex, dummy.matrix);
        instanceIndex += 1;
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, totalPetals]}>
      <meshStandardMaterial side={THREE.DoubleSide} roughness={0.2} metalness={0.1} />
      <instancedBufferAttribute attach="instanceColor" args={[colors, 3]} />
    </instancedMesh>
  );
}

function Stem() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const curve = useMemo(() => {
    const points: THREE.Vector3[] = [];

    for (let i = 0; i <= 50; i += 1) {
      const t = i / 50;
      const y = -10 + t * 20;
      const angle = t * Math.PI * 10;
      const radius = 0.8 + Math.sin(t * Math.PI) * 2 + Math.pow(t, 3) * 5;
      const noiseX = (Math.sin(t * 43) + Math.cos(t * 17)) * 0.5;
      const noiseZ = (Math.cos(t * 37) + Math.sin(t * 23)) * 0.5;

      points.push(new THREE.Vector3(Math.cos(angle) * radius + noiseX, y, Math.sin(angle) * radius + noiseZ));
    }

    return new THREE.CatmullRomCurve3(points);
  }, []);

  useFrame(({ clock }) => {
    const time = Math.min(clock.getElapsedTime(), 12);
    let growth = 0;

    if (time > 0.5 && time <= 6.5) {
      const t = (time - 0.5) / 6;
      growth = 1 - Math.pow(1 - t, 3);
    } else if (time > 6.5) {
      growth = 1;
    }

    if (materialRef.current) {
      materialRef.current.uniforms.growth.value = growth;
    }
  });

  return (
    <mesh>
      <tubeGeometry args={[curve, 150, 0.5, 8, false]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          growth: { value: 0 },
          color: { value: new THREE.Color("#00ffaa") },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float growth;
          uniform vec3 color;
          varying vec2 vUv;
          void main() {
            if (vUv.x > growth) discard;
            float tipGlow = smoothstep(growth - 0.05, growth, vUv.x) * 5.0;
            gl_FragColor = vec4(color * (0.5 + tipGlow), 1.0);
          }
        `}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function MovingLight() {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!lightRef.current) return;

    const time = Math.min(clock.getElapsedTime(), 12);
    let growth = 0;

    if (time > 0.5 && time <= 6.5) {
      const t = (time - 0.5) / 6;
      growth = 1 - Math.pow(1 - t, 3);
    } else if (time > 6.5) {
      growth = 1;
    }

    lightRef.current.position.set(0, -10 + growth * 20, 0);
    lightRef.current.intensity = growth > 0 ? 24 + growth * 24 : 0;
  });

  return <pointLight ref={lightRef} color="#ffffff" distance={25} />;
}

function CameraRig() {
  const targetRef = useRef(new THREE.Vector3(0, -8, 0));

  useFrame(({ camera, clock }) => {
    const time = clock.getElapsedTime();
    const loopTime = Math.min(time, 12);
    const baseAngle = time * 0.15;

    let targetY = 0;
    let cameraY = 0;
    let radius = 15;
    let angle = 0;
    let growth = 0;

    if (loopTime > 0.5 && loopTime <= 6.5) {
      const t = (loopTime - 0.5) / 6;
      growth = 1 - Math.pow(1 - t, 3);
    } else if (loopTime > 6.5) {
      growth = 1;
    }

    if (loopTime < 0.5) {
      targetY = -10;
      cameraY = -10;
      radius = 12;
      angle = baseAngle;
    } else if (loopTime <= 6.5) {
      const tipY = -10 + growth * 20;
      targetY = tipY;
      cameraY = tipY - 2;
      radius = 12 + growth * 8;
      angle = baseAngle + growth * Math.PI * 2.5;
    } else {
      targetY = 10;
      cameraY = 8;
      radius = 20;
      angle = baseAngle + Math.PI * 2.5 + Math.max(loopTime - 6.5, 0) * 0.3;
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.cos(angle) * radius, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, cameraY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, Math.sin(angle) * radius, 0.05);

    targetRef.current.lerp(new THREE.Vector3(0, targetY, 0), 0.08);
    camera.lookAt(targetRef.current);
  });

  return null;
}

function FadeController() {
  useFrame(({ clock }) => {
    const elapsed = Math.min(clock.getElapsedTime(), 12);
    const opacity = elapsed > 11 ? Math.min(0.46, (elapsed - 11) * 0.46) : 0;
    const overlay = document.getElementById("ascii-startup-fade");
    if (overlay) overlay.style.opacity = opacity.toString();
  });

  return null;
}

export default function AsciiStartupIntro({ onComplete, phase }: AsciiStartupIntroProps) {
  const asciiData = useAsciiTexture();

  useEffect(() => {
    const timer = window.setTimeout(onComplete, LOOP_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="absolute inset-0 z-40 overflow-hidden bg-black"
      initial={false}
      animate={
        phase === "handoff"
          ? {
              opacity: 0.42,
              scale: 1.01,
            }
          : {
              opacity: 1,
              scale: 1,
            }
      }
      transition={{
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div
        id="ascii-startup-fade"
        className="pointer-events-none absolute inset-0 z-50 bg-[#04110c] transition-opacity duration-75"
        style={{ opacity: 0 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[55] blur-[10px]"
        initial={false}
        animate={
          phase === "handoff"
            ? {
                opacity: 0.72,
                scale: 1,
              }
            : {
                opacity: 0,
                scale: 1.06,
              }
        }
        transition={{
          duration: 1.15,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(118,255,194,0.2), rgba(118,255,194,0) 42%), linear-gradient(180deg, rgba(8,32,23,0.12), rgba(2,10,7,0.74)), repeating-linear-gradient(180deg, rgba(146,255,205,0.1) 0px, rgba(146,255,205,0.1) 1px, transparent 1px, transparent 4px)",
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[56]"
        initial={false}
        animate={
          phase === "handoff"
            ? {
                opacity: 0.38,
                scaleY: 1,
              }
            : {
                opacity: 0,
                scaleY: 0.82,
              }
        }
        transition={{
          duration: 1,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          transformOrigin: "50% 50%",
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(162,255,214,0.04) 30%, rgba(214,255,231,0.22) 50%, rgba(162,255,214,0.04) 70%, rgba(0,0,0,0) 100%)",
          mixBlendMode: "screen",
        }}
      />
      <Canvas gl={{ antialias: false, powerPreference: "high-performance" }}>
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={1} />
        <directionalLight position={[10, 20, 10]} intensity={1.45} color="#ffffff" />
        <pointLight position={[0, -5, 0]} intensity={18} color="#ff00aa" distance={20} />
        <pointLight position={[0, 5, 0]} intensity={18} color="#00ffff" distance={20} />
        <MovingLight />
        <Stem />
        <FlowerCluster />
        <CameraRig />
        <FadeController />
        <EffectComposer disableNormalPass>
          {asciiData ? (
            <AsciiEffect
              texture={asciiData.texture}
              characters={asciiData.numChars}
              charSize={12}
            />
          ) : null}
          <Bloom
            luminanceThreshold={0.38}
            luminanceSmoothing={0.78}
            height={300}
            intensity={0.72}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </motion.div>
  );
}
